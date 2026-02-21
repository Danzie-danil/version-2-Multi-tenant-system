// ── Branch: Loans & Other Income Module ──────────────────────────────────

window.renderLoansModule = function () {
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
                <span class="loader mx-auto mb-32"></span>
                <p class="text-gray-400 text-sm">Loading financial data…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    dbLoans.fetchAll(state.branchId).then(records => {
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

            <div class="grid grid-cols-3 gap-4">
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Received</p>
                    <p class="text-2xl font-bold text-emerald-600">${fmt.currency(totalIncome)}</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Outgoing</p>
                    <p class="text-2xl font-bold text-red-600">${fmt.currency(totalOutgoing)}</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Records</p>
                    <p class="text-2xl font-bold text-gray-900">${records.length}</p>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                ${records.length === 0 ? `
                <div class="py-16 text-center">
                    <i data-lucide="banknote" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                    <p class="text-gray-400 text-sm">No loan or income records yet</p>
                    <button onclick="openModal('addLoan')" class="mt-4 btn-primary text-sm">Record First Entry</button>
                </div>` : `
                <table class="w-full responsive-table">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Party</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Notes</th>
                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                            <th class="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        ${records.map(rec => {
            const t = typeMap[rec.type] || typeMap.income;
            return `
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4" data-label="Type">
                                <span class="badge ${t.bg} ${t.text}">${t.label}</span>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-gray-900" data-label="Party">${rec.party || '—'}</td>
                            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" data-label="Notes">${rec.notes || '—'}</td>
                            <td class="px-6 py-4 text-sm text-gray-400" data-label="Date">${fmt.date(rec.created_at)}</td>
                            <td class="px-6 py-4 text-right font-bold ${t.isOut ? 'text-red-600' : 'text-emerald-600'}" data-label="Amount">
                                ${t.isOut ? '-' : '+'}${fmt.currency(rec.amount)}
                            </td>
                            <td class="px-6 py-4 text-center" data-label="Actions">
                                <div class="flex items-center justify-center gap-2">
                                    <button onclick="confirmDelete('loan', '${rec.id}', 'this record')" class="text-gray-400 hover:text-red-600 transition-colors" title="Delete">
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
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load records: ${err.message}</div>`;
    });

    return '';
};
