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
        ${renderPremiumLoader('Loading branches…')}
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

            <!-- Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                <div class="bg-gradient-to-br from-indigo-500 to-violet-600 px-3 py-2 rounded-2xl text-white shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-indigo-100 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Total Branches">Total Branches</p>
                    <p class="text-dynamic-lg font-black text-white truncate leading-none my-auto py-1">${branches.length}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 px-3 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Active">Active</p>
                    <p class="text-dynamic-lg font-black text-emerald-600 dark:text-emerald-400 truncate leading-none my-auto py-1">${branches.filter(b => b.status === 'active').length}</p>
                </div>
                <div class="bg-white dark:bg-gray-800 px-3 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Avg Target Progress">Target Attained</p>
                    <p class="text-dynamic-lg font-black text-gray-900 dark:text-white truncate leading-none my-auto py-1">${branches.length ? Math.round((withSales.filter(b => b.todaySales >= (b.target || 1000)).length / branches.length) * 100) : 0}%</p>
                </div>
                <div class="bg-white dark:bg-gray-800 px-3 py-2 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Combined Today">Combined Today</p>
                    <p class="text-dynamic-lg font-black text-indigo-600 dark:text-indigo-400 truncate leading-none my-auto py-1" title="${fmt.currency(combinedToday)}">${fmt.currency(combinedToday)}</p>
                </div>
            </div>

            ${branches.length === 0 ? `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                <i data-lucide="git-branch" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                <p class="text-gray-400 text-sm">No branches yet. Create your first branch!</p>
                <button onclick="openModal('addBranch')" class="mt-4 btn-primary text-sm">Add Branch</button>
            </div>` : `
            <div class="space-y-3.5">
                ${withSales.map((branch, idx) => {
            const pct = fmt.percent(branch.todaySales, branch.target);
            const barColor = pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
            const accentColors = ['border-l-indigo-500', 'border-l-emerald-500', 'border-l-blue-500', 'border-l-purple-500', 'border-l-rose-500', 'border-l-amber-500'];
            const accentColor = accentColors[idx % accentColors.length];

            // Format currency for this specific branch
            const currCode = branch.currency || (state.profile && state.profile.currency) || 'USD';
            const fCurr = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: currCode }).format(val || 0);

            return `
                    <div onclick="openDetailsModal('branch', '${branch.id}')" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 border-l-[4px] ${accentColor} rounded-2xl p-4 md:p-5 flex items-center gap-4 hover:shadow-md transition-all group relative cursor-pointer">
                        <!-- Left Icon -->
                        <div class="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:scale-110 duration-300 flex-shrink-0">
                            <i data-lucide="building-2" class="w-6 h-6"></i>
                        </div>

                        <!-- Main Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-3 mb-1">
                                <div>
                                    <h3 class="font-bold text-gray-900 dark:text-white text-base leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">${branch.name}</h3>
                                    <div class="flex items-center gap-2 mt-0.5">
                                        <span class="w-1.5 h-1.5 rounded-full ${branch.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300 dark:bg-gray-600'}"></span>
                                        <p class="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest">${branch.status}</p>
                                    </div>
                                </div>
                                <div class="text-right">
                                    <p class="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 leading-none mb-1">Today's Sales</p>
                                    <span class="text-sm md:text-lg font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">${fCurr(branch.todaySales)}</span>
                                </div>
                            </div>
                            
                            <div class="flex items-end justify-between gap-3 mt-2">
                                <div class="flex items-center gap-3">
                                    <div class="flex flex-col">
                                        <p class="text-[8px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Manager</p>
                                        <p class="text-[11px] font-bold text-gray-700 dark:text-gray-200 truncate">${branch.manager || 'Unassigned'}</p>
                                    </div>
                                    <div class="h-5 w-px bg-gray-100 dark:bg-gray-700"></div>
                                    <div class="flex flex-col">
                                        <p class="text-[8px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Achievement</p>
                                        <p class="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">${pct}%</p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3">
                                    <div class="w-24 bg-gray-100 dark:bg-gray-700 rounded-full h-1 overflow-hidden hidden sm:block">
                                        <div class="${barColor} h-full transition-all duration-1000" style="width:${Math.min(pct, 100)}%"></div>
                                    </div>
                                    <div class="text-gray-300 dark:text-gray-600 group-hover:text-indigo-400 transition-colors">
                                        <i data-lucide="chevron-right" class="w-5 h-5"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>`;
        }).join('')}
            </div>`  }
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
