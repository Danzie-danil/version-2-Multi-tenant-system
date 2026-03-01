/**
 * BMS Theme Management
 * Handles dark/light theme switching and persistence.
 */

import { state } from './state.js';
import { dbProfile, dbBranches } from './db.js';

export function initTheme(theme) {
    const savedTheme = theme || localStorage.getItem('bms-theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    // Sync back to local storage if it was passed from DB
    if (theme) localStorage.setItem('bms-theme', theme);
};

export async function toggleTheme() {
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

export async function apiSaveTheme(theme) {
    if (!state) return;

    try {
        if (state.role === 'owner' && state.ownerId) {
            await dbProfile.updateTheme(state.ownerId, theme);
        } else if (state.role === 'branch' && state.branchId) {
            await dbBranches.updateTheme(state.branchId, theme);
        }
    } catch (err) {
        console.warn('Failed to sync theme to Supabase:', err);
    }
};


// Initialize immediately to avoid flash of unstyled content if possible
// (though it's better in the head, we'll call it first thing in app.js or similar)
initTheme();
