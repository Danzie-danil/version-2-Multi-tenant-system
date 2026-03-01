// ── Owner: Staff & HR Monitoring ─────────────────────────────────────────
export async function renderOwnerStaffModule() {
    const area = document.getElementById('mainContent');
    area.innerHTML = renderPremiumLoader('Loading staff across all branches…');
    lucide.createIcons();

    try {
        const branches = state.branches || await dbBranches.fetchAll(state.ownerId);
        let allStaff = [];

        for (const b of branches) {
            const staffList = await dbStaff.fetchAll(b.id);
            staffList.forEach(s => { s._branchName = b.name; s._branchId = b.id; });
            allStaff = allStaff.concat(staffList);
        }

        const total = allStaff.length;
        const active = allStaff.filter(s => s.status === 'active').length;
        const inactive = total - active;

        area.innerHTML = `
        <div class="p-4 sm:p-6 max-w-6xl mx-auto">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                    <h2 class="text-xl sm:text-2xl font-black text-gray-900">Staff & HR Monitor</h2>
                    <p class="text-sm text-gray-500 mt-0.5">View all staff across your branches</p>
                </div>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-3 gap-3 mb-6">
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-gray-900">${total}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Total Staff</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-emerald-600">${active}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Active</p>
                </div>
                <div class="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                    <p class="text-2xl font-black text-red-500">${inactive}</p>
                    <p class="text-[10px] text-gray-500 uppercase font-bold mt-1">Inactive</p>
                </div>
            </div>

            <!-- Staff List -->
            <div class="space-y-3">
                ${allStaff.length === 0 ? `
                    <div class="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                        <i data-lucide="user-check" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                        <p class="text-gray-400 text-sm">No staff records found</p>
                    </div>` :
                allStaff.map(s => `
                    <div class="bg-white border border-gray-200 rounded-2xl p-5 hover:border-indigo-200 hover:shadow-md transition-all">
                        <div class="flex items-start justify-between gap-3 mb-2">
                            <div>
                                <h4 class="font-bold text-gray-900 text-sm">${s.name || 'Unnamed'}</h4>
                                <p class="text-xs text-indigo-600 font-medium mt-0.5">${s._branchName}</p>
                            </div>
                            <div class="flex items-center gap-2">
                                ${s.status === 'active'
                        ? '<span class="bg-emerald-50 text-emerald-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-emerald-100">Active</span>'
                        : '<span class="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase border border-gray-200">Inactive</span>'}
                            </div>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                            <p class="text-xs text-gray-600"><span class="text-gray-400 font-medium">Role:</span> ${s.role || 'Employee'}</p>
                            <p class="text-xs text-gray-600"><span class="text-gray-400 font-medium">Salary:</span> ${fmt.currency(s.salary || 0)}</p>
                            ${s.phone ? `<p class="text-xs text-gray-600"><span class="text-gray-400 font-medium">Phone:</span> ${s.phone}</p>` : ''}
                            ${s.email ? `<p class="text-xs text-gray-600"><span class="text-gray-400 font-medium">Email:</span> ${s.email}</p>` : ''}
                        </div>
                    </div>`).join('')}
            </div>
        </div>`;
        lucide.createIcons();
    } catch (err) {
        area.innerHTML = `<div class="p-6"><p class="text-red-500 text-sm">Failed to load staff: ${err.message}</p></div>`;
    }
};
