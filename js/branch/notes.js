// ── Branch: Notes Module ──────────────────────────────────────────────────

// ── Selection State ──────────────────────────────────────────────────────────
window.notesSelection = new Set();
window.notesPageState = {
    page: 1,
    pageSize: 5,
    totalCount: 0
};

window.changeNotesPage = function (delta) {
    const newPage = window.notesPageState.page + delta;
    const maxPage = Math.ceil(window.notesPageState.totalCount / window.notesPageState.pageSize) || 1;
    if (newPage < 1 || newPage > maxPage) return;
    window.notesPageState.page = newPage;
    renderNotesModule();
};

window.toggleNoteSelection = function (id) {
    if (window.notesSelection.has(id)) {
        window.notesSelection.delete(id);
    } else {
        window.notesSelection.add(id);
    }
    updateNoteBulkActionBar();
};

window.toggleSelectAllNotes = function (checked) {
    const checkboxes = document.querySelectorAll('.note-checkbox');
    window.notesSelection.clear();
    checkboxes.forEach(cb => {
        cb.checked = checked;
        if (checked) window.notesSelection.add(cb.value);
    });
    updateNoteBulkActionBar();
};

window.updateNoteBulkActionBar = function () {
    const count = window.notesSelection.size;
    const countSpan = document.getElementById('notesSelectedCount');
    if (countSpan) countSpan.textContent = `${count} selected`;

    const deleteBtn = document.getElementById('btnBulkDeleteNotes');
    if (deleteBtn) deleteBtn.disabled = count === 0;

    const tagBtn = document.getElementById('btnBulkTagNotes');
    if (tagBtn) tagBtn.disabled = count === 0;

    const selectAll = document.getElementById('selectAllNotes');
    const checkboxes = document.querySelectorAll('.note-checkbox');
    if (selectAll && checkboxes.length > 0) {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        selectAll.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }
};

window.bulkDeleteSelectedNotes = async function () {
    const count = window.notesSelection.size;
    if (count === 0) return;
    if (!confirm(`Are you sure you want to delete ${count} selected notes?`)) return;

    try {
        const ids = Array.from(window.notesSelection);
        await dbNotes.bulkDelete(ids);
        window.notesSelection.clear();
        showToast(`Deleted ${count} notes`, 'success');
        renderNotesModule();
    } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
};

window.openNotesTagModal = async function (noteId, isBulk = false) {
    document.querySelectorAll('.tags-modal-overlay').forEach(el => el.remove());
    const title = isBulk ? `Tag ${window.notesSelection.size} Notes` : 'Manage Note Tags';

    let currentTags = [];
    if (!isBulk && noteId) {
        try {
            const allTags = await dbNoteTags.fetchAll(state.branchId);
            currentTags = allTags.filter(t => t.note_id === noteId);
        } catch (err) { console.error(err); }
    }

    const overlay = document.createElement('div');
    overlay.className = 'tags-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-200';
    overlay.style.opacity = '0';

    overlay.innerHTML = `
        <div class="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden transform scale-95 transition-transform duration-200">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <i data-lucide="tag" class="w-5 h-5 text-amber-500"></i> ${title}
                </h3>
                <button type="button" class="close-tags-btn p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <div class="p-6">
                <div class="flex gap-2 mb-6">
                    <input type="text" id="newNoteTagName" placeholder="New tag name..." class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all">
                    <button id="submitNoteTagBtn" class="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-amber-700 transition-colors">Add</button>
                </div>

                ${!isBulk ? `
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Tags</p>
                    <div class="flex flex-wrap gap-2 mb-6">
                        ${currentTags.length ? currentTags.map(t => `
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold">
                                # ${t.tag}
                                <i data-lucide="x" onclick="removeNoteTagModal('${t.id}', '${noteId}')" class="w-3.5 h-3.5 cursor-pointer hover:text-red-600"></i>
                            </span>
                        `).join('') : '<p class="text-xs text-gray-400 italic">No tags applied yet</p>'}
                    </div>
                ` : ''}

                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Suggestions</p>
                <div class="flex flex-wrap gap-2">
                    ${['Incident', 'Reminder', 'Tasks', 'Archive', 'Urgent'].map(t => `
                        <button onclick="quickAddNoteTag('${t}', '${noteId}', ${isBulk})" class="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-50/30 transition-all">
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
        renderNotesModule();
    };

    overlay.querySelectorAll('.close-tags-btn').forEach(btn => btn.addEventListener('click', closeTagsModal));

    const submitBtn = overlay.querySelector('#submitNoteTagBtn');
    const input = overlay.querySelector('#newNoteTagName');

    const handleAdd = async () => {
        const tagName = input.value.trim();
        if (!tagName) return;
        submitBtn.disabled = true;
        try {
            if (isBulk) {
                const ids = Array.from(window.notesSelection);
                await Promise.all(ids.map(id => dbNoteTags.add(state.branchId, id, tagName)));
                window.notesSelection.clear();
                showToast(`Tagged ${ids.length} items`, 'success');
                closeTagsModal();
            } else {
                await dbNoteTags.add(state.branchId, noteId, tagName);
                openNotesTagModal(noteId, false);
            }
        } catch (err) { showToast('Error adding tag', 'error'); }
        finally { submitBtn.disabled = false; }
    };

    submitBtn.addEventListener('click', handleAdd);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAdd(); });

    window.removeNoteTagModal = async (tagId, noteId) => {
        try {
            await dbNoteTags.delete(tagId);
            openNotesTagModal(noteId, false);
        } catch (err) { showToast('Error', 'error'); }
    };

    window.quickAddNoteTag = async (tagName, noteId, isBulk) => {
        input.value = tagName;
        handleAdd();
    };
};

