// ── Owner: Analytics Dashboard ────────────────────────────────────────────

window.renderAnalytics = function () {
    const totalSales = state.branches.reduce((s, b) => s + b.todaySales, 0);
    const totalExpenses = state.expenses.reduce((s, e) => s + e.amount, 0);

    return `
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
            ['Avg Transaction Value', '$142.50', 'text-gray-900'],
            ['Customer Satisfaction', '4.8 / 5.0', 'text-emerald-600'],
            ['Inventory Turnover', '12.3×', 'text-gray-900'],
            ['Staff Productivity', '94%', 'text-indigo-600'],
            ['Tasks Completion Rate', `${state.tasks.length ? Math.round(state.tasks.filter(t => t.status === 'completed').length / state.tasks.length * 100) : 0}%`, 'text-amber-600']
        ].map(([label, value, cls]) => `
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span class="text-sm text-gray-600">${label}</span>
                        <span class="font-bold ${cls}">${value}</span>
                    </div>`).join('')}
                </div>
            </div>
        </div>
    </div>`;
};

window.initAnalyticsCharts = function () {
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
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = days.map(() => Math.floor(Math.random() * 20000) + 5000);
        new Chart(trend.getContext('2d'), {
            type: 'line',
            data: {
                labels: days,
                datasets: [{ label: 'Daily Sales', data, borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.08)', tension: 0.4, fill: true, pointBackgroundColor: '#6366f1', pointRadius: 4 }]
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
