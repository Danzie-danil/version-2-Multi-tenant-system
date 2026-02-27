// ── Owner: Suppliers & POs Monitoring ─────────────────────────────────────
window.renderOwnerSuppliersModule = async function () {
    const area = document.getElementById('mainContent');
    area.innerHTML = `<div class="p-6"><div class="flex items-center gap-3 mb-4"><i data-lucide="loader-2" class="w-5 h-5 animate-spin text-indigo-500"></i><span class="text-sm text-gray-500">Loading suppliers & purchase orders…</span></div></div>`;
    lucide.createIcons();

    try {
        const branches = state.branches || await dbBranches.fetchAll(state.ownerId);

        // Suppliers are scoped to ownerId (enterprise_id)
        const suppliers = await dbSuppliers.fetchAll(state.ownerId);

        // POs are scoped per branch
        let allPOs = [];
        for (const b of branches) {
            const pos = await dbPurchaseOrders.fetchAll(b.id);
            pos.forEach(po => { po._branchName = b.name; });
            allPOs = allPOs.concat(pos);
        }

        // Sort POs by date descending
        allPOs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const pendingPOs = allPOs.filter(p => p.status === 'pending').length;
        const approvedPOs = allPOs.filter(p => p.status === 'approved').length;
        const totalPOValue = allPOs.reduce((s, p) => s + (p.total_amount || 0), 0);

        // Tab state
        const activeTab = window._ownerSupTab || 'suppliers';

        area.innerHTML = `
        <div class="p-4 sm:p-6 max-w-6xl mx-auto">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h2 class="text-xl sm:text-2xl font-black text-gray-900">Suppliers & POs Monitor</h2>
                    <p class="text-sm text-gray-500 mt-0.5">Manage suppliers and track purchase orders</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-gray-900">${suppliers.length}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Suppliers</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-gray-900">${allPOs.length}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Total POs</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-amber-500">${pendingPOs}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Pending</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-indigo-600">${fmt.currency(totalPOValue)}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Total Value</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-2 mb-4">
                <button onclick="window._ownerSupTab='suppliers'; renderOwnerSuppliersModule()" class="px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'suppliers' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
                    Suppliers (${suppliers.length})
                </button>
                <button onclick="window._ownerSupTab='pos'; renderOwnerSuppliersModule()" class="px-4 py-2 rounded-xl text-sm font-bold transition-colors ${activeTab === 'pos' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
                    Purchase Orders (${allPOs.length})
                </button>
            </div>

            <!-- Content -->
            <div class="space-y-3">
                ${activeTab === 'suppliers' ? renderOwnerSuppliersList(suppliers) : renderOwnerPOsList(allPOs)}
            </div>
        </div>`;
        lucide.createIcons();
    } catch (err) {
        area.innerHTML = `<div class="p-6"><p class="text-red-500 text-sm">Failed to load: ${err.message}</p></div>`;
    }
};

function renderOwnerSuppliersList(suppliers) {
    if (suppliers.length === 0) return `
        <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <i data-lucide="truck" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
            <p class="text-gray-400 text-sm">No suppliers found</p>
        </div>`;

    return suppliers.map(s => `
        <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all">
            <div class="flex items-start justify-between gap-3 mb-2">
                <h4 class="font-bold text-gray-900 text-sm">${s.name || 'Unnamed'}</h4>
                ${s.status === 'active'
            ? '<span class="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-emerald-100">Active</span>'
            : '<span class="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-gray-200">Inactive</span>'}
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                ${s.contact_person ? `<p class="text-xs text-gray-600"><i data-lucide="user" class="w-3 h-3 inline mr-1 text-gray-400"></i>${s.contact_person}</p>` : ''}
                ${s.phone ? `<p class="text-xs text-gray-600"><i data-lucide="phone" class="w-3 h-3 inline mr-1 text-gray-400"></i>${s.phone}</p>` : ''}
                ${s.email ? `<p class="text-xs text-gray-600"><i data-lucide="mail" class="w-3 h-3 inline mr-1 text-gray-400"></i>${s.email}</p>` : ''}
                ${s.address ? `<p class="text-xs text-gray-500 truncate"><i data-lucide="map-pin" class="w-3 h-3 inline mr-1 text-gray-400"></i>${s.address}</p>` : ''}
            </div>
        </div>`).join('');
}

function renderOwnerPOsList(pos) {
    if (pos.length === 0) return `
        <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <i data-lucide="file-text" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
            <p class="text-gray-400 text-sm">No purchase orders found</p>
        </div>`;

    const statusColors = {
        pending: 'bg-amber-50 text-amber-600 border-amber-100',
        approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        received: 'bg-blue-50 text-blue-600 border-blue-100',
        cancelled: 'bg-red-50 text-red-500 border-red-100'
    };

    return pos.map(po => `
        <div onclick="openEditModal('viewPO', '${po.id}')" class="bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
            <div class="flex items-start justify-between gap-3 mb-2">
                <div>
                    <h4 class="font-bold text-gray-900 text-sm">${po.po_number || 'N/A'}</h4>
                    <p class="text-xs text-indigo-600 font-medium">${po._branchName}</p>
                </div>
                <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${statusColors[po.status] || statusColors.pending}">${po.status}</span>
            </div>
            <div class="flex items-center justify-between mt-3">
                <p class="text-xs text-gray-500">${po.suppliers?.name || 'Unknown Supplier'}</p>
                <p class="font-black text-gray-900 text-sm">${fmt.currency(po.total_amount || 0)}</p>
            </div>
            <p class="text-[10px] text-gray-400 mt-2">${new Date(po.created_at).toLocaleDateString()}</p>
        </div>`).join('');
}
