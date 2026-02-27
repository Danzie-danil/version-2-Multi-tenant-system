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

window.showInlineSaveIndicator = function (inputElem, state) {
    if (!inputElem) return;
    let wrapper = inputElem.parentElement;
    if (!wrapper || wrapper.tagName === 'BODY') return;

    // Ensure wrapper can hold absolute elements
    if (window.getComputedStyle(wrapper).position === 'static') {
        wrapper.classList.add('relative');
    }

    let indicator = wrapper.querySelector('.inline-input-save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'inline-input-save-indicator absolute right-3 top-8 flex items-center justify-center pointer-events-none transition-all duration-300 opacity-0 z-10';
        wrapper.appendChild(indicator);
    }

    let clickToEdit = wrapper.querySelector('.click-to-edit-indicator');

    if (state === 'saving') {
        if (clickToEdit) clickToEdit.style.display = 'none';
        indicator.innerHTML = '<span class="text-[10px] font-bold text-indigo-500 bg-white/90 px-1.5 py-0.5 rounded shadow-sm animate-pulse">Saving...</span>';
        indicator.classList.remove('opacity-0');
        indicator.classList.add('opacity-100');
    } else if (state === 'saved') {
        indicator.innerHTML = '<span class="text-[10px] font-bold text-emerald-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i>Saved</span>';
        indicator.classList.remove('opacity-0');
        indicator.classList.add('opacity-100');
        lucide.createIcons();
        setTimeout(() => {
            indicator.classList.remove('opacity-100');
            indicator.classList.add('opacity-0');
            if (clickToEdit) clickToEdit.style.display = '';
        }, 2000);
    } else if (state === 'error') {
        indicator.innerHTML = '<span class="text-[10px] font-bold text-red-600 bg-white/90 px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1"><i data-lucide="x" class="w-3 h-3"></i>Failed</span>';
        indicator.classList.remove('opacity-0');
        indicator.classList.add('opacity-100');
        lucide.createIcons();
        setTimeout(() => {
            indicator.classList.remove('opacity-100');
            indicator.classList.add('opacity-0');
            if (clickToEdit) clickToEdit.style.display = '';
        }, 3000);
    }
};

