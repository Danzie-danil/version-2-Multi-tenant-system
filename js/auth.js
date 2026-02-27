// ── Authentication ─────────────────────────────────────────────────────────

window.login = async function () {
    const role = document.getElementById('roleSelect').value;
    const btn = document.querySelector('#loginForm button[onclick="login()"]'); // Updated selector

    if (role === 'owner') {
        const email = document.getElementById('ownerEmail').value.trim();
        const password = document.getElementById('ownerPassword').value;

        if (!email || !password) {
            showToast('Please enter your email and password', 'warning');
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Signing in…';
        }

        const { data, error } = await dbAuth.signIn(email, password);
        if (error) {
            showToast('Login failed: ' + error.message, 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Access Dashboard';
                lucide.createIcons();
            }
            return;
        }

        state.role = 'owner';
        state.ownerId = data.user.id;
        state.currentUser = data.user.email;

        // Load profile
        try {
            let profile = await dbProfile.fetch(state.ownerId);
            if (!profile) {
                // First time login - Create stub
                profile = await dbProfile.upsert(state.ownerId, {
                    full_name: data.user.user_metadata?.first_name || 'Admin',
                    currency: 'USD'
                });
            }
            state.profile = profile;
        } catch (e) {
            console.error('Profile fetch failed', e);
            state.profile = { currency: 'USD' }; // Fallback
        }

        // Load branches
        try {
            state.branches = await dbBranches.fetchAll(state.ownerId);
        } catch (e) {
            state.branches = [];
        }

        // Store session start for timeout policy
        localStorage.setItem('bms_session_start', Date.now());

    } else {
        // Branch manager: Owner Email + Branch Name + PIN
        const ownerEmail = document.getElementById('branchOwnerEmail').value.trim();
        const branchName = document.getElementById('branchNameInput').value.trim();
        const pin = document.getElementById('pinInput').value.trim();

        if (!ownerEmail || !branchName || !pin) {
            showToast('Please enter Owner Email, Branch Name, and PIN', 'warning');
            return;
        }
        if (pin.length !== 6) {
            showToast('Please enter a 6-digit PIN', 'warning');
            return;
        }

        const branchBtn = document.querySelector('#branchSelector button');
        if (branchBtn) {
            branchBtn.disabled = true;
            branchBtn.textContent = 'Verifying…';
        }

        let branch;
        try {
            // New lookup method
            branch = await dbBranches.verifyCredentials(ownerEmail, branchName, pin);
        } catch (e) {
            console.error(e);
            showToast('Could not connect to server', 'error');
            if (branchBtn) {
                branchBtn.disabled = false;
                branchBtn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Access Dashboard';
                lucide.createIcons();
            }
            return;
        }

        if (!branch) {
            showToast('Invalid credentials. Please check Email, Branch Name, and PIN.', 'error');
            if (branchBtn) {
                branchBtn.disabled = false;
                branchBtn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Access Dashboard';
                lucide.createIcons();
            }
            return;
        }

        // --- POLICY ENFORCEMENT: PIN EXPIRY ---
        try {
            const profile = await dbProfile.fetch(branch.owner_id);
            const expiryDays = profile?.pin_expiry_days || 90;
            const lastUpdate = new Date(branch.pin_updated_at || branch.created_at);
            const now = new Date();
            const diffDays = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24));

            if (diffDays >= expiryDays) {
                showToast(`PIN Security Alert: Your branch PIN has expired (${diffDays} days old). Please contact your administrator to reset it.`, 'error');
                if (branchBtn) {
                    branchBtn.disabled = false;
                    branchBtn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Access Dashboard';
                    lucide.createIcons();
                }
                return;
            }
        } catch (err) {
            console.warn('Failed to check PIN expiry during login:', err);
        }
        // --------------------------------------

        state.role = 'branch';
        state.branchId = branch.id;
        state.currentUser = `${branch.name} (Manager)`;
        state.ownerId = branch.owner_id;

        // Load branch-specific details and merge into state
        state.branchProfile = {
            id: branch.id,
            name: branch.name,
            branch_code: branch.branch_code || `BR-${branch.id.substring(0, 5).toUpperCase()}`,
            branch_reg_no: branch.branch_reg_no || '',
            branch_tin: branch.branch_tin || '',
            phone: branch.phone || '',
            email: branch.email || '',
            address: branch.address || '',
            last_notif_check: branch.last_notif_check,
            theme: branch.theme
        };

        // Fetch the Enterprise Name (from owner's profile)
        try {
            const profile = await dbProfile.fetch(branch.owner_id);
            state.enterpriseName = profile?.business_name || 'My Enterprise';

            // Provide global profile, but inject the Branch's specific currency if it exists
            state.profile = profile || { currency: 'USD' };
            if (branch.currency) {
                state.profile.currency = branch.currency;
            }
        } catch (e) {
            console.warn('Failed to fetch enterprise profile from branch', e);
            state.enterpriseName = 'BMS Enterprise';
            state.profile = { currency: branch.currency || 'USD' };
        }

        // Persist Branch Session
        localStorage.setItem('bms_branch_session', JSON.stringify({
            branchId: branch.id,
            ownerId: branch.owner_id,
            name: branch.name,
            enterpriseName: state.enterpriseName
        }));
        localStorage.setItem('bms_session_start', Date.now());
    }

    // Apply theme from profile/branch before showing app
    const userTheme = state.role === 'owner' ? state.profile?.theme : state.branchProfile?.theme;
    if (userTheme && typeof initTheme === 'function') {
        console.log(`[Theme] Successfully fetched preference from Supabase: ${userTheme}`);
        initTheme(userTheme);
    }

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    setupDashboard();
    showToast(`Welcome back, ${state.currentUser}!`, 'success');
};

