// ── Branch: Inventory Module ──────────────────────────────────────────────

// ── Selection State ──────────────────────────────────────────────────────────
let inventorySelection = new Set();
window.inventorySelection = inventorySelection;
let inventoryPageState = {
    page: 1,
    pageSize: 5,
    totalCount: 0
};
window.inventoryPageState = inventoryPageState;

export function changeInventoryPage(delta) {
    const newPage = inventoryPageState.page + delta;
    const maxPage = Math.ceil(inventoryPageState.totalCount / inventoryPageState.pageSize) || 1;
    if (newPage < 1 || newPage > maxPage) return;
    inventoryPageState.page = newPage;
    renderInventoryModule();
};

export function toggleInventorySelection(id) {
    if (inventorySelection.has(id)) {
        inventorySelection.delete(id);
    } else {
        inventorySelection.add(id);
    }
    updateInventoryBulkActionBar();
};

export function toggleSelectAllInventory(checked) {
    const checkboxes = document.querySelectorAll('.inventory-checkbox');
    inventorySelection.clear();
    checkboxes.forEach(cb => {
        cb.checked = checked;
        if (checked) inventorySelection.add(cb.value);
    });
    updateInventoryBulkActionBar();
};

export function updateInventoryBulkActionBar() {
    const count = inventorySelection.size;
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

export async function bulkDeleteSelectedInventory() {
    const count = inventorySelection.size;
    if (count === 0) return;
    const confirmed = await window.confirmModal('Confirm Deletion', 'Are you sure you want to delete the selected items?', 'Yes, Delete', 'Cancel');
    if (!confirmed) return;

    try {
        const ids = Array.from(inventorySelection);
        await dbInventory.bulkDelete(ids);
        inventorySelection.clear();
        showToast(`Deleted ${count} items`, 'success');
        renderInventoryModule();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};

export async function openInventoryTagModal(itemId, isBulk = false) {
    document.querySelectorAll('.tags-modal-overlay').forEach(el => el.remove());
    const title = isBulk ? `Tag ${inventorySelection.size} Items` : 'Manage Product Tags';

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
                        <button onclick="quickAddInvTag('${t}', '${itemId}', ${isBulk})" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all uppercase tracking-tight">
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
                const ids = Array.from(inventorySelection);
                await Promise.all(ids.map(id => dbInventoryTags.add(state.branchId, id, tagName)));
                inventorySelection.clear();
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

export function renderInventoryModule() {
    inventorySelection.clear();
    const container = document.getElementById('mainContent');

    window.importInventoryCSV = function () {
        triggerCSVUpload(async (data) => {
            if (!data || data.length === 0) {
                showToast('CSV is empty or invalid', 'error');
                return;
            }

            // Expected headers: name, sku, quantity, min_threshold, price, category
            const records = data.map(row => ({
                branch_id: state.branchId,
                name: row.name || 'Unnamed Item',
                sku: row.sku || '',
                quantity: fmt.parseNumber(row.quantity || 0),
                min_threshold: fmt.parseNumber(row.min_threshold || 10),
                price: fmt.parseNumber(row.price || 0),
                category: row.category || 'General'
            })).filter(r => r.name !== 'Unnamed Item');

            if (records.length === 0) {
                showToast('No valid records found in CSV', 'error');
                return;
            }

            const confirmed = await window.confirmModal('Confirm Import', `Are you sure you want to import ${records.length} items?`, 'Yes, Import', 'Cancel');
            if (!confirmed) return;

            try {
                await dbInventory.bulkAdd(records);
                showToast(`Successfully imported ${records.length} items`, 'success');
                renderInventoryModule();
            } catch (err) {
                showToast('Import failed: ' + err.message, 'error');
            }
        });
    };

    window.downloadInventoryCSVTemplate = function () {
        const headers = ['name', 'sku', 'category', 'price', 'quantity', 'min_threshold'];
        downloadCSVTemplate('inventory_template.csv', headers);
    };
    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Inventory Management</div>
            </div>
            <div class="flex gap-1.5 sm:gap-2">
                <button onclick="openModal('importInventoryInfo')" title="Import CSV" class="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 flex-shrink-0 flex items-center justify-center gap-1 sm:gap-1.5">
                    <i data-lucide="upload" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> <span>Import CSV</span>
                </button>
                <button onclick="openModal('addInventoryItem')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 flex items-center justify-center gap-1 sm:gap-1.5">
                    <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> <span class="hidden sm:inline-block">Add Item</span><span class="inline-block sm:hidden">Add</span>
                </button>
            </div>
        </div>
        ${renderPremiumLoader('Loading inventory data…')}
    </div>`;
    lucide.createIcons();

    Promise.all([
        dbInventory.fetchAll(state.branchId, {
            page: inventoryPageState.page,
            pageSize: inventoryPageState.pageSize
        }),
        dbInventoryTags.fetchAll(state.branchId)
    ]).then(([itemsRes, tags]) => {
        const items = itemsRes.items;
        inventoryPageState.totalCount = itemsRes.count;
        const totalPages = Math.ceil(inventoryPageState.totalCount / inventoryPageState.pageSize) || 1;
        const lowStock = items.filter(i => i.quantity <= i.min_threshold);

        container.innerHTML = `
        <div class="space-y-4 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Inventory Management</div>
                </div>
                <div class="flex gap-1.5 sm:gap-2">
                    <button onclick="openModal('importInventoryInfo')" title="Import CSV" class="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-gray-700 hover:bg-gray-50 flex-shrink-0 flex items-center justify-center gap-1 sm:gap-1.5">
                        <i data-lucide="upload" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> <span>Import CSV</span>
                    </button>
                    <button onclick="openModal('addInventoryItem')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 font-bold flex items-center justify-center gap-1 sm:gap-1.5">
                        <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> <span class="hidden sm:inline-block">Add Item</span><span class="inline-block sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Total SKUs">Total SKUs</p>
                    <p class="text-dynamic-lg font-black text-gray-900 truncate leading-none my-auto py-1">${inventoryPageState.totalCount}</p>
                </div>
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Low Stock">Items on Pge</p>
                    <p class="text-dynamic-lg font-black text-gray-900 truncate leading-none my-auto py-1">${items.length}</p>
                </div>
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Total Units">Low Stock (Page)</p>
                    <p class="text-dynamic-lg font-black text-red-600 truncate leading-none my-auto py-1">${lowStock.length}</p>
                </div>
            </div>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 mb-20 md:mb-0">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-xl font-bold text-gray-900">Product List</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 font-medium">Page ${inventoryPageState.page} of ${totalPages}</span>
                    </div>
                </div>
                
                <!-- Search & Filters -->
                <div class="relative mb-4">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="w-4 h-4 text-indigo-500"></i>
                    </div>
                    <input type="text" placeholder="Search products..." oninput="filterList('inventoryList', this.value)" class="w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
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

                <div class="space-y-4" id="inventoryList">
                    ${items.length === 0 ? `
                        <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <i data-lucide="package" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                            <p class="text-gray-400 text-sm">No products history found for this page</p>
                        </div>
                    ` : items.map(item => {
            const isLow = item.quantity <= item.min_threshold;
            return `
                        <div onclick="openDetailsModal('inventory', '${item.id}')" data-search="${item.name.toLowerCase()} ${(item.category || '').toLowerCase()} ${(item.sku || '').toLowerCase()}" class="bg-white border border-gray-200 border-l-[4px] ${isLow ? 'border-l-red-500 bg-red-50/10' : 'border-l-indigo-500'} rounded-2xl p-5 md:p-6 flex gap-4 hover:shadow-md transition-all group relative cursor-pointer">
                            <div class="pt-1" onclick="event.stopPropagation()">
                                <input type="checkbox" value="${item.id}" onchange="toggleInventorySelection('${item.id}')" class="inventory-checkbox rounded w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer" ${inventorySelection.has(item.id) ? 'checked' : ''}>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-3 mb-1">
                                    <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                        <h4 class="font-bold text-gray-900 text-sm sm:text-base truncate">${item.name}</h4>
                                        <span class="text-xs text-gray-400 font-medium whitespace-nowrap flex-shrink-0 hidden sm:inline-block">${item.category || 'General'}</span>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-[10px] uppercase font-bold text-gray-400 leading-none">${fmt.dateTime(item.created_at)}</p>
                                    </div>
                                </div>
                                <div class="flex items-end justify-between gap-3">
                                    <div class="flex flex-wrap gap-1.5 overflow-hidden pt-1">
                                        ${isLow ? `<span class="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap flex-shrink-0">Low Stock</span>` : ''}
                                        ${tags.filter(t => t.inventory_id === item.id).map(t => `<span class="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap flex-shrink-0">#${t.tag}</span>`).join('')}
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm sm:text-base font-black text-gray-900 leading-none">
                                            <span class="${isLow ? 'text-red-600' : 'text-gray-900'}">${item.quantity}</span> 
                                            <span class="text-xs text-gray-400 font-normal mx-1">@</span> 
                                            <span class="text-emerald-600">${fmt.currency(item.price)}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>`;
        }).join('')}
                </div>

                <!-- Pagination Footer -->
                <div class="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <p class="text-xs text-gray-500">Showing <span class="font-bold text-gray-900">${items.length}</span> of <span class="font-bold text-gray-900">${inventoryPageState.totalCount}</span> products</p>
                    <div class="flex items-center gap-2">
                        <button onclick="changeInventoryPage(-1)" ${inventoryPageState.page === 1 ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        </button>
                        <div class="flex items-center gap-1">
                            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return `<button onclick="inventoryPageState.page = ${p}; renderInventoryModule()" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${inventoryPageState.page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}">${p}</button>`;
        }).join('')}
                        </div>
                        <button onclick="changeInventoryPage(1)" ${inventoryPageState.page === totalPages ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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

