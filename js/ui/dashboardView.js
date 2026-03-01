import { state, subscribe } from '../state.js';
import { switchView } from '../app.js';

export function initDashboardView() {
    subscribe((property, value, previousValue) => {
        // Only react to specific state changes relevant to the dashboard layout

        switch (property) {
            case 'currentUser':
                const elCurrentUser = document.getElementById('currentUser');
                if (elCurrentUser) elCurrentUser.textContent = value || '';
                break;

            case 'role': {
                const elUserRole = document.getElementById('userRole');
                const ownerNav = document.getElementById('ownerNav');
                const branchNav = document.getElementById('branchNav');

                if (value === 'owner') {
                    if (elUserRole) elUserRole.textContent = 'Business Owner';
                    if (ownerNav) ownerNav.classList.remove('hidden');
                    if (branchNav) branchNav.classList.add('hidden');

                    const lastView = localStorage.getItem('lastOwnerView') || 'overview';
                    switchView(lastView);

                    if (window.checkNotifications) window.checkNotifications();
                } else if (value === 'branch') {
                    if (elUserRole) elUserRole.textContent = state.branchProfile?.name || value?.replace(' (Manager)', '') || 'Branch';
                    if (ownerNav) ownerNav.classList.add('hidden');
                    if (branchNav) branchNav.classList.remove('hidden');

                    const lastView = localStorage.getItem('lastBranchView') || 'dashboard';
                    switchView(lastView);
                }
                break;
            }

            case 'branchProfile': {
                if (state.role === 'branch') {
                    const elUserRole = document.getElementById('userRole');
                    if (elUserRole) {
                        elUserRole.textContent = value?.name || state.currentUser?.replace(' (Manager)', '') || 'Branch';
                    }
                }
                break;
            }

            case 'branchId': {
                const elCurrentBranch = document.getElementById('currentBranch');
                if (elCurrentBranch && state.role !== 'owner') {
                    const branchName = state.branches.find(b => b.id === value)?.name || 'Branch';
                    elCurrentBranch.textContent = branchName;
                }
                break;
            }
        }

        // After any auth/role setup state change, ensure icons and avatars are refreshed
        if (['role', 'currentUser', 'branchProfile', 'profile'].includes(property)) {
            if (window.updateSidebarAvatar) window.updateSidebarAvatar();
            if (window.lucide) window.lucide.createIcons();
            setTimeout(() => window.initRealtimeSync?.(), 300);
        }
    });

    // Handle immediate setup if state is already populated (e.g., hot refresh)
    if (state.role) {
        // Trigger a fake property update to force the UI to render its current state
        state.role = state.role;
    }
}