// ── Auth State & UI Toggles ────────────────────────────────────────────────
window.toggleRegistration = function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetForm = document.getElementById('resetPasswordForm');
    const mainLoginBtn = document.getElementById('mainLoginBtn');
    const regToggle = document.getElementById('regToggle');

    // Hide reset form if open
    resetForm.classList.add('hidden');

    if (loginForm.classList.contains('hidden')) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        if (mainLoginBtn) mainLoginBtn.classList.remove('hidden');
        if (regToggle) regToggle.classList.remove('hidden');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        if (mainLoginBtn) mainLoginBtn.classList.add('hidden');
        if (regToggle) regToggle.classList.add('hidden');
    }
};

window.toggleResetPassword = function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetForm = document.getElementById('resetPasswordForm');
    const mainLoginBtn = document.getElementById('mainLoginBtn');
    const regToggle = document.getElementById('regToggle');

    // Ensure reg form is hidden
    registerForm.classList.add('hidden');

    if (resetForm.classList.contains('hidden')) {
        loginForm.classList.add('hidden');
        resetForm.classList.remove('hidden');
        if (mainLoginBtn) mainLoginBtn.classList.add('hidden');
        if (regToggle) regToggle.classList.add('hidden');
    } else {
        resetForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        if (mainLoginBtn) mainLoginBtn.classList.remove('hidden');
        if (regToggle) regToggle.classList.remove('hidden');
    }
};

window.handlePasswordReset = async function () {
    const email = document.getElementById('resetEmail').value.trim();
    if (!email) { showToast('Please enter your email', 'warning'); return; }

    const btn = document.querySelector('#resetPasswordForm button');
    const originalText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/index.html',
        });
        if (error) throw error;
        showToast('Check your email for the reset link!', 'success');
        setTimeout(() => toggleResetPassword(), 2000);
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

window.toggleBranchPinReset = function () {
    const branchSelector = document.getElementById('branchSelector');
    const resetForm = document.getElementById('branchPinReset');
    const mainLoginBtn = document.getElementById('mainLoginBtn');

    if (resetForm.classList.contains('hidden')) {
        // Pre-fill fields for convenience
        document.getElementById('reqOwnerEmail').value = document.getElementById('branchOwnerEmail').value;
        document.getElementById('reqBranchName').value = document.getElementById('branchNameInput').value;

        branchSelector.classList.add('hidden');
        resetForm.classList.remove('hidden');
        if (mainLoginBtn) mainLoginBtn.classList.add('hidden');
    } else {
        resetForm.classList.add('hidden');
        branchSelector.classList.remove('hidden');
        if (mainLoginBtn) mainLoginBtn.classList.remove('hidden');
    }
};

