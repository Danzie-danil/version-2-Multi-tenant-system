// ── Owner: Quotations Monitoring ──────────────────────────────────────────
window.renderOwnerQuotationsModule = async function () {
    const area = document.getElementById('mainContent');
    area.innerHTML = `<div class="p-6"><div class="flex items-center gap-3 mb-4"><i data-lucide="loader-2" class="w-5 h-5 animate-spin text-indigo-500"></i><span class="text-sm text-gray-500">Loading quotations across all branches…</span></div></div>`;
    lucide.createIcons();

    try {
        const branches = state.branches || await dbBranches.fetchAll(state.ownerId);
        let allQuotes = [];

        for (const b of branches) {
            const quotes = await dbQuotations.fetchAll(b.id);
            quotes.forEach(q => { q._branchName = b.name; });
            allQuotes = allQuotes.concat(quotes);
        }

        // Sort by date descending
        allQuotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const totalValue = allQuotes.reduce((s, q) => s + (q.total_amount || 0), 0);
        const drafts = allQuotes.filter(q => q.status === 'draft').length;
        const sent = allQuotes.filter(q => q.status === 'sent').length;
        const accepted = allQuotes.filter(q => q.status === 'accepted').length;
        const rejected = allQuotes.filter(q => q.status === 'rejected').length;

        // Filter
        const filter = window._ownerQuoteFilter || 'all';

        const filtered = filter === 'all' ? allQuotes : allQuotes.filter(q => q.status === filter);

        const statusColors = {
            draft: 'bg-amber-50 text-amber-600 border-amber-100',
            sent: 'bg-blue-50 text-blue-600 border-blue-100',
            accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
            rejected: 'bg-red-50 text-red-500 border-red-100',
            converted: 'bg-indigo-50 text-indigo-600 border-indigo-100'
        };

        area.innerHTML = `
        <div class="p-4 sm:p-6 max-w-6xl mx-auto">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h2 class="text-xl sm:text-2xl font-black text-gray-900">Quotations Monitor</h2>
                    <p class="text-sm text-gray-500 mt-0.5">Track all quotations across branches</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-gray-900">${allQuotes.length}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Total</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-amber-500">${drafts}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Draft</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-blue-500">${sent}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Sent</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-emerald-600">${accepted}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Accepted</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                    <p class="text-lg font-black text-indigo-600">${fmt.currency(totalValue)}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Total Value</p>
                </div>
            </div>

            <!-- Filter Tabs -->
            <div class="flex gap-2 mb-4 flex-wrap">
                ${['all', 'draft', 'sent', 'accepted', 'rejected'].map(f => `
                    <button onclick="window._ownerQuoteFilter='${f}'; renderOwnerQuotationsModule()" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}">
                        ${f === 'all' ? `All (${allQuotes.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${allQuotes.filter(q => q.status === f).length})`}
                    </button>`).join('')}
            </div>

            <!-- Quotation List -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${filtered.length === 0 ? `
                    <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                        <i data-lucide="file-signature" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                        <p class="text-gray-400 text-sm">No quotations found</p>
                    </div>` :
                filtered.map(q => `
                    <div onclick="openEditModal('viewQuotation', '${q.id}')" class="bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer">
                        <div class="flex items-start justify-between gap-3 mb-2">
                            <div>
                                <h4 class="font-bold text-gray-900 text-sm">${q.quote_number}</h4>
                                <p class="text-xs text-indigo-600 font-medium">${q._branchName}</p>
                            </div>
                            <span class="text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${statusColors[q.status] || statusColors.draft}">${q.status}</span>
                        </div>
                        <div class="flex items-center justify-between mt-3">
                            <p class="text-xs text-gray-500">${q.customer_name || 'Walk-in'}</p>
                            <p class="font-black text-gray-900 text-sm">${fmt.currency(q.total_amount || 0)}</p>
                        </div>
                        <div class="flex items-center justify-between mt-2">
                            <p class="text-[10px] text-gray-400">${new Date(q.created_at).toLocaleDateString()}</p>
                            ${q.valid_until ? `<p class="text-[10px] text-gray-400">Valid until: ${new Date(q.valid_until).toLocaleDateString()}</p>` : ''}
                        </div>
                    </div>`).join('')}
            </div>
        </div>`;
        lucide.createIcons();
    } catch (err) {
        area.innerHTML = `<div class="p-6"><p class="text-red-500 text-sm">Failed to load quotations: ${err.message}</p></div>`;
    }
};
