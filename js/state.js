// ── Shared Application State ──────────────────────────────────────────────
// Only session/runtime state is stored here.
// All persistent data is now fetched live from Supabase via js/db.js.

window.state = {
    currentUser: null,   // display name
    role: null,   // 'owner' | 'branch'
    branchId: null,   // UUID of the logged-in branch (branch role only)
    ownerId: null,   // UUID from Supabase Auth (owner role only)
    branches: [],     // loaded after owner login via dbBranches.fetchAll()
    activities: []      // live activity feed (in-memory, owner view)
};
