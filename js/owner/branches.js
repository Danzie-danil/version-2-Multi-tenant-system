// ── Owner: Branch Management ──────────────────────────────────────────────

window.renderBranchesManagement = function () {
    return `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Branch Management</h2>
            <button onclick="openModal('addBranch')" class="btn-primary">
                <i data-lucide="plus" class="w-4 h-4"></i> Add Branch
            </button>
        </div>

        <!-- Summary Bar -->
        <div class="grid grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <p class="text-2xl font-bold text-gray-900">${state.branches.length}</p>
                <p class="text-xs text-gray-500 mt-1">Total Branches</p>
            </div>
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <p class="text-2xl font-bold text-emerald-600">${state.branches.filter(b => b.status === 'active').length}</p>
                <p class="text-xs text-gray-500 mt-1">Active</p>
            </div>
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <p class="text-2xl font-bold text-indigo-600">${fmt.currency(state.branches.reduce((s, b) => s + b.todaySales, 0))}</p>
                <p class="text-xs text-gray-500 mt-1">Combined Today</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${state.branches.map(branch => {
        const pct = fmt.percent(branch.todaySales, branch.target);
        const barColor = pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-500';
        return `
                <div class="module-card bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="font-semibold text-gray-900">${branch.name}</h3>
                            <p class="text-sm text-gray-500 mt-0.5">
                                <i data-lucide="map-pin" class="w-3 h-3 inline mr-1"></i>${branch.location || 'No location set'}
                            </p>
                        </div>
                        <span class="badge ${branch.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}">${branch.status}</span>
                    </div>

                    <div class="space-y-2 mb-4 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-500">Manager</span>
                            <span class="font-medium text-gray-900">${branch.manager}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Today's Sales</span>
                            <span class="font-bold text-emerald-600">${fmt.currency(branch.todaySales)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Target</span>
                            <span class="font-medium">${fmt.currency(branch.target)}</span>
                        </div>
                    </div>

                    <div class="mb-4">
                        <div class="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span><span>${pct}%</span>
                        </div>
                        <div class="w-full bg-gray-100 rounded-full h-2">
                            <div class="${barColor} h-2 rounded-full progress-bar" style="width:${Math.min(pct, 100)}%"></div>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <button onclick="openModal('resetPin','${branch.id}')"
                            class="flex-1 py-2 text-sm font-medium text-violet-700 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors">
                            Reset PIN
                        </button>
                        <button onclick="openModal('assignTask')"
                            class="flex-1 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                            Assign Task
                        </button>
                    </div>
                </div>`;
    }).join('')}
        </div>
    </div>`;
};
