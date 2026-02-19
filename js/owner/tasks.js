// ── Owner: Tasks & Objectives ─────────────────────────────────────────────

window.renderTasksManagement = function () {
    const statusFilter = ['pending', 'in_progress', 'completed'];
    return `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Tasks & Objectives</h2>
            <button onclick="openModal('assignTask')" class="btn-primary">
                <i data-lucide="plus" class="w-4 h-4"></i> New Task
            </button>
        </div>

        <!-- Status Summary -->
        <div class="grid grid-cols-3 gap-4">
            ${[['pending', 'bg-gray-100 text-gray-700', 'Pending'], ['in_progress', 'bg-blue-100 text-blue-700', 'In Progress'], ['completed', 'bg-emerald-100 text-emerald-700', 'Completed']].map(([s, cls, label]) => `
            <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                <span class="badge ${cls} mb-2">${label}</span>
                <p class="text-2xl font-bold text-gray-900">${state.tasks.filter(t => t.status === s).length}</p>
            </div>`).join('')}
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Task</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Branch</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Deadline</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Priority</th>
                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                    ${state.tasks.length === 0 ? `
                    <tr><td colspan="5" class="px-6 py-10 text-center text-gray-400 text-sm">No tasks yet. Assign one from the button above.</td></tr>
                    ` : state.tasks.map(task => `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-4">
                            <p class="font-medium text-gray-900">${task.title}</p>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-600">
                            ${state.branches.find(b => b.id === task.branchId)?.name || 'All Branches'}
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-600">${fmt.date(task.deadline)}</td>
                        <td class="px-6 py-4">${priorityBadge(task.priority)}</td>
                        <td class="px-6 py-4">${statusBadge(task.status)}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>
    </div>`;
};
