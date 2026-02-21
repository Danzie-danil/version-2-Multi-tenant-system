// ── Branch: Customers Module ──────────────────────────────────────────────

window.renderCustomersModule = function () {
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-6 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Customer Directory</div>
            </div>
            <button onclick="openModal('addCustomer')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="user-plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Customer
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <span class="loader mx-auto mb-32"></span>
                <p class="text-gray-400 text-sm">Loading customer data…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    dbCustomers.fetchAll(state.branchId).then(customers => {
        container.innerHTML = `
        <div class="space-y-6 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Customer Directory</div>
                </div>
                <button onclick="openModal('addCustomer')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                    <i data-lucide="user-plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Customer
                </button>
            </div>

            <div class="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 gap-3 md:gap-4">
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Total Customers">Total Customers</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate">${customers.length}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Total Purchases Value">Total Purchases Value</p>
                    <p class="text-dynamic-lg font-bold text-indigo-600 truncate" title="${fmt.currency(customers.reduce((s, c) => s + Number(c.total_purchases || 0), 0))}">${fmt.currency(customers.reduce((s, c) => s + Number(c.total_purchases || 0), 0))}</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                ${customers.length === 0 ? `
                <div class="py-16 text-center">
                    <i data-lucide="users" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                    <p class="text-gray-400 text-sm">No customers added yet</p>
                    <button onclick="openModal('addCustomer')" class="mt-4 btn-primary text-sm">Add First Customer</button>
                </div>` : `
                <table class="w-full responsive-table">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Loyalty Pts</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Added</th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        ${customers.map(c => `
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4" data-label="Name">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                        <span class="text-sm font-bold text-indigo-600">${c.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <span class="font-medium text-sm text-gray-900">${c.name}</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600" data-label="Phone">${c.phone || '—'}</td>
                            <td class="px-6 py-4 text-sm text-gray-600" data-label="Email">${c.email || '—'}</td>
                            <td class="px-6 py-4" data-label="Loyalty Pts">
                                <span class="badge bg-amber-100 text-amber-700">${c.loyalty_points} pts</span>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-400" data-label="Added">${fmt.date(c.created_at)}</td>
                            <td class="px-6 py-4 text-center" data-label="Actions">
                                <div class="flex items-center justify-center gap-2">
                                    <button onclick="openEditModal('editCustomer', '${c.id}')" class="text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                        <i data-lucide="pencil" class="w-4 h-4"></i>
                                    </button>
                                    <button onclick="confirmDelete('customer', '${c.id}', '${c.name}')" class="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
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
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load customers: ${err.message}</div>`;
    });

    return '';
};
