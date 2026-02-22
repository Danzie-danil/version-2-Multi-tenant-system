// ── Branch: Loans & Other Income Module ──────────────────────────────────

// ── Selection State ──────────────────────────────────────────────────────────
window.loansSelection = new Set();
window.loansPageState = {
    page: 1,
    pageSize: 5,
    totalCount: 0
};

window.changeLoansPage = function (delta) {
    const newPage = window.loansPageState.page + delta;
    const maxPage = Math.ceil(window.loansPageState.totalCount / window.loansPageState.pageSize) || 1;
    if (newPage < 1 || newPage > maxPage) return;
    window.loansPageState.page = newPage;
    renderLoansModule();
};

window.toggleLoanSelection = function (id) {
    if (window.loansSelection.has(id)) {
        window.loansSelection.delete(id);
    } else {
        window.loansSelection.add(id);
    }
    updateLoanBulkActionBar();
};

window.toggleSelectAllLoans = function (checked) {
    const checkboxes = document.querySelectorAll('.loan-checkbox');
    window.loansSelection.clear();
    checkboxes.forEach(cb => {
        cb.checked = checked;
        if (checked) window.loansSelection.add(cb.value);
    });
    updateLoanBulkActionBar();
};

window.updateLoanBulkActionBar = function () {
    const count = window.loansSelection.size;
    const countSpan = document.getElementById('loansSelectedCount');
    if (countSpan) countSpan.textContent = `${count} selected`;

    const deleteBtn = document.getElementById('btnBulkDeleteLoans');
    if (deleteBtn) deleteBtn.disabled = count === 0;

    const tagBtn = document.getElementById('btnBulkTagLoans');
    if (tagBtn) tagBtn.disabled = count === 0;

    const selectAll = document.getElementById('selectAllLoans');
    const checkboxes = document.querySelectorAll('.loan-checkbox');
    if (selectAll && checkboxes.length > 0) {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        selectAll.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }
};

