// ── Branch: Reports Module ────────────────────────────────────────────────

window.renderReportsModule = function () {
    const branch = state.branches.find(b => b.id === state.branchId);
    const sales = state.sales.filter(s => s.branchId === state.branchId);
    const expenses = state.expenses.filter(e => e.branchId === state.branchId);
    const totalSales = sales.reduce((s, r) => s + r.amount, 0);
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalSales - totalExp;
    const progress = fmt.percent(branch.todaySales, branch.target);

    return `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Reports</h2>
            <span class="text-sm text-gray-500">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>

        <!-- Daily Summary Card -->
        <div class="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl text-white shadow-md dashboard-card">
            <h3 class="text-lg font-semibold mb-4 opacity-90">Daily Summary – ${branch.name}</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div class="min-w-0">
                    <p class="text-indigo-200 text-[10px] md:text-xs uppercase tracking-wide truncate" title="Revenue">Revenue</p>
                    <p class="text-dynamic-lg font-bold truncate" title="${fmt.currency(totalSales)}">${fmt.currency(totalSales)}</p>
                </div>
                <div class="min-w-0">
                    <p class="text-indigo-200 text-[10px] md:text-xs uppercase tracking-wide truncate" title="Expenses">Expenses</p>
                    <p class="text-dynamic-lg font-bold truncate" title="${fmt.currency(totalExp)}">${fmt.currency(totalExp)}</p>
                </div>
                <div class="min-w-0">
                    <p class="text-indigo-200 text-[10px] md:text-xs uppercase tracking-wide truncate" title="Net Profit">Net Profit</p>
                    <p class="text-dynamic-lg font-bold ${netProfit >= 0 ? 'text-emerald-200' : 'text-red-300'} truncate" title="${fmt.currency(netProfit)}">${fmt.currency(netProfit)}</p>
                </div>
            </div>
            <div class="mt-4">
                <div class="flex justify-between text-xs text-indigo-200 mb-1">
                    <span>Target progress</span><span>${progress}%</span>
                </div>
                <div class="w-full bg-white bg-opacity-20 rounded-full h-2">
                    <div class="bg-white h-2 rounded-full" style="width:${Math.min(progress, 100)}%"></div>
                </div>
            </div>
        </div>

        <!-- Detailed Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 class="font-semibold text-gray-900 mb-4">Sales Summary</h3>
                <div class="space-y-3">
                    ${[
            ['Total Transactions', sales.length, ''],
            ['Total Revenue', fmt.currency(totalSales), 'text-emerald-600'],
            ['Average Sale', sales.length ? fmt.currency(totalSales / sales.length) : '$0.00', ''],
            ['Target', fmt.currency(branch.target), ''],
            ['Remaining to Target', fmt.currency(Math.max(0, branch.target - totalSales)), 'text-amber-600']
        ].map(([label, value, cls]) => `
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span class="text-sm text-gray-600">${label}</span>
                        <span class="font-semibold ${cls || 'text-gray-900'}">${value}</span>
                    </div>`).join('')}
                </div>
            </div>

            <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 class="font-semibold text-gray-900 mb-4">Expense Summary</h3>
                <div class="space-y-3">
                    ${[
            ['Total Expense Records', expenses.length, ''],
            ['Total Spent', fmt.currency(totalExp), 'text-red-600'],
            ['Net Profit', fmt.currency(netProfit), netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'],
            ['Profit Margin', totalSales ? `${Math.round((netProfit / totalSales) * 100)}%` : '0%', ''],
            ['Customers Served', state.customers.filter(c => c.branchId === state.branchId).length, '']
        ].map(([label, value, cls]) => `
                    <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span class="text-sm text-gray-600">${label}</span>
                        <span class="font-semibold ${cls || 'text-gray-900'}">${value}</span>
                    </div>`).join('')}
                </div>
            </div>
        </div>

        <!-- Tasks Performance -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 class="font-semibold text-gray-900 mb-4">Task Performance</h3>
            <div class="grid grid-cols-3 gap-4">
                ${[['pending', 'bg-gray-100 text-gray-700', 'Pending'], ['in_progress', 'bg-blue-100 text-blue-700', 'In Progress'], ['completed', 'bg-emerald-100 text-emerald-700', 'Completed']].map(([s, cls, label]) => `
                <div class="text-center p-4 rounded-xl bg-gray-50">
                    <p class="text-2xl font-bold text-gray-900">${state.tasks.filter(t => t.branchId === state.branchId && t.status === s).length}</p>
                    <span class="badge ${cls} mt-2">${label}</span>
                </div>`).join('')}
            </div>
        </div>
    </div>`;
};
