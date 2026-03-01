// ── Branch: Quotations Module ──────────────────────────────────────────────

let quotationsSelection = new Set();
window.quotationsSelection = quotationsSelection;
let quotationsPageState = {
    page: 1,
    pageSize: 10,
    totalCount: 0
};
window.quotationsPageState = quotationsPageState;

export function changeQuotationsPage(delta) {
    const newPage = quotationsPageState.page + delta;
    const maxPage = Math.ceil(quotationsPageState.totalCount / quotationsPageState.pageSize) || 1;
    if (newPage < 1 || newPage > maxPage) return;
    quotationsPageState.page = newPage;
    renderQuotationsModule();
};

export function toggleQuotationSelection(id) {
    if (quotationsSelection.has(id)) {
        quotationsSelection.delete(id);
    } else {
        quotationsSelection.add(id);
    }
    updateQuotationBulkActionBar();
};

export function toggleSelectAllQuotations(checked) {
    const checkboxes = document.querySelectorAll('.quotation-checkbox');
    quotationsSelection.clear();
    checkboxes.forEach(cb => {
        cb.checked = checked;
        if (checked) quotationsSelection.add(cb.value);
    });
    updateQuotationBulkActionBar();
};

export function updateQuotationBulkActionBar() {
    const count = quotationsSelection.size;
    const countSpan = document.getElementById('quotationSelectedCount');
    if (countSpan) countSpan.textContent = `${count} selected`;

    const deleteBtn = document.getElementById('btnBulkDeleteQuotation');
    if (deleteBtn) deleteBtn.disabled = count === 0;

    const selectAll = document.getElementById('selectAllQuotations');
    const checkboxes = document.querySelectorAll('.quotation-checkbox');
    if (selectAll && checkboxes.length > 0) {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        selectAll.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }
};