window.attachClickToEditIndicators = function (container) {
    if (!container) return;

    // Select all form inputs that might be editable
    const inputs = container.querySelectorAll('input.form-input, textarea.form-input, select.form-input');

    inputs.forEach(input => {
        // Skip uneditable or un-applicable types
        if (input.disabled || input.readOnly) return;
        if (['checkbox', 'radio', 'file', 'color', 'hidden', 'time', 'date', 'datetime-local', 'month', 'week'].includes(input.type)) return;

        let wrapper = input.parentElement;
        if (!wrapper || wrapper.tagName === 'BODY' || wrapper.querySelector('.click-to-edit-indicator')) return;

        // Prepare the wrapper
        if (window.getComputedStyle(wrapper).position === 'static') {
            wrapper.classList.add('relative');
        }
        wrapper.classList.add('group');

        // Ensure the input has enough right padding so text doesn't hide behind the indicator
        input.classList.add('pr-[70px]');

        // Create the indicator
        const indicator = document.createElement('div');

        let topClass = 'top-8'; // standard input under a label
        if (input.tagName === 'TEXTAREA') topClass = 'top-9';
        if (!wrapper.querySelector('label')) topClass = 'top-1/2 -translate-y-1/2'; // Vertical center if no label

        indicator.className = `click-to-edit-indicator pointer-events-none absolute right-3 ${topClass} flex items-center gap-1 text-[10px] text-gray-400 font-medium opacity-70 transition-opacity z-0 bg-transparent px-1 rounded`;
        indicator.innerHTML = '<i data-lucide="edit-2" class="w-3 h-3"></i> Click to edit';
        wrapper.appendChild(indicator);

        // Hide when input is focused
        input.addEventListener('focus', () => {
            indicator.classList.remove('opacity-70');
            indicator.classList.add('opacity-0');
        });
        input.addEventListener('blur', () => {
            indicator.classList.remove('opacity-0');
            indicator.classList.add('opacity-70');
        });
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
};

window.switchView = function (viewId, context = null) {
    // Enforcement: check session expiry during navigation
    if (typeof checkSessionExpiry === 'function') checkSessionExpiry();

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
        case 'staff':
            renderOwnerStaffModule();
            break;
        case 'suppliers':
            renderOwnerSuppliersModule();
            break;
        case 'quotations':
            renderOwnerQuotationsModule();
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
        case 'staff':
            renderStaffModule();
            break;
        case 'suppliers':
            renderSuppliersModule();
            break;
        case 'quotations':
            renderQuotationsModule();
            break;
        case 'invoices':
            if (typeof renderInvoicesModule === 'function') renderInvoicesModule();
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
        const [reqs, access, unreadChat, unreadCommentsRes] = await Promise.all([
            supabaseClient.from('requests').select('id', { count: 'exact', head: true }).eq('owner_id', state.profile.id).eq('status', 'pending'),
            supabaseClient.from('access_requests').select('id', { count: 'exact', head: true }).eq('owner_id', state.profile.id).eq('status', 'pending'),
            dbMessages.getUnreadCount(null, 'owner'),
            supabaseClient.from('task_comments').select('id, tasks!inner(branch_id)', { count: 'exact', head: true }).eq('sender_role', 'branch').eq('is_read', false).in('tasks.branch_id', state.branches?.map(b => b.id) || [])
        ]);

        currentUnreadChat = unreadChat || 0;
        const pendingActions = (reqs.count || 0) + (access.count || 0);
        const unreadCommentsCount = unreadCommentsRes.count || 0;
        const totalPending = pendingActions + currentUnreadChat + unreadCommentsCount;
        state.pendingRequestCount = totalPending;

        // Update Sidebar Approval Badge
        const approvalBadge = document.getElementById('approvalBadge');
        if (approvalBadge) {
            if (pendingActions > 0) {
                approvalBadge.textContent = pendingActions > 99 ? '99+' : pendingActions;
                approvalBadge.classList.remove('hidden');
            } else {
                approvalBadge.classList.add('hidden');
            }
        }

        // Update Owner Tasks Badge
        const ownerTasksBadge = document.getElementById('ownerTasksBadge');
        if (ownerTasksBadge) {
            if (unreadCommentsCount > 0) {
                ownerTasksBadge.textContent = unreadCommentsCount > 99 ? '99+' : unreadCommentsCount;
                ownerTasksBadge.classList.remove('hidden');
            } else {
                ownerTasksBadge.classList.add('hidden');
            }
        }

        if (totalPending > oldRequestCount) hasNew = true;

        if (totalPending > 0) {
            document.getElementById('notifBadge')?.classList.remove('hidden');
        } else {
            document.getElementById('notifBadge')?.classList.add('hidden');
        }
    }
    else if (state.role === 'branch') {
        const [tasksRes, stockRes, reqsRes, unreadChat, unreadCommentsRes] = await Promise.all([
            supabaseClient.from('tasks').select('id', { count: 'exact', head: true }).eq('branch_id', state.branchId).eq('status', 'pending'),
            dbInventory.fetchAll(state.branchId),
            dbRequests.fetchByBranch(state.branchId),
            dbMessages.getUnreadCount(state.branchId, 'branch'),
            supabaseClient.from('task_comments').select('id, tasks!inner(branch_id)', { count: 'exact', head: true }).eq('sender_role', 'owner').eq('is_read', false).eq('tasks.branch_id', state.branchId)
        ]);

        currentUnreadChat = unreadChat || 0;
        const pendingTasks = tasksRes.count || 0;
        const lowStock = (stockRes.items || []).filter(i => i.quantity <= i.min_threshold).length;
        const unreadCommentsCount = unreadCommentsRes.count || 0;

        // Response tracking logic (Cross-device via DB)
        const dismissedRes = JSON.parse(localStorage.getItem('bms_dismissed_responses') || '[]');
        const responses = reqsRes.filter(r => (r.status === 'rejected' || (r.status === 'pending' && r.admin_response)) && !dismissedRes.includes(r.id));
        const lastChecked = state.branchProfile?.last_notif_check || '1970-01-01T00:00:00Z';
        const newResponses = responses.filter(r => new Date(r.updated_at || r.created_at) > new Date(lastChecked)).length;

        // Update Branch Tasks Badge
        const branchTasksBadge = document.getElementById('branchTasksBadge');
        if (branchTasksBadge) {
            const totalTasksNotif = pendingTasks + unreadCommentsCount;
            if (totalTasksNotif > 0) {
                branchTasksBadge.textContent = totalTasksNotif > 99 ? '99+' : totalTasksNotif;
                branchTasksBadge.classList.remove('hidden');
            } else {
                branchTasksBadge.classList.add('hidden');
            }
        }

        if (newResponses > 0 || currentUnreadChat > 0 || unreadCommentsCount > 0) hasNew = true;

        if (pendingTasks > 0 || lowStock > 0 || newResponses > 0 || currentUnreadChat > 0 || unreadCommentsCount > 0) {
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

// Unified Notification check is now triggered by realtime.js hub
checkNotifications(true);


window.showNotifications = async function () {
    const overlay = document.getElementById('notifOverlay');
    const panel = document.getElementById('notifPanel');
    const content = document.getElementById('notifContent');

    // Open panel first with loading state
    overlay.classList.remove('hidden', 'opacity-0');
    panel.classList.remove('translate-x-[calc(100%+2rem)]');

    // Update last checked timestamp for cross-device notification sync
    const now = new Date().toISOString();
    if (state.role === 'branch') {
        supabaseClient.from('branches').update({ last_notif_check: now }).eq('id', state.branchId);
        if (state.branchProfile) state.branchProfile.last_notif_check = now;
        checkNotifications(true);
    } else if (state.role === 'owner') {
        supabaseClient.from('profiles').update({ last_notif_check: now }).eq('id', state.profile.id);
        if (state.profile) state.profile.last_notif_check = now;
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

            const { data: unreadOwnerComments } = await supabaseClient
                .from('task_comments')
                .select('*, tasks!inner(title, branch_id)')
                .eq('sender_role', 'branch')
                .eq('is_read', false)
                .in('tasks.branch_id', branchIds)
                .order('created_at', { ascending: false });

            // Render Requests (Approval Queue)
            const allReqs = await dbRequests.fetchAll(state.profile.id);
            const pendingReqs = allReqs.filter(r => r.status === 'pending');

            let uiItems = [];

            if (accessRequests && accessRequests.length > 0) {
                accessRequests.forEach(req => {
                    uiItems.push({
                        time: new Date(req.created_at).getTime(),
                        html: `
                    <div onclick="switchView('security', '${req.id}'); closeNotifications();" class="notif-item p-4 bg-white dark:bg-white/5 border border-indigo-50 dark:border-indigo-900/40 shadow-sm relative overflow-hidden mb-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div class="flex items-center justify-between mb-1">
                            <p class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">PIN Reset for ${req.branches?.name || 'Unknown Branch'}</p>
                            <span class="text-[9px] font-black text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded uppercase flex-shrink-0 ml-2">Access Request</span>
                        </div>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">Requested by branch manager</p>
                        <div class="flex gap-2 mt-3">
                            <button onclick="event.stopPropagation(); approveReset('${req.id}', '${req.branch_id}');" class="flex-1 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Approve</button>
                            <button onclick="event.stopPropagation(); denyReset('${req.id}');" class="flex-1 py-1.5 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-gray-200 dark:hover:bg-white/15 transition-colors">Deny</button>
                        </div>
                    </div>`
                    });
                });
            }

            if (pendingReqs && pendingReqs.length > 0) {
                pendingReqs.forEach(req => {
                    uiItems.push({
                        time: new Date(req.created_at).getTime(),
                        html: `
                    <div onclick="switchView('requests', '${req.id}'); closeNotifications();" class="notif-item p-4 bg-white dark:bg-white/5 border border-indigo-50 dark:border-indigo-900/40 shadow-sm relative overflow-hidden mb-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                        <div class="flex items-center justify-between mb-1">
                            <p class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">${req.subject}</p>
                            <span class="text-[9px] font-black text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded uppercase flex-shrink-0 ml-2">Approval: ${req.type.split('_')[1] || req.type}</span>
                        </div>
                        <p class="text-xs text-gray-400 dark:text-gray-500 mb-1 font-medium">${req.branches?.name || 'Unknown Branch'}</p>
                        <p class="text-[10px] text-gray-500 dark:text-gray-500 italic truncate">"${req.message}"</p>
                    </div>`
                    });
                });
            }

            if (unreadOwnerComments && unreadOwnerComments.length > 0) {
                unreadOwnerComments.forEach(c => {
                    const branchName = state.branches.find(b => b.id === c.tasks.branch_id)?.name || 'Branch';
                    uiItems.push({
                        time: new Date(c.created_at).getTime(),
                        html: `
                    <div onclick="openTaskCommentNotif('${c.id}', '${c.task_id}')" class="notif-item p-4 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 shadow-sm relative overflow-hidden mb-3 cursor-pointer hover:bg-indigo-50 transition-colors text-left w-full block">
                        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                        <div class="flex items-center justify-between mb-1">
                            <p class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">Reply on "${c.tasks.title}"</p>
                            <span class="text-[9px] font-black text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded uppercase flex-shrink-0 ml-2">Task Reply</span>
                        </div>
                        <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5">${branchName} &bull; ${fmt.time(c.created_at)}</p>
                        <p class="text-xs text-gray-700 dark:text-gray-300 italic truncate border-l-2 border-indigo-200 pl-2">"${c.message}"</p>
                    </div>`
                    });
                });
            }

            if (activities && activities.length > 0) {
                const uniqueActivities = [];
                const seenBranches = new Set();
                for (const a of activities) {
                    if (!seenBranches.has(a.branch)) {
                        uniqueActivities.push(a);
                        seenBranches.add(a.branch);
                    }
                }
                const typeMap = {
                    sale: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', icon: 'shopping-cart', ic: 'text-emerald-600 dark:text-emerald-400', view: 'overview' },
                    expense: { bg: 'bg-red-100 dark:bg-red-500/20', icon: 'credit-card', ic: 'text-red-600 dark:text-red-400', view: 'overview' },
                    task_completed: { bg: 'bg-blue-100 dark:bg-blue-500/20', icon: 'check-circle', ic: 'text-blue-600 dark:text-blue-400', view: 'tasks' },
                    task_assigned: { bg: 'bg-amber-100 dark:bg-amber-500/20', icon: 'clipboard-list', ic: 'text-amber-600 dark:text-amber-400', view: 'tasks' }
                };

                uniqueActivities.forEach(a => {
                    const t = typeMap[a.type] || typeMap.task_completed;
                    uiItems.push({
                        time: new Date(a.created_at).getTime(),
                        html: `
                    <div onclick="switchView('${t.view}'); closeNotifications();" class="notif-item flex items-start gap-3 p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm mb-2 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div class="w-8 h-8 rounded-full ${t.bg} flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i data-lucide="${t.icon}" class="w-4 h-4 ${t.ic}"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">${a.message}</p>
                            <p class="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 uppercase font-bold">${a.branch} &bull; ${a.time}</p>
                        </div>
                        ${a.amount ? `<span class="text-xs font-black text-gray-700 dark:text-gray-300 mt-0.5">${fmt.currency(a.amount)}</span>` : ''}
                    </div>`
                    });
                });
            }

            uiItems.sort((a, b) => b.time - a.time);
            html += uiItems.map(i => i.html).join('');
        } else {
            // ── BRANCH LOGIC ─────────────────────────────────────────────────
            const [tasksRes, stockRes, requests, unreadCommentsRes] = await Promise.all([
                supabaseClient.from('tasks').select('*').eq('branch_id', state.branchId).neq('status', 'completed').order('deadline', { ascending: true }),
                dbInventory.fetchAll(state.branchId),
                dbRequests.fetchByBranch(state.branchId),
                supabaseClient.from('task_comments')
                    .select('*, tasks!inner(title, branch_id)')
                    .eq('sender_role', 'owner')
                    .eq('is_read', false)
                    .eq('tasks.branch_id', state.branchId)
                    .order('created_at', { ascending: false })
            ]);

            const tasks = tasksRes.data || [];
            const lowStock = (stockRes.items || []).filter(i => i.quantity <= i.min_threshold);
            const unreadBranchComments = unreadCommentsRes?.data || [];

            const dismissedRes = JSON.parse(localStorage.getItem('bms_dismissed_responses') || '[]');
            const respondedReqs = requests.filter(r => (r.status === 'rejected' || (r.status === 'pending' && r.admin_response)) && !dismissedRes.includes(r.id)).slice(0, 10);
            const pendingReqs = requests.filter(r => r.status === 'pending' && !r.admin_response);

            let uiItems = [];

            if (respondedReqs.length > 0) {
                respondedReqs.forEach(req => {
                    const statusColor = { approved: 'bg-emerald-500', rejected: 'bg-red-500', pending: 'bg-indigo-500' };
                    const badgeClass = req.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : req.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-indigo-500/20 text-indigo-400';
                    uiItems.push({
                        time: new Date(req.updated_at || req.created_at).getTime(),
                        html: `
                    <div onclick="openResponseNotif('${req.id}')" class="notif-item p-4 bg-white dark:bg-white/5 border border-indigo-50 border-r-4 border-r-indigo-100 shadow-sm relative overflow-hidden mb-3 hover:bg-gray-50 cursor-pointer transition-colors">
                        <div class="absolute top-0 left-0 w-1 h-full ${statusColor[req.status] || 'bg-gray-500'}"></div>
                        <div class="flex items-center justify-between mb-1.5">
                            <p class="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">Approval Response</p>
                            <span class="badge ${badgeClass} uppercase text-[9px] font-black">${req.status}</span>
                        </div>
                        <p class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight">${req.subject}</p>
                        ${req.admin_response ? `<p class="text-[11px] text-indigo-300 dark:text-indigo-300 italic bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20 mt-2 font-medium">"${req.admin_response}"</p>` : ''}
                    </div>`
                    });
                });
            }

            if (pendingReqs.length > 0) {
                pendingReqs.forEach(req => {
                    uiItems.push({
                        time: new Date(req.created_at).getTime(),
                        html: `
                    <div onclick="switchView('requests', '${req.id}'); closeNotifications();" class="notif-item p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 relative group overflow-hidden mb-3 opacity-80 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div class="absolute top-0 left-0 w-1 h-full bg-gray-300 dark:bg-gray-600"></div>
                        <div class="flex items-center justify-between mb-1.5">
                            <p class="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-wider">Pending Approval</p>
                            <span class="badge bg-gray-200/80 dark:bg-white/10 text-gray-500 dark:text-gray-400 uppercase text-[9px] font-black italic">Awaiting...</span>
                        </div>
                        <p class="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1 leading-tight">${req.subject}</p>
                    </div>`
                    });
                });
            }

            if (lowStock.length > 0) {
                lowStock.forEach(item => {
                    uiItems.push({
                        time: Date.now() + 1000,
                        html: `
                    <div onclick="switchView('inventory'); closeNotifications();" class="notif-item p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-2 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div class="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <i data-lucide="alert-triangle" class="w-4 h-4 text-orange-600 dark:text-orange-400"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">${item.name}</p>
                            <p class="text-[10px] text-orange-500 dark:text-orange-400 font-black uppercase tracking-widest leading-none mt-0.5">${item.quantity} In Stock</p>
                        </div>
                    </div>`
                    });
                });
            }

            if (unreadBranchComments && unreadBranchComments.length > 0) {
                unreadBranchComments.forEach(c => {
                    uiItems.push({
                        time: new Date(c.created_at).getTime(),
                        html: `
                    <div onclick="openTaskCommentNotif('${c.id}', '${c.task_id}')" class="notif-item p-4 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 shadow-sm relative overflow-hidden mb-3 cursor-pointer hover:bg-indigo-50 transition-colors text-left w-full block">
                        <div class="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                        <div class="flex items-center justify-between mb-1">
                            <p class="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">Task: ${c.tasks.title}</p>
                            <span class="text-[9px] font-black text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded uppercase flex-shrink-0 ml-2">Admin Reminder &bull; ${fmt.time(c.created_at)}</span>
                        </div>
                        <p class="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1.5">Admin</p>
                        <p class="text-xs text-gray-700 dark:text-gray-300 italic truncate border-l-2 border-indigo-200 pl-2">"${c.message}"</p>
                    </div>`
                    });
                });
            }

            if (tasks.length > 0) {
                tasks.forEach(task => {
                    const isOverdue = task.deadline && new Date(task.deadline) < new Date();
                    const statusColor = isOverdue ? 'text-red-500 dark:text-red-400' : 'text-indigo-500 dark:text-indigo-400';
                    uiItems.push({
                        time: isOverdue ? Date.now() + 500 : new Date(task.created_at).getTime(),
                        html: `
                    <div onclick="switchView('tasks'); closeNotifications();" class="notif-item p-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 mb-2 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div class="flex items-center gap-2 mb-1.5">
                            <span class="w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500' : 'bg-indigo-500'}"></span>
                            <p class="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">${task.title}</p>
                        </div>
                        <p class="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mb-2 font-medium">${task.description || 'No description provided'}</p>
                        ${task.deadline ? `<p class="text-[10px] font-black ${statusColor} uppercase tracking-tight flex items-center gap-1"><i data-lucide="calendar" class="w-3.5 h-3.5"></i> ${isOverdue ? 'OVERDUE' : 'Due'}: ${task.deadline}</p>` : ''}
                    </div>`
                    });
                });
            }

            uiItems.sort((a, b) => b.time - a.time);
            html += uiItems.map(i => i.html).join('');

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

window.checkSessionExpiry = function () {
    if (!state.profile) return;
    const sessionStart = localStorage.getItem('bms_session_start');
    if (!sessionStart) return;

    const maxHrs = state.profile.session_duration_hrs || 8;
    const ageMs = Date.now() - parseInt(sessionStart);

    if (ageMs > (maxHrs * 3600000)) {
        console.warn('Runtime session expiry triggered');
        // Prevent recursive calls and multiple toasts
        localStorage.removeItem('bms_session_start');
        alert('Your session has expired for security. You will be logged out.');
        if (typeof logout === 'function') logout();
    }
};

// ── Notification Action Handlers ───────────────────────────────────────────
window.openTaskCommentNotif = async function (commentId, taskId) {
    try {
        await dbTaskComments.markAsRead(commentId);
        closeNotifications();

        // Background update to clear notification badge 
        checkNotifications(true);

        // Open the relevant task details directly, this will trigger the fetch and display 
        if (typeof openDetailsModal === 'function') {
            openDetailsModal('task', taskId);
        }
    } catch (err) {
        showToast('Error opening notification', 'error');
        console.error(err);
    }
};

window.openResponseNotif = function (reqId) {
    let dismissed = JSON.parse(localStorage.getItem('bms_dismissed_responses') || '[]');
    if (!dismissed.includes(reqId)) {
        dismissed.push(reqId);
        localStorage.setItem('bms_dismissed_responses', JSON.stringify(dismissed));
    }

    // Switch to requests view and show the request
    switchView('requests', reqId);
    closeNotifications();
    checkNotifications(true);
};
