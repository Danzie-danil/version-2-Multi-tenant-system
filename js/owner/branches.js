// ── Owner: Branch Management ──────────────────────────────────────────────

window.renderBranchesManagement = function () {
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Branch Management</div>
            </div>
            <button onclick="openModal('addBranch')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Branch
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <p class="text-gray-400 text-sm">Loading branches…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    dbBranches.fetchAll(state.ownerId).then(async branches => {
        // Update state so modals can reference branch list
        state.branches = branches;

        // Fetch today's sales total for every branch in parallel
        const salesTotals = await Promise.all(
            branches.map(b => dbSales.todayTotal(b.id).catch(() => 0))
        );

        const withSales = branches.map((b, i) => ({ ...b, todaySales: salesTotals[i] }));
        const combinedToday = withSales.reduce((s, b) => s + b.todaySales, 0);

        container.innerHTML = `
        <div class="space-y-4 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Branch Management</div>
                </div>
                <button onclick="openModal('addBranch')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 font-bold">
                    <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Branch
                </button>
            </div>

            <!-- Summary Bar -->
            <div class="grid grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                    <p class="text-2xl font-black text-gray-900">${branches.length}</p>
                    <p class="text-xs text-gray-500 mt-1 font-bold uppercase tracking-tight">Total Branches</p>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                    <p class="text-2xl font-black text-emerald-600">${branches.filter(b => b.status === 'active').length}</p>
                    <p class="text-xs text-gray-500 mt-1 font-bold uppercase tracking-tight">Active</p>
                </div>
                <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                    <p class="text-2xl font-black text-indigo-600">${fmt.currency(combinedToday)}</p>
                    <p class="text-xs text-gray-500 mt-1 font-bold uppercase tracking-tight">Combined Today</p>
                </div>
            </div>

            ${branches.length === 0 ? `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                <i data-lucide="git-branch" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                <p class="text-gray-400 text-sm">No branches yet. Create your first branch!</p>
                <button onclick="openModal('addBranch')" class="mt-4 btn-primary text-sm">Add Branch</button>
            </div>` : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                ${withSales.map(branch => {
            const pct = fmt.percent(branch.todaySales, branch.target);
            const barColor = pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';

            // Format currency for this specific branch, falling back to global currency
            const currCode = branch.currency || (state.profile && state.profile.currency) || 'USD';
            const fCurr = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currCode }).format(val || 0);

            return `
                    <div onclick="openDetailsModal('branch', '${branch.id}')" class="module-card bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full">
                        <!-- Top Row: Icon + Name -->
                        <div class="flex items-start justify-between mb-5">
                            <div class="flex items-center gap-3.5">
                                <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110 duration-300">
                                    <i data-lucide="building-2" class="w-6 h-6"></i>
                                </div>
                                <div>
                                    <h3 class="font-black text-gray-900 text-base leading-tight group-hover:text-indigo-600 transition-colors">${branch.name}</h3>
                                    <div class="flex items-center gap-1.5 mt-1">
                                        <span class="w-1.5 h-1.5 rounded-full ${branch.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}"></span>
                                        <p class="text-[9px] text-gray-400 uppercase font-black tracking-[0.1em]">${branch.status}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="bg-gray-50 text-gray-400 p-2 rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-colors">
                                <i data-lucide="chevron-right" class="w-4 h-4"></i>
                            </div>
                        </div>

                        <!-- Manager info -->
                        <div class="flex items-center gap-2.5 mb-5 p-2 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                            <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 text-gray-400 group-hover:text-indigo-500 transition-colors">
                                <i data-lucide="user" class="w-4 h-4"></i>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-[8px] text-gray-400 uppercase font-black tracking-wider mb-0.5">Branch Manager</p>
                                <p class="text-[11px] font-bold text-gray-700 truncate leading-none">${branch.manager || 'Unassigned'}</p>
                            </div>
                        </div>

                        <!-- Stats Grid: Vertical Stack -->
                        <div class="grid grid-cols-1 gap-2 mb-6">
                            <div class="bg-indigo-50/40 rounded-2xl p-3 border border-indigo-100/30 group-hover:bg-indigo-50 transition-colors flex items-center justify-between">
                                <p class="text-[8px] text-indigo-400 uppercase font-black tracking-widest opacity-80">Today's Sales</p>
                                <p class="text-sm font-black text-indigo-600">${fCurr(branch.todaySales)}</p>
                            </div>
                            <div class="bg-emerald-50/40 rounded-2xl p-3 border border-emerald-100/30 group-hover:bg-emerald-50 transition-colors flex items-center justify-between">
                                <p class="text-[8px] text-emerald-400 uppercase font-black tracking-widest opacity-80">Achievement</p>
                                <p class="text-sm font-black text-emerald-600">${pct}%</p>
                            </div>
                        </div>

                        <!-- Progress Bar Section -->
                        <div class="mt-auto pt-2">
                            <div class="flex justify-between items-end mb-2">
                                <p class="text-[9px] font-black uppercase text-gray-400 tracking-[0.15em]">Growth Metric</p>
                                <p class="text-[10px] font-black text-gray-900">${pct}%</p>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
                                <div class="${barColor} h-full progress-bar transition-all duration-1000" style="width:${Math.min(pct, 100)}%"></div>
                            </div>
                        </div>
                    </div>`;
        }).join('')}
            </div>`}
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `< div class= "py-20 text-center text-red-500" > Failed to load branches: ${err.message}</div > `;
    });

    return '';
};

// Global function to handle branch deletion
window.deleteBranchRow = async function (id, name) {
    const confirmed = await confirmModal(
        'Delete Branch',
        `Are you absolutely sure you want to delete the branch "${name}" ? This action cannot be undone and will delete all associated data(sales, expenses, etc.).`,
        'Delete Branch',
        'Cancel',
        'bg-red-600 hover:bg-red-700',
        name
    );
    if (!confirmed) return;

    try {
        await dbBranches.delete(id);

        // Remove from local state
        state.branches = state.branches.filter(b => b.id !== id);

        showToast(`Branch "${name}" deleted successfully.`, 'success');

        // Re-render the view
        switchView('branches');
    } catch (err) {
        showToast(`Failed to delete branch: ${err.message}`, 'error');
    }
};
