// ── Branch: Tasks Module ──────────────────────────────────────────────────

window.renderBranchTasks = function () {
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">My Tasks</h2>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center text-gray-400">
                <i data-lucide="loader-2" class="w-8 h-8 mx-auto mb-2 animate-spin"></i>
                <p class="text-sm">Loading tasks…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    dbTasks.fetchByBranch(state.branchId).then(tasks => {
        container.innerHTML = `
        <div class="space-y-6 slide-in">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-gray-900">My Tasks</h2>
                <div class="flex gap-2 text-sm">
                    <span class="badge bg-gray-100 text-gray-700">${tasks.filter(t => t.status === 'pending').length} pending</span>
                    <span class="badge bg-blue-100 text-blue-700">${tasks.filter(t => t.status === 'in_progress').length} in progress</span>
                    <span class="badge bg-emerald-100 text-emerald-700">${tasks.filter(t => t.status === 'completed').length} done</span>
                </div>
            </div>

            ${tasks.length === 0 ? `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                <i data-lucide="list-todo" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                <p class="text-gray-400 text-sm">No tasks assigned to this branch yet</p>
            </div>` : `
            <div class="space-y-3">
                ${tasks.map(task => `
                <div class="bg-white rounded-2xl border ${task.status === 'completed' ? 'border-emerald-100 opacity-75' : 'border-gray-100'} shadow-sm p-5 module-card">
                    <div class="flex items-start gap-4">
                        <div class="w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5
                            ${task.status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                task.status === 'in_progress' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                            flex items-center justify-center">
                            ${task.status === 'completed' ? '<i data-lucide="check" class="w-3 h-3 text-white"></i>' : ''}
                        </div>
                        <div class="flex-1">
                            <p class="font-medium text-gray-900 ${task.status === 'completed' ? 'line-through text-gray-400' : ''}">${task.title}</p>
                            ${task.description ? `<p class="text-sm text-gray-500 mt-1">${task.description}</p>` : ''}
                            <div class="flex items-center gap-3 mt-2 flex-wrap">
                                ${priorityBadge(task.priority)}
                                ${statusBadge(task.status)}
                                <span class="text-xs text-gray-400">Deadline: ${task.deadline ? fmt.date(task.deadline) : '—'}</span>
                            </div>
                        </div>
                        ${task.status !== 'completed' ? `
                        <button onclick="advanceTask('${task.id}', '${task.status}')"
                            class="px-3 py-1.5 text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors">
                            ${task.status === 'pending' ? 'Start' : 'Complete'}
                        </button>` : ''}
                    </div>
                </div>`).join('')}
            </div>`}
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load tasks: ${err.message}</div>`;
    });

    return '';
};

window.advanceTask = async function (taskId, currentStatus) {
    const nextStatus = currentStatus === 'pending' ? 'in_progress' : 'completed';
    try {
        await dbTasks.updateStatus(taskId, nextStatus);
        if (nextStatus === 'completed') {
            addActivity('task_completed', `Task completed`, state.currentUser);
            showToast('Task completed! 🎉', 'success');
        } else {
            showToast('Task started!', 'info');
        }
        switchView('tasks');
    } catch (err) {
        showToast('Failed to update task: ' + err.message, 'error');
    }
};
