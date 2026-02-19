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
    <div class="space-y-6 slide-in">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Notes</h2>
            <button onclick="openModal('addNote')" class="btn-primary">
                <i data-lucide="edit-3" class="w-4 h-4"></i> Add Note
            </button>
        </div>
        <div class="flex items-center justify-center py-20">
            <div class="text-center text-gray-400">
                <i data-lucide="loader-2" class="w-8 h-8 mx-auto mb-2 animate-spin"></i>
                <p class="text-sm">Loading notes…</p>
            </div>
        </div>
    </div>`;
    lucide.createIcons();

    dbNotes.fetchAll(state.branchId).then(notes => {
        container.innerHTML = `
        <div class="space-y-6 slide-in">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold text-gray-900">Notes</h2>
                <button onclick="openModal('addNote')" class="btn-primary">
                    <i data-lucide="edit-3" class="w-4 h-4"></i> Add Note
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
                        <button onclick="deleteNote('${note.id}')" class="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
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
