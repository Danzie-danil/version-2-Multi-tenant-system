// ── Branch: Expenses Module ───────────────────────────────────────────────

window.renderExpensesModule = function () {
    const branchExpenses = state.expenses.filter(e => e.branchId === state.branchId);
    const total = branchExpenses.reduce((s, e) => s + e.amount, 0);

    const categoryColors = {
        supplies: 'bg-blue-100 text-blue-700',
        utilities: 'bg-amber-100 text-amber-700',
        salary: 'bg-violet-100 text-violet-700',
        rent: 'bg-red-100 text-red-700',
        maintenance: 'bg-orange-100 text-orange-700',
        marketing: 'bg-pink-100 text-pink-700',
        other: 'bg-gray-100 text-gray-700'
    };

    return `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Expenses</h2>
            <button onclick="openModal('addExpense')" class="btn-primary btn-danger">
                <i data-lucide="plus" class="w-4 h-4"></i> Add Expense
            </button>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Spent</p>
                <p class="text-2xl font-bold text-red-600">${fmt.currency(total)}</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Transactions</p>
                <p class="text-2xl font-bold text-gray-900">${branchExpenses.length}</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Largest Expense</p>
                <p class="text-2xl font-bold text-gray-900">${branchExpenses.length ? fmt.currency(Math.max(...branchExpenses.map(e => e.amount))) : '$0.00'}</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-50">
                <h3 class="font-semibold text-gray-900">Expense Log</h3>
            </div>
            ${branchExpenses.length === 0 ? `
            <div class="py-16 text-center">
                <i data-lucide="credit-card" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                <p class="text-gray-400 text-sm">No expenses recorded yet</p>
                <button onclick="openModal('addExpense')" class="mt-4 btn-primary btn-danger text-sm">Add First Expense</button>
            </div>` : `
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    ${branchExpenses.slice().reverse().map(exp => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4 text-sm font-medium text-gray-900">${exp.description}</td>
                        <td class="px-6 py-4">
                            <span class="badge ${categoryColors[exp.category] || 'bg-gray-100 text-gray-700'}">${exp.category}</span>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-400">${exp.time}</td>
                        <td class="px-6 py-4 text-right font-bold text-red-600">${fmt.currency(exp.amount)}</td>
                    </tr>`).join('')}
                </tbody>
                <tfoot class="bg-gray-50 border-t border-gray-200">
                    <tr>
                        <td colspan="3" class="px-6 py-3 text-sm font-semibold text-gray-700">Total</td>
                        <td class="px-6 py-3 text-right font-bold text-red-700 text-lg">${fmt.currency(total)}</td>
                    </tr>
                </tfoot>
            </table>`}
        </div>
    </div>`;
};
