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

window.switchView = function (viewId, context = null) {
    let btnElement = null;
    let extraData = null;

    if (context instanceof HTMLElement) {
        btnElement = context;
    } else {
        extraData = context;
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

    // 2. Dispatch with extraData
    if (state.role === 'owner') {
        localStorage.setItem('lastOwnerView', viewId);
        renderOwnerView(viewId, extraData);
    } else {
        localStorage.setItem('lastBranchView', viewId);
        renderBranchView(viewId, extraData);
    }

    // 3. Mobile: Close sidebar
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('mainSidebar');
        if (sidebar && !sidebar.classList.contains('-translate-x-[calc(100%+1rem)]')) {
            toggleSidebar();
        }
    }
};

// ── Owner View Dispatch ───────────────────────────────────────────────────

window.renderOwnerView = function (view, extraData = null) {
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
        case 'requests':
            renderRequestsModule(extraData);
            break;
        case 'chat':
            renderChatModule();
            break;
        default:
            renderOwnerOverview();
    }
};

// ── Branch View Dispatch ──────────────────────────────────────────────────

window.renderBranchView = function (view, extraData = null) {
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
        case 'requests':
            renderBranchRequestsModule();
            break;
        case 'chat':
            renderChatModule();
            break;
        default:
            renderBranchDashboard();
    }
};

// ── Notification bell reset ───────────────────────────────────────────────
// ── Notification Logic ─────────────────────────────────────────────────────

window.checkNotifications = async function (shush = false) {
    if (!state.profile) return;

    let hasNew = false;
    const oldRequestCount = state.pendingRequestCount || 0;
    let currentUnreadChat = 0;

    if (state.role === 'owner') {
        const [reqs, access, unreadChat] = await Promise.all([
            supabaseClient.from('requests').select('id', { count: 'exact', head: true }).eq('owner_id', state.profile.id).eq('status', 'pending'),
            supabaseClient.from('access_requests').select('id', { count: 'exact', head: true }).eq('owner_id', state.profile.id).eq('status', 'pending'),
            dbMessages.getUnreadCount(null, 'admin')
        ]);

        currentUnreadChat = unreadChat || 0;
        const totalPending = (reqs.count || 0) + (access.count || 0) + currentUnreadChat;
        state.pendingRequestCount = totalPending;
        if (totalPending > oldRequestCount) hasNew = true;

        if (totalPending > 0) {
            document.getElementById('notifBadge')?.classList.remove('hidden');
        } else {
            document.getElementById('notifBadge')?.classList.add('hidden');
        }
    }
    else if (state.role === 'branch') {
        // For branches, check for pending tasks, low inventory, AND new responses
        const [tasksRes, stockRes, reqsRes, unreadChat] = await Promise.all([
            supabaseClient.from('tasks').select('id', { count: 'exact', head: true }).eq('branch_id', state.branchId).eq('status', 'pending'),
            dbInventory.fetchAll(state.branchId),
            dbRequests.fetchByBranch(state.branchId),
            dbMessages.getUnreadCount(state.branchId, 'branch')
        ]);

        currentUnreadChat = unreadChat || 0;
        const pendingTasks = tasksRes.count || 0;
        const lowStock = (stockRes.items || []).filter(i => i.quantity <= i.min_threshold).length;

        // Response tracking logic
        const responses = reqsRes.filter(r => r.status !== 'pending' || r.admin_response);
        const lastChecked = localStorage.getItem(`last_checked_reqs_${state.branchId}`) || '0';
        const newResponses = responses.filter(r => new Date(r.updated_at || r.created_at) > new Date(lastChecked)).length;

        if (newResponses > 0 || currentUnreadChat > 0) hasNew = true;

        if (pendingTasks > 0 || lowStock > 0 || newResponses > 0 || currentUnreadChat > 0) {
            document.getElementById('notifBadge')?.classList.remove('hidden');
        } else {
            document.getElementById('notifBadge')?.classList.add('hidden');
        }
    }

    // Update Chat Badge
    document.querySelectorAll('.chat-unread-badge').forEach(badge => {
        if (currentUnreadChat > 0) {
            badge.textContent = currentUnreadChat > 99 ? '99+' : currentUnreadChat;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });

    if (hasNew && !shush) {
        showNotificationHint('New Notification');
    }
};

window.showNotificationHint = function (message = 'New Notification') {
    const bell = document.querySelector('button[onclick="showNotifications()"]');
    if (!bell) return;

    // Remove existing hint if any
    const oldHint = document.getElementById('notifHint');
    if (oldHint) oldHint.remove();

    const hint = document.createElement('div');
    hint.id = 'notifHint';
    hint.className = 'fixed z-[60] bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl shadow-2xl animate-bounce-subtle pointer-events-none opacity-0 transition-opacity duration-300 flex items-center gap-2';
    hint.innerHTML = `<i data-lucide="sparkles" class="w-3 h-3"></i> ${message}`;

    // Position near bell
    const rect = bell.getBoundingClientRect();
    hint.style.top = (rect.bottom + 10) + 'px';
    hint.style.left = (rect.left - 40) + 'px';

    document.body.appendChild(hint);
    lucide.createIcons();
    playSound('notification');

    // Fade in
    setTimeout(() => hint.classList.remove('opacity-0'), 10);

    // Hide after 2s
    setTimeout(() => {
        hint.classList.add('opacity-0');
        setTimeout(() => hint.remove(), 300);
    }, 2000);
};

window.initNotificationPolling = function () {
    if (window.notifInterval) clearInterval(window.notifInterval);
    // Initial check
    checkNotifications(true);

    // Set up Realtime WebSockets instead of polling
    if (window.notifChannel) {
        window.supabaseClient.removeChannel(window.notifChannel);
    }

    window.notifChannel = window.supabaseClient.channel('realtime-notifications');

    if (state.role === 'owner') {
        window.notifChannel
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests', filter: `owner_id=eq.${state.profile.id}` }, payload => checkNotifications())
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'requests', filter: `owner_id=eq.${state.profile.id}` }, payload => checkNotifications())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'access_requests', filter: `owner_id=eq.${state.profile.id}` }, payload => checkNotifications())
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'access_requests', filter: `owner_id=eq.${state.profile.id}` }, payload => checkNotifications())
            .subscribe();
    } else if (state.role === 'branch') {
        window.notifChannel
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'requests', filter: `branch_id=eq.${state.branchId}` }, payload => checkNotifications())
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'requests', filter: `branch_id=eq.${state.branchId}` }, payload => checkNotifications())
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks', filter: `branch_id=eq.${state.branchId}` }, payload => checkNotifications())
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `branch_id=eq.${state.branchId}` }, payload => checkNotifications())
            .subscribe();
    }
};

