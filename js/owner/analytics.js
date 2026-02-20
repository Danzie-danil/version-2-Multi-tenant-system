// ── Owner: Analytics Dashboard ────────────────────────────────────────────

window.renderAnalytics = async function () {
    const container = document.getElementById('mainContent');
    container.innerHTML = `
        <div class="flex items-center justify-center h-full">
            <div class="text-center text-gray-400">
                <i data-lucide="loader-2" class="w-8 h-8 mx-auto mb-2 animate-spin"></i>
                <p>Loading analytics...</p>
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
        // Note: For a true owner view we might need owner-scoped fetchAll, 
        // but currently we might rely on iterating branches.
        // For simplicity/performance in this fix, we'll try to use what we have or fetch minimally.

        // Let's assume we need to populate state.expenses and state.tasks for the reduce to work
        // Ideally we should have dbExpenses.fetchAllForOwner(ownerId) but we might have to loop.
        // To fix the immediate crash, we will ensure state.expenses/tasks are arrays.

        // Quick fix: Fetch expenses for all branches (could be heavy, but accurate)
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
        <div class="space-y-6 slide-in">
            <h2 class="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>

            <!-- Top Stats -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Revenue</p>
                    <p class="text-2xl font-bold text-gray-900">${fmt.currency(totalSales)}</p>
                    <p class="text-xs text-emerald-600 mt-1">Today</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Expenses</p>
                    <p class="text-2xl font-bold text-gray-900">${fmt.currency(totalExpenses)}</p>
                    <p class="text-xs text-red-500 mt-1">All branches</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Net Profit</p>
                    <p class="text-2xl font-bold text-emerald-600">${fmt.currency(totalSales - totalExpenses)}</p>
                    <p class="text-xs text-gray-400 mt-1">Revenue − Expenses</p>
                </div>
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm stat-card">
                    <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg / Branch</p>
                    <p class="text-2xl font-bold text-gray-900">${fmt.currency(state.branches.length ? totalSales / state.branches.length : 0)}</p>
                    <p class="text-xs text-gray-400 mt-1">Revenue per branch</p>
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
        initAnalyticsCharts(allSales);

    } catch (err) {
        console.error('Analytics load error:', err);
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load analytics: ${err.message}</div>`;
    }

    return ''; // Rendered async
};

window.initAnalyticsCharts = function (allSales) {
    const branchNames = state.branches.map(b => b.name.split(' ')[0]);
    const branchSales = state.branches.map(b => b.todaySales);

    // Revenue by Branch
    const rev = document.getElementById('revenueChart');
    if (rev) {
        new Chart(rev.getContext('2d'), {
            type: 'bar',
            data: {
                labels: branchNames,
                datasets: [{ label: 'Revenue', data: branchSales, backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa'], borderRadius: 8, borderSkipped: false }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } } }
        });
    }

    // Trend chart
    const trend = document.getElementById('trendChart');
    if (trend) {
        const daysLabel = [];
        const dataMap = {};

        // Setup past 7 days tracking map
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const displayDay = d.toLocaleDateString('en-US', { weekday: 'short' });
            daysLabel.push(displayDay);
            dataMap[dateStr] = 0;
        }

        // Project real sales sums into tracker
        (allSales || []).forEach(s => {
            if (!s.created_at) return;
            const dateStr = s.created_at.split('T')[0];
            if (dataMap[dateStr] !== undefined) {
                dataMap[dateStr] += Number(s.amount || 0);
            }
        });

        const dataVals = Object.values(dataMap);

        new Chart(trend.getContext('2d'), {
            type: 'line',
            data: {
                labels: daysLabel,
                datasets: [{ label: 'Daily Sales', data: dataVals, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#6366f1', pointRadius: 4 }]
            },
            options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f3f4f6' } }, x: { grid: { display: false } } } }
        });
    }

    // Expense chart
    const exp = document.getElementById('expenseChart');
    if (exp) {
        new Chart(exp.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Supplies', 'Utilities', 'Salary', 'Rent', 'Other'],
                datasets: [{ data: [30, 20, 25, 15, 10], backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'], borderWidth: 0 }]
            },
            options: { plugins: { legend: { position: 'right' } }, cutout: '65%' }
        });
    }
};
