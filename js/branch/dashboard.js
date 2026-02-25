// ── Branch: Dashboard ─────────────────────────────────────────────────────

window.renderBranchDashboard = function () {
    const container = document.getElementById('mainContent');

    // Get branch info from state (already loaded after login)
    const branch = state.branches.find(b => b.id === state.branchId) || { name: 'My Branch', manager: '', target: 0 };

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <!-- Header -->
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden w-fit">
            <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Branch Dashboard</div>
            <div class="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                <i data-lucide="calendar" class="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"></i>
                <span class="text-[10px] sm:text-xs font-bold whitespace-nowrap">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
        </div>

        <!-- Loading KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3" id="dashKPIs">
            <div class="bg-gradient-to-br from-indigo-500 to-violet-600 p-3 rounded-2xl text-white shadow-md animate-pulse">
                <p class="text-indigo-100 text-xs font-bold uppercase tracking-tight mb-2 leading-tight">Today's Sales</p>
                <div class="h-6 bg-white bg-opacity-20 rounded w-3/4"></div>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                <div class="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                <div class="h-6 bg-gray-100 rounded w-3/4"></div>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                <div class="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                <div class="h-6 bg-gray-100 rounded w-3/4"></div>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                <div class="h-3 bg-gray-100 rounded w-1/2 mb-2"></div>
                <div class="h-6 bg-gray-100 rounded w-3/4"></div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-3 sm:grid-cols-5 gap-2 md:gap-3">
                <button onclick="openAddSaleModal()" class="p-4 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center group">
                    <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-bold text-gray-700 uppercase tracking-tight">New Sale</span>
                </button>
                <button onclick="openModal('addExpense')" class="p-4 border border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all text-center group">
                    <i data-lucide="minus-circle" class="w-4 h-4 text-red-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-bold text-gray-700 uppercase tracking-tight">Add Expense</span>
                </button>
                <button onclick="openModal('addCustomer')" class="p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
                    <i data-lucide="user-plus" class="w-4 h-4 text-blue-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-bold text-gray-700 uppercase tracking-tight">Add Customer</span>
                </button>
                <button onclick="openModal('addNote')" class="p-4 border border-gray-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all text-center group">
                    <i data-lucide="edit-3" class="w-4 h-4 text-amber-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-bold text-gray-700 uppercase tracking-tight">Add Note</span>
                </button>
                <button onclick="switchView('chat',null)" id="dashMsgBtn" class="relative p-4 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center group">
                    <div class="relative inline-block">
                        <i data-lucide="message-square" class="w-4 h-4 text-indigo-500 mx-auto group-hover:scale-110 transition-transform"></i>
                        <span id="dashMsgBadge" class="chat-unread-badge hidden absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow"></span>
                    </div>
                    <span class="text-xs font-bold text-gray-700 uppercase tracking-tight block mt-1">Messages</span>
                </button>
            </div>
        </div>

        <div id="dashTasksSection"></div>
        <div id="dashInventoryAlerts"></div>
    </div>`;
    lucide.createIcons();

    // Load unread message badge
    dbMessages.getUnreadCount(state.branchId, state.role).then(count => {
        const badge = document.getElementById('dashMsgBadge');
        if (badge && count > 0) {
            badge.textContent = count > 9 ? '9+' : count;
            badge.classList.remove('hidden');
        }
    }).catch(() => { });

    // Fetch data in parallel — all paginated APIs return { items, count }
    Promise.all([
        dbSales.fetchAll(state.branchId, { pageSize: 1000 }),
        dbExpenses.fetchAll(state.branchId, { pageSize: 1000 }),
        dbTasks.fetchAll(state.branchId, { pageSize: 1000 }),
        dbInventory.fetchAll(state.branchId, { pageSize: 1000 })
    ]).then(([salesRes, expensesRes, tasksRes, inventoryRes]) => {
        const sales = salesRes.items || [];
        const expenses = expensesRes.items || [];
        const tasks = tasksRes.items || [];
        const items = inventoryRes.items || [];

        const todaySalesTotal = sales.reduce((s, r) => s + Number(r.amount), 0);
        const todayExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);

        document.getElementById('dashKPIs').innerHTML = `
        <div class="bg-gradient-to-br from-indigo-500 to-violet-600 px-3 py-2 rounded-2xl text-white shadow-sm stat-card min-w-0 flex flex-col h-full">
            <p class="text-[11px] sm:text-xs text-indigo-100 uppercase tracking-tight font-bold whitespace-normal leading-tight">Today's Sales</p>
            <p class="text-dynamic-lg font-black truncate leading-none my-auto py-1" title="${fmt.currency(todaySalesTotal)}">${fmt.currency(todaySalesTotal)}</p>
        </div>
        <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
            <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight font-bold whitespace-normal leading-tight">Transactions</p>
            <p class="text-dynamic-lg font-black text-gray-900 truncate leading-none my-auto py-1">${sales.length}</p>
        </div>
        <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
            <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight font-bold whitespace-normal leading-tight">Expenses</p>
            <p class="text-dynamic-lg font-black text-red-600 truncate leading-none my-auto py-1" title="${fmt.currency(todayExpenses)}">${fmt.currency(todayExpenses)}</p>
        </div>
        <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
            <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight font-bold whitespace-normal leading-tight">Open Tasks</p>
            <p class="text-dynamic-lg font-black text-gray-900 truncate leading-none my-auto py-1">${tasks.filter(t => t.status !== 'completed').length}</p>
        </div>
        <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
            <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight font-bold whitespace-normal leading-tight">Sales Target</p>
            <p class="text-dynamic-lg font-black text-indigo-600 truncate leading-none my-auto py-1" title="${fmt.currency(branch.target)}">${fmt.currency(branch.target)}</p>
        </div>`;

        // Task preview
        const pendingTasks = tasks.filter(t => t.status !== 'completed').slice(0, 3);
        if (pendingTasks.length > 0) {
            document.getElementById('dashTasksSection').innerHTML = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-900">My Tasks</h3>
                    <button onclick="switchView('tasks',null)" class="text-sm text-indigo-600 hover:underline">View all →</button>
                </div>
                <div class="space-y-2">
                    ${pendingTasks.map(t => `
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div class="w-3 h-3 rounded-full ${t.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}"></div>
                        <p class="flex-1 text-sm text-gray-900">${t.title}</p>
                        ${priorityBadge(t.priority)}
                    </div>`).join('')}
                </div>
            </div>`;
        }

        // Inventory Alerts
        const lowStock = items.filter(i => i.quantity <= i.min_threshold);
        if (lowStock.length > 0) {
            document.getElementById('dashInventoryAlerts').innerHTML = `
            <div class="bg-amber-50 border border-amber-200 rounded-2xl p-6 mt-6 flex items-start gap-4">
                <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600"></i>
                </div>
                <div>
                    <h4 class="text-sm font-bold text-amber-900 mb-1">${lowStock.length} Low Stock Alert(s)</h4>
                    <p class="text-xs text-amber-700 mb-3">${lowStock.map(i => i.name).slice(0, 3).join(', ')}${lowStock.length > 3 ? '...' : ''} are below minimum levels.</p>
                    <button onclick="switchView('inventory')" class="text-xs font-bold text-amber-800 bg-amber-200 hover:bg-amber-300 py-1.5 px-3 rounded-lg transition-colors">
                        Manage Inventory
                    </button>
                </div>
            </div>`;
        }

        lucide.createIcons();
    }).catch(err => {
        console.error('Dashboard load error:', err);
    });

    return '';
};