window.bulkDeleteSelectedLoans = async function () {
    const count = window.loansSelection.size;
    if (count === 0) return;
    if (!confirm(`Are you sure you want to delete ${count} selected records?`)) return;

    try {
        const ids = Array.from(window.loansSelection);
        await dbLoans.bulkDelete(ids);
        window.loansSelection.clear();
        showToast(`Deleted ${count} records`, 'success');
        renderLoansModule();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};

window.openLoansTagModal = async function (loanId, isBulk = false) {
    document.querySelectorAll('.tags-modal-overlay').forEach(el => el.remove());
    const title = isBulk ? `Tag ${window.loansSelection.size} Records` : 'Manage Record Tags';

    let currentTags = [];
    if (!isBulk && loanId) {
        try {
            const allTags = await dbLoanTags.fetchAll(state.branchId);
            currentTags = allTags.filter(t => t.loan_id === loanId);
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
                    <input type="text" id="newLoanTagName" placeholder="New tag name..." class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                    <button id="submitLoanTagBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">Add</button>
                </div>

                ${!isBulk ? `
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Tags</p>
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${currentTags.length ? currentTags.map(t => `
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                                # ${t.tag}
                                <i data-lucide="x" onclick="removeLoanTagModal('${t.id}', '${loanId}')" class="w-3.5 h-3.5 cursor-pointer hover:text-red-600"></i>
                            </span>
                        `).join('') : '<p class="text-xs text-gray-400 italic">No tags applied yet</p>'}
                    </div>
                ` : ''}

                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Suggestions</p>
                <div class="flex flex-wrap gap-2">
                    ${['Personal', 'Business', 'Urgent', 'Cleared', 'Pending'].map(t => `
                        <button onclick="quickAddLoanTag('${t}', '${loanId}', ${isBulk})" class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all">
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
        renderLoansModule();
    };

    overlay.querySelectorAll('.close-tags-btn').forEach(btn => btn.addEventListener('click', closeTagsModal));

    const submitBtn = overlay.querySelector('#submitLoanTagBtn');
    const input = overlay.querySelector('#newLoanTagName');

    const handleAdd = async () => {
        const tagName = input.value.trim();
        if (!tagName) return;
        submitBtn.disabled = true;
        try {
            if (isBulk) {
                const ids = Array.from(window.loansSelection);
                await Promise.all(ids.map(id => dbLoanTags.add(state.branchId, id, tagName)));
                window.loansSelection.clear();
                showToast(`Tagged ${ids.length} items`, 'success');
                closeTagsModal();
            } else {
                await dbLoanTags.add(state.branchId, loanId, tagName);
                openLoansTagModal(loanId, false);
            }
        } catch (err) { showToast('Error adding tag', 'error'); }
        finally { submitBtn.disabled = false; }
    };

    submitBtn.addEventListener('click', handleAdd);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAdd(); });

    window.removeLoanTagModal = async (tagId, loanId) => {
        try {
            await dbLoanTags.delete(tagId);
            openLoansTagModal(loanId, false);
        } catch (err) { showToast('Error', 'error'); }
    };

    window.quickAddLoanTag = async (tagName, loanId, isBulk) => {
        input.value = tagName;
        handleAdd();
    };
};

window.renderLoansModule = function () {
    window.loansSelection.clear();
    const container = document.getElementById('mainContent');

    const typeMap = {
        income: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Other Income', isOut: false },
        loan_given: { bg: 'bg-red-100', text: 'text-red-700', label: 'Loan Given', isOut: true },
        loan_received: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Loan Received', isOut: false },
        repayment: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Repayment Received', isOut: false }
    };

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Loans &amp; Income</div>
            </div>
            <button onclick="openModal('addLoan')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Transaction
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <p class="text-gray-400 text-sm">Loading financial data…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    Promise.all([
        dbLoans.fetchAll(state.branchId, {
            page: window.loansPageState.page,
            pageSize: window.loansPageState.pageSize
        }),
        dbLoanTags.fetchAll(state.branchId)
    ]).then(([res, tags]) => {
        const records = res.items;
        window.loansPageState.totalCount = res.count;
        const totalPages = Math.ceil(window.loansPageState.totalCount / window.loansPageState.pageSize) || 1;
        const totalIncome = records.filter(r => !typeMap[r.type]?.isOut).reduce((s, r) => s + Number(r.amount), 0);
        const totalOutgoing = records.filter(r => typeMap[r.type]?.isOut).reduce((s, r) => s + Number(r.amount), 0);

        container.innerHTML = `
        <div class="space-y-4 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Loans &amp; Income</div>
                </div>
                <button onclick="openModal('addLoan')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                    <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Transaction
                </button>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Total Received">Received (Page)</p>
                    <p class="text-dynamic-lg font-bold text-emerald-600 truncate">${fmt.currency(totalIncome)}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Total Outgoing">Outgoing (Page)</p>
                    <p class="text-dynamic-lg font-bold text-red-600 truncate">${fmt.currency(totalOutgoing)}</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate" title="Records">Total Records</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate">${window.loansPageState.totalCount}</p>
                </div>
            </div>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 mb-20 md:mb-0">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-xl font-bold text-gray-900">Financial Records</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 font-medium">Page ${window.loansPageState.page} of ${totalPages}</span>
                    </div>
                </div>
                
                <!-- Search & Filters -->
                <div class="relative mb-4">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="w-4 h-4 text-indigo-500"></i>
                    </div>
                    <input type="text" placeholder="Search records..." oninput="filterList('loansList', this.value)" class="w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                </div>

                <!-- Bulk Action Bar -->
                <div class="flex flex-wrap items-center justify-between bg-gray-50/70 border border-gray-100 rounded-xl p-2.5 md:p-3 mb-5 gap-3">
                    <div class="flex items-center gap-3 pl-2">
                        <input type="checkbox" id="selectAllLoans" onchange="toggleSelectAllLoans(this.checked)" class="rounded w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer">
                        <span class="text-sm font-semibold text-gray-800">Select All <span id="loansSelectedCount" class="font-normal text-xs text-gray-400 ml-1.5 hidden sm:inline-block">0 selected</span></span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button id="btnBulkDeleteLoans" disabled onclick="bulkDeleteSelectedLoans()" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors disabled:opacity-50">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5 text-gray-400"></i> <span class="hidden sm:inline-block">Delete Selected</span>
                        </button>
                        <button id="btnBulkTagLoans" disabled onclick="openLoansTagModal(null, true)" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-50">
                            <i data-lucide="tag" class="w-3.5 h-3.5 text-indigo-500"></i> <span class="hidden sm:inline-block">Apply Tag</span>
                        </button>
                    </div>
                </div>

                <div class="space-y-4" id="loansList">
                    ${records.length === 0 ? `
                        <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <i data-lucide="banknote" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                            <p class="text-gray-400 text-sm">No records history found for this page</p>
                        </div>
                    ` : records.map(rec => {
            const t = typeMap[rec.type] || typeMap.income;
            return `
                        <div data-search="${(rec.party || '').toLowerCase()} ${rec.type} ${(rec.notes || '').toLowerCase()}" class="bg-white border border-gray-200 border-l-[3px] ${t.isOut ? 'border-l-red-500 bg-red-50/10' : 'border-l-emerald-500 bg-emerald-50/10'} rounded-2xl p-4 flex gap-3 hover:shadow-md transition-all group relative">
                            <div class="pt-0.5">
                                <input type="checkbox" value="${rec.id}" onchange="toggleLoanSelection('${rec.id}')" class="loan-checkbox rounded w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer" ${window.loansSelection.has(rec.id) ? 'checked' : ''}>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between gap-2 mb-2">
                                    <div class="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                                        <h4 class="font-bold text-gray-900 text-xs sm:text-sm truncate flex-shrink-0 max-w-[35%]">${rec.party || 'No Party Listed'}</h4>
                                        <span class="${t.bg} ${t.text} text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap flex-shrink-0 hidden sm:inline-block">${t.label}</span>
                                        <span class="text-[10px] text-gray-500 whitespace-nowrap flex-shrink-0 hidden md:inline-block">- ${rec.notes || ''}</span>
                                        <div class="flex gap-1 overflow-hidden">
                                            ${tags.filter(tg => tg.loan_id === rec.id).map(tg => `<span class="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap flex-shrink-0">#${tg.tag}</span>`).join('')}
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                                        <span class="text-[9px] sm:text-[10px] text-gray-400 whitespace-nowrap">${fmt.date(rec.created_at)}</span>
                                        <span class="text-xs sm:text-sm font-black ${t.isOut ? 'text-red-600' : 'text-emerald-600'} whitespace-nowrap">${t.isOut ? '-' : '+'}${fmt.currency(rec.amount)}</span>
                                    </div>
                                </div>
                                <div class="grid grid-cols-2 gap-1 sm:gap-1.5 w-full mt-2">
                                    <button onclick="openLoansTagModal('${rec.id}', false)" class="flex flex-col min-[420px]:flex-row items-center justify-center gap-0.5 min-[420px]:gap-1 min-[420px]:px-2 py-1.5 min-[420px]:py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] sm:text-[11px] lg:text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                                        <i data-lucide="tag" class="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400"></i> <span class="leading-none">Tag</span>
                                    </button>
                                    <button onclick="confirmDelete('loan', '${rec.id}', 'this record')" class="flex flex-col min-[420px]:flex-row items-center justify-center gap-0.5 min-[420px]:gap-1 min-[420px]:px-2 py-1.5 min-[420px]:py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] sm:text-[11px] lg:text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400"></i> <span class="leading-none">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>`;
        }).join('')}
                </div>

                <!-- Pagination Footer -->
                <div class="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <p class="text-xs text-gray-500">Showing <span class="font-bold text-gray-900">${records.length}</span> of <span class="font-bold text-gray-900">${window.loansPageState.totalCount}</span> records</p>
                    <div class="flex items-center gap-2">
                        <button onclick="changeLoansPage(-1)" ${window.loansPageState.page === 1 ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        </button>
                        <div class="flex items-center gap-1">
                            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return `<button onclick="window.loansPageState.page = ${p}; renderLoansModule()" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${window.loansPageState.page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}">${p}</button>`;
        }).join('')}
                        </div>
                        <button onclick="changeLoansPage(1)" ${window.loansPageState.page === totalPages ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load records: ${err.message}</div>`;
    });

    return '';
};
