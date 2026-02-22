// ── Owner Settings Module ──────────────────────────────────────────────────

window.renderSettings = function () {
    const main = document.getElementById('mainContent');
    const profile = state.profile || {};

    // Use current tab state or default to 'personal'
    const activeTab = state.settingsTab || 'personal';

    main.innerHTML = `
    <div class="max-w-5xl mx-auto opacity-0 translate-y-4 animate-fade-in-up">
        
        <!-- Header -->
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between mb-5 overflow-hidden">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Account Settings</div>
                <span class="text-[10px] sm:text-sm font-medium text-gray-500 hidden md:block whitespace-nowrap">Manage your profile and business details.</span>
            </div>
            
            <button onclick="saveSettings()" class="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap flex-shrink-0">
                <i data-lucide="save" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> <span class="hidden xs:inline">Save</span>
            </button>
        </div>

        <div class="flex flex-col md:flex-row gap-8">
            <!-- Sidebar Navigation -->
            <div class="w-full md:w-64 flex-shrink-0">
                <nav class="space-y-1 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 sticky top-6">
                    <button onclick="switchSettingsTab('personal')" id="tab-personal" class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-xl transition-colors ${activeTab === 'personal' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}">
                        <i data-lucide="user" class="w-4 h-4 ${activeTab === 'personal' ? 'text-indigo-600' : 'text-gray-400'}"></i>
                        Personal Profile
                    </button>
                    <button onclick="switchSettingsTab('business')" id="tab-business" class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-xl transition-colors ${activeTab === 'business' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}">
                        <i data-lucide="building-2" class="w-4 h-4 ${activeTab === 'business' ? 'text-indigo-600' : 'text-gray-400'}"></i>
                        Business Details
                    </button>
                    <button onclick="switchSettingsTab('preferences')" id="tab-preferences" class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-xl transition-colors ${activeTab === 'preferences' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}">
                        <i data-lucide="sliders" class="w-4 h-4 ${activeTab === 'preferences' ? 'text-indigo-600' : 'text-gray-400'}"></i>
                        Global Preferences
                    </button>
                    <button onclick="switchSettingsTab('security')" id="tab-security" class="w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-xl transition-colors ${activeTab === 'security' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}">
                        <i data-lucide="shield" class="w-4 h-4 ${activeTab === 'security' ? 'text-indigo-600' : 'text-gray-400'}"></i>
                        Security & Billing
                    </button>
                </nav>
            </div>

            <!-- Settings Content -->
            <div class="flex-1">
                <form id="settingsForm" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" onsubmit="event.preventDefault(); saveSettings();">
                    
                    <!-- Tab Content: Personal Profile -->
                    <div id="content-personal" class="${activeTab === 'personal' ? 'block' : 'hidden'} p-8">
                        <h3 class="text-lg font-bold text-gray-900 mb-6">Personal Admin Information</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="col-span-1 md:col-span-2">
                                <label for="set_full_name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" id="set_full_name" value="${profile.full_name || ''}" class="form-input w-full" placeholder="e.g. John Doe">
                            </div>
                            <div class="col-span-1">
                                <label for="set_admin_email" class="block text-sm font-medium text-gray-700 mb-1">Admin Email Address</label>
                                <input type="email" id="set_admin_email" value="${state.currentUser}" class="form-input w-full bg-gray-50 cursor-not-allowed text-gray-500" disabled title="To change login email, please contact support.">
                                <p class="text-xs text-gray-400 mt-1">Primary communication email.</p>
                            </div>
                            <div class="col-span-1">
                                <label for="set_mobile_number" class="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input type="tel" id="set_mobile_number" value="${profile.mobile_number || ''}" class="form-input w-full" placeholder="+1 (555) 000-0000">
                            </div>
                            <div class="col-span-1 md:col-span-2 mt-2">
                                <label for="set_avatar_url" class="block text-sm font-medium text-gray-700 mb-2">Profile Avatar (URL)</label>
                                <div class="flex items-center gap-4">
                                    <div class="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xl font-bold overflow-hidden border-2 border-white shadow">
                                        ${profile.avatar_url ? `<img src="${profile.avatar_url}" class="w-full h-full object-cover">` : (profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U')}
                                    </div>
                                    <input type="url" id="set_avatar_url" value="${profile.avatar_url || ''}" class="form-input w-full" placeholder="https://example.com/photo.jpg">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content: Business Details -->
                    <div id="content-business" class="${activeTab === 'business' ? 'block' : 'hidden'} p-8">
                        <h3 class="text-lg font-bold text-gray-900 mb-6">Business / Organization Details</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="col-span-1 md:col-span-2">
                                <label for="set_business_name" class="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                <input type="text" id="set_business_name" value="${profile.business_name || ''}" class="form-input w-full" placeholder="Your Enterprise Name">
                            </div>
                            <div class="col-span-1">
                                <label for="set_industry" class="block text-sm font-medium text-gray-700 mb-1">Industry / Category</label>
                                <select id="set_industry" class="form-input w-full">
                                    <option value="">Select Industry...</option>
                                    <option value="retail" ${profile.industry === 'retail' ? 'selected' : ''}>Retail</option>
                                    <option value="fnb" ${profile.industry === 'fnb' ? 'selected' : ''}>Food & Beverage</option>
                                    <option value="services" ${profile.industry === 'services' ? 'selected' : ''}>Services</option>
                                    <option value="other" ${profile.industry === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                            <div class="col-span-1">
                                <label for="set_tax_id" class="block text-sm font-medium text-gray-700 mb-1">Tax ID / Business Reg No.</label>
                                <input type="text" id="set_tax_id" value="${profile.tax_id || ''}" class="form-input w-full" placeholder="e.g. TAX-12345">
                            </div>
                            
                            <hr class="col-span-1 md:col-span-2 my-2 border-gray-100">
                            
                            <div class="col-span-1 md:col-span-2 mb-2">
                                <h4 class="text-sm font-bold text-gray-900 mb-4">Localization</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label for="set_currency" class="block text-sm font-medium text-gray-700 mb-1">Global Currency</label>
                                        <select id="set_currency" class="form-input w-full">
                                            <option value="USD" ${profile.currency === 'USD' ? 'selected' : ''}>USD ($) - US Dollar</option>
                                            <option value="EUR" ${profile.currency === 'EUR' ? 'selected' : ''}>EUR (€) - Euro</option>
                                            <option value="GBP" ${profile.currency === 'GBP' ? 'selected' : ''}>GBP (£) - British Pound</option>
                                            <option value="KES" ${profile.currency === 'KES' ? 'selected' : ''}>KES (KSh) - Kenyan Shilling</option>
                                            <option value="TZS" ${profile.currency === 'TZS' ? 'selected' : ''}>TZS (TSh) - Tanzanian Shilling</option>
                                            <option value="NGN" ${profile.currency === 'NGN' ? 'selected' : ''}>NGN (₦) - Nigerian Naira</option>
                                            <option value="UGX" ${profile.currency === 'UGX' ? 'selected' : ''}>UGX (USh) - Ugandan Shilling</option>
                                            <option value="ZAR" ${profile.currency === 'ZAR' ? 'selected' : ''}>ZAR (R) - South African Rand</option>
                                            <option value="INR" ${profile.currency === 'INR' ? 'selected' : ''}>INR (₹) - Indian Rupee</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label for="set_timezone" class="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                                        <select id="set_timezone" class="form-input w-full">
                                            <option value="UTC" ${profile.timezone === 'UTC' ? 'selected' : ''}>UTC</option>
                                            <option value="Africa/Nairobi" ${profile.timezone === 'Africa/Nairobi' ? 'selected' : ''}>Africa/Nairobi</option>
                                            <option value="Africa/Lagos" ${profile.timezone === 'Africa/Lagos' ? 'selected' : ''}>Africa/Lagos</option>
                                            <option value="Europe/London" ${profile.timezone === 'Europe/London' ? 'selected' : ''}>Europe/London</option>
                                            <option value="America/New_York" ${profile.timezone === 'America/New_York' ? 'selected' : ''}>America/New_York</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content: Global Preferences -->
                    <div id="content-preferences" class="${activeTab === 'preferences' ? 'block' : 'hidden'} p-8">
                        <h3 class="text-lg font-bold text-gray-900 mb-6">Global Branch Preferences</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="col-span-1">
                                <label for="set_default_target" class="block text-sm font-medium text-gray-700 mb-1">Default Daily Sales Target</label>
                                <div class="flex items-stretch rounded-lg shadow-sm border border-gray-300 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 overflow-hidden active:border-indigo-500 transition-colors bg-white">
                                    <span class="flex items-center px-4 bg-gray-50 border-r border-gray-300 text-gray-500 font-medium whitespace-nowrap">${fmt.currency(0).replace(/[0-9.,\s]/g, '').trim()}</span>
                                    <input type="text" inputmode="decimal" id="set_default_target" value="${profile.default_target || 10000}" class="flex-1 block w-full px-4 py-2 text-gray-900 border-0 focus:ring-0 focus:outline-none number-format">
                                </div>
                                <p class="text-xs text-gray-400 mt-2">Applied as baseline when creating new branches.</p>
                            </div>
                            <div class="col-span-1">
                                <label for="set_hours_open" class="block text-sm font-medium text-gray-700 mb-1">Global Operating Hours</label>
                                <div class="flex items-center gap-2">
                                    <input type="time" id="set_hours_open" value="${(profile.operating_hours ? JSON.parse(profile.operating_hours).open : '08:00')}" class="form-input flex-1">
                                    <span class="text-gray-400 text-sm">to</span>
                                    <input type="time" id="set_hours_close" value="${(profile.operating_hours ? JSON.parse(profile.operating_hours).close : '18:00')}" class="form-input flex-1">
                                </div>
                            </div>
                            <div class="col-span-1 md:col-span-2">
                                <label for="set_receipt_text" class="block text-sm font-medium text-gray-700 mb-1">Default Receipt / Invoice Footer Text</label>
                                <textarea id="set_receipt_text" class="form-input w-full" rows="3" placeholder="Thank you for your business!">${profile.receipt_text || 'Thank you for your business!'}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Tab Content: Security & Billing -->
                    <div id="content-security" class="${activeTab === 'security' ? 'block' : 'hidden'} p-8">
                        <h3 class="text-lg font-bold text-gray-900 mb-6">Security & Billing</h3>
                        
                        <div class="mb-8">
                            <h4 class="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Account Security</h4>
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div>
                                    <p class="font-medium text-sm text-gray-900">Two-Factor Authentication (2FA)</p>
                                    <p class="text-xs text-gray-500 mt-1">Require a code via email when logging in.</p>
                                </div>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" id="set_two_factor" class="sr-only peer" ${profile.two_factor ? 'checked' : ''}>
                                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        </div>

                        <div>
                            <h4 class="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Subscription Details</h4>
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div class="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                                    <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Current Plan</p>
                                    <p class="font-bold text-indigo-700">${profile.current_plan || 'Free Tier'}</p>
                                </div>
                                <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                                    <p class="text-xs text-gray-500 uppercase tracking-widest mb-1">Billing Cycle</p>
                                    <p class="font-bold text-gray-900 capitalize">${profile.billing_cycle || 'Monthly'}</p>
                                </div>
                                <div class="col-span-2 flex items-center justify-center p-4">
                                    <button type="button" class="w-full px-4 py-2 border border-gray-300 bg-white shadow-sm text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                        Manage Billing
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>

                </form>
                
                <!-- Always Visible System Utilities -->
                <div class="p-8 border-t border-gray-100 bg-gray-50/30">
                    <h4 class="text-sm font-bold text-gray-900 mb-4 border-b pb-2">System Utilities</h4>
                    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white rounded-xl border border-gray-100 gap-4">
                        <div>
                            <p class="font-medium text-sm text-gray-900">Fetch New Code Changes</p>
                            <p class="text-xs text-gray-500 mt-1">Force the application to reload and download the latest updates.</p>
                        </div>
                        <button type="button" onclick="confirmUpdateApp()" class="flex items-center justify-center gap-3 px-4 py-2 bg-emerald-600 border border-emerald-500 rounded-full hover:bg-emerald-700 transition-colors w-full sm:w-auto shadow-sm group">
                            <div class="w-6 h-6 rounded bg-white/20 flex items-center justify-center shadow-sm">
                                <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-white"></i>
                            </div>
                            <span class="text-white font-medium text-sm pr-1">Check for Updates</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

    // Apply small delay to trigger CSS transition smoothly
    setTimeout(() => {
        const wrap = main.querySelector('.opacity-0');
        if (wrap) {
            wrap.classList.remove('opacity-0', 'translate-y-4');
        }
    }, 10);

    lucide.createIcons();
};

window.switchSettingsTab = function (tabName) {
    // Save to state so it persists if they navigate away
    state.settingsTab = tabName;

    const iconMap = {
        'personal': 'user',
        'business': 'building-2',
        'preferences': 'sliders',
        'security': 'shield'
    };

    // Update active styles on buttons
    ['personal', 'business', 'preferences', 'security'].forEach(tab => {
        const btn = document.getElementById('tab-' + tab);
        const iconName = iconMap[tab];
        const content = document.getElementById('content-' + tab);

        if (tab === tabName) {
            btn.className = `w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-xl transition-colors bg-indigo-50 text-indigo-700`;
            btn.querySelector('svg, i').outerHTML = `<i data-lucide="${iconName}" class="w-4 h-4 text-indigo-600"></i>`;
            content.classList.remove('hidden');
            content.classList.add('block');
        } else {
            btn.className = `w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium rounded-xl transition-colors text-gray-600 hover:bg-gray-50`;
            btn.querySelector('svg, i').outerHTML = `<i data-lucide="${iconName}" class="w-4 h-4 text-gray-400"></i>`;
            content.classList.add('hidden');
            content.classList.remove('block');
        }
    });

    lucide.createIcons();
};

window.saveSettings = async function () {
    const notifyBtn = document.querySelector('button[onclick="saveSettings()"]');
    const originalText = notifyBtn.innerHTML;
    notifyBtn.innerHTML = 'Saving...';
    notifyBtn.disabled = true;

    // Gather Personal Data
    const personal = {
        full_name: document.getElementById('set_full_name').value.trim(),
        mobile_number: document.getElementById('set_mobile_number').value.trim(),
        avatar_url: document.getElementById('set_avatar_url').value.trim()
    };

    // Gather Business Data
    const business = {
        business_name: document.getElementById('set_business_name').value.trim(),
        industry: document.getElementById('set_industry').value,
        tax_id: document.getElementById('set_tax_id').value.trim(),
        currency: document.getElementById('set_currency').value,
        timezone: document.getElementById('set_timezone').value
    };

    // Gather Preferences
    const prefs = {
        default_target: fmt.parseNumber(document.getElementById('set_default_target').value) || 10000,
        receipt_text: document.getElementById('set_receipt_text').value.trim(),
        operating_hours: JSON.stringify({
            open: document.getElementById('set_hours_open').value || '08:00',
            close: document.getElementById('set_hours_close').value || '18:00'
        })
    };

    // Gather Security
    const security = {
        two_factor: document.getElementById('set_two_factor').checked
    };

    const payload = {
        ...personal,
        ...business,
        ...prefs,
        ...security
    };

    try {
        const updatedProfile = await dbProfile.upsert(state.ownerId, payload);
        // Update global state immediately
        state.profile = updatedProfile;

        // Update username globally in sidebar if changed
        document.getElementById('currentUser').textContent = updatedProfile.full_name || state.currentUser;

        showToast('Settings saved successfully', 'success');

        // Re-render to show updated currency symbols immediately if changed
        renderSettings();
    } catch (err) {
        showToast('Failed to save settings: ' + err.message, 'error');
    } finally {
        notifyBtn.innerHTML = originalText;
        notifyBtn.disabled = false;
        lucide.createIcons();
    }
};
