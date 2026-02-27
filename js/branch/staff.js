// ── Branch: Staff & HR Module ──────────────────────────────────────────────

window.staffSelection = new Set();
window.staffPageState = {
    page: 1,
    pageSize: 10,
    totalCount: 0
};

window.changeStaffPage = function (delta) {
    const newPage = window.staffPageState.page + delta;
    const maxPage = Math.ceil(window.staffPageState.totalCount / window.staffPageState.pageSize) || 1;
    if (newPage < 1 || newPage > maxPage) return;
    window.staffPageState.page = newPage;
    renderStaffModule();
};

window.toggleStaffSelection = function (id) {
    if (window.staffSelection.has(id)) {
        window.staffSelection.delete(id);
    } else {
        window.staffSelection.add(id);
    }
    updateStaffBulkActionBar();
};

window.toggleSelectAllStaff = function (checked) {
    const checkboxes = document.querySelectorAll('.staff-checkbox');
    window.staffSelection.clear();
    checkboxes.forEach(cb => {
        cb.checked = checked;
        if (checked) window.staffSelection.add(cb.value);
    });
    updateStaffBulkActionBar();
};

window.updateStaffBulkActionBar = function () {
    const count = window.staffSelection.size;
    const countSpan = document.getElementById('staffSelectedCount');
    if (countSpan) countSpan.textContent = `${count} selected`;

    const deleteBtn = document.getElementById('btnBulkDeleteStaff');
    if (deleteBtn) deleteBtn.disabled = count === 0;

    const selectAll = document.getElementById('selectAllStaff');
    const checkboxes = document.querySelectorAll('.staff-checkbox');
    if (selectAll && checkboxes.length > 0) {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        selectAll.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }
};

