// ── Branch Settings Module ──────────────────────────────────────────────────

window.renderBranchSettings = function () {
    const main = document.getElementById('mainContent');
    const branch = state.branchProfile || {};

    main.innerHTML = `
    <div class="max-w-4xl mx-auto opacity-0 translate-y-4 animate-fade-in-up">
        
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between mb-5 overflow-hidden">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Branch Settings</div>
                <div class="flex items-center gap-1.5 sm:gap-2 text-gray-400">
                    <i data-lucide="settings" class="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0"></i>
                    <span class="text-[10px] sm:text-xs font-medium whitespace-nowrap">Profile & System</span>
                </div>
            </div>

            <button onclick="confirmUpdateApp()" class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs sm:text-sm font-bold rounded-lg sm:rounded-xl hover:bg-emerald-600 hover:text-white transition-all active:scale-95 whitespace-nowrap flex-shrink-0">
                <i data-lucide="refresh-cw" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> <span class="hidden xs:inline">Check Updates</span>
            </button>
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
                        <label for="parentEnterprise" class="block text-sm font-medium text-gray-700 mb-1">Parent Enterprise Name</label>
                        <input type="text" id="parentEnterprise" value="${state.enterpriseName || 'BMS Enterprise'}" class="form-input w-full bg-gray-100 text-gray-500 cursor-not-allowed font-medium" disabled>
                        <p class="text-xs text-gray-400 mt-1">This is managed by the main account administrator.</p>
                    </div>

                    <div class="col-span-1">
                        <label for="branchNameDisplay" class="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                        <input type="text" id="branchNameDisplay" value="${branch.name || ''}" class="form-input w-full bg-gray-50 text-gray-600 cursor-not-allowed" disabled>
                    </div>
                    
                    <div class="col-span-1">
                        <label for="branchCodeDisplay" class="block text-sm font-medium text-gray-700 mb-1">Branch Code (ID)</label>
                        <input type="text" id="branchCodeDisplay" value="${branch.branch_code || ''}" class="form-input w-full bg-gray-50 font-mono text-gray-600 cursor-not-allowed" disabled>
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
                        <label for="branch_set_phone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input type="tel" id="branch_set_phone" value="${branch.phone || ''}" class="form-input w-full bg-gray-50" placeholder="+1 (555) 123-4567" disabled onchange="autoSaveBranchSettings()">
                    </div>
                    
                    <div class="col-span-1">
                        <label for="branch_set_email" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input type="email" id="branch_set_email" value="${branch.email || ''}" class="form-input w-full bg-gray-50" placeholder="branch@example.com" disabled onchange="autoSaveBranchSettings()">
                    </div>
                    
                    <div class="col-span-1 md:col-span-2 mt-4">
                        <label for="branch_set_address" class="block text-sm font-medium text-gray-700 mb-1">Physical Address</label>
                        <textarea id="branch_set_address" class="form-input w-full bg-gray-50" rows="2" placeholder="123 Main St, City, Country" disabled onchange="autoSaveBranchSettings()">${branch.address || ''}</textarea>
                    </div>
                </div>
            </div>

            <!-- Section: Legal / Tax Info -->
            <div class="p-8 border-b border-gray-50 group transition-colors hover:bg-gray-50/30">
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
                        <label for="branch_set_reg_no" class="block text-sm font-medium text-gray-700 mb-1">Business Registration No.</label>
                        <input type="text" id="branch_set_reg_no" value="${branch.branch_reg_no || ''}" class="form-input w-full bg-gray-50" placeholder="e.g. REG-55214" disabled onchange="autoSaveBranchSettings()">
                    </div>
                    
                    <div class="col-span-1">
                        <label for="branch_set_tin" class="block text-sm font-medium text-gray-700 mb-1">Tax Identification Number (TIN)</label>
                        <input type="text" id="branch_set_tin" value="${branch.branch_tin || ''}" class="form-input w-full bg-gray-50" placeholder="e.g. TIN-998877" disabled onchange="autoSaveBranchSettings()">
                    </div>
                </div>
            </div>

            <!-- Section: Operational Settings -->
            <div class="p-8 group transition-colors hover:bg-gray-50/30">
                <div class="flex items-center justify-between mb-6 text-indigo-700">
                    <div class="flex items-center gap-2">
                        <i data-lucide="clock" class="w-5 h-5"></i>
                        <h3 class="text-lg font-bold">Operational Settings</h3>
                    </div>
                    <button onclick="enableSectionEditing('opsSettingsSection', this)" class="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer" title="Edit Section">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                </div>
                
                <div id="opsSettingsSection" class="grid grid-cols-1 md:grid-cols-3 gap-6 editable-section opacity-75 grayscale-[20%] transition-all">
                    <div class="col-span-1">
                        <label for="branch_set_tax" class="block text-sm font-medium text-gray-700 mb-1">Default Tax Rate (%)</label>
                        <input type="number" id="branch_set_tax" value="${branch.tax_rate || 0}" step="0.01" class="form-input w-full bg-gray-50" placeholder="0.00" disabled onchange="autoSaveBranchSettings()">
                    </div>
                    <div class="col-span-1">
                        <label for="branch_set_open" class="block text-sm font-medium text-gray-700 mb-1">Opening Time</label>
                        <input type="time" id="branch_set_open" value="${branch.opening_time || '08:00'}" class="form-input w-full bg-gray-50" disabled onchange="autoSaveBranchSettings()">
                    </div>
                    <div class="col-span-1">
                        <label for="branch_set_close" class="block text-sm font-medium text-gray-700 mb-1">Closing Time</label>
                        <input type="time" id="branch_set_close" value="${branch.closing_time || '18:00'}" class="form-input w-full bg-gray-50" disabled onchange="autoSaveBranchSettings()">
                    </div>
                    <div class="col-span-1 md:col-span-3 flex items-center gap-3 mt-2">
                        <label class="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" id="branch_set_notifs" ${branch.low_stock_notifications ? 'checked' : ''} class="sr-only peer" disabled onchange="autoSaveBranchSettings()">
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                        <span class="text-sm font-medium text-gray-700">Receive Low Stock Email Notifications</span>
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
    indicator.innerHTML = '<span class="text-indigo-600">Saving...</span>';
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
            branch_tin: document.getElementById('branch_set_tin').value.trim(),
            tax_rate: parseFloat(document.getElementById('branch_set_tax').value) || 0,
            opening_time: document.getElementById('branch_set_open').value,
            closing_time: document.getElementById('branch_set_close').value,
            low_stock_notifications: document.getElementById('branch_set_notifs').checked
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
