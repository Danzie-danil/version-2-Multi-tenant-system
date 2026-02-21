// ── Branch: Expenses Module ───────────────────────────────────────────────

window.renderExpensesModule = function () {
    const container = document.getElementById('mainContent');
    const categoryColors = {
        supplies: 'bg-blue-100 text-blue-700',
        utilities: 'bg-amber-100 text-amber-700',
        salary: 'bg-violet-100 text-violet-700',
        rent: 'bg-red-100 text-red-700',
        maintenance: 'bg-orange-100 text-orange-700',
        marketing: 'bg-pink-100 text-pink-700',
        other: 'bg-gray-100 text-gray-700'
    };

    container.innerHTML = `
    <div class="space-y-6 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Expense Management</div>
            </div>
            <button onclick="openModal('addExpense')" class="btn-primary btn-danger text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Expense
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <span class="loader mx-auto mb-32"></span>
                <p class="text-gray-400 text-sm">Loading expenses…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    dbExpenses.fetchAll(state.branchId).then(expenses => {
        const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
        container.innerHTML = `
        <div class="space-y-6 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Expense Management</div>
                </div>
                <button onclick="openModal('addExpense')" class="btn-primary btn-danger text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                    <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Expense
                </button>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Total Spent">Total Spent</p>
                    <p class="text-dynamic-lg font-bold text-red-600 truncate" title="${fmt.currency(total)}">${fmt.currency(total)}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Transactions">Transactions</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate">${expenses.length}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Largest Expense">Largest Expense</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate" title="${expenses.length ? fmt.currency(Math.max(...expenses.map(e => e.amount))) : '$0.00'}">${expenses.length ? fmt.currency(Math.max(...expenses.map(e => e.amount))) : '$0.00'}</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-50">
                    <h3 class="font-semibold text-gray-900">Expense Log</h3>
                </div>
                ${expenses.length === 0 ? `
                <div class="py-16 text-center">
                    <i data-lucide="credit-card" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                    <p class="text-gray-400 text-sm">No expenses recorded yet</p>
                    <button onclick="openModal('addExpense')" class="mt-4 btn-primary btn-danger text-sm">Add First Expense</button>
                </div>` : `
                <table class="w-full responsive-table">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        ${expenses.map(exp => `
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 text-sm font-medium text-gray-900" data-label="Description">${exp.description}</td>
                            <td class="px-6 py-4" data-label="Category">
                                <span class="badge ${categoryColors[exp.category] || 'bg-gray-100 text-gray-700'}">${exp.category}</span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-400" data-label="Date">${fmt.date(exp.created_at)}</td>
                            <td class="px-6 py-4 text-right font-bold text-red-600" data-label="Amount">${fmt.currency(exp.amount)}</td>
                            <td class="px-6 py-4 text-center" data-label="Actions">
                                <div class="flex items-center justify-center gap-2">
                                    <button onclick="openEditModal('editExpense', '${exp.id}')" class="text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                        <i data-lucide="pencil" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="confirmDelete('expense', '${exp.id}', '${exp.description}')" class="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>`}
            </div>
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load expenses: ${err.message}</div>`;
    });

    return '';
};
