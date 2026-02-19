// ── Main App: View Router & Entry Point ───────────────────────────────────

/**
 * switchView(viewName, clickedEl)
 * @param {string} viewName  - the view to render
 * @param {HTMLElement|null} clickedEl - the sidebar button that was clicked
 *   Pass `null` when calling programmatically (e.g. after form submit).
 *
 * Note: async module renderers write directly to #mainContent themselves.
 * They return '' so we don't accidentally overwrite the DOM they already set.
 */
// ── Sidebar Toggle Using Tailwind Classes ──────────────────────────────────
window.toggleSidebar = function () {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    // Toggle transform class
    sidebar.classList.toggle('-translate-x-full');

    // Toggle overlay visibility
    if (sidebar.classList.contains('-translate-x-full')) {
        overlay.classList.add('hidden');
    } else {
        overlay.classList.remove('hidden');
    }
};

window.switchView = function (viewId, btnElement) {
    // 1. Update active state in sidebar
    document.querySelectorAll('.sidebar-item').forEach(el => {
        el.classList.remove('active', 'text-indigo-600', 'bg-indigo-50');
        el.classList.add('text-gray-700');
    });

    if (btnElement) {
        btnElement.classList.add('active', 'text-indigo-600', 'bg-indigo-50');
        btnElement.classList.remove('text-gray-700');
    }

    // 2. Hide all views
    // (Original logic for view switching)
    if (state.role === 'owner') {
        renderOwnerView(viewId);
    } else {
        renderBranchView(viewId);
    }

    // 3. Mobile: Close sidebar after selection
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('mainSidebar');
        if (!sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }
};

// ── Owner View Dispatch ───────────────────────────────────────────────────

window.renderOwnerView = function (view) {
    // Each renderer is responsible for writing to #mainContent
    switch (view) {
        case 'overview':
            renderOwnerOverview();
            break;
        case 'branches':
            renderBranchesManagement();
            break;
        case 'tasks':
            renderTasksManagement();
            break;
        case 'analytics': {
            const html = renderAnalytics();
            document.getElementById('mainContent').innerHTML = html;
            lucide.createIcons();
            initAnalyticsCharts();      // charts need DOM elements first
            break;
        }
        case 'security': {
            const html = renderSecurity();
            document.getElementById('mainContent').innerHTML = html;
            lucide.createIcons();
            break;
        }
        default:
            renderOwnerOverview();
    }
};

// ── Branch View Dispatch ──────────────────────────────────────────────────

window.renderBranchView = function (view) {
    switch (view) {
        case 'dashboard':
            renderBranchDashboard();
            break;
        case 'sales':
            renderSalesModule();
            break;
        case 'expenses':
            renderExpensesModule();
            break;
        case 'inventory':
            renderInventoryModule();
            break;
        case 'customers':
            renderCustomersModule();
            break;
        case 'tasks':
            renderBranchTasks();
            break;
        case 'notes':
            renderNotesModule();
            break;
        case 'loans':
            renderLoansModule();
            break;
        default:
            renderBranchDashboard();
    }
};

// ── Notification bell reset ───────────────────────────────────────────────
// ── Notification Logic ─────────────────────────────────────────────────────

window.checkNotifications = async function () {
    if (state.role !== 'owner') return;

    const { count, error } = await supabase
        .from('access_requests')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', state.ownerId)
        .eq('status', 'pending');

    if (!error && count > 0) {
        document.getElementById('notifBadge')?.classList.remove('hidden');
    } else {
        document.getElementById('notifBadge')?.classList.add('hidden');
    }
};

window.showNotifications = async function () {
    if (state.role !== 'owner') {
        showToast('Notifications are for Business Owners', 'info');
        return;
    }

    const { data: requests, error } = await supabase
        .from('access_requests')
        .select('*, branches(name)')
        .eq('owner_id', state.ownerId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    if (!requests || requests.length === 0) {
        showToast('No pending requests', 'info');
        document.getElementById('notifBadge')?.classList.add('hidden');
        return;
    }

    // Render Modal with Requests
    const content = `
        <div class="p-6">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-bold">Pending Requests</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                ${requests.map(req => `
                    <div class="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-100">
                        <div>
                            <p class="font-bold text-sm text-gray-800">${req.branches?.name || 'Unknown Branch'}</p>
                            <p class="text-xs text-gray-500">PIN Reset Requested</p>
                            <p class="text-xs text-gray-400">${new Date(req.created_at).toLocaleDateString()}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="approveReset('${req.id}', '${req.branch_id}')" 
                                class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                                Reset PIN
                            </button>
                            <button onclick="denyReset('${req.id}')" 
                                class="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                Deny
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    document.getElementById('modalContent').innerHTML = content;
    document.getElementById('modalOverlay').classList.remove('hidden');
    lucide.createIcons();
};

window.approveReset = async function (reqId, branchId) {
    const newPin = prompt("Enter new 6-digit PIN for this branch:");
    if (newPin === null) return; // Cancelled
    if (!newPin || newPin.length !== 6) {
        alert("Invalid PIN. It must be exactly 6 digits.");
        return;
    }

    // 1. Update Branch PIN
    const { error: pinError } = await supabase
        .from('branches')
        .update({ pin: newPin })
        .eq('id', branchId);

    if (pinError) {
        showToast('Failed to update PIN: ' + pinError.message, 'error');
        return;
    }

    // 2. Update Request Status
    await supabase.from('access_requests').update({ status: 'approved' }).eq('id', reqId);

    showToast('PIN Updated Successfully', 'success');
    closeModal();
};

window.denyReset = async function (reqId) {
    if (!confirm("Deny this request?")) return;
    await supabase.from('access_requests').update({ status: 'rejected' }).eq('id', reqId);
    showToast('Request Denied', 'info');
    closeModal();
};
