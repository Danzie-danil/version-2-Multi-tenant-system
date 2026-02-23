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

                <div class="space-y-4">
                    ${myTasks.length === 0 ? `
                    <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                        <i data-lucide="clipboard-list" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                        <p class="text-gray-400 text-sm">No tasks assigned yet. Assign one above.</p>
                    </div>
                    ` : myTasks.map(task => `
                    <div onclick="openDetailsModal('task', '${task.id}')" class="bg-white border border-gray-200 border-l-[4px] ${task.status === 'completed' ? 'border-l-emerald-500 bg-emerald-50/10 opacity-75' : 'border-l-indigo-500'} rounded-2xl p-5 md:p-6 flex gap-4 hover:shadow-md transition-all group relative cursor-pointer">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between gap-3">
                                <div class="flex items-center gap-2.5 flex-1 min-w-0">
                                    <h4 class="font-bold text-gray-900 text-sm sm:text-base ${task.status === 'completed' ? 'line-through text-gray-400' : ''} truncate">${task.title}</h4>
                                    <span class="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg font-bold whitespace-nowrap">${task.branch?.name || '—'}</span>
                                </div>
                                <div class="flex items-center gap-2 flex-shrink-0 scale-95 origin-right">
                                    ${priorityBadge(task.priority)}
                                    ${statusBadge(task.status)}
                                </div>
                            </div>
                            <div class="mt-3 flex items-center justify-between text-xs text-gray-500">
                                <div class="flex items-center gap-1.5">
                                    <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
                                    <span>${task.deadline ? fmt.date(task.deadline) : 'No deadline'}</span>
                                </div>
                                <span class="group-hover:text-indigo-600 font-bold transition-colors">View Details <i data-lucide="chevron-right" class="w-3.5 h-3.5 inline"></i></span>
                            </div>
                        </div>
                    </div>`).join('')}
                </div>
            </div>`;
            lucide.createIcons();
        }).catch(err => {
            container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load tasks: ${err.message}</div>`;
        });

    return '';
};
