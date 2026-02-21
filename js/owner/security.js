// ── Owner: Security Management ────────────────────────────────────────────

window.renderSecurity = function () {
    return `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Security Management</div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- PIN Management -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i data-lucide="key" class="w-5 h-5 text-indigo-600"></i> Branch PIN Management
                </h3>
                <div class="space-y-3">
                    ${state.branches.map(branch => `
                    <div class="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-gray-50">
                        <div>
                            <p class="font-medium text-sm text-gray-900">${branch.name}</p>
                            <p class="text-xs text-gray-500 mt-0.5">
                                <i data-lucide="map-pin" class="w-3 h-3 inline mr-1"></i>${branch.location || 'No location'} 
                                · Status: <span class="text-emerald-600 font-medium">${branch.status}</span>
                            </p>
                        </div>
                        <button onclick="openModal('resetPin','${branch.id}')"
                            class="px-4 py-1.5 text-sm font-medium text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition-colors">
                            Reset PIN
                        </button>
                    </div>`).join('')}
                </div>
            </div>

            <!-- Access Logs -->
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i data-lucide="shield" class="w-5 h-5 text-indigo-600"></i> Access Logs
                </h3>
                <div class="space-y-2 max-h-72 overflow-auto pr-1">
                    ${[
            { dot: 'bg-emerald-500', msg: 'Downtown Branch Login', sub: 'John Smith · 2 min ago' },
            { dot: 'bg-emerald-500', msg: 'PIN Changed – Mall Branch', sub: 'Admin · 1 hour ago' },
            { dot: 'bg-red-500', msg: 'Failed Login Attempt', sub: 'Airport Branch · 3 hours ago' },
            { dot: 'bg-emerald-500', msg: 'Mall Branch Login', sub: 'Sarah Lee · 4 hours ago' },
            { dot: 'bg-amber-500', msg: 'PIN Expiry Warning', sub: 'Airport Branch · Yesterday' },
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
            <div class="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <i data-lucide="settings" class="w-5 h-5 text-indigo-600"></i> Security Policies
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${[
            ['PIN Expiry', '90 days', 'Auto-expire branch PINs'],
            ['Max Login Attempts', '5 tries', 'Lock after failed attempts'],
            ['Session Duration', '8 hours', 'Auto-logout idle sessions']
        ].map(([title, value, desc]) => `
                    <div class="p-4 border border-gray-100 rounded-xl">
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">${title}</p>
                        <p class="text-lg font-bold text-indigo-600">${value}</p>
                        <p class="text-xs text-gray-400 mt-1">${desc}</p>
                    </div>`).join('')}
                </div>
            </div>
        </div>
    </div>`;
};
