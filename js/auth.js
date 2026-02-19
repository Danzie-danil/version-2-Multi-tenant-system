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

        // Load all branches for this owner
        try {
            state.branches = await dbBranches.fetchAll(state.ownerId);
        } catch (e) {
            state.branches = [];
        }

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

        state.role = 'branch';
        state.branchId = branch.id;
        state.currentUser = `${branch.name} (Manager)`;
        state.ownerId = branch.owner_id;
    }

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    setupDashboard();
    showToast(`Welcome back, ${state.currentUser}!`, 'success');
};

/* ── Registration ─────────────────────────────────────────────────────────── */


window.toggleRegistration = function () {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const mainLoginBtn = document.getElementById('mainLoginBtn');
    const isRegistering = loginForm.classList.contains('hidden');

    if (isRegistering) {
        // Switch to Login
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        if (mainLoginBtn) mainLoginBtn.classList.remove('hidden');
    } else {
        // Switch to Register
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        if (mainLoginBtn) mainLoginBtn.classList.add('hidden');
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
    if (state.role === 'owner') {
        await dbAuth.signOut();
    }
    location.reload();
};


window.setupDashboard = function () {
    const isOwner = state.role === 'owner';

    document.getElementById('userRole').textContent = isOwner ? 'Business Owner' : 'Branch Manager';
    document.getElementById('currentUser').textContent = state.currentUser;
    document.getElementById('currentBranch').textContent = isOwner
        ? 'All Branches'
        : (state.branches.find(b => b.id === state.branchId)?.name || 'Branch');

    if (isOwner) {
        document.getElementById('ownerNav').classList.remove('hidden');
        document.getElementById('liveIndicator').classList.remove('hidden');
        switchView('overview');
        startLiveSimulation();
    } else {
        document.getElementById('branchNav').classList.remove('hidden');
        switchView('dashboard');
    }
    lucide.createIcons();
};

/* ── Role select: toggle login fields ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const roleSelect = document.getElementById('roleSelect');

    roleSelect?.addEventListener('change', e => {
        const isOwner = e.target.value === 'owner';
        const isBranch = e.target.value === 'branch';

        document.getElementById('ownerFields').classList.toggle('hidden', !isOwner);
        document.getElementById('branchSelector').classList.toggle('hidden', !isBranch);

        // No need to load branch options anymore
    });
});
