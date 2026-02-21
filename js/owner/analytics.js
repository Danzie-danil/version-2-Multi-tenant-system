// ── Owner: Analytics Dashboard ────────────────────────────────────────────

window.renderAnalytics = async function () {
    const container = document.getElementById('mainContent');
    container.innerHTML = `
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <span class="loader mx-auto mb-32"></span>
                <p class="text-gray-400">Loading analytics...</p>
            </div>
        </div>`;
    lucide.createIcons();

    try {
        // Fetch fresh data for analytics
        const branches = await dbBranches.fetchAll(state.ownerId);
        state.branches = branches; // Update state

        // Fetch today's sales for all branches to update state
        await Promise.all(branches.map(async b => {
            b.todaySales = await dbSales.todayTotal(b.id).catch(() => 0);
        }));

        // Fetch all expenses and tasks if needed for aggregate stats
        const allExpenses = (await Promise.all(branches.map(b => dbExpenses.fetchAll(b.id)))).flat();
        state.expenses = allExpenses;

        // Fetch global tasks for Tasks Completion metrics
        const allTasks = (await supabaseClient.from('tasks').select('*').in('branch_id', branches.map(b => b.id))).data || [];
        state.tasks = allTasks;

        // Calculate REAL specific Key Metrics
        const allSales = (await supabaseClient.from('sales').select('amount, created_at').in('branch_id', branches.map(b => b.id))).data || [];
        const avgTxValue = allSales.length ? allSales.reduce((s, x) => s + Number(x.amount || 0), 0) / allSales.length : 0;

        const allInventory = (await supabaseClient.from('inventory').select('price, quantity').in('branch_id', branches.map(b => b.id))).data || [];
        const inventoryValue = allInventory.reduce((s, x) => s + (Number(x.price || 0) * Number(x.quantity || 0)), 0);

        const allCustomers = (await supabaseClient.from('customers').select('loyalty_points').in('branch_id', branches.map(b => b.id))).data || [];
        const avgLoyalty = allCustomers.length ? Math.round(allCustomers.reduce((s, c) => s + Number(c.loyalty_points || 0), 0) / allCustomers.length) : 0;

        const totalSales = state.branches.reduce((s, b) => s + (b.todaySales || 0), 0);
        const totalExpenses = state.expenses.reduce((s, e) => s + (e.amount || 0), 0);
        const totalTarget = state.branches.reduce((s, b) => s + (Number(b.target) || 0), 0);

        const turnover = inventoryValue > 0 ? (totalSales / inventoryValue).toFixed(1) + '×' : 'N/A';
        const productivity = totalTarget > 0 ? Math.min(Math.round((totalSales / totalTarget) * 100), 100) + '%' : 'N/A';
        const tasksPct = allTasks.length ? Math.round(allTasks.filter(t => t.status === 'completed').length / allTasks.length * 100) : 0;

        container.innerHTML = `
        <div class="space-y-4 slide-in">
            <div class="flex flex-nowrap flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Analytics Dashboard</div>
                </div>

                <!-- Branch Filter -->
                <div class="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <span class="text-xs text-gray-500 font-medium ml-2">Filter</span>
                    <select id="analyticsBranchFilter" onchange="renderAnalytics()" class="text-xs font-semibold bg-gray-50 border-none rounded-lg py-1.5 px-3 focus:ring-0 cursor-pointer">
                        <option value="all">All Branches</option>
                        ${branches.map(b => `<option value="${b.id}" ${state.analyticsBranchId === b.id ? 'selected' : ''}>${b.name}</option>`).join('')}
                    </select>
                </div>
            </div>

            <!-- Top Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                <div class="bg-gradient-to-br from-indigo-500 to-violet-600 p-4 md:p-5 rounded-2xl text-white shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-indigo-100 uppercase tracking-wide mb-1 truncate">Total Revenue</p>
                    <p class="text-dynamic-lg font-bold truncate" title="${fmt.currency(totalSales)}">${fmt.currency(totalSales)}</p>
                    <p class="text-[10px] md:text-xs text-indigo-200 mt-1 truncate">Today</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Total Expenses</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate" title="${fmt.currency(totalExpenses)}">${fmt.currency(totalExpenses)}</p>
                    <p class="text-[10px] md:text-xs text-red-500 mt-1 truncate">All branches</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Net Profit</p>
                    <p class="text-dynamic-lg font-bold text-emerald-600 truncate" title="${fmt.currency(totalSales - totalExpenses)}">${fmt.currency(totalSales - totalExpenses)}</p>
                    <p class="text-[10px] md:text-xs text-gray-400 mt-1 truncate">Revenue − Expenses</p>
                </div>
                <div class="bg-white p-4 md:p-5 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0">
                    <p class="text-[10px] md:text-xs text-gray-500 uppercase tracking-wide mb-1 truncate">Avg / Branch</p>
                    <p class="text-dynamic-lg font-bold text-gray-900 truncate" title="${fmt.currency(state.branches.length ? totalSales / state.branches.length : 0)}">${fmt.currency(state.branches.length ? totalSales / state.branches.length : 0)}</p>
                    <p class="text-[10px] md:text-xs text-gray-400 mt-1 truncate">Revenue per branch</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="font-semibold text-gray-900 mb-4">Revenue by Branch</h3>
                    <canvas id="revenueChart" height="220"></canvas>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="font-semibold text-gray-900 mb-4">Sales Trend (7 Days)</h3>
                    <canvas id="trendChart" height="220"></canvas>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="font-semibold text-gray-900 mb-4">Expense Categories</h3>
                    <canvas id="expenseChart" height="220"></canvas>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="font-semibold text-gray-900 mb-4">Sales vs Target</h3>
                    <canvas id="targetChart" height="220"></canvas>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 class="font-semibold text-gray-900 mb-4">Key Metrics</h3>
                    <div class="space-y-3">
                        ${[
                ['Avg Transaction Value', fmt.currency(avgTxValue), 'text-gray-900'],
                ['Avg Loyalty Points', `${avgLoyalty} pts`, 'text-emerald-600'],
                ['Inventory Turnover', turnover, 'text-gray-900'],
                ['Target Hit Rate (Productivity)', productivity, 'text-indigo-600'],
                ['Tasks Completion Rate', `${tasksPct}%`, 'text-amber-600']
            ].map(([label, value, cls]) => `
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                            <span class="text-sm text-gray-600">${label}</span>
                            <span class="font-bold ${cls}">${value}</span>
                        </div>`).join('')}
                    </div>
                </div>
            </div>
        </div>`;

        lucide.createIcons();

        // Fetch 7-day history for trends
        const filterId = document.getElementById('analyticsBranchFilter')?.value || 'all';
        state.analyticsBranchId = filterId;
        const targetIds = filterId === 'all' ? branches.map(b => b.id) : [filterId];

        const history = await dbSales.fetchHistory(targetIds, 7);
        initAnalyticsCharts(history, filterId);

    } catch (err) {
        console.error('Analytics load error:', err);
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load analytics: ${err.message}</div>`;
    }

    return ''; // Rendered async
};

window.initAnalyticsCharts = function (history, filterId) {
    // 1. Revenue by Branch (Bar)
    const rev = document.getElementById('revenueChart');
    if (rev) {
        let labels, data;
        if (filterId === 'all') {
            labels = state.branches.map(b => b.name.split(' ')[0]);
            data = state.branches.map(b => b.todaySales);
        } else {
            const b = state.branches.find(x => x.id === filterId);
            labels = [b?.name || 'Branch'];
            data = [b?.todaySales || 0];
        }

        new Chart(rev.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{ label: 'Today Revenue', data: data, backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#f59e0b', '#10b981'], borderRadius: 8 }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
        });
    }

    // 2. Sales Trend (7 Days Line) - REAL DATA
    const trend = document.getElementById('trendChart');
    if (trend) {
        // Group history by date
        const groups = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            groups[key] = 0;
        }

        history.forEach(s => {
            const key = s.created_at.split('T')[0];
            if (groups[key] !== undefined) groups[key] += Number(s.amount);
        });

        const labels = Object.keys(groups).map(k => {
            const d = new Date(k);
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        });
        const data = Object.values(groups);

        new Chart(trend.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Revenue',
                    data: data,
                    borderColor: '#6366f1',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#6366f1',
                    pointBorderWidth: 2
                }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }
        });
    }

    // 3. Expenses Breakdown (Doughnut)
    const exp = document.getElementById('expenseChart');
    if (exp) {
        const relevantExpenses = filterId === 'all' ? state.expenses : state.expenses.filter(e => e.branch_id === filterId);
        const categories = [...new Set(relevantExpenses.map(e => e.category || 'Other'))];
        const catData = categories.map(c => relevantExpenses.filter(e => e.category === c).reduce((s, x) => s + x.amount, 0));

        new Chart(exp.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{ data: catData, backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1'] }]
            },
            options: { cutout: '75%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }
        });
    }

    // 4. Sales vs Target (Radar or Grouped Bar)
    const targetCtx = document.getElementById('targetChart');
    if (targetCtx) {
        let labels, salesData, targetData;
        if (filterId === 'all') {
            labels = state.branches.map(b => b.name.split(' ')[0]);
            salesData = state.branches.map(b => b.todaySales);
            targetData = state.branches.map(b => Number(b.target) || 0);
        } else {
            const b = state.branches.find(x => x.id === filterId);
            labels = [b?.name || 'Branch'];
            salesData = [b?.todaySales || 0];
            targetData = [Number(b?.target) || 0];
        }

        new Chart(targetCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Sales', data: salesData, backgroundColor: '#6366f1', borderRadius: 6 },
                    { label: 'Target', data: targetData, backgroundColor: '#e2e8f0', borderRadius: 6 }
                ]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6 } } },
                scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
            }
        });
    }
};
