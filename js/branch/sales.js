// ── Branch: Sales Module ──────────────────────────────────────────────────

window.renderSalesModule = function () {
    const container = document.getElementById('mainContent');
    // Show loading state immediately
    container.innerHTML = `
    <div class="space-y-6 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Sales Register</div>
            </div>
            <button onclick="openAddSaleModal()" class="btn-primary btn-success text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> New Sale
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <span class="loader mx-auto mb-32"></span>
                <p class="text-gray-400 text-sm">Loading sales data…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    // Async fetch then render
    Promise.all([
        dbSales.fetchAll(state.branchId),
        dbInventory.fetchAll(state.branchId) // Pre-fetch inventory so it's ready for "New Sale"
    ]).then(([sales, inventory]) => {
        // Inventory is cached in state by fetchAll, or we can use the return value if specialized
        // The modal uses dbInventory.fetchAll again which might be cached or fast, 
        // but ensuring it's loaded here guarantees freshness.

        const todayTotal = sales.reduce((s, r) => s + Number(r.amount), 0);
        container.innerHTML = `
        <div class="space-y-6 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Sales Register</div>
                </div>
                <button onclick="openAddSaleModal()" class="btn-primary btn-success text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                    <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> New Sale
                </button>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Today's Total">Today's Total</p>
                    <p class="text-dynamic-lg font-bold text-emerald-600 truncate" title="${fmt.currency(todayTotal)}">${fmt.currency(todayTotal)}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Transactions">Transactions</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate">${sales.length}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Average Sale">Average Sale</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate" title="${sales.length ? fmt.currency(todayTotal / sales.length) : '$0.00'}">${sales.length ? fmt.currency(todayTotal / sales.length) : '$0.00'}</p>
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
                <table class="w-full responsive-table">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        ${sales.map(sale => `
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4 text-sm font-medium text-gray-900" data-label="Customer">${sale.customer}</td>
                            <td class="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" data-label="Items">${sale.items || '—'}</td>
                            <td class="px-6 py-4" data-label="Payment"><span class="badge bg-indigo-100 text-indigo-700">${sale.payment}</span></td>
                            <td class="px-6 py-4 text-sm text-gray-400" data-label="Time">${fmt.date(sale.created_at)}</td>
                            <td class="px-6 py-4 text-right font-bold text-emerald-600" data-label="Amount">${fmt.currency(sale.amount)}</td>
                            <td class="px-6 py-4 text-center" data-label="Actions">
                                <div class="flex items-center justify-center gap-2">
                                    <button onclick="openEditModal('editSale', '${sale.id}')" class="text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                        <i data-lucide="pencil" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="confirmDelete('sale', '${sale.id}')" class="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
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
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load sales: ${err.message}</div>`;
    });

    // Return empty string — rendering is async
    return '';
};

// ── Helper: Open Add Sale Modal with Inventory Data ───────────────────────
// ── Helper: Open Add Sale Modal with Inventory Data ───────────────────────
window.openAddSaleModal = async function () {
    try {
        console.log(`[Sales] Fetching inventory for branch: ${state.branchId}`);
        // Show loading state on button if possible, or just wait
        const inventory = await dbInventory.fetchAll(state.branchId);
        console.log('[Sales] Inventory fetched:', inventory);

        if (!inventory || inventory.length === 0) {
            showToast('No products found! Please add items to Inventory first.', 'warning');
            // Still open modal so they can see it's empty, but the toast explains why
        }

        openModal('addSale', inventory);
    } catch (err) {
        console.error('[Sales] Error loading inventory:', err);
        showToast('Failed to load product list: ' + err.message, 'error');
    }
};

window.refreshSaleProducts = async function () {
    try {
        const btn = document.querySelector('button[onclick="refreshSaleProducts()"]');
        const icon = btn ? btn.querySelector('i') : null;
        const loader = btn ? btn.querySelector('.loader') : null;

        if (icon) icon.classList.add('hidden');
        if (loader) loader.classList.remove('hidden');

        const inventory = await dbInventory.fetchAll(state.branchId);
        const select = document.getElementById('saleProduct');

        if (!inventory || inventory.length === 0) {
            showToast('No products found.', 'warning');
            if (select) select.innerHTML = `<option value="" disabled selected>No products available</option>`;
        } else {
            showToast('Products refreshed!', 'success');

            const options = inventory.map(item => `
                <option value="${item.id}" data-price="${item.price}" data-name="${item.name}">
                    ${item.name} (${item.quantity} in stock) - ${fmt.currency(item.price)}
                </option>
            `).join('');

            if (select) select.innerHTML = `<option value="" disabled selected>Select a product...</option>${options}`;
        }

        if (icon) icon.classList.remove('hidden');
        if (loader) loader.classList.add('hidden');
    } catch (err) {
        showToast('Failed to refresh: ' + err.message, 'error');
    }
};

window.updateSaleTotal = function () {
    const productSelect = document.getElementById('saleProduct');
    const qtyInput = document.getElementById('saleQty');
    const amountInput = document.getElementById('saleAmount');

    if (productSelect && productSelect.selectedIndex > 0) {
        const option = productSelect.options[productSelect.selectedIndex];
        const price = parseFloat(option.getAttribute('data-price')) || 0;
        const qty = parseInt(qtyInput.value) || 0;
        amountInput.value = (price * qty).toFixed(2);
    }
};
