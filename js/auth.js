// ── Authentication ────────────────────────────────────────────────────────

window.login = function () {
    const role = document.getElementById('roleSelect').value;
    const pin = document.getElementById('pinInput').value;
    const branchSelect = document.getElementById('branchSelect');

    if (pin.length !== 6) {
        showToast('Please enter a 6-digit PIN', 'warning');
        return;
    }

    if (role === 'owner' && pin !== '123456') {
        showToast('Invalid owner PIN', 'error');
        return;
    }

    if (role === 'branch') {
        if (!branchSelect.value) {
            showToast('Please select a branch', 'warning');
            return;
        }
        const branch = state.branches.find(b => b.id === branchSelect.value);
        if (pin !== branch.pin) {
            showToast('Invalid branch PIN', 'error');
            return;
        }
    }

    state.role = role;
    state.branchId = role === 'branch' ? branchSelect.value : null;
    state.currentUser = role === 'owner'
        ? 'Business Owner'
        : state.branches.find(b => b.id === state.branchId).manager;

    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    setupDashboard();
    startLiveSimulation();
    showToast(`Welcome back, ${state.currentUser}!`, 'success');
};

window.logout = function () {
    location.reload();
};

window.setupDashboard = function () {
    const isOwner = state.role === 'owner';

    document.getElementById('userRole').textContent = isOwner ? 'Business Owner' : 'Branch Manager';
    document.getElementById('currentUser').textContent = state.currentUser;
    document.getElementById('currentBranch').textContent = isOwner
        ? 'All Branches'
        : state.branches.find(b => b.id === state.branchId).name;

    if (isOwner) {
        document.getElementById('ownerNav').classList.remove('hidden');
        document.getElementById('liveIndicator').classList.remove('hidden');
        switchView('overview');
    } else {
        document.getElementById('branchNav').classList.remove('hidden');
        switchView('dashboard');
    }
    lucide.createIcons();
};

/* ── Role select show/hide branch selector ───── */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('roleSelect')?.addEventListener('change', e => {
        const branchSelector = document.getElementById('branchSelector');
        branchSelector.classList.toggle('hidden', e.target.value !== 'branch');
    });
});
