// ── Branch: Inventory Module ──────────────────────────────────────────────

window.renderInventoryModule = function () {
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Inventory Management</div>
            </div>
            <button onclick="openModal('addInventoryItem')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Item
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <span class="loader mx-auto mb-32"></span>
                <p class="text-gray-400 text-sm">Loading inventory data…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    dbInventory.fetchAll(state.branchId).then(items => {
        const lowStock = items.filter(i => i.quantity <= i.min_threshold);

        container.innerHTML = `
        <div class="space-y-4 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Inventory Management</div>
                </div>
                <button onclick="openModal('addInventoryItem')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                    <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Item
                </button>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Total SKUs">Total SKUs</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate">${items.length}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Low Stock">Low Stock</p>
                    <p class="text-dynamic-lg font-bold text-red-600 truncate">${lowStock.length}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Total Units">Total Units</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate">${items.reduce((s, i) => s + i.quantity, 0)}</p>
                </div>
            </div>

            ${lowStock.length > 0 ? `
            <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"></i>
                <p class="text-sm text-amber-800"><strong>${lowStock.length} item(s)</strong> are at or below minimum threshold — reorder soon.</p>
            </div>` : ''}

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                ${items.length === 0 ? `
                <div class="py-16 text-center">
                    <i data-lucide="package" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                    <p class="text-gray-400 text-sm">No inventory items found</p>
                    <button onclick="openModal('addInventoryItem')" class="mt-4 btn-primary text-sm">Add First Item</button>
                </div>` : `
                <table class="w-full responsive-table">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Min</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        ${items.map(item => {
            const isLow = item.quantity <= item.min_threshold;
            return `
                        <tr class="hover:bg-gray-50 transition-colors ${isLow ? 'bg-red-50' : ''}">
                            <td class="px-6 py-4 font-medium text-sm text-gray-900" data-label="Product">${item.name}</td>
                            <td class="px-6 py-4 text-sm text-gray-500" data-label="Category"><span class="badge bg-gray-100 text-gray-600">${item.category || 'General'}</span></td>
                            <td class="px-6 py-4 text-sm text-gray-500 font-mono" data-label="SKU">${item.sku || '—'}</td>
                            <td class="px-6 py-4 text-sm text-gray-900" data-label="Price">${fmt.currency(item.price)}</td>
                            <td class="px-6 py-4 text-sm font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}" data-label="Qty">${item.quantity}</td>
                            <td class="px-6 py-4 text-sm text-gray-500" data-label="Min">${item.min_threshold}</td>
                            <td class="px-6 py-4" data-label="Status">
                                <span class="badge ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
                                    ${isLow ? 'Low Stock' : 'OK'}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center" data-label="Actions">
                                <div class="flex items-center justify-center gap-2">
                                    <button onclick="openEditModal('editInventoryItem', '${item.id}')" class="text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                        <i data-lucide="pencil" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="confirmDelete('inventory', '${item.id}', '${item.name}')" class="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>`;
        }).join('')}
                    </tbody>
                </table>`}
            </div>
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load inventory: ${err.message}</div>`;
    });

    return '';
};
