// ── Branch: Customers Module ──────────────────────────────────────────────

window.renderCustomersModule = function () {
    const customers = state.customers.filter(c => c.branchId === state.branchId);

    return `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Customers</h2>
            <button onclick="openModal('addCustomer')" class="btn-primary">
                <i data-lucide="user-plus" class="w-4 h-4"></i> Add Customer
            </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Customers</p>
                <p class="text-2xl font-bold text-gray-900">${customers.length}</p>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Added Today</p>
                <p class="text-2xl font-bold text-indigo-600">${customers.length}</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            ${customers.length === 0 ? `
            <div class="py-16 text-center">
                <i data-lucide="users" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                <p class="text-gray-400 text-sm">No customers added yet</p>
                <button onclick="openModal('addCustomer')" class="mt-4 btn-primary text-sm">Add First Customer</button>
            </div>` : `
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Loyalty Pts</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Added</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    ${customers.slice().reverse().map(c => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                    <span class="text-sm font-bold text-indigo-600">${c.name.charAt(0).toUpperCase()}</span>
                                </div>
                                <span class="font-medium text-sm text-gray-900">${c.name}</span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-600">${c.phone || '—'}</td>
                        <td class="px-6 py-4 text-sm text-gray-600">${c.email || '—'}</td>
                        <td class="px-6 py-4">
                            <span class="badge bg-amber-100 text-amber-700">${c.loyaltyPoints} pts</span>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-400">${c.joinedAt}</td>
                    </tr>`).join('')}
                </tbody>
            </table>`}
        </div>
    </div>`;
};
