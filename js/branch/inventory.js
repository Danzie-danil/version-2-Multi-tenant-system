// ── Branch: Inventory Module ──────────────────────────────────────────────

// ── Selection State ──────────────────────────────────────────────────────────
window.inventorySelection = new Set();
window.inventoryPageState = {
    page: 1,
    pageSize: 10,
    totalCount: 0
};

window.changeInventoryPage = function (delta) {
    const newPage = window.inventoryPageState.page + delta;
    const maxPage = Math.ceil(window.inventoryPageState.totalCount / window.inventoryPageState.pageSize) || 1;
    if (newPage < 1 || newPage > maxPage) return;
    window.inventoryPageState.page = newPage;
    renderInventoryModule();
};

window.toggleInventorySelection = function (id) {
    if (window.inventorySelection.has(id)) {
        window.inventorySelection.delete(id);
    } else {
        window.inventorySelection.add(id);
    }
    updateInventoryBulkActionBar();
};

window.toggleSelectAllInventory = function (checked) {
    const checkboxes = document.querySelectorAll('.inventory-checkbox');
    window.inventorySelection.clear();
    checkboxes.forEach(cb => {
        cb.checked = checked;
        if (checked) window.inventorySelection.add(cb.value);
    });
    updateInventoryBulkActionBar();
};

window.updateInventoryBulkActionBar = function () {
    const count = window.inventorySelection.size;
    const countSpan = document.getElementById('inventorySelectedCount');
    if (countSpan) countSpan.textContent = `${count} selected`;

    const deleteBtn = document.getElementById('btnBulkDeleteInventory');
    if (deleteBtn) deleteBtn.disabled = count === 0;

    const selectAll = document.getElementById('selectAllInventory');
    const checkboxes = document.querySelectorAll('.inventory-checkbox');
    if (selectAll && checkboxes.length > 0) {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        selectAll.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }
};

window.bulkDeleteSelectedInventory = async function () {
    const count = window.inventorySelection.size;
    if (count === 0) return;
    if (!confirm(`Are you sure you want to delete ${count} selected items?`)) return;

    try {
        const ids = Array.from(window.inventorySelection);
        await dbInventory.bulkDelete(ids);
        window.inventorySelection.clear();
        showToast(`Deleted ${count} items`, 'success');
        renderInventoryModule();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};

window.openInventoryTagModal = async function (itemId, isBulk = false) {
    document.querySelectorAll('.tags-modal-overlay').forEach(el => el.remove());
    const title = isBulk ? `Tag ${window.inventorySelection.size} Items` : 'Manage Product Tags';

    let currentTags = [];
    if (!isBulk && itemId) {
        try {
            const allTags = await dbInventoryTags.fetchAll(state.branchId);
            currentTags = allTags.filter(t => t.inventory_id === itemId);
        } catch (err) { console.error(err); }
    }

    const overlay = document.createElement('div');
    overlay.className = 'tags-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-200';
    overlay.style.opacity = '0';

    overlay.innerHTML = `
        <div class="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden transform scale-95 transition-transform duration-200">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <i data-lucide="tag" class="w-5 h-5 text-indigo-500"></i> ${title}
                </h3>
                <button type="button" class="close-tags-btn p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <div class="p-6">
                <div class="flex gap-2 mb-6">
                    <input type="text" id="newInvTagName" placeholder="New tag name..." class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                    <button id="submitInvTagBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">Add</button>
                </div>

                ${!isBulk ? `
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Tags</p>
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${currentTags.length ? currentTags.map(t => `
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                                # ${t.tag}
                                <i data-lucide="x" onclick="removeInvTagModal('${t.id}', '${itemId}')" class="w-3.5 h-3.5 cursor-pointer hover:text-red-600"></i>
                            </span>
                        `).join('') : '<p class="text-xs text-gray-400 italic">No tags yet</p>'}
                    </div>
                ` : ''}

                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Suggestions</p>
                <div class="flex flex-wrap gap-2">
                    ${['Fast Moving', 'Fragile', 'Premium', 'New Out', 'Bulk'].map(t => `
                        <button onclick="quickAddInvTag('${t}', '${itemId}', ${isBulk})" class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all">
                            + ${t}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button class="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors close-tags-btn">Done</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons();
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('.transform').classList.replace('scale-95', 'scale-100');
    });

    const closeTagsModal = () => {
        overlay.style.opacity = '0';
        overlay.querySelector('.transform').classList.replace('scale-100', 'scale-95');
        setTimeout(() => overlay.remove(), 200);
        renderInventoryModule();
    };

    overlay.querySelectorAll('.close-tags-btn').forEach(btn => btn.addEventListener('click', closeTagsModal));

    const submitBtn = overlay.querySelector('#submitInvTagBtn');
    const input = overlay.querySelector('#newInvTagName');

    const handleAdd = async () => {
        const tagName = input.value.trim();
        if (!tagName) return;
        submitBtn.disabled = true;
        try {
            if (isBulk) {
                const ids = Array.from(window.inventorySelection);
                await Promise.all(ids.map(id => dbInventoryTags.add(state.branchId, id, tagName)));
                window.inventorySelection.clear();
                showToast(`Tagged ${ids.length} items`, 'success');
                closeTagsModal();
            } else {
                await dbInventoryTags.add(state.branchId, itemId, tagName);
                openInventoryTagModal(itemId, false);
            }
        } catch (err) { showToast('Error adding tag', 'error'); }
        finally { submitBtn.disabled = false; }
    };

    submitBtn.addEventListener('click', handleAdd);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAdd(); });

    window.removeInvTagModal = async (tagId, itemId) => {
        try {
            await dbInventoryTags.delete(tagId);
            openInventoryTagModal(itemId, false);
        } catch (err) { showToast('Error', 'error'); }
    };

    window.quickAddInvTag = async (tagName, itemId, isBulk) => {
        input.value = tagName;
        handleAdd();
    };
};