window.requestPinReset = async function () {
    const email = document.getElementById('reqOwnerEmail').value.trim();
    const branch = document.getElementById('reqBranchName').value.trim();

    if (!email || !branch) {
        showToast('Please enter Owner Email and Branch Name', 'warning');
        return;
    }

    const btn = document.querySelector('#branchPinReset button');
    const originalText = btn.textContent;
    btn.textContent = 'Sending Request...';
    btn.disabled = true;

    try {
        await dbBranches.requestAccess(email, branch);
        showToast('Request sent to owner! They will be notified.', 'success');
        setTimeout(() => toggleBranchPinReset(), 2000);
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
};

window.register = async function () {
    const businessName = document.getElementById('regBusinessName').value.trim();
    const countryCode = document.getElementById('regCountryCode').value;
    const phone = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;

    if (!businessName || !phone || !email || !password) {
        showToast('Please fill in all fields', 'warning');
        return;
    }
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', 'warning');
        return;
    }

    const btn = document.querySelector('#registerForm button[onclick="register()"]');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Creating Account…';
    }

    const fullPhone = countryCode + phone;

    // 1. Create User
    const { data: authData, error: authError } = await dbAuth.signUp(email, password, {
        business_name: businessName,
        phone: fullPhone
    });

    if (authError) {
        showToast(authError.message, 'error');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
        return;
    }

    // 2. Provision default branch (link to owner_email now)
    const newOwnerId = authData.user?.id;
    // We can use the input email as the owner_email since registration succeeded
    const ownerEmail = email;

    if (newOwnerId) {
        try {
            await dbBranches.add(newOwnerId, {
                name: 'Main Branch',
                location: 'Headquarters',
                manager: 'Owner',
                pin: '000000', // Default PIN
                target: 10000,
                owner_email: ownerEmail // SAVE EMAIL HERE
            });

            // 3. DO NOT auto-login. Require email confirmation.
            document.getElementById('regBusinessName').value = '';
            document.getElementById('regPhone').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';

            showToast('Registration successful! Please check your email to confirm your account.', 'success');

            // Switch back to login view so they can log in after confirming
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
            toggleRegistration();

        } catch (err) {
            console.error('Auto-provisioning failed:', err);
            showToast(`Branch setup failed: ${err.message}. Please create branch manually.`, 'error');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
        }
    } else {
        showToast('Please check your email to confirm your account.', 'info');
        toggleRegistration();
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    }
};

window.logout = async function () {
    // Tear down live WebSocket before session ends
    window.destroyRealtimeSync?.();
    if (state.role === 'owner') {
        await dbAuth.signOut();
    }
    // Clear all local storage sessions
    localStorage.clear();

    // Return default theme to light
    localStorage.setItem('bms-theme', 'light');
    document.documentElement.classList.remove('dark');
    if (typeof initTheme === 'function') initTheme('light');

    location.reload();
};


window.setupDashboard = function () {
    const isOwner = state.role === 'owner';

    document.getElementById('userRole').textContent = isOwner ? 'Business Owner' : (state.branchProfile?.name || state.currentUser?.replace(' (Manager)', '') || 'Branch');
    document.getElementById('currentUser').textContent = state.currentUser;
    document.getElementById('currentBranch').textContent = isOwner
        ? 'All Branches'
        : (state.branches.find(b => b.id === state.branchId)?.name || 'Branch');

    // Update the sidebar avatar
    window.updateSidebarAvatar();

    if (isOwner) {
        document.getElementById('ownerNav').classList.remove('hidden');

        const lastView = localStorage.getItem('lastOwnerView') || 'overview';
        switchView(lastView);

        // Check for PIN Reset requests
        if (window.checkNotifications) window.checkNotifications();
    } else {
        document.getElementById('branchNav').classList.remove('hidden');

        const lastView = localStorage.getItem('lastBranchView') || 'dashboard';
        switchView(lastView);
    }
    lucide.createIcons();

    // Start the live WebSocket sync after the dashboard is fully ready
    setTimeout(() => window.initRealtimeSync?.(), 300);
};

