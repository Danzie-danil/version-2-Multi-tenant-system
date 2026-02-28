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

        showLoader('Signing in...');
        const { data, error } = await dbAuth.signIn(email, password);
        if (error) {
            hideLoader();
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
        localStorage.setItem('bms_last_role', role);
        localStorage.setItem('bms_session_start', Date.now());

    } else {
        // Branch manager: Manager Email + Password
        const email = document.getElementById('branchEmailInput').value.trim();
        const password = document.getElementById('branchPasswordInput').value;

        if (!email || !password) {
            showToast('Please enter your Manager Email and Password', 'warning');
            return;
        }

        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Verifying…';
        }

        showLoader('Verifying credentials...');

        const { data, error } = await dbAuth.signIn(email, password);

        if (error) {
            hideLoader();
            showToast('Invalid credentials or account does not exist.', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Access Dashboard';
                lucide.createIcons();
            }
            return;
        }

        let branch;
        try {
            branch = await dbBranches.fetchByManager(data.user.id);
        } catch (e) {
            console.error(e);
            hideLoader();
            showToast('Could not fetch branch data.', 'error');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Access Dashboard';
                lucide.createIcons();
            }
            return;
        }

        if (!branch) {
            hideLoader();
            showToast('No branch assigned to this manager account.', 'error');
            await dbAuth.signOut(); // Kick them out if no branch assigned
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i> Access Dashboard';
                lucide.createIcons();
            }
            return;
        }

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

        // Persist session metadata
        localStorage.setItem('bms_last_role', 'branch');
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
    hideLoader();
    showToast(`Welcome back, ${state.currentUser}!`, 'success');

    if (state.role === 'owner' && typeof startSaaSTour === 'function') {
        setTimeout(startSaaSTour, 800);
    }
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

    showLoader('Sending reset link...');
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/index.html',
        });
        if (error) throw error;
        showToast('Check your email for the reset link!', 'success');
        setTimeout(() => toggleResetPassword(), 2000);
    } catch (err) {
        hideLoader();
        showToast(err.message, 'error');
    } finally {
        hideLoader();
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

    showLoader('Sending Request...');
    try {
        await dbBranches.requestAccess(email, branch);
        showToast('Request sent to owner! They will be notified.', 'success');
        setTimeout(() => toggleBranchPinReset(), 2000);
    } catch (err) {
        hideLoader();
        showToast(err.message, 'error');
    } finally {
        hideLoader();
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

    showLoader('Creating Account...');
    const fullPhone = countryCode + phone;

    // 1. Create User
    const { data: authData, error: authError } = await dbAuth.signUp(email, password, {
        data: {
            business_name: businessName,
            phone: fullPhone
        },
        emailRedirectTo: window.location.origin
    });

    if (authError) {
        hideLoader();
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

            hideLoader();
            showToast('Registration successful! Please check your email to confirm your account.', 'success');

            // Switch back to login view so they can log in after confirming
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Create Account';
            }
            toggleRegistration();

        } catch (err) {
            hideLoader(); // CRITICAL: Stop the animation
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
    // Clear all local storage and session storage
    localStorage.clear();
    sessionStorage.clear();

    // Clear service worker / browser caches
    if ('caches' in window) {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        } catch (e) {
            console.error('Error clearing caches:', e);
        }
    }

    // Return default theme to light
    localStorage.setItem('bms-theme', 'light');
    document.documentElement.classList.remove('dark');
    if (typeof initTheme === 'function') initTheme('light');

    // Force hard reload to completely refresh the app state from the server
    window.location.reload(true);
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

    const isBranch = state.role === 'branch';
    const avatarUrl = isBranch ? state.branchProfile?.avatar_url : state.profile?.avatar_url;

    if (avatarUrl) {
        wrap.innerHTML = `<img src="${avatarUrl}" alt="Profile" class="w-full h-full object-cover rounded-full"
            onerror="this.parentElement.innerHTML='<i data-lucide=\\'user\\' class=\\'w-4 h-4 text-indigo-600\\'></i>'; lucide.createIcons();">`;
    } else {
        // Fallback: initials or user icon
        const initialStr = isBranch ? (state.branchProfile?.name || state.currentUser || '') : (state.currentUser || '');
        const initials = initialStr.charAt(0).toUpperCase();
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
    const { data: { session } } = await dbAuth.getSession();
    const sessionStart = localStorage.getItem('bms_session_start');

    if (session) {
        console.log('[Auth] Supabase session found, identifying role...');

        // 1. Check if user is a Manager (source of truth is the branches table)
        let branch = await dbBranches.fetchByManager(session.user.id);

        if (branch) {
            console.log('[Auth] Identified: Branch Manager');
            state.role = 'branch';
            state.branchId = branch.id;
            state.ownerId = branch.owner_id;
            state.currentUser = `${branch.name} (Manager)`;
            state.branchProfile = { ...branch, branch_code: branch.branch_code || `BR-${branch.id.substring(0, 5).toUpperCase()}` };

            // Fetch Enterprise info
            try {
                const profile = await dbProfile.fetch(branch.owner_id);
                state.enterpriseName = profile?.business_name || 'BMS Enterprise';
                state.profile = profile || { currency: 'USD' };
                if (branch.currency) state.profile.currency = branch.currency;

                // --- POLICY ENFORCEMENT: SESSION DURATION ---
                const maxHrs = profile?.session_duration_hrs || 8;
                if (sessionStart && (Date.now() - parseInt(sessionStart)) > (maxHrs * 3600000)) {
                    console.warn('[Auth] Branch session expired based on enterprise policy');
                    showToast('Your session has expired. Please log in again.', 'info');
                    await logout();
                    return;
                }
            } catch (e) {
                console.warn('[Auth] Failed to fetch enterprise profile for manager', e);
                state.enterpriseName = 'BMS Enterprise';
                state.profile = { currency: 'USD' };
            }
        } else {
            console.log('[Auth] Identified: Business Owner');
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

                // --- POLICY ENFORCEMENT: SESSION DURATION ---
                const maxHrs = profile?.session_duration_hrs || 8;
                if (sessionStart && (Date.now() - parseInt(sessionStart)) > (maxHrs * 3600000)) {
                    console.warn('[Auth] Owner session expired based on enterprise policy');
                    showToast('Your session has expired. Please log in again.', 'info');
                    await logout();
                    return;
                }
            } catch (e) {
                console.error('[Auth] Profile fetch on restore failed', e);
                state.profile = { currency: 'USD' };
            }

            // Load branches
            try {
                state.branches = await dbBranches.fetchAll(state.ownerId);
            } catch (e) {
                console.error('[Auth] Failed to load branches:', e);
                state.branches = [];
            }
        }

        // Common Setup for both roles
        const userTheme = state.role === 'owner' ? state.profile?.theme : state.branchProfile?.theme;
        if (userTheme && typeof initTheme === 'function') initTheme(userTheme);

        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        setupDashboard();

        if (state.role === 'owner' && typeof startSaaSTour === 'function') {
            setTimeout(startSaaSTour, 800);
        }
        return;
    }

    // No session found
    console.log('[Auth] No active session, redirecting to login...');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');

    // Default to last used role or fallback to owner
    const lastRole = localStorage.getItem('bms_last_role') || 'owner';
    if (typeof setLoginRole === 'function') {
        setLoginRole(lastRole);
    }
};

window.hideInitialLoader = () => {
    const initialLoader = document.getElementById('initial-loader');
    if (initialLoader) {
        initialLoader.classList.add('fade-out');
        setTimeout(() => initialLoader.remove(), 500);
    }
};

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth.js Loaded');
    initAuth().finally(() => {
        hideInitialLoader();
    });
});
