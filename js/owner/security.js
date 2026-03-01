// ── Owner: Security Management ────────────────────────────────────────────

export function renderSecurity() {
    return `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Security Management</div>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-6">
            <!-- Access Logs -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i data-lucide="shield" class="w-5 h-5 text-indigo-600"></i> Access Logs
                </h3>
                <div class="space-y-2 max-h-72 overflow-auto pr-1">
                    ${[
            { dot: 'bg-emerald-500', msg: 'Downtown Branch Login', sub: 'John Smith · 2 min ago' },
            { dot: 'bg-emerald-500', msg: 'System Settings Updated', sub: 'Admin · 1 hour ago' },
            { dot: 'bg-red-500', msg: 'Failed Login Attempt', sub: 'Airport Branch · 3 hours ago' },
            { dot: 'bg-emerald-500', msg: 'Mall Branch Login', sub: 'Sarah Lee · 4 hours ago' },
            { dot: 'bg-emerald-500', msg: 'Airport Branch Login', sub: 'Mike Chen · Yesterday' }
        ].map(log => `
                    <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div class="w-2 h-2 rounded-full ${log.dot} flex-shrink-0"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium text-gray-900">${log.msg}</p>
                            <p class="text-xs text-gray-500">${log.sub}</p>
                        </div>
                    </div>`).join('')}
                </div>
            </div>

            <!-- General Security Settings -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i data-lucide="settings" class="w-5 h-5 text-indigo-600"></i> Security Policies
                </h3>
                <div class="grid grid-cols-1 gap-4">
                    <div onclick="editSessionDuration()" class="p-4 border border-gray-100 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 cursor-pointer transition-all group">
                        <div class="flex items-center justify-between mb-1">
                            <p class="text-xs text-gray-500 uppercase tracking-wide">Session Duration</p>
                            <i data-lucide="edit-2" class="w-3 h-3 text-gray-300 group-hover:text-indigo-400"></i>
                        </div>
                        <p class="text-lg font-bold text-indigo-600">${state.profile.session_duration_hrs || 8} hours</p>
                        <p class="text-xs text-gray-400 mt-1">Force logout idle sessions to protect data.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
};


export async function editSessionDuration() {
    const current = state.profile.session_duration_hrs || 8;
    const val = await promptModal('Session Duration', 'Enter session length in hours (auto-logout):', 'e.g. 8, 12, 24...', current);
    if (val === null || val == current) return;

    const hrs = parseInt(val);
    if (isNaN(hrs) || hrs < 1) return showToast('Please enter a valid number of hours', 'error');

    dbProfile.updateSecurity(state.profile.id, {
        pin_expiry_days: state.profile.pin_expiry_days || 90,
        session_duration_hrs: hrs
    }).then(() => {
        state.profile.session_duration_hrs = hrs;
        showToast('Session Duration policy updated');
        switchView('security');
    }).catch(err => showToast(err.message, 'error'));
};
