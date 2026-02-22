/**
 * BMS Theme Management
 * Handles dark/light theme switching and persistence.
 */

window.initTheme = function (theme) {
    const savedTheme = theme || localStorage.getItem('bms-theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    // Sync back to local storage if it was passed from DB
    if (theme) localStorage.setItem('bms-theme', theme);
};

window.toggleTheme = async function () {
    const isDark = document.documentElement.classList.toggle('dark');
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('bms-theme', theme);

    // Refresh icons since some hidden/block classes might have changed
    if (window.lucide) {
        window.lucide.createIcons();
    }

    showToast(`${isDark ? 'Dark' : 'Light'} theme enabled`, 'info');

    // Sync to Supabase if logged in
    await apiSaveTheme(theme);
};

window.apiSaveTheme = async function (theme) {
    if (!window.state) return;

    try {
        if (window.state.role === 'owner' && window.state.ownerId) {
            await window.dbProfile.updateTheme(window.state.ownerId, theme);
        } else if (window.state.role === 'branch' && window.state.branchId) {
            await window.dbBranches.updateTheme(window.state.branchId, theme);
        }
    } catch (err) {
        console.warn('Failed to sync theme to Supabase:', err);
    }
};


// Initialize immediately to avoid flash of unstyled content if possible
// (though it's better in the head, we'll call it first thing in app.js or similar)
initTheme();
