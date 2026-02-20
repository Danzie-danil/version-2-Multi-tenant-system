// ── Owner: Business Overview ───────────────────────────────────────────────

window.renderOwnerOverview = function () {
    const container = document.getElementById('mainContent');

    // Render skeleton immediately with structure + spinner
    container.innerHTML = `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Business Overview</h2>
            <span class="text-sm text-gray-500">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>

        <!-- KPI skeleton -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4" id="overviewKPIs">
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

        <!-- Quick Actions -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button onclick="openModal('assignTask')" class="p-4 border border-gray-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center group">
                    <i data-lucide="plus-circle" class="w-6 h-6 text-indigo-500 mx-auto mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="text-sm font-medium text-gray-700">Assign Task</span>
                </button>
                <button onclick="switchView('analytics',null)" class="p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all text-center group">
                    <i data-lucide="bar-chart-3" class="w-6 h-6 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="text-sm font-medium text-gray-700">Analytics</span>
                </button>
                <button onclick="switchView('branches',null)" class="p-4 border border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all text-center group">
                    <i data-lucide="git-branch" class="w-6 h-6 text-emerald-500 mx-auto mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="text-sm font-medium text-gray-700">Branches</span>
                </button>
                <button onclick="switchView('security',null)" class="p-4 border border-gray-200 rounded-xl hover:border-violet-400 hover:bg-violet-50 transition-all text-center group">
                    <i data-lucide="shield" class="w-6 h-6 text-violet-500 mx-auto mb-2 group-hover:scale-110 transition-transform"></i>
                    <span class="text-sm font-medium text-gray-700">Security</span>
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

        // Update KPI cards
        document.getElementById('overviewKPIs').innerHTML = `
        <div onclick="switchView('sales')" class="stat-card bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:-translate-y-1 transition-transform">
            <div class="flex items-center justify-between mb-3">
                <span class="text-gray-500 text-xs font-medium uppercase tracking-wide truncate">Total Revenue</span>
                <div class="p-2 bg-emerald-100 rounded-lg flex-shrink-0"><i data-lucide="dollar-sign" class="w-4 h-4 text-emerald-600"></i></div>
            </div>
            <p class="text-dynamic-lg font-bold text-gray-900" title="${fmt.currency(totalSales)}">${fmt.currency(totalSales)}</p>
            <p class="text-xs text-emerald-600 mt-1 font-medium truncate">▲ Across all branches</p>
        </div>
        <div onclick="switchView('branches')" class="stat-card bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:-translate-y-1 transition-transform">
            <div class="flex items-center justify-between mb-3">
                <span class="text-gray-500 text-xs font-medium uppercase tracking-wide truncate">Active Branches</span>
                <div class="p-2 bg-blue-100 rounded-lg flex-shrink-0"><i data-lucide="git-branch" class="w-4 h-4 text-blue-600"></i></div>
            </div>
            <p class="text-dynamic-lg font-bold text-gray-900">${branches.length}</p>
            <p class="text-xs text-gray-500 mt-1 truncate">All operational</p>
        </div>
        <div onclick="switchView('tasks')" class="stat-card bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:-translate-y-1 transition-transform">
            <div class="flex items-center justify-between mb-3">
                <span class="text-gray-500 text-xs font-medium uppercase tracking-wide truncate">Pending Tasks</span>
                <div class="p-2 bg-amber-100 rounded-lg flex-shrink-0"><i data-lucide="alert-circle" class="w-4 h-4 text-amber-600"></i></div>
            </div>
            <p class="text-dynamic-lg font-bold text-gray-900">${pendingTasks}</p>
            <p class="text-xs text-amber-600 mt-1 font-medium truncate">Requires attention</p>
        </div>
        <div onclick="switchView('branches')" class="stat-card bg-white p-5 rounded-2xl shadow-sm border border-gray-100 cursor-pointer hover:-translate-y-1 transition-transform">
            <div class="flex items-center justify-between mb-3">
                <span class="text-gray-500 text-xs font-medium uppercase tracking-wide truncate">Target Progress</span>
                <div class="p-2 bg-violet-100 rounded-lg flex-shrink-0"><i data-lucide="target" class="w-4 h-4 text-violet-600"></i></div>
            </div>
            <p class="text-dynamic-lg font-bold text-gray-900">${progress}%</p>
            <div class="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                <div class="bg-violet-500 h-1.5 rounded-full progress-bar" style="width:${Math.min(progress, 100)}%"></div>
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
