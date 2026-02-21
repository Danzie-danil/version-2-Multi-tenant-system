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
    sidebar.classList.toggle('-translate-x-[calc(100%+1rem)]');

    // Toggle overlay visibility
    if (sidebar.classList.contains('-translate-x-[calc(100%+1rem)]')) {
        overlay.classList.add('hidden');
    } else {
        overlay.classList.remove('hidden');
    }
};

window.switchView = function (viewId, btnElement) {
    // If no button passed (e.g., initial load), try to find the matching sidebar item
    if (!btnElement) {
        btnElement = document.querySelector(`.sidebar-item[onclick*="switchView('${viewId}'"]`);
    }

    // 1. Update active state in sidebar
    document.querySelectorAll('.sidebar-item').forEach(el => {
        el.classList.remove('active', 'text-indigo-600', 'bg-indigo-50');
        el.classList.add('text-gray-700');
    });

    if (btnElement) {
        btnElement.classList.add('active', 'text-indigo-600', 'bg-indigo-50');
        btnElement.classList.remove('text-gray-700');
    }

    // 2. Hide all views and save preference
    if (state.role === 'owner') {
        localStorage.setItem('lastOwnerView', viewId);
        renderOwnerView(viewId);
    } else {
        localStorage.setItem('lastBranchView', viewId);
        renderBranchView(viewId);
    }

    // 3. Mobile: Close sidebar after selection
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('mainSidebar');
        if (!sidebar.classList.contains('-translate-x-[calc(100%+1rem)]')) {
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
        case 'reports':
            renderReportsModule();
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
    if (state.role === 'owner') {
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
    } else if (state.role === 'branch') {
        // For branches, check for pending tasks and low inventory
        const [tasksRes, stockRes] = await Promise.all([
            supabaseClient.from('tasks').select('id', { count: 'exact', head: true }).eq('branch_id', state.branchId).eq('status', 'pending'),
            dbInventory.fetchAll(state.branchId)
        ]);

        const pendingTasks = tasksRes.count || 0;
        const lowStock = stockRes.filter(i => i.quantity <= i.min_threshold).length;

        if (pendingTasks > 0 || lowStock > 0) {
            document.getElementById('notifBadge')?.classList.remove('hidden');
        } else {
            document.getElementById('notifBadge')?.classList.add('hidden');
        }
    }
};

window.showNotifications = async function () {
    const overlay = document.getElementById('notifOverlay');
    const panel = document.getElementById('notifPanel');
    const content = document.getElementById('notifContent');

    // Open panel first with loading state
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.remove('opacity-0');
        panel.classList.remove('translate-x-full');
    }, 10);

    content.innerHTML = `
        <div class="py-10 text-center text-gray-500 flex flex-col items-center">
            <span class="loader scale-[0.6] mb-20"></span>
            <span class="text-sm">Loading notifications...</span>
        </div>`;
    lucide.createIcons();

    try {
        let html = '';

        if (state.role === 'owner') {
            // ── OWNER LOGIC ──────────────────────────────────────────────────
            const { data: requests, error: reqErr } = await supabaseClient
                .from('access_requests')
                .select('*, branches(name)')
                .eq('owner_id', state.ownerId)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (reqErr) throw reqErr;

            const branchIds = state.branches.map(b => b.id);
            const activities = await dbActivities.fetchRecent(branchIds, 15);

            // Render Requests
            if (requests && requests.length > 0) {
                html += `<h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-1">Action Required</h4>`;
                html += requests.map(req => `
                    <div class="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden mb-3">
                        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <p class="font-bold text-sm text-gray-900 mb-1">${req.branches?.name || 'Unknown Branch'}</p>
                        <p class="text-xs text-gray-600 mb-3 flex items-center gap-1"><i data-lucide="key" class="w-3 h-3 text-indigo-500"></i> PIN Reset Requested</p>
                        <div class="flex gap-2">
                            <button onclick="approveReset('${req.id}', '${req.branch_id}')" class="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors">Approve</button>
                            <button onclick="denyReset('${req.id}')" class="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors">Deny</button>
                        </div>
                    </div>`).join('');
            }

            // Render Activities
            if (activities && activities.length > 0) {
                html += `<h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-1">Recent Activity</h4>`;
                const typeMap = {
                    sale: { bg: 'bg-emerald-100', icon: 'shopping-cart', ic: 'text-emerald-600' },
                    expense: { bg: 'bg-red-100', icon: 'credit-card', ic: 'text-red-600' },
                    task_completed: { bg: 'bg-blue-100', icon: 'check-circle', ic: 'text-blue-600' },
                    task_assigned: { bg: 'bg-amber-100', icon: 'clipboard-list', ic: 'text-amber-600' }
                };

                html += activities.map(a => {
                    const t = typeMap[a.type] || typeMap.task_completed;
                    return `
                    <div class="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm mb-2">
                        <div class="w-8 h-8 rounded-full ${t.bg} flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i data-lucide="${t.icon}" class="w-4 h-4 ${t.ic}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 leading-snug">${a.message}</p>
                            <p class="text-xs text-gray-500 mt-0.5">${a.branch} · ${a.time}</p>
                        </div>
                        ${a.amount ? `<span class="text-xs font-bold text-gray-700 mt-0.5">${fmt.currency(a.amount)}</span>` : ''}
                    </div>`;
                }).join('');
            }
        } else {
            // ── BRANCH LOGIC ─────────────────────────────────────────────────
            const [tasksRes, stockRes, notesRes] = await Promise.all([
                supabaseClient.from('tasks').select('*').eq('branch_id', state.branchId).neq('status', 'completed').order('deadline', { ascending: true }),
                dbInventory.fetchAll(state.branchId),
                supabaseClient.from('notes').select('*').eq('branch_id', state.branchId).order('created_at', { ascending: false }).limit(5)
            ]);

            const tasks = tasksRes.data || [];
            const lowStock = stockRes.filter(i => i.quantity <= i.min_threshold);
            const notes = notesRes.data || [];

            // 1. Stock Alerts (Urgent)
            if (lowStock.length > 0) {
                html += `<h4 class="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2 mt-4 px-1">Stock Alerts</h4>`;
                html += lowStock.map(item => `
                    <div onclick="switchView('inventory')" class="p-3 bg-orange-50 border border-orange-100 rounded-xl mb-2 cursor-pointer hover:bg-orange-100 transition-colors flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="alert-triangle" class="w-4 h-4 text-orange-700"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold text-gray-900 truncate">${item.name}</p>
                            <p class="text-xs text-orange-700">Critical: ${item.quantity} left (Min: ${item.min_threshold})</p>
                        </div>
                    </div>`).join('');
            }

            // 2. Tasks & Deadlines
            if (tasks.length > 0) {
                html += `<h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-1">Pending Tasks</h4>`;
                html += tasks.map(task => {
                    const isOverdue = task.deadline && new Date(task.deadline) < new Date();
                    const statusColor = isOverdue ? 'text-red-600' : 'text-indigo-600';
                    return `
                    <div onclick="switchView('tasks')" class="p-3 bg-white border border-gray-100 rounded-xl mb-2 cursor-pointer hover:shadow-md transition-all">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-indigo-500'}"></span>
                            <p class="text-sm font-bold text-gray-900 truncate">${task.title}</p>
                        </div>
                        <p class="text-xs text-gray-500 line-clamp-1 mb-1">${task.description || 'No description'}</p>
                        ${task.deadline ? `<p class="text-[10px] font-bold ${statusColor} uppercase tracking-tighter flex items-center gap-1"><i data-lucide="calendar" class="w-3 h-3"></i> Due: ${task.deadline}</p>` : ''}
                    </div>`;
                }).join('');
            }

            // 3. Recent Notes / Comments
            if (notes.length > 0) {
                html += `<h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-1">Recent Notes</h4>`;
                html += notes.map(note => `
                    <div onclick="switchView('notes')" class="p-3 bg-gray-50 border border-transparent rounded-xl mb-2 cursor-pointer hover:border-gray-200 transition-all">
                        <p class="text-xs font-bold text-gray-800 mb-1">${note.title}</p>
                        <p class="text-[10px] text-gray-500 line-clamp-1">${note.content}</p>
                    </div>`).join('');
            }
        }

        if (!html) {
            html = `
            <div class="py-20 text-center text-gray-500 flex flex-col items-center">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <i data-lucide="bell-off" class="w-8 h-8 text-gray-300"></i>
                </div>
                <p class="text-sm font-medium">No notifications yet</p>
                <p class="text-xs text-gray-400 mt-1">You're all caught up!</p>
            </div>`;
        }

        content.innerHTML = html;
        lucide.createIcons();

        // Specific badge clearing for owner requests
        if (state.role === 'owner') {
            // For owners we already did the logic above, badge persists if requests > 0
        } else {
            // For branches, assume viewed for now (or implement persistent read/unread later)
            document.getElementById('notifBadge')?.classList.add('hidden');
        }

    } catch (err) {
        content.innerHTML = `<div class="p-10 text-center text-red-500 text-sm"><i data-lucide="alert-circle" class="w-10 h-10 mx-auto mb-3 opacity-50"></i><br>Failed to load: ${err.message}</div>`;
        console.error(err);
        lucide.createIcons();
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
    const newPin = await promptModal("Reset Branch PIN", "Enter new 6-digit PIN for this branch:", "e.g. 123456");
    if (newPin === null) return; // Cancelled
    if (!newPin || newPin.length !== 6) {
        showToast("Invalid PIN. It must be exactly 6 digits.", "error");
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

window.togglePasswordVisibility = function (inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';

    // Update icon
    btn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}" class="w-4 h-4 text-gray-400"></i>`;
    lucide.createIcons();
};
