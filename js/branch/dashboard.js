// ── Branch: Dashboard ─────────────────────────────────────────────────────

window.renderBranchDashboard = function () {
    const container = document.getElementById('mainContent');

    // Get branch info from state (already loaded after login)
    const branch = state.branches.find(b => b.id === state.branchId) || { name: 'My Branch', manager: '', target: 0 };

    container.innerHTML = `
    <div class="space-y-6 slide-in">
        <!-- Header -->
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden w-fit">
            <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Branch Dashboard</div>
            <div class="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                <i data-lucide="calendar" class="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"></i>
                <span class="text-[10px] sm:text-xs font-medium whitespace-nowrap">${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
        </div>

        <!-- Loading KPIs -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashKPIs">
            <div class="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl text-white shadow-md animate-pulse">
                <p class="text-indigo-100 text-xs font-medium uppercase tracking-wide mb-6">Today's Sales</p>
                <div class="h-8 bg-white bg-opacity-20 rounded"></div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                <div class="h-4 bg-gray-100 rounded mb-4"></div>
                <div class="h-8 bg-gray-100 rounded"></div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                <div class="h-4 bg-gray-100 rounded mb-4"></div>
                <div class="h-8 bg-gray-100 rounded"></div>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
                <div class="h-4 bg-gray-100 rounded mb-4"></div>
                <div class="h-8 bg-gray-100 rounded"></div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onclick="openAddSaleModal()" class="p-2 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center group">
                    <i data-lucide="plus-circle" class="w-4 h-4 text-emerald-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-medium text-gray-700">New Sale</span>
                </button>
                <button onclick="openModal('addExpense')" class="p-2 border border-gray-200 rounded-lg hover:border-red-400 hover:bg-red-50 transition-all text-center group">
                    <i data-lucide="minus-circle" class="w-4 h-4 text-red-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-medium text-gray-700">Add Expense</span>
                </button>
                <button onclick="openModal('addCustomer')" class="p-2 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
                    <i data-lucide="user-plus" class="w-4 h-4 text-blue-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-medium text-gray-700">Add Customer</span>
                </button>
                <button onclick="openModal('addNote')" class="p-2 border border-gray-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all text-center group">
                    <i data-lucide="edit-3" class="w-4 h-4 text-amber-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-medium text-gray-700">Add Note</span>
                </button>
            </div>
        </div>

        <div id="dashTasksSection"></div>
    </div>`;
    lucide.createIcons();

    // Fetch data in parallel
    Promise.all([
        dbSales.fetchAll(state.branchId),
        dbExpenses.fetchAll(state.branchId),
        dbTasks.fetchByBranch(state.branchId)
    ]).then(([sales, expenses, tasks]) => {
        const todaySalesTotal = sales.reduce((s, r) => s + Number(r.amount), 0);
        const todayExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
        const progress = fmt.percent(todaySalesTotal, branch.target);

        document.getElementById('dashKPIs').innerHTML = `
        <div class="bg-gradient-to-br from-indigo-500 to-violet-600 p-4 md:p-5 rounded-2xl text-white shadow-sm stat-card min-w-0">
            <p class="text-[10px] md:text-xs text-indigo-100 uppercase tracking-wide mb-1 truncate">Today's Sales</p>
            <p class="text-dynamic-lg font-bold truncate" title="${fmt.currency(todaySalesTotal)}">${fmt.currency(todaySalesTotal)}</p>
        </div>
        <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
            <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Transactions</p>
            <p class="text-dynamic-lg font-bold text-gray-900 truncate">${sales.length}</p>
        </div>
        <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
            <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Expenses</p>
            <p class="text-dynamic-lg font-bold text-red-600 truncate" title="${fmt.currency(todayExpenses)}">${fmt.currency(todayExpenses)}</p>
        </div>
        <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
            <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Open Tasks</p>
            <p class="text-dynamic-lg font-bold text-gray-900 truncate">${tasks.filter(t => t.status !== 'completed').length}</p>
        </div>
        <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
            <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Sales Target</p>
            <p class="text-dynamic-lg font-bold text-indigo-600 truncate" title="${fmt.currency(branch.target)}">${fmt.currency(branch.target)}</p>
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

        lucide.createIcons();
    }).catch(err => {
        console.error('Dashboard load error:', err);
    });

    return '';
};