/** Update the sidebar footer avatar — call this after profile photo changes */
window.updateSidebarAvatar = function () {
    const wrap = document.getElementById('sidebarAvatarWrap');
    if (!wrap) return;

    const avatarUrl = state.profile?.avatar_url;
    if (avatarUrl) {
        wrap.innerHTML = `<img src="${avatarUrl}" alt="Profile" class="w-full h-full object-cover rounded-full"
            onerror="this.parentElement.innerHTML='<i data-lucide=\\'user\\' class=\\'w-4 h-4 text-indigo-600\\'></i>'; lucide.createIcons();">`;
    } else {
        // Fallback: initials or user icon
        const initials = (state.currentUser || '').charAt(0).toUpperCase();
        wrap.innerHTML = initials
            ? `<span class="text-sm font-black text-indigo-600">${initials}</span>`
            : `<i data-lucide="user" class="w-4 h-4 text-indigo-600"></i>`;
        lucide.createIcons();
    }
};


/* ── Role Toggle Logic ────────────────────────────────────────────────── */
/* ── Role Toggle Logic ────────────────────────────────────────────────── */
window.setLoginRole = function (role) {
    const input = document.getElementById('roleSelect');
    const slider = document.getElementById('roleSlider');
    const btnOwner = document.getElementById('btn-owner');
    const btnBranch = document.getElementById('btn-branch');

    // Update value
    if (input) input.value = role;

    // Update Slider Position
    if (role === 'owner') {
        if (slider) slider.style.transform = 'translateX(0)';

        if (btnOwner) {
            btnOwner.classList.replace('text-gray-500', 'text-indigo-600');
            btnOwner.classList.add('font-semibold');
            btnOwner.classList.remove('font-medium');
            btnOwner.classList.add('shadow-sm');
        }

        if (btnBranch) {
            btnBranch.classList.replace('text-indigo-600', 'text-gray-500');
            btnBranch.classList.add('font-medium');
            btnBranch.classList.remove('font-semibold');
            btnBranch.classList.remove('shadow-sm');
        }

        // Show Owner Fields
        const ownerFields = document.getElementById('ownerFields');
        const branchSelector = document.getElementById('branchSelector');
        const branchPinReset = document.getElementById('branchPinReset');
        const regToggle = document.getElementById('regToggle');

        if (ownerFields) ownerFields.classList.remove('hidden');
        if (branchSelector) branchSelector.classList.add('hidden');
        if (branchPinReset) branchPinReset.classList.add('hidden');
        if (regToggle) regToggle.classList.remove('hidden');
    } else {
        if (slider) slider.style.transform = 'translateX(100%) translateX(4px)'; // Adjust for padding

        if (btnBranch) {
            btnBranch.classList.replace('text-gray-500', 'text-indigo-600');
            btnBranch.classList.add('font-semibold');
            btnBranch.classList.remove('font-medium');
            btnBranch.classList.add('shadow-sm');
        }

        if (btnOwner) {
            btnOwner.classList.replace('text-indigo-600', 'text-gray-500');
            btnOwner.classList.add('font-medium');
            btnOwner.classList.remove('font-semibold');
            btnOwner.classList.remove('shadow-sm');
        }

        // Show Branch Fields
        const ownerFields = document.getElementById('ownerFields');
        const branchSelector = document.getElementById('branchSelector');
        const branchPinReset = document.getElementById('branchPinReset');
        const regToggle = document.getElementById('regToggle');

        if (ownerFields) ownerFields.classList.add('hidden');
        if (branchSelector) branchSelector.classList.remove('hidden');
        if (branchPinReset) branchPinReset.classList.add('hidden');
        if (regToggle) regToggle.classList.add('hidden');
    }
};

