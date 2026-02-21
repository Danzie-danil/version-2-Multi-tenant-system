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
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            
            <!-- Section: Enterprise & Identity (Read-only) -->
            <div class="p-8 border-b border-gray-50 bg-gray-50/30">
                <div class="flex items-center justify-between mb-6 text-indigo-700">
                    <div class="flex items-center gap-2">
                        <i data-lucide="building" class="w-5 h-5"></i>
                        <h3 class="text-lg font-bold">Identity & Affiliation</h3>
                    </div>
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
            <div class="p-8 border-b border-gray-50 group transition-colors hover:bg-gray-50/30">
                <div class="flex items-center justify-between mb-6 text-indigo-700">
                    <div class="flex items-center gap-2">
                        <i data-lucide="phone" class="w-5 h-5"></i>
                        <h3 class="text-lg font-bold">Contact Details</h3>
                    </div>
                    <button onclick="enableSectionEditing('contactDetailsSection', this)" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit Section">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                </div>
                
                <div id="contactDetailsSection" class="grid grid-cols-1 md:grid-cols-2 gap-6 editable-section opacity-75 grayscale-[20%] transition-all">
                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" id="branch_set_phone" value="${branch.phone || ''}" class="form-input w-full bg-gray-50" placeholder="+1 (555) 123-4567" disabled onchange="autoSaveBranchSettings()">
                    </div>
                    
                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" id="branch_set_email" value="${branch.email || ''}" class="form-input w-full bg-gray-50" placeholder="branch@example.com" disabled onchange="autoSaveBranchSettings()">
                    </div>
                    
                    <div class="col-span-1 md:col-span-2 mt-4">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                        <textarea id="branch_set_address" class="form-input w-full bg-gray-50" rows="2" placeholder="123 Main St, City, Country" disabled onchange="autoSaveBranchSettings()">${branch.address || ''}</textarea>
                    </div>
                </div>
            </div>

            <!-- Section: Legal / Tax Info -->
            <div class="p-8 group transition-colors hover:bg-gray-50/30">
                <div class="flex items-center justify-between mb-6 text-indigo-700">
                    <div class="flex items-center gap-2">
                        <i data-lucide="briefcase" class="w-5 h-5"></i>
                        <h3 class="text-lg font-bold">Legal & Tax Identification</h3>
                    </div>
                    <button onclick="enableSectionEditing('legalInfoSection', this)" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit Section">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                </div>
                
                <div id="legalInfoSection" class="grid grid-cols-1 md:grid-cols-2 gap-6 editable-section opacity-75 grayscale-[20%] transition-all">
                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Business Registration No.</label>
                        <input type="text" id="branch_set_reg_no" value="${branch.branch_reg_no || ''}" class="form-input w-full bg-gray-50" placeholder="e.g. REG-55214" disabled onchange="autoSaveBranchSettings()">
                    </div>
                    
                    <div class="col-span-1">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tax Identification Number (TIN)</label>
                        <input type="text" id="branch_set_tin" value="${branch.branch_tin || ''}" class="form-input w-full bg-gray-50" placeholder="e.g. TIN-998877" disabled onchange="autoSaveBranchSettings()">
                    </div>
                </div>
            </div>

        </div>
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

window.enableSectionEditing = function (sectionId, btn) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    const isEditing = !section.classList.contains('opacity-75');

    if (isEditing) {
        // Lock it
        const inputs = section.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.disabled = true;
            input.classList.add('bg-gray-50');
            input.classList.remove('bg-white', 'border-indigo-300', 'shadow-inner');
        });
        section.classList.add('opacity-75', 'grayscale-[20%]');
        btn.innerHTML = '<i data-lucide="edit-3" class="w-4 h-4"></i>';
        btn.classList.remove('text-indigo-600', 'bg-indigo-50', 'animate-pulse', 'ring-2', 'ring-indigo-300');
        btn.classList.add('text-gray-400');
    } else {
        // Unlock it
        const inputs = section.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.disabled = false;
            input.classList.remove('bg-gray-50');
            input.classList.add('bg-white', 'border-indigo-300', 'shadow-inner');
        });
        section.classList.remove('opacity-75', 'grayscale-[20%]');
        inputs[0].focus();
        btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i>';
        btn.classList.add('text-indigo-600', 'bg-indigo-50', 'animate-pulse', 'ring-2', 'ring-indigo-300');
        btn.classList.remove('text-gray-400');
    }
    lucide.createIcons();
};

let autoSaveTimeout = null;
let activeIndicatorTimeout = null;

window.autoSaveBranchSettings = function () {
    // Find whichever section is currently being edited (unlocked)
    const editingSection = document.querySelector('.editable-section:not(.opacity-75)');
    if (!editingSection) return;

    // Find the header of that section to place the indicator
    const headerDiv = editingSection.previousElementSibling;
    let indicator = headerDiv.querySelector('.save-indicator');

    if (!indicator) {
        // Create it if it doesn't exist
        indicator = document.createElement('div');
        indicator.className = 'save-indicator flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-300 opacity-0 mr-2';

        // Insert right before the edit pen button
        const editBtn = headerDiv.querySelector('button');
        headerDiv.insertBefore(indicator, editBtn);
    }

    // Clear any pending fade outs so the indicator doesn't disappear prematurely
    clearTimeout(activeIndicatorTimeout);

    // Show "Saving..." indicator
    indicator.innerHTML = '<i data-lucide="loader" class="w-3 h-3 animate-spin text-indigo-500"></i> <span class="text-indigo-600">Saving...</span>';
    indicator.classList.remove('opacity-0', 'bg-emerald-50', 'bg-red-50');
    indicator.classList.add('opacity-100', 'bg-indigo-50');
    lucide.createIcons();

    // Debounce to prevent spamming the database
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(async () => {
        const payload = {
            phone: document.getElementById('branch_set_phone').value.trim(),
            email: document.getElementById('branch_set_email').value.trim(),
            address: document.getElementById('branch_set_address').value.trim(),
            branch_reg_no: document.getElementById('branch_set_reg_no').value.trim(),
            branch_tin: document.getElementById('branch_set_tin').value.trim()
        };

        try {
            const updatedBranch = await dbBranches.updateProfile(state.branchId, payload);

            state.branchProfile = {
                ...state.branchProfile,
                ...updatedBranch
            };

            // Show "Saved!" indicator
            indicator.innerHTML = '<i data-lucide="check-circle" class="w-3 h-3 text-emerald-500"></i> <span class="text-emerald-600">Saved!</span>';
            indicator.classList.remove('bg-indigo-50', 'bg-red-50');
            indicator.classList.add('bg-emerald-50');
            lucide.createIcons();

            // Fade out the indicator slowly
            activeIndicatorTimeout = setTimeout(() => {
                indicator.classList.remove('opacity-100');
                indicator.classList.add('opacity-0');
            }, 2500);

            // Update global sidebar logic silently
            document.getElementById('currentUser').textContent = state.currentUser;
            if (updatedBranch.branch_code) {
                document.getElementById('currentBranch').textContent = `Branch ID: ${updatedBranch.branch_code}`;
            }

        } catch (error) {
            console.error('Auto-save Branch Settings Error:', error);
            indicator.innerHTML = '<i data-lucide="alert-circle" class="w-3 h-3 text-red-500"></i> <span class="text-red-600">Failed</span>';
            indicator.classList.remove('bg-indigo-50', 'bg-emerald-50');
            indicator.classList.add('bg-red-50');
            lucide.createIcons();
            showToast('Failed to auto-save settings: ' + error.message, 'error');
        }
    }, 1000); // Wait 1 second after typing stops
};