window.bulkDeleteSelectedStaff = async function () {
    const count = window.staffSelection.size;
    if (count === 0) return;
    const confirmed = await window.confirmModal('Confirm Deletion', 'Are you sure you want to delete the selected staff members?', 'Yes, Delete', 'Cancel');
    if (!confirmed) return;

    try {
        const ids = Array.from(window.staffSelection);
        await Promise.all(ids.map(id => dbStaff.delete(id)));
        window.staffSelection.clear();
        showToast(`Deleted ${count} staff records`, 'success');
        renderStaffModule();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};

window.renderStaffModule = function () {
    window.staffSelection.clear();
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Staff &amp; HR Management</div>
            </div>
            <button onclick="openModal('addStaff')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Staff
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <p class="text-gray-400 text-sm">Loading staff data…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    dbStaff.fetchAll(state.branchId).then((records) => {
        window.staffPageState.totalCount = records.length;

        // Manual Pagination for layout (since API might return all)
        const startIdx = (window.staffPageState.page - 1) * window.staffPageState.pageSize;
        const pagedRecords = records.slice(startIdx, startIdx + window.staffPageState.pageSize);
        const totalPages = Math.ceil(window.staffPageState.totalCount / window.staffPageState.pageSize) || 1;

        const activeCount = records.filter(r => r.status === 'active').length;
        const totalPayroll = records.filter(r => r.status === 'active').reduce((s, r) => s + Number(r.salary || 0), 0);

        container.innerHTML = `
        <div class="space-y-4 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Staff &amp; HR Management</div>
                </div>
                <button onclick="openModal('addStaff')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 font-bold">
                    <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Staff
                </button>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight whitespace-normal font-bold leading-tight">Total Staff / Active</p>
                    <div class="flex items-end gap-2 mt-auto">
                        <p class="text-dynamic-lg font-black text-gray-900 truncate leading-none pb-1">${records.length}</p>
                        <p class="text-sm font-bold text-emerald-600 pb-2">/ ${activeCount}</p>
                    </div>
                </div>
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight whitespace-normal font-bold leading-tight">Total Est. Monthly Payroll</p>
                    <p class="text-dynamic-lg font-black text-indigo-600 truncate leading-none my-auto py-1">${fmt.currency(totalPayroll)}</p>
                </div>
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full col-span-2 lg:col-span-1 border-l-4 border-emerald-500 cursor-pointer hover:bg-emerald-50 transition-colors" onclick="openModal('markAttendance')">
                    <div class="flex items-center justify-between h-full">
                        <div>
                            <p class="text-[11px] sm:text-xs text-emerald-700 uppercase tracking-tight whitespace-normal font-bold leading-tight">Quick Action</p>
                            <p class="text-lg font-black text-emerald-800 truncate leading-none mt-1">Record Attendance</p>
                        </div>
                        <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <i data-lucide="calendar-check" class="w-5 h-5"></i>
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 mb-20 md:mb-0">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-xl font-bold text-gray-900">Personnel Roster</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 font-medium">Page ${window.staffPageState.page} of ${totalPages}</span>
                    </div>
                </div>
                
                <!-- Search -->
                <div class="relative mb-4">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="w-4 h-4 text-indigo-500"></i>
                    </div>
                    <input type="text" placeholder="Search staff members..." oninput="filterList('staffList', this.value)" class="w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                </div>

                <!-- Bulk Action Bar -->
                <div class="flex flex-wrap items-center justify-between bg-gray-50/70 border border-gray-100 rounded-xl p-2.5 md:p-3 mb-5 gap-3">
                    <div class="flex items-center gap-3 pl-2">
                        <input type="checkbox" id="selectAllStaff" onchange="toggleSelectAllStaff(this.checked)" class="rounded w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer">
                        <span class="text-sm font-semibold text-gray-800">Select All <span id="staffSelectedCount" class="font-normal text-xs text-gray-400 ml-1.5 hidden sm:inline-block">0 selected</span></span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button id="btnBulkDeleteStaff" disabled onclick="bulkDeleteSelectedStaff()" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors disabled:opacity-50">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5 text-gray-400"></i> <span class="hidden sm:inline-block">Delete Selected</span>
                        </button>
                    </div>
                </div>

                <div class="space-y-4" id="staffList">
                    ${pagedRecords.length === 0 ? `
                        <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <i data-lucide="users" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                            <p class="text-gray-400 text-sm">No staff records found</p>
                        </div>
                    ` : pagedRecords.map(rec => {
            const isActive = rec.status === 'active';
            return `
                        <div onclick="openModal('editStaff', '${rec.id}')" data-search="${(rec.name || '').toLowerCase()} ${(rec.role || '').toLowerCase()}" class="bg-white border border-gray-200 border-l-[4px] ${isActive ? 'border-l-indigo-500' : 'border-l-gray-400'} rounded-2xl p-5 md:p-6 flex gap-4 hover:shadow-md transition-all group relative cursor-pointer">
                            <div class="pt-1" onclick="event.stopPropagation()">
                                <input type="checkbox" value="${rec.id}" onchange="toggleStaffSelection('${rec.id}')" class="staff-checkbox rounded w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer" ${window.staffSelection.has(rec.id) ? 'checked' : ''}>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-3 mb-1">
                                    <div class="flex items-center gap-2 max-w-[70%]">
                                        <div class="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-xs uppercase">
                                            ${(rec.name || 'S')[0]}
                                        </div>
                                        <h4 class="font-bold text-gray-900 text-sm sm:text-base truncate">${rec.name || 'Unknown'}</h4>
                                        ${isActive ? '' : '<span class="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Inactive</span>'}
                                    </div>
                                    <div class="text-right">
                                        <p class="text-[10px] uppercase font-bold text-gray-400 leading-none pb-1">Role</p>
                                        <p class="text-sm font-bold text-indigo-600">${rec.role}</p>
                                    </div>
                                </div>
                                <div class="flex items-end justify-between gap-3 mt-3">
                                    <div class="flex flex-col gap-1">
                                        ${rec.phone ? `<div class="flex items-center gap-1.5 text-xs text-gray-500"><i data-lucide="phone" class="w-3.5 h-3.5"></i> ${rec.phone}</div>` : ''}
                                        ${rec.email ? `<div class="flex items-center gap-1.5 text-xs text-gray-500"><i data-lucide="mail" class="w-3.5 h-3.5"></i> ${rec.email}</div>` : ''}
                                    </div>
                                    <div class="text-right">
                                        <p class="text-[10px] uppercase font-bold text-gray-400 leading-none mb-1">Base Salary</p>
                                        <span class="text-base sm:text-lg font-black text-gray-900 whitespace-nowrap">${fmt.currency(rec.salary || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>`;
        }).join('')}
                </div>

                <!-- Pagination Footer -->
                <div class="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <p class="text-xs text-gray-500">Showing <span class="font-bold text-gray-900">${pagedRecords.length}</span> of <span class="font-bold text-gray-900">${window.staffPageState.totalCount}</span> records</p>
                    <div class="flex items-center gap-2">
                        <button onclick="changeStaffPage(-1)" ${window.staffPageState.page === 1 ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        </button>
                        <div class="flex items-center gap-1">
                            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return `<button onclick="window.staffPageState.page = ${p}; renderStaffModule()" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${window.staffPageState.page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}">${p}</button>`;
        }).join('')}
                        </div>
                        <button onclick="changeStaffPage(1)" ${window.staffPageState.page === totalPages ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load staff records: ${err.message}</div>`;
    });
};