window.renderNotesModule = function () {
    window.notesSelection.clear();
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Branch Notes</div>
            </div>
            <button onclick="openModal('addNote')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="edit-3" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Note
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center">
                <p class="text-gray-400 text-sm">Loading notes…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    Promise.all([
        dbNotes.fetchAll(state.branchId, {
            page: window.notesPageState.page,
            pageSize: window.notesPageState.pageSize
        }),
        dbNoteTags.fetchAll(state.branchId)
    ]).then(([res, tags]) => {
        const notes = res.items;
        window.notesPageState.totalCount = res.count;
        const totalPages = Math.ceil(window.notesPageState.totalCount / window.notesPageState.pageSize) || 1;

        container.innerHTML = `
        <div class="space-y-4 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Branch Notes</div>
                </div>
                <button onclick="openModal('addNote')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                    <i data-lucide="edit-3" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Add Note
                </button>
            </div>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 mb-20 md:mb-0">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-xl font-bold text-gray-900">Note Archive</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 font-medium">Page ${window.notesPageState.page} of ${totalPages}</span>
                    </div>
                </div>
                
                <!-- Search & Filters -->
                <div class="relative mb-4">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="w-4 h-4 text-amber-500"></i>
                    </div>
                    <input type="text" placeholder="Search notes..." oninput="filterList('notesList', this.value)" class="w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-indigo-500 transition-all">
                </div>

                <!-- Bulk Action Bar -->
                <div class="flex flex-wrap items-center justify-between bg-gray-50/70 border border-gray-100 rounded-xl p-2.5 md:p-3 mb-5 gap-3">
                    <div class="flex items-center gap-3 pl-2">
                        <input type="checkbox" id="selectAllNotes" onchange="toggleSelectAllNotes(this.checked)" class="rounded w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 cursor-pointer">
                        <span class="text-sm font-semibold text-gray-800">Select All <span id="notesSelectedCount" class="font-normal text-xs text-gray-400 ml-1.5 hidden sm:inline-block">0 selected</span></span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button id="btnBulkDeleteNotes" disabled onclick="bulkDeleteSelectedNotes()" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors disabled:opacity-50">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5 text-gray-400"></i> <span class="hidden sm:inline-block">Delete Selected</span>
                        </button>
                        <button id="btnBulkTagNotes" disabled onclick="openNotesTagModal(null, true)" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-amber-600 transition-colors disabled:opacity-50">
                            <i data-lucide="tag" class="w-3.5 h-3.5 text-amber-500"></i> <span class="hidden sm:inline-block">Apply Tag</span>
                        </button>
                    </div>
                </div>

                <div class="space-y-4" id="notesList">
                    ${notes.length === 0 ? `
                        <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <i data-lucide="file-text" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                            <p class="text-gray-400 text-sm">No notes history found for this page</p>
                        </div>
                    ` : notes.map(note => `
                        <div data-search="${note.title.toLowerCase()} ${(note.details || note.content || '').toLowerCase()}" class="bg-white border border-gray-200 border-l-[3px] border-l-amber-500 rounded-2xl p-4 flex gap-3 hover:shadow-md transition-all group relative">
                            <div class="pt-0.5">
                                <input type="checkbox" value="${note.id}" onchange="toggleNoteSelection('${note.id}')" class="note-checkbox rounded w-4 h-4 text-amber-600 border-gray-300 focus:ring-amber-500 cursor-pointer" ${window.notesSelection.has(note.id) ? 'checked' : ''}>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-center justify-between gap-2 mb-2">
                                    <div class="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
                                        <h4 class="font-bold text-gray-900 text-xs sm:text-sm truncate flex-shrink-0 max-w-[40%]">${note.title}</h4>
                                        <span class="text-[10px] text-gray-500 whitespace-nowrap flex-shrink-0 hidden sm:inline-block">- ${note.details || ''}</span>
                                        <div class="flex gap-1 overflow-hidden">
                                            ${tags.filter(t => t.note_id === note.id).map(t => `<span class="bg-amber-50 text-amber-700 border border-amber-100 text-[9px] px-1.5 py-0.5 rounded font-medium whitespace-nowrap flex-shrink-0">#${t.tag}</span>`).join('')}
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-2 flex-shrink-0">
                                        <span class="text-[9px] sm:text-[10px] text-gray-400 whitespace-nowrap">${fmt.date(note.created_at)}</span>
                                    </div>
                                </div>
                                <div class="grid grid-cols-3 gap-1 sm:gap-1.5 w-full mt-2">
                                    <button onclick="openEditModal('editNote', '${note.id}')" class="flex flex-col min-[420px]:flex-row items-center justify-center gap-0.5 min-[420px]:gap-1 min-[420px]:px-2 py-1.5 min-[420px]:py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] sm:text-[11px] lg:text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-colors">
                                        <i data-lucide="edit-3" class="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400"></i> <span class="leading-none">Edit</span>
                                    </button>
                                    <button onclick="openNotesTagModal('${note.id}', false)" class="flex flex-col min-[420px]:flex-row items-center justify-center gap-0.5 min-[420px]:gap-1 min-[420px]:px-2 py-1.5 min-[420px]:py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] sm:text-[11px] lg:text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-amber-600 transition-colors">
                                        <i data-lucide="tag" class="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400"></i> <span class="leading-none">Tag</span>
                                    </button>
                                    <button onclick="confirmDelete('note', '${note.id}', '${note.title}')" class="flex flex-col min-[420px]:flex-row items-center justify-center gap-0.5 min-[420px]:gap-1 min-[420px]:px-2 py-1.5 min-[420px]:py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] sm:text-[11px] lg:text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors">
                                        <i data-lucide="trash-2" class="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400"></i> <span class="leading-none">Delete</span>
                                    </button>
                                </div>
                            </div>
                        </div>`).join('')}
                </div>

                <!-- Pagination Footer -->
                <div class="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <p class="text-xs text-gray-500">Showing <span class="font-bold text-gray-900">${notes.length}</span> of <span class="font-bold text-gray-900">${window.notesPageState.totalCount}</span> notes</p>
                    <div class="flex items-center gap-2">
                        <button onclick="changeNotesPage(-1)" ${window.notesPageState.page === 1 ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        </button>
                        <div class="flex items-center gap-1">
                            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1;
            return `<button onclick="window.notesPageState.page = ${p}; renderNotesModule()" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${window.notesPageState.page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}">${p}</button>`;
        }).join('')}
                        </div>
                        <button onclick="changeNotesPage(1)" ${window.notesPageState.page === totalPages ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load notes: ${err.message}</div>`;
    });

    return '';
};

window.deleteNote = async function (noteId) {
    try {
        await dbNotes.delete(noteId);
        showToast('Note deleted', 'info');
        switchView('notes');
    } catch (err) {
        showToast('Failed to delete note: ' + err.message, 'error');
    }
};