window.showNotifications = async function () {
    const overlay = document.getElementById('notifOverlay');
    const panel = document.getElementById('notifPanel');
    const content = document.getElementById('notifContent');

    // Open panel first with loading state
    overlay.classList.remove('hidden', 'opacity-0');
    panel.classList.remove('translate-x-[calc(100%+2rem)]');

    // Update last checked timestamp for branch responses
    if (state.role === 'branch') {
        localStorage.setItem(`last_checked_reqs_${state.branchId}`, new Date().toISOString());
        // Hide badge immediately on panel open if it was only because of responses
        checkNotifications(true);
    }

    content.innerHTML = `
        <div class="py-10 text-center text-gray-500 flex flex-col items-center">
            <span class="text-sm">Loading notifications...</span>
        </div>`;
    lucide.createIcons();

    try {
        let html = '';

        if (state.role === 'owner') {
            // ── OWNER LOGIC ──────────────────────────────────────────────────
            const { data: accessRequests, error: accessReqErr } = await supabaseClient
                .from('access_requests')
                .select('*, branches(name)')
                .eq('owner_id', state.profile.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (accessReqErr) throw accessReqErr;

            const branchIds = state.branches.map(b => b.id);
            const activities = await dbActivities.fetchRecent(branchIds, 15);

            // Render Requests (Approval Queue)
            const allReqs = await dbRequests.fetchAll(state.profile.id);
            const pendingReqs = allReqs.filter(r => r.status === 'pending');

            if (accessRequests && accessRequests.length > 0) {
                html += `<h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 mt-4 px-1 pb-1 border-b border-indigo-100">Access Requests</h4>`;
                html += accessRequests.map(req => `
                    <div onclick="switchView('security', '${req.id}'); closeNotifications();" class="notif-item p-4 bg-white border border-indigo-50 shadow-sm relative overflow-hidden mb-3">
                        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div class="flex items-center justify-between mb-1">
                            <p class="font-bold text-sm text-gray-900 leading-tight">PIN Reset for ${req.branches?.name || 'Unknown Branch'}</p>
                            <span class="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase flex-shrink-0 ml-2">Pending</span>
                        </div>
                        <p class="text-xs text-gray-400 mb-1 font-medium">Requested by branch manager</p>
                        <div class="flex gap-2 mt-3">
                            <button onclick="event.stopPropagation(); approveReset('${req.id}', '${req.branch_id}');" class="flex-1 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Approve</button>
                            <button onclick="event.stopPropagation(); denyReset('${req.id}');" class="flex-1 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-gray-200 transition-colors">Deny</button>
                        </div>
                    </div>`).join('');
            }

            if (pendingReqs && pendingReqs.length > 0) {
                html += `<h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-1">Approval Requests</h4>`;
                html += pendingReqs.map(req => `
                    <div onclick="switchView('requests', '${req.id}'); closeNotifications();" class="notif-item p-4 bg-white border border-indigo-50 shadow-sm relative overflow-hidden mb-3">
                        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div class="flex items-center justify-between mb-1">
                            <p class="font-bold text-sm text-gray-900 leading-tight">${req.subject}</p>
                            <span class="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase flex-shrink-0 ml-2">${req.type.split('_')[1] || req.type}</span>
                        </div>
                        <p class="text-xs text-gray-400 mb-1 font-medium">${req.branches?.name || 'Unknown Branch'}</p>
                        <p class="text-[10px] text-gray-400 italic truncate italic">"${req.message}"</p>
                    </div>`).join('');
            }

            // Render Activities
            if (activities && activities.length > 0) {
                html += `<h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-1">Recent Activity</h4>`;
                const typeMap = {
                    sale: { bg: 'bg-emerald-100', icon: 'shopping-cart', ic: 'text-emerald-600', view: 'overview' },
                    expense: { bg: 'bg-red-100', icon: 'credit-card', ic: 'text-red-600', view: 'overview' },
                    task_completed: { bg: 'bg-blue-100', icon: 'check-circle', ic: 'text-blue-600', view: 'tasks' },
                    task_assigned: { bg: 'bg-amber-100', icon: 'clipboard-list', ic: 'text-amber-600', view: 'tasks' }
                };

                html += activities.map(a => {
                    const t = typeMap[a.type] || typeMap.task_completed;
                    return `
                    <div onclick="switchView('${t.view}'); closeNotifications();" class="notif-item flex items-start gap-3 p-3 bg-white border border-gray-100 shadow-sm mb-2">
                        <div class="w-8 h-8 rounded-full ${t.bg} flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i data-lucide="${t.icon}" class="w-4 h-4 ${t.ic}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 leading-snug">${a.message}</p>
                            <p class="text-[10px] text-gray-400 mt-0.5 uppercase font-bold">${a.branch} · ${a.time}</p>
                        </div>
                        ${a.amount ? `<span class="text-xs font-black text-gray-700 mt-0.5">${fmt.currency(a.amount)}</span>` : ''}
                    </div>`;
                }).join('');
            }
        } else {
            // ── BRANCH LOGIC ─────────────────────────────────────────────────
            const [tasksRes, stockRes, requests] = await Promise.all([
                supabaseClient.from('tasks').select('*').eq('branch_id', state.branchId).neq('status', 'completed').order('deadline', { ascending: true }),
                dbInventory.fetchAll(state.branchId),
                dbRequests.fetchByBranch(state.branchId)
            ]);

            const tasks = tasksRes.data || [];
            const lowStock = (stockRes.items || []).filter(i => i.quantity <= i.min_threshold);

            // Filter for responded and pending requests
            const respondedReqs = requests.filter(r => r.status !== 'pending' || r.admin_response).slice(0, 5);
            const pendingReqs = requests.filter(r => r.status === 'pending' && !r.admin_response).slice(0, 5);

            // 0. Responses from Admin
            if (respondedReqs.length > 0) {
                html += `<h4 class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 mt-4 px-1 pb-1 border-b border-indigo-100">Approval Responses</h4>`;
                html += respondedReqs.map(req => {
                    const statusColor = { approved: 'bg-emerald-500', rejected: 'bg-red-500', pending: 'bg-indigo-500' };
                    return `
                    <div onclick="switchView('requests', '${req.id}'); closeNotifications();" class="notif-item p-4 bg-white border border-gray-100 relative group overflow-hidden mb-3">
                        <div class="absolute top-0 left-0 w-1 h-full ${statusColor[req.status] || 'bg-gray-500'}"></div>
                        <div class="flex items-center justify-between mb-1.5">
                            <p class="text-[9px] font-black uppercase text-gray-400 tracking-wider">${req.type.replace('_', ' ')}</p>
                            <span class="badge ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : (req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700')} uppercase text-[9px] font-black">${req.status}</span>
                        </div>
                        <p class="text-sm font-bold text-gray-900 mb-1 leading-tight">${req.subject}</p>
                        ${req.admin_response ? `<p class="text-[11px] text-indigo-700 italic bg-indigo-50/50 p-2 rounded-lg border border-indigo-100/30 mt-2 font-medium">"${req.admin_response}"</p>` : ''}
                    </div>`;
                }).join('');
            }

            // 0.5 Pending Requests (Awaiting Admin)
            if (pendingReqs.length > 0) {
                html += `<h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4 px-1 pb-1 border-b border-gray-100">Pending Approvals</h4>`;
                html += pendingReqs.map(req => {
                    return `
                    <div onclick="switchView('requests', '${req.id}'); closeNotifications();" class="notif-item p-4 bg-white border border-gray-100 relative group overflow-hidden mb-3 opacity-80">
                        <div class="absolute top-0 left-0 w-1 h-full bg-gray-300"></div>
                        <div class="flex items-center justify-between mb-1.5">
                            <p class="text-[9px] font-black uppercase text-gray-400 tracking-wider">${req.type.replace('_', ' ')}</p>
                            <span class="badge bg-gray-100 text-gray-600 uppercase text-[9px] font-black italic">Awaiting...</span>
                        </div>
                        <p class="text-sm font-bold text-gray-900 mb-1 leading-tight">${req.subject}</p>
                    </div>`;
                }).join('');
            }

            // 1. Stock Alerts (Urgent)
            if (lowStock.length > 0) {
                html += `<h4 class="text-xs font-bold text-orange-500 uppercase tracking-wider mb-2 mt-4 px-1">Stock Alerts</h4>`;
                html += lowStock.map(item => `
                    <div onclick="switchView('inventory'); closeNotifications();" class="notif-item p-3 bg-white border border-gray-100 mb-2 flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="alert-triangle" class="w-4 h-4 text-orange-600"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold text-gray-900 truncate">${item.name}</p>
                            <p class="text-[10px] text-orange-600 font-black uppercase tracking-widest leading-none mt-0.5">${item.quantity} In Stock</p>
                        </div>
                    </div>`).join('');
            }

            // 2. Tasks & Deadlines
            if (tasks.length > 0) {
                html += `<h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-1">Pending Tasks</h4>`;
                html += tasks.map(task => {
                    const isOverdue = task.deadline && new Date(task.deadline) < new Date();
                    const statusColor = isOverdue ? 'text-red-600' : 'text-indigo-600';
                    return `
                    <div onclick="switchView('tasks'); closeNotifications();" class="notif-item p-4 bg-white border border-gray-100 mb-2">
                        <div class="flex items-center gap-2 mb-1.5">
                            <span class="w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-indigo-500'}"></span>
                            <p class="text-sm font-bold text-gray-900 truncate">${task.title}</p>
                        </div>
                        <p class="text-[11px] text-gray-500 line-clamp-1 mb-2 font-medium">${task.description || 'No description provided'}</p>
                        ${task.deadline ? `<p class="text-[10px] font-black ${statusColor} uppercase tracking-tight flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${isOverdue ? 'OVERDUE' : 'Due'}: ${task.deadline}</p>` : ''}
                    </div>`;
                }).join('');
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
    }
};

window.closeNotifications = function () {
    const overlay = document.getElementById('notifOverlay');
    const panel = document.getElementById('notifPanel');
    if (panel) panel.classList.add('translate-x-[calc(100%+2rem)]');
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
