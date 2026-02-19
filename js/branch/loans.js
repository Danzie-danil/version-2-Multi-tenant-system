// ── Branch: Loans & Other Income Module ──────────────────────────────────

window.renderLoansModule = function () {
    const records = state.loans.filter(l => l.branchId === state.branchId);

    const typeMap = {
        income: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Other Income', icon: 'trending-up' },
        loan_given: { bg: 'bg-red-100', text: 'text-red-700', label: 'Loan Given', icon: 'arrow-up-right' },
        loan_received: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Loan Received', icon: 'arrow-down-left' },
        repayment: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Repayment Received', icon: 'check-circle' }
    };

    const totalIncome = records
        .filter(r => r.type === 'income' || r.type === 'loan_received' || r.type === 'repayment')
        .reduce((s, r) => s + r.amount, 0);
    const totalOutgoing = records
        .filter(r => r.type === 'loan_given')
        .reduce((s, r) => s + r.amount, 0);

    return `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Loans & Income</h2>
            <button onclick="openModal('addLoan')" class="btn-primary">
                <i data-lucide="plus" class="w-4 h-4"></i> Record Entry
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
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Party</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Notes</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th class="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    ${records.slice().reverse().map(rec => {
        const t = typeMap[rec.type] || typeMap.income;
        const isOut = rec.type === 'loan_given';
        return `
                        <tr class="hover:bg-gray-50 transition-colors">
                            <td class="px-6 py-4">
                                <span class="badge ${t.bg} ${t.text}">${t.label}</span>
                            </td>
                            <td class="px-6 py-4 text-sm font-medium text-gray-900">${rec.party}</td>
                            <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">${rec.notes || '—'}</td>
                            <td class="px-6 py-4 text-sm text-gray-400">${rec.date}</td>
                            <td class="px-6 py-4 text-right font-bold ${isOut ? 'text-red-600' : 'text-emerald-600'}">
                                ${isOut ? '-' : '+'}${fmt.currency(rec.amount)}
                            </td>
                        </tr>`;
    }).join('')}
                </tbody>
            </table>`}
        </div>
    </div>`;
};