window.renderInventoryModule = function () {
    window.inventorySelection.clear();
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
                <p class="text-gray-400 text-sm">Loading inventory data…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    Promise.all([
        dbInventory.fetchAll(state.branchId, {
            page: window.inventoryPageState.page,
            pageSize: window.inventoryPageState.pageSize
        }),
        dbInventoryTags.fetchAll(state.branchId)
    ]).then(([itemsRes, tags]) => {
        const items = itemsRes.items;
        window.inventoryPageState.totalCount = itemsRes.count;
        const totalPages = Math.ceil(window.inventoryPageState.totalCount / window.inventoryPageState.pageSize) || 1;
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
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Total SKUs">Total SKUs</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate">${window.inventoryPageState.totalCount}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Low Stock">Items on Pge</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate">${items.length}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Total Units">Low Stock (Page)</p>
                    <p class="text-dynamic-lg font-bold text-red-600 truncate">${lowStock.length}</p>
                </div>
            </div>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 mb-20 md:mb-0">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-xl font-bold text-gray-900">Product List</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 font-medium">Page ${window.inventoryPageState.page} of ${totalPages}</span>
                    </div>
                </div>
                
                <!-- Search & Filters -->
                <div class="relative mb-4">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="w-4 h-4 text-indigo-500"></i>
                    </div>
                    <input type="text" placeholder="Search products..." class="w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                </div>

                <!-- Bulk Action Bar -->
                <div class="flex flex-wrap items-center justify-between bg-gray-50/70 border border-gray-100 rounded-xl p-2.5 md:p-3 mb-5 gap-3">
                    <div class="flex items-center gap-3 pl-2">
                        <input type="checkbox" id="selectAllInventory" onchange="toggleSelectAllInventory(this.checked)" class="rounded w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer">
                        <span class="text-sm font-semibold text-gray-800">Select All <span id="inventorySelectedCount" class="font-normal text-xs text-gray-400 ml-1.5 hidden sm:inline-block">0 selected</span></span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="btnBulkDeleteInventory" disabled onclick="bulkDeleteSelectedInventory()" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors disabled:opacity-50">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5 text-gray-400"></i> <span class="hidden sm:inline-block">Delete Selected</span>
                        </button>
                        <button id="btnBulkTagInventory" disabled onclick="openInventoryTagModal(null, true)" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-50">
                            <i data-lucide="tag" class="w-3.5 h-3.5 text-indigo-500"></i> <span class="hidden sm:inline-block">Apply Tag</span>
                        </button>
                    </div>
                </div>

                <div class="space-y-4">
                    ${items.length === 0 ? `
                        <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <i data-lucide="package" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                            <p class="text-gray-400 text-sm">No products history found for this page</p>
                        </div>
                    ` : items.map(item => {
            const isLow = item.quantity <= item.min_threshold;
            return `
                        <div class="bg-white border border-gray-200 border-l-[3px] ${isLow ? 'border-l-red-500 bg-red-50/10' : 'border-l-indigo-500'} rounded-2xl p-4 flex gap-3 hover:shadow-md transition-all group relative">
                            <div class="pt-0.5">
                                <input type="checkbox" value="${item.id}" onchange="toggleInventorySelection('${item.id}')" class="inventory-checkbox rounded w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer" ${window.inventorySelection.has(item.id) ? 'checked' : ''}>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex justify-between items-start mb-1 gap-4">
                                    <div class="flex flex-col">
                                        <h4 class="font-bold text-gray-900 text-[15px] truncate">${item.name}</h4>
                                        <div class="flex flex-wrap gap-1 mt-1">
                                            <span class="badge bg-gray-100 text-gray-600 text-[10px] py-0 px-2">${item.category || 'General'}</span>
                                            ${tags.filter(t => t.inventory_id === item.id).map(t => `
                                                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                    # ${t.tag}
                                                </span>
                                            `).join('')}
                                            ${isLow ? `<span class="badge bg-red-100 text-red-700 text-[10px] py-0 px-2">Low Stock</span>` : ''}
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-lg font-black text-gray-900">${fmt.currency(item.price)}</p>
                                        <p class="text-[10px] text-gray-400">Stock: <span class="${isLow ? 'text-red-600 font-bold' : ''}">${item.quantity}</span> / ${item.min_threshold}</p>
                                    </div>
                                </div>
                                <div class="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                                    <button onclick="openEditModal('editInventoryItem', '${item.id}')" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                                        <i data-lucide="edit-2" class="w-3.5 h-3.5"></i> Edit
                                    </button>
                                    <button onclick="openInventoryTagModal('${item.id}', false)" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                                        <i data-lucide="tag" class="w-3.5 h-3.5"></i> Tag
                                    </button>
                                    <div class="flex-1"></div>
                                    <button onclick="confirmDelete('inventory', '${item.id}', '${item.name}')" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-400 hover:text-red-600 transition-colors">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5 text-gray-300"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>`;
        }).join('')}
                </div>

                <!-- Pagination Footer -->
                <div class="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <p class="text-xs text-gray-500">Showing <span class="font-bold text-gray-900">${items.length}</span> of <span class="font-bold text-gray-900">${window.inventoryPageState.totalCount}</span> products</p>
                    <div class="flex items-center gap-2">
                        <button onclick="changeInventoryPage(-1)" ${window.inventoryPageState.page === 1 ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        </button>
                        <div class="flex items-center gap-1">
                            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return `<button onclick="window.inventoryPageState.page = ${p}; renderInventoryModule()" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${window.inventoryPageState.page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}">${p}</button>`;
        }).join('')}
                        </div>
                        <button onclick="changeInventoryPage(1)" ${window.inventoryPageState.page === totalPages ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load inventory: ${err.message}</div>`;
    });

    return '';
};
