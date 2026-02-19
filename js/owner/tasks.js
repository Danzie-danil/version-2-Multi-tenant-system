// ── Owner: Tasks & Objectives ─────────────────────────────────────────────

window.renderTasksManagement = function () {
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Tasks &amp; Objectives</h2>
            <button onclick="openModal('assignTask')" class="btn-primary">
                <i data-lucide="plus" class="w-4 h-4"></i> New Task
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center text-gray-400">
                <i data-lucide="loader-2" class="w-8 h-8 mx-auto mb-2 animate-spin"></i>
                <p class="text-sm">Loading tasks…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    // Fetch tasks for all branches of this owner via joins
    supabaseClient
        .from('tasks')
        .select('*, branch:branches(name, owner_id)')
        .order('created_at', { ascending: false })
        .then(({ data: tasks, error }) => {
            if (error) throw error;
            // Filter to tasks belonging to this owner's branches
            const myTasks = (tasks || []).filter(t => t.branch?.owner_id === state.ownerId);

            container.innerHTML = `
            <div class="space-y-6 slide-in">
                <div class="flex items-center justify-between">
                    <h2 class="text-2xl font-bold text-gray-900">Tasks &amp; Objectives</h2>
                    <button onclick="openModal('assignTask')" class="btn-primary">
                        <i data-lucide="plus" class="w-4 h-4"></i> New Task
                    </button>
                </div>

                <!-- Status summary -->
                <div class="grid grid-cols-3 gap-4">
                    ${[['pending', 'bg-gray-100 text-gray-700', 'Pending'],
                ['in_progress', 'bg-blue-100 text-blue-700', 'In Progress'],
                ['completed', 'bg-emerald-100 text-emerald-700', 'Completed']
                ].map(([s, cls, label]) => `
                    <div class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
                        <span class="badge ${cls} mb-2">${label}</span>
                        <p class="text-2xl font-bold text-gray-900">${myTasks.filter(t => t.status === s).length}</p>
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
                            ${myTasks.length === 0 ? `
                            <tr><td colspan="5" class="px-6 py-10 text-center text-gray-400 text-sm">No tasks yet. Assign one from the button above.</td></tr>
                            ` : myTasks.map(task => `
                            <tr class="hover:bg-gray-50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="font-medium text-gray-900">${task.title}</p>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-600">${task.branch?.name || '—'}</td>
                                <td class="px-6 py-4 text-sm text-gray-600">${task.deadline ? fmt.date(task.deadline) : '—'}</td>
                                <td class="px-6 py-4">${priorityBadge(task.priority)}</td>
                                <td class="px-6 py-4">${statusBadge(task.status)}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
            lucide.createIcons();
        }).catch(err => {
            container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load tasks: ${err.message}</div>`;
        });

    return '';
};
