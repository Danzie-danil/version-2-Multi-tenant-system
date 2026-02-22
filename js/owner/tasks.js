// ── Owner: Tasks & Objectives ─────────────────────────────────────────────

window.renderTasksManagement = function () {
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Tasks &amp; Objectives</div>
            </div>
            <button onclick="openModal('assignTask')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> New Task
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <p class="text-gray-400 text-sm">Loading tasks…</p>
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
            <div class="space-y-4 slide-in">
                <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                    <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                        <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Tasks &amp; Objectives</div>
                    </div>
                    <button onclick="openModal('assignTask')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                        <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> New Task
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
                    <table class="w-full responsive-table">
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
                                <td class="px-6 py-4" data-label="Task">
                                    <p class="text-sm sm:text-base font-medium text-gray-900">${task.title}</p>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-600" data-label="Branch">${task.branch?.name || '—'}</td>
                                <td class="px-6 py-4 text-sm text-gray-600" data-label="Deadline">${task.deadline ? fmt.date(task.deadline) : '—'}</td>
                                <td class="px-6 py-4" data-label="Priority">${priorityBadge(task.priority)}</td>
                                <td class="px-6 py-4" data-label="Status">${statusBadge(task.status)}</td>
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
