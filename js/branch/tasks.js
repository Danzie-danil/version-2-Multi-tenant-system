// ── Branch: Tasks Module ──────────────────────────────────────────────────

// ── Selection State ──────────────────────────────────────────────────────────
window.tasksSelection = new Set();
window.tasksPageState = {
    page: 1,
    pageSize: 5,
    totalCount: 0,
    statusFilter: 'all' // all | pending | in_progress | completed | deleted
};

window.setTasksStatusFilter = function (status) {
    window.tasksPageState.statusFilter = status;
    window.tasksPageState.page = 1;
    renderBranchTasks();
};

window.changeTasksPage = function (delta) {
    const newPage = window.tasksPageState.page + delta;
    const maxPage = Math.ceil(window.tasksPageState.totalCount / window.tasksPageState.pageSize) || 1;
    if (newPage < 1 || newPage > maxPage) return;
    window.tasksPageState.page = newPage;
    renderBranchTasks();
};

window.toggleTaskSelection = function (id) {
    if (window.tasksSelection.has(id)) {
        window.tasksSelection.delete(id);
    } else {
        window.tasksSelection.add(id);
    }
    updateTaskBulkActionBar();
};

window.toggleSelectAllTasks = function (checked) {
    const checkboxes = document.querySelectorAll('.task-checkbox');
    window.tasksSelection.clear();
    checkboxes.forEach(cb => {
        cb.checked = checked;
        if (checked) window.tasksSelection.add(cb.value);
    });
    updateTaskBulkActionBar();
};

window.updateTaskBulkActionBar = function () {
    const count = window.tasksSelection.size;
    const countSpan = document.getElementById('tasksSelectedCount');
    if (countSpan) countSpan.textContent = `${count} selected`;

    const deleteBtn = document.getElementById('btnBulkDeleteTasks');
    if (deleteBtn) deleteBtn.disabled = count === 0;

    const tagBtn = document.getElementById('btnBulkTagTasks');
    if (tagBtn) tagBtn.disabled = count === 0;

    const selectAll = document.getElementById('selectAllTasks');
    const checkboxes = document.querySelectorAll('.task-checkbox');
    if (selectAll && checkboxes.length > 0) {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        selectAll.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }
};

window.bulkDeleteSelectedTasks = async function () {
    const count = window.tasksSelection.size;
    if (count === 0) return;
    const confirmed = await window.confirmModal('Confirm Deletion', 'Are you sure you want to delete the selected items?', 'Yes, Delete', 'Cancel');
    if (!confirmed) return;

    try {
        const ids = Array.from(window.tasksSelection);
        await dbTasks.bulkDelete(ids);
        window.tasksSelection.clear();
        showToast(`Deleted ${count} tasks`, 'success');
        renderBranchTasks();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};

window.openTaskTagModal = async function (taskId, isBulk = false) {
    document.querySelectorAll('.tags-modal-overlay').forEach(el => el.remove());
    const title = isBulk ? `Tag ${window.tasksSelection.size} Tasks` : 'Manage Task Tags';

    let currentTags = [];
    if (!isBulk && taskId) {
        try {
            const allTags = await dbTaskTags.fetchAll(state.branchId);
            currentTags = allTags.filter(t => t.task_id === taskId);
        } catch (err) { console.error(err); }
    }

    const overlay = document.createElement('div');
    overlay.className = 'tags-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-200';
    overlay.style.opacity = '0';

    overlay.innerHTML = `
        <div class="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden transform scale-95 transition-transform duration-200">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <i data-lucide="tag" class="w-5 h-5 text-indigo-500"></i> ${title}
                </h3>
                <button type="button" class="close-tags-btn p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <div class="p-6">
                <div class="flex gap-2 mb-6">
                    <input type="text" id="newTaskTagName" placeholder="New tag name..." class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                    <button id="submitTaskTagBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">Add</button>
                </div>

                ${!isBulk ? `
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Tags</p>
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${currentTags.length ? currentTags.map(t => `
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                                # ${t.tag}
                                <i data-lucide="x" onclick="removeTaskTagModal('${t.id}', '${taskId}')" class="w-3.5 h-3.5 cursor-pointer hover:text-red-600"></i>
                            </span>
                        `).join('') : '<p class="text-xs text-gray-400 italic">No tags applied yet</p>'}
                    </div>
                ` : ''}

                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Suggestions</p>
                <div class="flex flex-wrap gap-2">
                    ${['Operations', 'Sales', 'Admin', 'Maintenance', 'Urgent'].map(t => `
                        <button onclick="quickAddTaskTag('${t}', '${taskId}', ${isBulk})" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all uppercase tracking-tight">
                            + ${t}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button class="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors close-tags-btn">Done</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons();
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('.transform').classList.replace('scale-95', 'scale-100');
    });

    const closeTagsModal = () => {
        overlay.style.opacity = '0';
        overlay.querySelector('.transform').classList.replace('scale-100', 'scale-95');
        setTimeout(() => overlay.remove(), 200);
        renderBranchTasks();
    };

    overlay.querySelectorAll('.close-tags-btn').forEach(btn => btn.addEventListener('click', closeTagsModal));

    const submitBtn = overlay.querySelector('#submitTaskTagBtn');
    const input = overlay.querySelector('#newTaskTagName');

    const handleAdd = async () => {
        const tagName = input.value.trim();
        if (!tagName) return;
        submitBtn.disabled = true;
        try {
            if (isBulk) {
                const ids = Array.from(window.tasksSelection);
                await Promise.all(ids.map(id => dbTaskTags.add(state.branchId, id, tagName)));
                window.tasksSelection.clear();
                showToast(`Tagged ${ids.length} tasks`, 'success');
                closeTagsModal();
            } else {
                await dbTaskTags.add(state.branchId, taskId, tagName);
                openTaskTagModal(taskId, false);
            }
        } catch (err) { showToast('Error adding tag', 'error'); }
        finally { submitBtn.disabled = false; }
    };

    submitBtn.addEventListener('click', handleAdd);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAdd(); });

    window.removeTaskTagModal = async (tagId, taskId) => {
        try {
            await dbTaskTags.delete(tagId);
            openTaskTagModal(taskId, false);
        } catch (err) { showToast('Error', 'error'); }
    };

    window.quickAddTaskTag = async (tagName, taskId, isBulk) => {
        input.value = tagName;
        handleAdd();
    };
};

