// ── Branch: Inventory Module ──────────────────────────────────────────────

window.renderInventoryModule = function () {
    const items = state.inventory.filter(i => i.branchId === state.branchId);

    return `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Inventory</h2>
            <button onclick="openModal('addInventoryItem')" class="btn-primary">
                <i data-lucide="plus" class="w-4 h-4"></i> Add Item
            </button>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total SKUs</p>
                <p class="text-2xl font-bold text-gray-900">${items.length}</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Low Stock</p>
                <p class="text-2xl font-bold text-red-600">${items.filter(i => i.quantity <= i.minThreshold).length}</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Units</p>
                <p class="text-2xl font-bold text-gray-900">${items.reduce((s, i) => s + i.quantity, 0)}</p>
            </div>
        </div>

        ${items.filter(i => i.quantity <= i.minThreshold).length > 0 ? `
        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"></i>
            <p class="text-sm text-amber-800"><strong>${items.filter(i => i.quantity <= i.minThreshold).length} item(s)</strong> are at or below minimum threshold — reorder soon.</p>
        </div>` : ''}

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            ${items.length === 0 ? `
            <div class="py-16 text-center">
                <i data-lucide="package" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                <p class="text-gray-400 text-sm">No inventory items found for this branch</p>
            </div>` : `
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Min</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    ${items.map(item => {
        const isLow = item.quantity <= item.minThreshold;
        return `
                        <tr class="hover:bg-gray-50 transition-colors ${isLow ? 'bg-red-50' : ''}">
                            <td class="px-6 py-4 font-medium text-sm text-gray-900">${item.name}</td>
                            <td class="px-6 py-4 text-sm text-gray-500 font-mono">${item.sku}</td>
                            <td class="px-6 py-4 text-sm text-gray-900">${fmt.currency(item.price)}</td>
                            <td class="px-6 py-4 text-sm font-bold ${isLow ? 'text-red-600' : 'text-gray-900'}">${item.quantity}</td>
                            <td class="px-6 py-4 text-sm text-gray-500">${item.minThreshold}</td>
                            <td class="px-6 py-4">
                                <span class="badge ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}">
                                    ${isLow ? 'Low Stock' : 'OK'}
                                </span>
                            </td>
                        </tr>`;
    }).join('')}
                </tbody>
            </table>`}
        </div>
    </div>`;
};
