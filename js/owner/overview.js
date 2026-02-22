// ── Owner: Business Overview ───────────────────────────────────────────────

window.renderOwnerOverview = function () {
    const container = document.getElementById('mainContent');

    // Render skeleton immediately with structure + spinner
    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Business Overview</div>
                <span class="text-[10px] sm:text-sm font-medium text-gray-500 flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
                    <i data-lucide="calendar" class="w-3 h-3 sm:w-4 sm:h-4"></i>
                    ${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
            </div>
        </div>

        <!-- KPI skeleton -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3" id="overviewKPIs">
            ${[1, 2, 3, 4].map(() => `
            <div class="stat-card bg-white p-5 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
                <div class="h-3 bg-gray-100 rounded mb-4 w-24"></div>
                <div class="h-8 bg-gray-100 rounded w-32"></div>
            </div>`).join('')}
        </div>

        <!-- Feed + Branch Performance -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-gray-900">Live Activity Feed</h3>
                    <span class="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                        <span class="w-2 h-2 rounded-full live-indicator inline-block"></span> Real-time
                    </span>
                </div>
                <div id="activityFeed" class="space-y-3 max-h-80 overflow-auto pr-1">
                    ${renderActivities()}
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 class="font-semibold text-gray-900 mb-4">Branch Performance</h3>
                <div id="branchPerformance" class="space-y-3 animate-pulse">
                    ${[1, 2, 3].map(() => `
                    <div class="p-3 bg-gray-50 rounded-xl">
                        <div class="h-3 bg-gray-100 rounded mb-3 w-28"></div>
                        <div class="w-full bg-gray-200 rounded-full h-1.5"></div>
                    </div>`).join('')}
                </div>
                <button onclick="switchView('branches',null)" class="w-full mt-4 py-2 text-sm text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
                    Manage Branches →
                </button>
            </div>
        </div>

        <div id="dashStockAlerts"></div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <button onclick="openModal('assignTask')" class="p-2 border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center group">
                    <i data-lucide="plus-circle" class="w-4 h-4 text-indigo-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-medium text-gray-700">Assign Task</span>
                </button>
                <button onclick="switchView('analytics',null)" class="p-2 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
                    <i data-lucide="bar-chart-3" class="w-4 h-4 text-blue-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-medium text-gray-700">Analytics</span>
                </button>
                <button onclick="switchView('branches',null)" class="p-2 border border-gray-200 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center group">
                    <i data-lucide="git-branch" class="w-4 h-4 text-emerald-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-medium text-gray-700">Branches</span>
                </button>
                <button onclick="switchView('security',null)" class="p-2 border border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition-all text-center group">
                    <i data-lucide="shield" class="w-4 h-4 text-violet-500 mx-auto mb-1 group-hover:scale-110 transition-transform"></i>
                    <span class="text-xs font-medium text-gray-700">Security</span>
                </button>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    // Fetch data for all branches of this owner
    dbBranches.fetchAll(state.ownerId).then(async branches => {
        state.branches = branches;
        const branchIds = branches.map(b => b.id);

        // Fetch today's sales for all branches in parallel, AND wait for activities
        const [salesTotals, taskCounts, recentActivities] = await Promise.all([
            Promise.all(branches.map(b => dbSales.todayTotal(b.id).catch(() => 0))),
            supabaseClient
                .from('tasks')
                .select('branch_id, status')
                .in('branch_id', branchIds)
                .then(r => r.data || []),
            dbActivities.fetchRecent(branchIds)
        ]);

        state.activities = recentActivities || [];

        const withSales = branches.map((b, i) => ({ ...b, todaySales: salesTotals[i] }));
        const totalSales = withSales.reduce((s, b) => s + b.todaySales, 0);
        const totalTarget = withSales.reduce((s, b) => s + Number(b.target), 0);
        const progress = totalTarget > 0 ? fmt.percent(totalSales, totalTarget) : 0;
        const pendingTasks = taskCounts.filter(t => t.status !== 'completed').length;

        // ── Inventory Alerts (Across All Branches) ───────────────────────────
        Promise.all(branchIds.map(id => dbInventory.fetchAll(id))).then(results => {
            const allItems = results.map(r => r.items || []).flat();
            const lowStock = allItems.filter(i => i.quantity <= i.min_threshold);
            const alertContainer = document.getElementById('dashStockAlerts');

            if (lowStock.length > 0 && alertContainer) {
                alertContainer.innerHTML = `
                <div class="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2 text-orange-600">
                            <i data-lucide="alert-circle" class="w-5 h-5"></i>
                            <h3 class="font-bold text-gray-900">Critical Stock Alerts</h3>
                        </div>
                        <span class="badge bg-orange-100 text-orange-700">${lowStock.length} items low</span>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        ${lowStock.slice(0, 6).map(item => {
                    const branch = branches.find(b => b.id === item.branch_id);
                    return `
                            <div class="flex items-center gap-3 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-bold text-gray-900 truncate">${item.name}</p>
                                    <p class="text-[10px] text-orange-600 font-medium truncate">${branch?.name || 'Branch'}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-sm font-bold text-red-600">${item.quantity}</p>
                                    <p class="text-[10px] text-gray-400">Min: ${item.min_threshold}</p>
                                </div>
                            </div>`;
                }).join('')}
                    </div>
                    ${lowStock.length > 6 ? `
                    <p class="text-center text-xs text-gray-400 mt-4">+ ${lowStock.length - 6} more items across branches</p>
                    ` : ''}
                </div>`;
                lucide.createIcons();
            }
        });

        // Update KPI cards
        document.getElementById('overviewKPIs').innerHTML = `
        <div onclick="switchView('sales')" class="bg-gradient-to-br from-indigo-500 to-violet-600 p-4 md:p-5 rounded-2xl text-white shadow-sm stat-card min-w-0 cursor-pointer hover:-translate-y-1 transition-transform">
            <p class="text-[10px] md:text-xs text-indigo-100 uppercase tracking-wide mb-1 truncate">Total Revenue</p>
            <p class="text-dynamic-lg font-bold truncate" title="${fmt.currency(totalSales)}">${fmt.currency(totalSales)}</p>
        </div>
        <div onclick="switchView('branches')" class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 cursor-pointer hover:-translate-y-1 transition-transform">
            <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Active Branches</p>
            <p class="text-dynamic-lg font-bold text-gray-900 truncate">${branches.length}</p>
        </div>
        <div onclick="switchView('tasks')" class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 cursor-pointer hover:-translate-y-1 transition-transform">
            <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Pending Tasks</p>
            <p class="text-dynamic-lg font-bold text-gray-900 truncate">${pendingTasks}</p>
        </div>
        <div onclick="switchView('branches')" class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 cursor-pointer hover:-translate-y-1 transition-transform flex flex-col justify-center">
            <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Target Progress</p>
            <p class="text-dynamic-lg font-bold text-violet-600 truncate mb-1">${progress}%</p>
            <div class="w-full bg-gray-100 rounded-full h-1 mt-auto">
                <div class="bg-violet-500 h-1 rounded-full progress-bar" style="width:${Math.min(progress, 100)}%"></div>
            </div>
        </div>`;

        // Update branch performance panel
        document.getElementById('branchPerformance').innerHTML = withSales.length === 0
            ? '<p class="text-gray-400 text-sm text-center py-4">No branches yet</p>'
            : withSales.map(branch => {
                const pct = branch.target > 0 ? fmt.percent(branch.todaySales, branch.target) : 0;
                const color = pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
                const textColor = pct >= 100 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-red-600';
                return `
                <div class="p-3 bg-gray-50 rounded-xl">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-medium text-sm text-gray-900">${branch.name}</p>
                            <p class="text-xs text-gray-500">${fmt.currency(branch.todaySales)} / ${fmt.currency(branch.target)}</p>
                        </div>
                        <span class="text-sm font-bold ${textColor}">${pct}%</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-1.5">
                        <div class="${color} h-1.5 rounded-full progress-bar" style="width:${Math.min(pct, 100)}%"></div>
                    </div>
                </div>`;
            }).join('');

        // Update Activity Feed DOM
        document.getElementById('activityFeed').innerHTML = renderActivities();

        // ── Real-time Polling for Activities ────────────────────────────────
        // Refresh activities every 15 seconds while on this view
        if (window.ownerOverviewInterval) clearInterval(window.ownerOverviewInterval);
        window.ownerOverviewInterval = setInterval(async () => {
            const currentFeed = document.getElementById('activityFeed');
            // Stop polling if the feed element is gone (user switched view)
            if (!currentFeed) {
                clearInterval(window.ownerOverviewInterval);
                return;
            }

            try {
                const latest = await dbActivities.fetchRecent(branchIds);
                state.activities = latest || [];
                currentFeed.innerHTML = renderActivities();
                lucide.createIcons();
            } catch (err) {
                console.warn('Polling error:', err);
            }
        }, 15000);

        lucide.createIcons();
    }).catch(err => {
        console.error('Overview load error:', err);
    });
};

window.renderActivities = function () {
    if (state.activities.length === 0) {
        return '<p class="text-gray-400 text-center py-10 text-sm">No recent activity — check back soon</p>';
    }
    const typeMap = {
        sale: { bg: 'bg-emerald-100', icon: 'shopping-cart', ic: 'text-emerald-600', amt: 'text-emerald-600', sign: '+' },
        expense: { bg: 'bg-red-100', icon: 'credit-card', ic: 'text-red-600', amt: 'text-red-600', sign: '-' },
        task_completed: { bg: 'bg-blue-100', icon: 'check-circle', ic: 'text-blue-600', amt: null, sign: '' },
        task_assigned: { bg: 'bg-amber-100', icon: 'clipboard-list', ic: 'text-amber-600', amt: null, sign: '' }
    };
    return state.activities.slice(0, 20).map(a => {
        const t = typeMap[a.type] || typeMap.task_completed;
        return `
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl slide-in">
            <div class="w-8 h-8 rounded-full ${t.bg} flex items-center justify-center flex-shrink-0">
                <i data-lucide="${t.icon}" class="w-4 h-4 ${t.ic}"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">${a.message}</p>
                <p class="text-xs text-gray-500 mt-0.5">${a.branch} · ${a.time}</p>
            </div>
            ${a.amount ? `<span class="text-sm font-bold ${t.amt} flex-shrink-0">${t.sign}${fmt.currency(a.amount)}</span>` : ''}
        </div>`;
    }).join('');
};
