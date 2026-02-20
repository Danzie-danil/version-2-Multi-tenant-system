// ── Branch Settings Module ──────────────────────────────────────────────────

window.renderBranchSettings = function () {
    const main = document.getElementById('mainContent');
    const branch = state.branchProfile || {};

    main.innerHTML = `
    <div class="max-w-4xl mx-auto opacity-0 translate-y-4 animate-fade-in-up">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
            <div>
                <h1 class="text-2xl font-bold border-b-2 border-indigo-500 pb-1 pr-4 inline-block text-gray-900 tracking-tight">Branch Settings</h1>
                <p class="text-sm text-gray-500 mt-2">Manage your branch contact details and business registration info.</p>
            </div>
            
            <button onclick="saveBranchSettings()" class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95">
                <i data-lucide="save" class="w-4 h-4"></i> Save Settings
            </button>
        </div>

        <form id="branchSettingsForm" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" onsubmit="event.preventDefault(); saveBranchSettings();">
            
            <!-- Section: Enterprise & Identity (Read-only) -->
            <div class="p-8 border-b border-gray-50 bg-gray-50/30">
                <div class="flex items-center gap-2 mb-6 text-indigo-700">
                    <i data-lucide="building" class="w-5 h-5"></i>
                    <h3 class="text-lg font-bold">Identity & Affiliation</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="col-span-1 md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Parent Enterprise Name</label>
                        <input type="text" value="${state.enterpriseName || 'BMS Enterprise'}" class="form-input w-full bg-gray-100 text-gray-500 cursor-not-allowed font-medium" disabled>
                        <p class="text-xs text-gray-400 mt-1">This is managed by the main account administrator.</p>
                    </div>

                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                        <input type="text" value="${branch.name || ''}" class="form-input w-full bg-gray-50 text-gray-600 cursor-not-allowed" disabled>
                    </div>
                    
                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Branch Code (ID)</label>
                        <input type="text" value="${branch.branch_code || ''}" class="form-input w-full bg-gray-50 font-mono text-gray-600 cursor-not-allowed" disabled>
                    </div>
                </div>
            </div>

            <!-- Section: Contact Details -->
            <div class="p-8 border-b border-gray-50">
                <div class="flex items-center gap-2 mb-6 text-indigo-700">
                    <i data-lucide="phone" class="w-5 h-5"></i>
                    <h3 class="text-lg font-bold">Contact Details</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" id="branch_set_phone" value="${branch.phone || ''}" class="form-input w-full" placeholder="+1 (555) 123-4567">
                    </div>
                    
                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" id="branch_set_email" value="${branch.email || ''}" class="form-input w-full" placeholder="branch@example.com">
                    </div>
                    
                    <div class="col-span-1 md:col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                        <textarea id="branch_set_address" class="form-input w-full" rows="2" placeholder="123 Main St, City, Country">${branch.address || ''}</textarea>
                    </div>
                </div>
            </div>

            <!-- Section: Legal / Tax Info -->
            <div class="p-8">
                <div class="flex items-center gap-2 mb-6 text-indigo-700">
                    <i data-lucide="briefcase" class="w-5 h-5"></i>
                    <h3 class="text-lg font-bold">Legal & Tax Identification</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Business Registration No.</label>
                        <input type="text" id="branch_set_reg_no" value="${branch.branch_reg_no || ''}" class="form-input w-full" placeholder="e.g. REG-55214">
                    </div>
                    
                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tax Identification Number (TIN)</label>
                        <input type="text" id="branch_set_tin" value="${branch.branch_tin || ''}" class="form-input w-full" placeholder="e.g. TIN-998877">
                    </div>
                </div>
            </div>

        </form>
    </div>`;

    // Trigger animation
    setTimeout(() => {
        const wrap = main.querySelector('.opacity-0');
        if (wrap) {
            wrap.classList.remove('opacity-0', 'translate-y-4');
        }
    }, 10);

    lucide.createIcons();
};

window.saveBranchSettings = async function () {
    const notifyBtn = document.querySelector('button[onclick="saveBranchSettings()"]');
    if (!notifyBtn) return;

    const originalText = notifyBtn.innerHTML;
    notifyBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> Saving...';
    notifyBtn.disabled = true;

    // Build payload mapping to the branch database columns
    const payload = {
        phone: document.getElementById('branch_set_phone').value.trim(),
        email: document.getElementById('branch_set_email').value.trim(),
        address: document.getElementById('branch_set_address').value.trim(),
        branch_reg_no: document.getElementById('branch_set_reg_no').value.trim(),
        branch_tin: document.getElementById('branch_set_tin').value.trim()
    };

    try {
        const updatedBranch = await dbBranches.updateProfile(state.branchId, payload);

        // Update local state immediately so if they revisit the tab, it shows the saved data
        state.branchProfile = {
            ...state.branchProfile,
            ...updatedBranch
        };

        showToast('Settings saved successfully', 'success');

        // Immediately update UI mapping to reflect the latest state
        renderBranchSettings();

        // Update the global sidebar user component text to display new changes immediately
        document.getElementById('currentUser').textContent = state.currentUser;
        if (updatedBranch.branch_code) {
            document.getElementById('currentBranch').textContent = `Branch ID: ${updatedBranch.branch_code}`;
        }

    } catch (error) {
        console.error('Save Branch Settings Error:', error);
        showToast('Failed to save settings: ' + error.message, 'error');
    } finally {
        notifyBtn.innerHTML = originalText;
        notifyBtn.disabled = false;
        lucide.createIcons();
    }
};