// ── Session Initialization ─────────────────────────────────────────────────
window.initAuth = async function () {
    // 1. Check for Owner Session (Supabase)
    const { data: { session } } = await dbAuth.getSession();
    const sessionStart = localStorage.getItem('bms_session_start');

    if (session) {
        // --- POLICY ENFORCEMENT: SESSION DURATION ---
        try {
            const profile = await dbProfile.fetch(session.user.id);
            const maxHrs = profile?.session_duration_hrs || 8;
            if (sessionStart && (Date.now() - parseInt(sessionStart)) > (maxHrs * 3600000)) {
                console.warn('Session expired based on enterprise policy');
                showToast('Your session has expired. Please log in again.', 'info');
                await logout();
                return;
            }
        } catch (e) { }
        // --------------------------------------------

        console.log('Restoring Owner Session...');
        state.role = 'owner';
        state.ownerId = session.user.id;
        state.currentUser = session.user.email;

        // Load profile
        try {
            let profile = await dbProfile.fetch(state.ownerId);
            if (!profile) {
                profile = await dbProfile.upsert(state.ownerId, {
                    full_name: session.user.user_metadata?.first_name || 'Admin',
                    currency: 'USD'
                });
            }
            state.profile = profile;
        } catch (e) {
            console.error('Profile fetch on restore failed', e);
            state.profile = { currency: 'USD' }; // Fallback
        }

        // Load branches
        try {
            state.branches = await dbBranches.fetchAll(state.ownerId);
        } catch (e) {
            console.error('Failed to load branches:', e);
            state.branches = [];
        }

        // Apply theme preference before showing app
        if (state.profile?.theme && typeof initTheme === 'function') {
            console.log(`[Theme] Successfully fetched owner preference: ${state.profile.theme}`);
            initTheme(state.profile.theme);
        }

        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        setupDashboard();
        return;
    }

    // 2. Check for Branch Session (LocalStorage)
    const branchSession = localStorage.getItem('bms_branch_session');
    if (branchSession) {
        try {
            const data = JSON.parse(branchSession);
            console.log('Restoring Branch Session...');
            state.role = 'branch';
            state.branchId = data.branchId;
            state.ownerId = data.ownerId;
            state.currentUser = `${data.name} (Manager)`;

            // --- POLICY ENFORCEMENT: SESSION DURATION ---
            try {
                const profile = await dbProfile.fetch(data.ownerId);
                const maxHrs = profile?.session_duration_hrs || 8;
                if (sessionStart && (Date.now() - parseInt(sessionStart)) > (maxHrs * 3600000)) {
                    console.warn('Branch session expired based on enterprise policy');
                    showToast('Branch session has expired. Please log in again.', 'info');
                    await logout();
                    return;
                }
            } catch (e) { }
            // --------------------------------------------

            // Must re-fetch branch and global profile data on reload
            try {
                const { data: bData } = await window.supabaseClient.from('branches').select('*').eq('id', data.branchId).single();
                if (bData) {
                    state.branchProfile = { ...bData, branch_code: bData.branch_code || `BR-${bData.id.substring(0, 5).toUpperCase()}` };

                    const profile = await dbProfile.fetch(data.ownerId);
                    state.enterpriseName = profile?.business_name || data.enterpriseName || 'BMS Enterprise';
                    state.profile = profile || { currency: 'USD' };
                    if (bData.currency) state.profile.currency = bData.currency;
                }
            } catch (err) {
                console.warn('Failed to rehydrate full branch profile', err);
                state.enterpriseName = data.enterpriseName || 'BMS Enterprise';
                state.profile = { currency: 'USD' };
            }

            // Apply theme preference before showing app
            if (state.branchProfile?.theme && typeof initTheme === 'function') {
                console.log(`[Theme] Successfully fetched branch preference: ${state.branchProfile.theme}`);
                initTheme(state.branchProfile.theme);
            }

            document.getElementById('loginScreen').classList.add('hidden');
            document.getElementById('app').classList.remove('hidden');
            setupDashboard();
            return;
        } catch (e) {
            console.error('Invalid branch session', e);
            localStorage.removeItem('bms_branch_session');
        }
    }

    // 3. No session, ensure login screen is visible (and correctly handled)
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');

    // Default to owner view state if function exists
    if (typeof setLoginRole === 'function') {
        setLoginRole('owner');
    }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth.js Loaded');
    initAuth();
});
