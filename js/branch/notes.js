// ── Branch: Notes Module ──────────────────────────────────────────────────

window.renderNotesModule = function () {
    const container = document.getElementById('mainContent');

    const tagColors = {
        general: 'bg-gray-100 text-gray-700',
        important: 'bg-red-100 text-red-700',
        reminder: 'bg-blue-100 text-blue-700',
        incident: 'bg-amber-100 text-amber-700'
    };

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
                <span class="loader mx-auto mb-32"></span>
                <p class="text-gray-400 text-sm">Loading notes…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    dbNotes.fetchAll(state.branchId).then(notes => {
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

            ${notes.length === 0 ? `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                <i data-lucide="file-text" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                <p class="text-gray-400 text-sm">No notes yet — jot down something important</p>
                <button onclick="openModal('addNote')" class="mt-4 btn-primary text-sm">Write First Note</button>
            </div>` : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${notes.map(note => `
                <div class="module-card bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                    <div class="flex items-start justify-between mb-3">
                        <h3 class="font-semibold text-gray-900 line-clamp-1">${note.title}</h3>
                        <span class="badge ${tagColors[note.tag] || 'bg-gray-100 text-gray-700'} ml-2 flex-shrink-0">${note.tag}</span>
                    </div>
                    <p class="text-sm text-gray-600 leading-relaxed line-clamp-4">${note.content}</p>
                    <div class="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                        <span class="text-xs text-gray-400">${fmt.date(note.created_at)}</span>
                        <div class="flex gap-2">
                            <button onclick="openEditModal('editNote', '${note.id}')" class="text-xs text-blue-500 hover:text-blue-700 transition-colors">Edit</button>
                            <button onclick="confirmDelete('note', '${note.id}', 'this note')" class="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>`).join('')}
            </div>`}
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