window.renderBranchTasks = function () {
    window.tasksSelection.clear();
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Branch Tasks</div>
            </div>
            <div class="flex items-center gap-1.5 sm:gap-2 text-gray-400 mr-2">
                <i data-lucide="clipboard-list" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i>
                <span class="text-[10px] sm:text-xs font-medium">Assigned to you</span>
            </div>
        </div>
        ${renderPremiumLoader('Loading tasks…')}
    </div>`;
    lucide.createIcons();

    let query = supabaseClient.from('tasks').select('*', { count: 'exact' }).eq('branch_id', state.branchId);

    // Status Filter logic
    if (window.tasksPageState.statusFilter && window.tasksPageState.statusFilter !== 'all') {
        if (window.tasksPageState.statusFilter === 'deleted') {
            // Because tasks are hard-deleted, we will just return nothing for deleted filter
            // unless a soft-delete mechanism is implemented in the DB.
            query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        } else {
            query = query.eq('status', window.tasksPageState.statusFilter);
        }
    }

    const from = (window.tasksPageState.page - 1) * window.tasksPageState.pageSize;
    const to = from + window.tasksPageState.pageSize - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    Promise.all([
        query.then(res => {
            if (res.error) throw res.error;
            return { items: res.data, count: res.count || 0 };
        }),
        dbTaskTags.fetchAll(state.branchId)
    ]).then(([res, tags]) => {
        const tasks = res.items;
        window.tasksPageState.totalCount = res.count;
        const totalPages = Math.ceil(window.tasksPageState.totalCount / window.tasksPageState.pageSize) || 1;

        container.innerHTML = `
        <div class="space-y-4 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Branch Tasks</div>
                </div>
                <div class="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <span class="text-xs text-gray-400 font-medium">Page ${window.tasksPageState.page} of ${totalPages}</span>
                </div>
            </div>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 mb-20 md:mb-0">
                <h3 class="text-xl font-bold text-gray-900 mb-5">Tasks List</h3>
                
                <!-- Search & Filters -->
                <div class="flex gap-2 mb-4">
                    <div class="relative flex-1">
                        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <i data-lucide="search" class="w-4 h-4 text-indigo-500"></i>
                        </div>
                        <input type="text" placeholder="Search tasks..." oninput="filterList('tasksList', this.value)" class="w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all">
                    </div>
                    <select id="branchTaskFilter" onchange="setTasksStatusFilter(this.value)" class="px-3 md:px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none hover:bg-white transition-all cursor-pointer">
                        <option value="all" ${window.tasksPageState.statusFilter === 'all' ? 'selected' : ''}>All Status</option>
                        <option value="pending" ${window.tasksPageState.statusFilter === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="in_progress" ${window.tasksPageState.statusFilter === 'in_progress' ? 'selected' : ''}>Ongoing</option>
                        <option value="completed" ${window.tasksPageState.statusFilter === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="deleted" ${window.tasksPageState.statusFilter === 'deleted' ? 'selected' : ''}>Deleted</option>
                    </select>
                </div>

                <!-- Bulk Action Bar -->
                <div class="flex flex-wrap items-center justify-between bg-gray-50/70 border border-gray-100 rounded-xl p-2.5 md:p-3 mb-5 gap-3">
                    <div class="flex items-center gap-3 pl-2">
                        <input type="checkbox" id="selectAllTasks" onchange="toggleSelectAllTasks(this.checked)" class="rounded w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer">
                        <span class="text-sm font-semibold text-gray-800">Select All <span id="tasksSelectedCount" class="font-normal text-xs text-gray-400 ml-1.5 hidden sm:inline-block">0 selected</span></span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button id="btnBulkDeleteTasks" disabled onclick="bulkDeleteSelectedTasks()" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors disabled:opacity-50">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5 text-gray-400"></i> <span class="hidden sm:inline-block">Delete Selected</span>
                        </button>
                        <button id="btnBulkTagTasks" disabled onclick="openTaskTagModal(null, true)" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-50">
                            <i data-lucide="tag" class="w-3.5 h-3.5 text-indigo-500"></i> <span class="hidden sm:inline-block">Apply Tag</span>
                        </button>
                    </div>
                </div>

                <div class="space-y-4" id="tasksList">
                    ${tasks.length === 0 ? `
                        <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <i data-lucide="list-todo" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                            <p class="text-gray-400 text-sm">No tasks history found for this page</p>
                        </div>
                    ` : tasks.map(task => `
                        <div onclick="openDetailsModal('task', '${task.id}')" data-search="${task.title.toLowerCase()} ${(task.description || '').toLowerCase()} ${task.priority} ${task.status}" class="bg-white border border-gray-200 border-l-[4px] ${task.status === 'completed' ? 'border-l-emerald-500 bg-emerald-50/10 opacity-75' : 'border-l-indigo-500'} rounded-2xl p-5 md:p-6 flex gap-4 hover:shadow-md transition-all group relative cursor-pointer">
                            <div class="pt-1" onclick="event.stopPropagation()">
                                <input type="checkbox" value="${task.id}" onchange="toggleTaskSelection('${task.id}')" class="task-checkbox rounded w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer" ${window.tasksSelection.has(task.id) ? 'checked' : ''}>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-3 mb-1">
                                    <h4 class="font-bold text-gray-900 text-sm sm:text-base ${task.status === 'completed' ? 'line-through text-gray-400' : ''} truncate max-w-[70%]" title="${task.description || task.title}">${task.title}</h4>
                                    <div class="text-right">
                                        <p class="text-[10px] uppercase font-bold text-gray-400 leading-none">${task.deadline ? fmt.dateTime(task.deadline) : 'No deadline'}</p>
                                    </div>
                                </div>
                                <div class="flex items-end justify-between gap-3">
                                    <div class="flex flex-wrap gap-1.5 overflow-hidden pt-1">
                                        <div class="flex items-center gap-1.5 flex-shrink-0 scale-95 origin-left">
                                            ${priorityBadge(task.priority)}
                                            ${statusBadge(task.status)}
                                        </div>
                                        ${tags.filter(t => t.task_id === task.id).map(t => `<span class="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap flex-shrink-0">#${t.tag}</span>`).join('')}
                                    </div>
                                </div>
                            </div>
                        </div>`).join('')}
                </div>

                <!-- Pagination Footer -->
                <div class="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <p class="text-xs text-gray-500">Showing <span class="font-bold text-gray-900">${tasks.length}</span> of <span class="font-bold text-gray-900">${window.tasksPageState.totalCount}</span> tasks</p>
                    <div class="flex items-center gap-2">
                        <button onclick="changeTasksPage(-1)" ${window.tasksPageState.page === 1 ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        </button>
                        <div class="flex items-center gap-1">
                            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return `<button onclick="window.tasksPageState.page = ${p}; renderBranchTasks()" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${window.tasksPageState.page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}">${p}</button>`;
        }).join('')}
                        </div>
                        <button onclick="changeTasksPage(1)" ${window.tasksPageState.page === totalPages ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
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

        // Add an automatic comment to notify the owner
        const statusText = nextStatus === 'completed' ? 'Completed' : 'In Progress';
        const msg = `Task status updated to: ${statusText}`;
        await dbTaskComments.add(taskId, 'branch', 'Branch System', msg);

        if (nextStatus === 'completed') {
            const branch = state.branches.find(b => b.id === state.branchId) || { name: 'Branch' };
            addActivity('task_completed', `Task completed`, branch.name);
            showToast('Task completed! 🎉', 'success');
        } else {
            showToast('Task started!', 'info');
        }

        // Force update of notifications/badges immediately
        if (typeof checkNotifications === 'function') checkNotifications(true);
        switchView('tasks');
    } catch (err) {
        showToast('Failed to update task: ' + err.message, 'error');
    }
};

