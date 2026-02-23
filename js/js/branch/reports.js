// ── Branch: Reports Module ────────────────────────────────────────────────

window.renderReportsModule = function () {
    const container = document.getElementById('mainContent');
    const branch = state.branches.find(b => b.id === state.branchId);

    // Fallback if branch not found
    if (!branch) {
        container.innerHTML = '<div class="py-20 text-center text-red-500">Branch data not found.</div>';
        return;
    }

    const sales = state.sales.filter(s => s.branchId === state.branchId);
    const expenses = state.expenses.filter(e => e.branchId === state.branchId);
    const totalSales = sales.reduce((s, r) => s + r.amount, 0);
    const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalSales - totalExp;
    const progress = fmt.percent(branch.todaySales, branch.target);

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Business Reports</div>
            </div>
            <div class="flex items-center gap-1.5 sm:gap-2 text-gray-400 mr-2">
                <i data-lucide="calendar" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                <span class="text-[10px] sm:text-xs font-medium whitespace-nowrap">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>

        <!-- Daily Summary Card -->
        <div class="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl text-white shadow-md dashboard-card">
            <h3 class="text-lg font-semibold mb-4 opacity-90">Daily Summary – ${branch.name}</h3>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
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
    lucide.createIcons();
};
