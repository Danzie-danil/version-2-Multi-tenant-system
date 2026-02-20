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
            renderAnalytics(); // function now handles its own async data loading & DOM injection
            break;
        }
        case 'security': {
            const html = renderSecurity();
            document.getElementById('mainContent').innerHTML = html;
            lucide.createIcons();
            break;
        }
        case 'settings':
            renderSettings();
            break;
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
        case 'settings':
            renderBranchSettings();
            break;
        default:
            renderBranchDashboard();
    }
};

// ── Notification bell reset ───────────────────────────────────────────────
// ── Notification Logic ─────────────────────────────────────────────────────

window.checkNotifications = async function () {
    if (state.role !== 'owner') return;

    const { count, error } = await supabaseClient
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

    const overlay = document.getElementById('notifOverlay');
    const panel = document.getElementById('notifPanel');
    const content = document.getElementById('notifContent');

    // Open panel first with loading state
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
    }, 10);

    content.innerHTML = '<div class="py-10 text-center text-gray-500 flex flex-col items-center"><i data-lucide="loader" class="w-6 h-6 animate-spin mb-2 text-indigo-500"></i><span class="text-sm">Loading notifications...</span></div>';
    lucide.createIcons();

    try {
        // 1. Fetch pending requests
        const { data: requests, error: reqErr } = await supabaseClient
            .from('access_requests')
            .select('*, branches(name)')
            .eq('owner_id', state.ownerId)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (reqErr) throw reqErr;

        // 2. Fetch recent activities globally
        const branchIds = state.branches.map(b => b.id);
        const activities = await dbActivities.fetchRecent(branchIds, 15);

        let html = '';

        // Render Requests (Actionable)
        if (requests && requests.length > 0) {
            html += `<h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-1">Action Required</h4>`;
            html += requests.map(req => `
                <div class="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <p class="font-bold text-sm text-gray-900 mb-1">${req.branches?.name || 'Unknown Branch'}</p>
                    <p class="text-xs text-gray-600 mb-3 flex items-center gap-1"><i data-lucide="key" class="w-3 h-3 text-indigo-500"></i> PIN Reset Requested</p>
                    <div class="flex gap-2">
                        <button onclick="approveReset('${req.id}', '${req.branch_id}')" 
                            class="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                            Approve
                        </button>
                        <button onclick="denyReset('${req.id}')" 
                            class="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">
                            Deny
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Render Recent Activities (Informational)
        if (activities && activities.length > 0) {
            html += `<h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-1">Recent Activity</h4>`;
            const typeMap = {
                sale: { bg: 'bg-emerald-100', icon: 'shopping-cart', ic: 'text-emerald-600', amt: 'text-emerald-600', sign: '+' },
                expense: { bg: 'bg-red-100', icon: 'credit-card', ic: 'text-red-600', amt: 'text-red-600', sign: '-' },
                task_completed: { bg: 'bg-blue-100', icon: 'check-circle', ic: 'text-blue-600', amt: null, sign: '' },
                task_assigned: { bg: 'bg-amber-100', icon: 'clipboard-list', ic: 'text-amber-600', amt: null, sign: '' }
            };

            html += activities.map(a => {
                const t = typeMap[a.type] || typeMap.task_completed;
                return `
                <div class="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div class="w-8 h-8 rounded-full ${t.bg} flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i data-lucide="${t.icon}" class="w-4 h-4 ${t.ic}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 leading-snug">${a.message}</p>
                        <p class="text-xs text-gray-500 mt-0.5">${a.branch} · ${a.time}</p>
                    </div>
                    ${a.amount ? `<span class="text-xs font-bold ${t.amt} flex-shrink-0 mt-0.5">${t.sign}${fmt.currency(a.amount)}</span>` : ''}
                </div>`;
            }).join('');
        }

        if (!html) {
            html = '<div class="py-10 text-center text-gray-500 flex flex-col items-center"><div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3"><i data-lucide="bell-off" class="w-6 h-6 text-gray-400"></i></div><p class="text-sm">You\'re all caught up!</p></div>';
        }

        content.innerHTML = html;
        lucide.createIcons();

        // Clear badge if there are only activities and no pending requests
        if (!requests || requests.length === 0) {
            document.getElementById('notifBadge')?.classList.add('hidden');
        }

    } catch (err) {
        content.innerHTML = `<div class="p-4 text-center text-red-500 text-sm">Failed to load notifications: ${err.message}</div>`;
        console.error(err);
    }
};

window.closeNotifications = function () {
    const overlay = document.getElementById('notifOverlay');
    const panel = document.getElementById('notifPanel');
    if (panel) panel.classList.add('translate-x-full');
    if (overlay) overlay.classList.add('opacity-0');
    setTimeout(() => {
        if (overlay) overlay.classList.add('hidden');
    }, 300);
};

window.approveReset = async function (reqId, branchId) {
    const newPin = prompt("Enter new 6-digit PIN for this branch:");
    if (newPin === null) return; // Cancelled
    if (!newPin || newPin.length !== 6) {
        alert("Invalid PIN. It must be exactly 6 digits.");
        return;
    }

    // 1. Update Branch PIN
    const { error: pinError } = await supabaseClient
        .from('branches')
        .update({ pin: newPin })
        .eq('id', branchId);

    if (pinError) {
        showToast('Failed to update PIN: ' + pinError.message, 'error');
        return;
    }

    // 2. Update Request Status
    await supabaseClient.from('access_requests').update({ status: 'approved' }).eq('id', reqId);

    showToast('PIN Updated Successfully', 'success');
    showNotifications();
};

window.denyReset = async function (reqId) {
    const confirmed = await confirmModal('Deny Request', 'Are you sure you want to deny this request?', 'Deny', 'Cancel');
    if (!confirmed) return;
    await supabaseClient.from('access_requests').update({ status: 'rejected' }).eq('id', reqId);
    showToast('Request Denied', 'info');
    showNotifications();
};
