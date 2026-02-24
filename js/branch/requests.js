// ── Branch: Sent Requests & Response Tracking ────────────────────────────────

window.renderBranchRequestsModule = function () {
    const container = document.getElementById('mainContent');
    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">My Approval Requests</div>
            </div>
            <button onclick="openModal('requestAttention', { type: 'general', id: null, summary: 'General Inquiry' })" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 font-bold">
                <i data-lucide="plus" class="w-4 h-4"></i> New Request
            </button>
        </div>

        <div id="branchRequestsList" class="space-y-4 pb-20 md:pb-0">
            <div class="flex items-center justify-center py-20">
                <p class="text-gray-400 text-sm italic">Loading your requests...</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();
    renderBranchRequestsList();
};

window.renderBranchRequestsList = async function () {
    const listContainer = document.getElementById('branchRequestsList');

    try {
        const requests = await dbRequests.fetchByBranch(state.branchId);

        if (requests.length === 0) {
            listContainer.innerHTML = `
            <div class="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <i data-lucide="send" class="w-12 h-12 text-gray-200 mx-auto mb-3"></i>
                <p class="text-gray-400 font-medium">You haven't sent any requests yet</p>
            </div>`;
            lucide.createIcons();
            return;
        }

        listContainer.innerHTML = requests.map(req => {
            const statusColors = {
                pending: 'border-l-indigo-500 bg-white shadow-sm',
                approved: 'border-l-emerald-500 bg-emerald-50/10 shadow-sm',
                rejected: 'border-l-red-500 bg-red-50/10 shadow-sm'
            };
            const badgeColors = {
                pending: 'bg-indigo-100 text-indigo-700',
                approved: 'bg-emerald-100 text-emerald-700',
                rejected: 'bg-red-100 text-red-700'
            };

            return `
            <div class="bg-white border border-gray-200 border-l-[4px] ${statusColors[req.status]} rounded-2xl p-5 md:p-6 transition-all hover:shadow-md relative">
                <div class="flex items-start justify-between gap-4 mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 ${badgeColors[req.status]} rounded-xl flex items-center justify-center flex-shrink-0">
                            <i data-lucide="${req.type.includes('inventory') ? 'package' : 'message-square'}" class="w-5 h-5"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-gray-900 leading-tight">${req.subject}</h4>
                            <p class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">${fmt.dateTime(req.created_at)}</p>
                        </div>
                    </div>
                    <span class="badge ${badgeColors[req.status]} uppercase font-black tracking-tighter">${req.status}</span>
                </div>

                <div class="p-4 bg-gray-50/80 rounded-xl border border-gray-100/50 mb-3">
                    <p class="text-sm text-gray-700 font-medium">${req.message}</p>
                </div>

                ${req.admin_response ? `
                <div class="p-4 bg-indigo-600 rounded-xl border border-indigo-500 shadow-lg shadow-indigo-100 animate-in slide-in-from-bottom-2 duration-500 mb-3">
                    <div class="flex items-center gap-2 mb-2">
                        <i data-lucide="message-circle" class="w-3.5 h-3.5 text-indigo-200"></i>
                        <p class="text-[10px] text-indigo-100 font-black uppercase tracking-widest">Approval Response</p>
                    </div>
                    <p class="text-sm text-white font-medium">${req.admin_response}</p>
                </div>` : ''}

                ${req.status === 'pending' ? `
                <div class="flex flex-wrap gap-2 pt-2 border-t border-gray-100 mt-2">
                    <button onclick="editBranchRequest('${req.id}')" class="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Edit
                    </button>
                    <button onclick="cancelBranchRequest('${req.id}')" class="flex-1 py-2 bg-white border border-gray-200 text-red-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2">
                        <i data-lucide="x-circle" class="w-3.5 h-3.5"></i> Cancel
                    </button>
                </div>` : req.admin_response ? '' : `
                <div class="text-right">
                    <p class="text-[10px] font-bold uppercase tracking-widest ${req.status === 'approved' ? 'text-emerald-500' :
                        req.status === 'rejected' ? 'text-red-400' :
                            req.status === 'resolved' ? 'text-indigo-400' :
                                'text-gray-400'
                    }">${req.status === 'approved' ? '✓ Approved' :
                        req.status === 'rejected' ? '✗ Rejected' :
                            req.status === 'resolved' ? '✓ Resolved' :
                                'Awaiting Approval...'
                    }</p>
                </div>
                `}
            </div>`;

        }).join('');
        lucide.createIcons();
    } catch (err) {
        listContainer.innerHTML = `<p class="p-10 text-center text-red-500 font-bold">Failed to load requests: ${err.message}</p>`;
    }
};

window.cancelBranchRequest = async function (reqId) {
    if (!await confirmModal("Cancel Request", "Are you sure you want to cancel this request? It will be deleted from the system and the approval queue.", "Cancel Request", "Keep It")) return;
    try {
        await dbRequests.delete(reqId);
        showToast("Request cancelled successfully.", "success");
        renderBranchRequestsList();
    } catch (err) {
        showToast("Failed to cancel request: " + err.message, "error");
    }
};

window.editBranchRequest = async function (reqId) {
    try {
        const requests = await dbRequests.fetchByBranch(state.branchId);
        const req = requests.find(r => r.id === reqId);
        if (!req) return showToast("Request not found.", "error");

        if (req.type === 'inventory_add') {
            openModal('editInventoryAddRequest', req);
        } else if (req.type === 'inventory_update') {
            openModal('editRestockRequest', req);
        } else {
            openModal('editGeneralRequest', req);
        }
    } catch (err) {
        showToast("Failed to load request: " + err.message, "error");
    }
};