export async function bulkDeleteSelectedQuotations() {
    const count = quotationsSelection.size;
    if (count === 0) return;
    const confirmed = await window.confirmModal('Confirm Deletion', 'Are you sure you want to delete the selected quotations?', 'Yes, Delete', 'Cancel');
    if (!confirmed) return;

    try {
        const ids = Array.from(quotationsSelection);
        await Promise.all(ids.map(id => dbQuotations.delete(id)));
        quotationsSelection.clear();
        showToast(`Deleted ${count} quotations`, 'success');
        renderQuotationsModule();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};

export async function renderQuotationsModule() {
    quotationsSelection.clear();
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Quotations &amp; Proposals</div>
            </div>
            <button onclick="openModal('createQuotation')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 font-bold bg-indigo-600 hover:bg-indigo-700">
                <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Create Quote
            </button>
        </div>

        <div id="quotationsContentArea" class="pt-2 min-h-[300px]">
            <div class="flex justify-center py-10"><p class="text-gray-400 text-sm"><i class="fas fa-spinner fa-spin mr-2"></i>Loading...</p></div>
        </div>
    </div>`;
    lucide.createIcons();

    await renderQuotationsList();
};

async function renderQuotationsList() {
    const area = document.getElementById('quotationsContentArea');
    try {
        const records = await dbQuotations.fetchAll(state.branchId);
        quotationsPageState.totalCount = records.length;

        const startIdx = (quotationsPageState.page - 1) * quotationsPageState.pageSize;
        const pagedRecords = records.slice(startIdx, startIdx + quotationsPageState.pageSize);
        const totalPages = Math.ceil(quotationsPageState.totalCount / quotationsPageState.pageSize) || 1;

        const getStatusStyles = (s) => {
            switch (s) {
                case 'draft': return 'bg-gray-100 text-gray-600 border-gray-200';
                case 'sent': return 'bg-blue-50 text-blue-600 border-blue-200';
                case 'accepted': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
                case 'rejected': return 'bg-red-50 text-red-600 border-red-200';
                default: return 'bg-gray-100 text-gray-600 border-gray-200';
            }
        };

        let html = `
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 mb-20 md:mb-0">
            <div class="flex items-center justify-between mb-5">
                <h3 class="text-xl font-bold text-gray-900">Quotations List</h3>
                <div class="flex items-center gap-2">
                    <span class="text-xs text-gray-400 font-medium">Page ${quotationsPageState.page} of ${totalPages}</span>
                </div>
            </div>
            
            <div class="relative mb-4">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <i data-lucide="search" class="w-4 h-4 text-indigo-500"></i>
                </div>
                <input type="text" placeholder="Search by quote number or customer..." oninput="filterList('quotationList', this.value)" class="w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
            </div>

            <div class="flex flex-wrap items-center justify-between bg-gray-50/70 border border-gray-100 rounded-xl p-2.5 md:p-3 mb-5 gap-3">
                <div class="flex items-center gap-3 pl-2">
                    <input type="checkbox" id="selectAllQuotations" onchange="toggleSelectAllQuotations(this.checked)" class="rounded w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer">
                    <span class="text-sm font-semibold text-gray-800">Select All <span id="quotationSelectedCount" class="font-normal text-xs text-gray-400 ml-1.5 hidden sm:inline-block">0 selected</span></span>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                    <button id="btnBulkDeleteQuotation" disabled onclick="bulkDeleteSelectedQuotations()" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors disabled:opacity-50">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5 text-gray-400"></i> <span class="hidden sm:inline-block">Delete</span>
                    </button>
                </div>
            </div>

            <div class="space-y-4" id="quotationList">
                ${pagedRecords.length === 0 ? `
                    <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                        <i data-lucide="file-signature" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                        <p class="text-gray-400 text-sm">No quotations created yet</p>
                    </div>
                ` : pagedRecords.map(rec => `
                    <div onclick="openEditModal('viewQuotation', '${rec.id}')" data-search="${(rec.quote_number || '').toLowerCase()} ${(rec.customer_name || '').toLowerCase()} ${(rec.customer_address || '').toLowerCase()}" class="bg-white border border-gray-200 rounded-2xl p-5 md:p-6 flex gap-4 hover:border-indigo-300 hover:shadow-md transition-all group relative cursor-pointer">
                        <div class="pt-1" onclick="event.stopPropagation()">
                            <input type="checkbox" value="${rec.id}" onchange="toggleQuotationSelection('${rec.id}')" class="quotation-checkbox rounded w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer" ${quotationsSelection.has(rec.id) ? 'checked' : ''}>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                <div class="flex items-center gap-3">
                                    <h4 class="font-black text-gray-900 text-sm sm:text-base">${rec.quote_number || 'Draft Quote'}</h4>
                                    <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getStatusStyles(rec.status)}">${rec.status}</span>
                                </div>
                                <div class="text-left sm:text-right">
                                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                                    <span class="text-base sm:text-lg font-black text-indigo-600">${fmt.currency(rec.total_amount)}</span>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-50">
                                <div>
                                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Customer</p>
                                    <p class="text-sm font-bold text-gray-700">${rec.customer_name || 'Walk-in / General'}</p>
                                </div>
                                <div class="sm:text-right flex flex-col sm:items-end">
                                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Valid Until</p>
                                    <p class="text-sm font-bold ${new Date(rec.valid_until) < new Date() && rec.status !== 'accepted' ? 'text-red-500' : 'text-gray-700'}">${fmt.date(rec.valid_until) || 'TBD'}</p>
                                </div>
                            </div>
                        </div>
                    </div>`).join('')}
            </div>

            <div class="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                <!-- Pagination Footer -->
                <p class="text-xs text-gray-500">Showing <span class="font-bold text-gray-900">${pagedRecords.length}</span> of <span class="font-bold text-gray-900">${quotationsPageState.totalCount}</span></p>
                <div class="flex items-center gap-2">
                    <button onclick="changeQuotationsPage(-1)" ${quotationsPageState.page === 1 ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i data-lucide="chevron-left" class="w-4 h-4"></i></button>
                    <span class="text-xs font-bold text-gray-600 mx-2">${quotationsPageState.page} / ${totalPages}</span>
                    <button onclick="changeQuotationsPage(1)" ${quotationsPageState.page === totalPages ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><i data-lucide="chevron-right" class="w-4 h-4"></i></button>
                </div>
            </div>
        </div>`;
        area.innerHTML = html;
        lucide.createIcons();
    } catch (err) {
        area.innerHTML = `<div class="py-10 text-center text-red-500">Error: ${err.message}</div>`;
    }
}
