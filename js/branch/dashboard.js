// ── Branch: Dashboard ─────────────────────────────────────────────────────

window.renderBranchDashboard = function () {
    const branch = state.branches.find(b => b.id === state.branchId);
    const progress = fmt.percent(branch.todaySales, branch.target);
    const branchTasks = state.tasks.filter(t => t.branchId === state.branchId);
    const todayExpenses = state.expenses.filter(e => e.branchId === state.branchId).reduce((s, e) => s + e.amount, 0);
    const todaySalesCount = state.sales.filter(s => s.branchId === state.branchId).length;

    return `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <div>
                <h2 class="text-2xl font-bold text-gray-900">${branch.name}</h2>
                <p class="text-gray-500 text-sm mt-0.5">Manager: ${branch.manager}</p>
            </div>
            <div class="text-right">
                <p class="text-xs text-gray-500">Today's Target</p>
                <p class="text-2xl font-bold text-gray-900">${fmt.currency(branch.target)}</p>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl text-white shadow-md">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-indigo-100 text-xs font-medium uppercase tracking-wide">Today's Sales</span>
                    <i data-lucide="trending-up" class="w-5 h-5 text-indigo-200"></i>
                </div>
                <p class="text-3xl font-bold">${fmt.currency(branch.todaySales)}</p>
                <div class="mt-3 bg-white bg-opacity-20 rounded-full h-1.5">
                    <div class="bg-white h-1.5 rounded-full transition-all" style="width:${Math.min(progress, 100)}%"></div>
                </div>
                <p class="text-indigo-100 text-xs mt-2">${progress}% of target</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-500 text-xs uppercase tracking-wide">Transactions</span>
                    <i data-lucide="shopping-cart" class="w-4 h-4 text-indigo-500"></i>
                </div>
                <p class="text-2xl font-bold text-gray-900">${todaySalesCount}</p>
                <p class="text-xs text-gray-400 mt-1">Today</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-500 text-xs uppercase tracking-wide">Expenses</span>
                    <i data-lucide="credit-card" class="w-4 h-4 text-red-500"></i>
                </div>
                <p class="text-2xl font-bold text-red-600">${fmt.currency(todayExpenses)}</p>
                <p class="text-xs text-gray-400 mt-1">Today</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-500 text-xs uppercase tracking-wide">Open Tasks</span>
                    <i data-lucide="list-todo" class="w-4 h-4 text-amber-500"></i>
                </div>
                <p class="text-2xl font-bold text-gray-900">${branchTasks.filter(t => t.status !== 'completed').length}</p>
                <p class="text-xs text-gray-400 mt-1">${branchTasks.filter(t => t.status === 'completed').length} completed</p>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button onclick="openModal('addSale')" class="p-4 border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center group">
                    <i data-lucide="plus-circle" class="w-6 h-6 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="text-sm font-medium text-gray-700">New Sale</span>
                </button>
                <button onclick="openModal('addExpense')" class="p-4 border border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all text-center group">
                    <i data-lucide="minus-circle" class="w-6 h-6 text-red-500 mx-auto mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="text-sm font-medium text-gray-700">Add Expense</span>
                </button>
                <button onclick="openModal('addCustomer')" class="p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
                    <i data-lucide="user-plus" class="w-6 h-6 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="text-sm font-medium text-gray-700">Add Customer</span>
                </button>
                <button onclick="openModal('addNote')" class="p-4 border border-gray-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 transition-all text-center group">
                    <i data-lucide="edit-3" class="w-6 h-6 text-amber-500 mx-auto mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="text-sm font-medium text-gray-700">Add Note</span>
                </button>
            </div>
        </div>

        <!-- Tasks preview -->
        ${branchTasks.length > 0 ? `
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-gray-900">My Tasks</h3>
                <button onclick="switchView('tasks',null)" class="text-sm text-indigo-600 hover:underline">View all →</button>
            </div>
            <div class="space-y-2">
                ${branchTasks.slice(0, 3).map(t => `
                <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div class="w-3 h-3 rounded-full ${t.status === 'completed' ? 'bg-emerald-500' : t.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-300'}"></div>
                    <p class="flex-1 text-sm text-gray-900">${t.title}</p>
                    ${priorityBadge(t.priority)}
                </div>`).join('')}
            </div>
        </div>` : ''}
    </div>`;
};
