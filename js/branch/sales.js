// ── Branch: Sales Module ──────────────────────────────────────────────────

window.renderSalesModule = function () {
    const container = document.getElementById('mainContent');
    // Show loading state immediately
    container.innerHTML = `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Sales</h2>
            <button onclick="openModal('addSale')" class="btn-primary btn-success">
                <i data-lucide="plus" class="w-4 h-4"></i> New Sale
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center text-gray-400">
                <i data-lucide="loader-2" class="w-8 h-8 mx-auto mb-2 animate-spin"></i>
                <p class="text-sm">Loading sales…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    // Async fetch then render
    dbSales.fetchAll(state.branchId).then(sales => {
        const todayTotal = sales.reduce((s, r) => s + Number(r.amount), 0);
        container.innerHTML = `
        <div class="space-y-6 slide-in">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-gray-900">Sales</h2>
                <button onclick="openModal('addSale')" class="btn-primary btn-success">
                    <i data-lucide="plus" class="w-4 h-4"></i> New Sale
                </button>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Today's Total</p>
                    <p class="text-2xl font-bold text-emerald-600">${fmt.currency(todayTotal)}</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Transactions</p>
                    <p class="text-2xl font-bold text-gray-900">${sales.length}</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Average Sale</p>
                    <p class="text-2xl font-bold text-gray-900">${sales.length ? fmt.currency(todayTotal / sales.length) : '$0.00'}</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-50">
                    <h3 class="font-semibold text-gray-900">Sales Record</h3>
                </div>
                ${sales.length === 0 ? `
                <div class="py-16 text-center">
                    <i data-lucide="shopping-cart" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                    <p class="text-gray-400 text-sm">No sales recorded yet</p>
                    <button onclick="openModal('addSale')" class="mt-4 btn-primary btn-success text-sm">Record First Sale</button>
                </div>` : `
                <table class="w-full">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        ${sales.map(sale => `
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 text-sm font-medium text-gray-900">${sale.customer}</td>
                            <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">${sale.items || '—'}</td>
                            <td class="px-6 py-4"><span class="badge bg-indigo-100 text-indigo-700">${sale.payment}</span></td>
                            <td class="px-6 py-4 text-sm text-gray-400">${fmt.date(sale.created_at)}</td>
                            <td class="px-6 py-4 text-right font-bold text-emerald-600">${fmt.currency(sale.amount)}</td>
                        </tr>`).join('')}
                    </tbody>
                    <tfoot class="bg-gray-50 border-t border-gray-200">
                        <tr>
                            <td colspan="4" class="px-6 py-3 text-sm font-semibold text-gray-700">Total</td>
                            <td class="px-6 py-3 text-right font-bold text-emerald-700 text-lg">${fmt.currency(todayTotal)}</td>
                        </tr>
                    </tfoot>
                </table>`}
            </div>
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load sales: ${err.message}</div>`;
    });

    // Return empty string — rendering is async
    return '';
};
