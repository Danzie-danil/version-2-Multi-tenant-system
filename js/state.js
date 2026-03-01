// ── Shared Application State ──────────────────────────────────────────────
// Only session/runtime state is stored here.
// All persistent data is now fetched live from Supabase via js/db.js.

// ── Observer Pattern for State Management ─────────────────────────────────
const listeners = new Set();

export const subscribe = (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback); // Returns unsubscribe function
};

const notifySubscribers = (property, value, previousValue) => {
    listeners.forEach(callback => {
        try {
            callback(property, value, previousValue);
        } catch (err) {
            console.error('[State Observer Error]', err);
        }
    });
};

const _internalState = {
    currentUser: null,   // display name
    role: null,          // 'owner' | 'branch'
    branchId: null,      // UUID of the logged-in branch (branch role only)
    ownerId: null,       // UUID from Supabase Auth (owner role only)
    profile: null,       // loaded from 'profiles' table (global settings)
    branches: [],        // loaded after owner login via dbBranches.fetchAll()
    activities: [],      // live activity feed (in-memory, owner view)
    enterpriseName: 'BMS Enterprise',
    branchProfile: null
};

export const state = new Proxy(_internalState, {
    set(target, property, value) {
        if (target[property] !== value) {
            const previousValue = target[property];
            target[property] = value;
            notifySubscribers(property, value, previousValue);
        }
        return true;
    }
});
