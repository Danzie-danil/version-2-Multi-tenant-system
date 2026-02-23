// ── Owner: Requests & Approval Management ────────────────────────────────────

window.renderRequestsModule = function (highlightId = null) {
    const container = document.getElementById('mainContent');
    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Requests & Approvals</div>
            </div>
            <div class="flex items-center gap-2">
                <select id="reqFilterStatus" onchange="renderRequestsList()" class="bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option value="pending">Pending Only</option>
                    <option value="all">All Requests</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
        </div>

        <div id="requestsList" class="space-y-4 pb-20 md:pb-0">
            <div class="flex items-center justify-center py-20">
                <p class="text-gray-400 text-sm italic">Loading requests...</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();
    renderRequestsList(highlightId);
};

window.renderRequestsList = async function (highlightId = null) {
    const listContainer = document.getElementById('requestsList');
    const filter = document.getElementById('reqFilterStatus')?.value || 'pending';

    try {
        const allRequests = await dbRequests.fetchAll(state.profile.id);
        const requests = filter === 'all'
            ? allRequests
            : allRequests.filter(r => r.status === filter);

        if (requests.length === 0) {
            listContainer.innerHTML = `
            <div class="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <i data-lucide="inbox" class="w-12 h-12 text-gray-200 mx-auto mb-3"></i>
                <p class="text-gray-400 font-medium">No ${filter} requests found</p>
            </div>`;
            lucide.createIcons();
            return;
        }

        listContainer.innerHTML = requests.map(req => {
            const isHighlighted = req.id === highlightId;
            const statusColors = {
                pending: 'border-l-indigo-500 bg-white',
                approved: 'border-l-emerald-500 bg-emerald-50/10',
                rejected: 'border-l-red-500 bg-red-50/10'
            };
            const badgeColors = {
                pending: 'bg-indigo-100 text-indigo-700',
                approved: 'bg-emerald-100 text-emerald-700',
                rejected: 'bg-red-100 text-red-700'
            };

            return `
            <div id="req-${req.id}" class="bg-white border border-gray-200 border-l-[4px] ${statusColors[req.status]} rounded-2xl p-5 md:p-6 transition-all ${isHighlighted ? 'ring-2 ring-indigo-500 shadow-lg' : 'hover:shadow-md'} relative group">
                <div class="flex items-start justify-between gap-4 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 ${badgeColors[req.status]} rounded-xl flex items-center justify-center flex-shrink-0">
                            <i data-lucide="${req.type.includes('inventory') ? 'package' : 'message-square'}" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-900 leading-tight">${req.subject}</h4>
                            <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">${req.branches?.name || 'Unknown Branch'} · ${fmt.dateTime(req.created_at)}</p>
                        </div>
                    </div>
                    <span class="badge ${badgeColors[req.status]} uppercase font-black tracking-tighter">${req.status}</span>
                </div>

                <div class="bg-gray-50/80 rounded-xl p-4 mb-4 border border-gray-100/50">
                    <p class="text-sm text-gray-700 leading-relaxed font-medium">${req.message}</p>
                    ${req.related_summary ? `<p class="mt-2 text-[10px] text-gray-400 font-bold uppercase">Target: ${req.related_summary}</p>` : ''}
                </div>

                ${req.admin_response ? `
                <div class="bg-indigo-50/50 rounded-xl p-4 mb-4 border border-indigo-100/30">
                    <p class="text-[10px] text-indigo-600 font-black uppercase mb-1">Admin Response</p>
                    <p class="text-sm text-indigo-800 italic">${req.admin_response}</p>
                </div>` : ''}

                ${req.status === 'pending' ? `
                <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-4">
                    <button onclick="handleRequestAction('${req.id}', 'approved')" class="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
                        <i data-lucide="check-circle" class="w-4 h-4"></i> Approve
                    </button>
                    <button onclick="handleRequestAction('${req.id}', 'rejected')" class="flex-1 py-2.5 bg-white border border-gray-200 text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2">
                        <i data-lucide="x-circle" class="w-4 h-4"></i> Reject
                    </button>
                    <button onclick="openAdminResponseModal('${req.id}')" class="px-4 py-2.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold uppercase hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                        <i data-lucide="message-circle" class="w-4 h-4"></i> Comment
                    </button>
                </div>` : `
                <div class="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-right">Processed on ${fmt.date(req.updated_at || req.created_at)}</div>
                `}
            </div>`;
        }).join('');
        lucide.createIcons();

        if (highlightId) {
            document.getElementById(`req-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } catch (err) {
        listContainer.innerHTML = `<p class="p-10 text-center text-red-500 font-bold">Failed to load requests: ${err.message}</p>`;
    }
};
window.handleRequestAction = async function (id, status) {
    const isApprove = status === 'approved';
    const confirmed = await confirmModal(
        isApprove ? 'Approve Request' : 'Reject Request',
        `Are you sure you want to mark this request as ${status}?`,
        isApprove ? 'Approve' : 'Reject',
        'Cancel'
    );
    if (!confirmed) return;

    try {
        const allRequests = await dbRequests.fetchAll(state.profile.id);
        const req = allRequests.find(r => r.id === id);
        if (!req) return;

        // Auto-Approvals for Inventory
        if (status === 'approved') {
            if (req.type === 'inventory_add' && req.metadata) {
                const { name, sku, category, price, quantity, min_threshold, supplier, cost_price } = req.metadata;
                // Add to inventory
                const addedItem = await dbInventory.add(req.branch_id, { name, sku, category, price, quantity, min_threshold });

                // Track purchase
                await dbInventoryPurchases.add({
                    branch_id: req.branch_id,
                    inventory_id: addedItem.id,
                    request_id: req.id,
                    supplier_info: supplier || 'Unknown',
                    quantity: quantity,
                    cost_price: cost_price || 0,
                    purchase_date: new Date().toISOString().split('T')[0]
                });
            } else if (req.type === 'inventory_update' && req.metadata) {
                const { inventory_id, quantity, supplier, cost_price } = req.metadata;

                // Fetch current stock
                const { data: item } = await supabaseClient.from('inventory').select('quantity').eq('id', inventory_id).single();
                if (item) {
                    await dbInventory.updateQty(inventory_id, item.quantity + quantity);

                    // Track purchase
                    await dbInventoryPurchases.add({
                        branch_id: req.branch_id,
                        inventory_id: inventory_id,
                        request_id: req.id,
                        supplier_info: supplier || 'Unknown',
                        quantity: quantity,
                        cost_price: cost_price || 0,
                        purchase_date: new Date().toISOString().split('T')[0]
                    });
                }
            }
        }

        await dbRequests.update(id, { status });
        showToast(`Request ${status} successfully!`, 'success');
        renderRequestsList();
    } catch (err) {
        showToast('Error processing request: ' + err.message, 'error');
    }
};

window.openAdminResponseModal = async function (id) {
    const response = await promptModal('Admin Response', 'Enter your response/comment for the branch:', 'e.g. Please provide more details...');
    if (response === null) return;

    dbRequests.update(id, { admin_response: response }).then(() => {
        showToast('Response sent!');
        renderRequestsList();
    }).catch(err => {
        showToast('Failed to send response: ' + err.message, 'error');
    });
};
