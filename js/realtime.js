// ── Centralised Supabase Realtime WebSocket Layer ─────────────────────────
//
// This module sets up a persistent WebSocket connection to Supabase and
// automatically re-renders the currently active view whenever relevant data
// changes in the database — for ALL users (branch & owner).
//
// Architecture:
//   - A single channel `bms-live` subscribes to INSERT/UPDATE/DELETE events
//     on every table used by the app.
//   - A "route map" maps each DB table → the view name it belongs to.
//   - On an event, we check `localStorage.lastBranchView` / `lastOwnerView`
//     (already kept in sync by switchView) and if the user is on the matching
//     view we call the appropriate render function silently (no page flash).
//   - Notifications are also refreshed on any event.

(function () {
    'use strict';

    // ─── Route map: table → views that should refresh when that table changes ─
    //   Format: tableName: [viewName, ...renderFunctions]
    //   renderFn is called only when the user is currently on that view.

    const BRANCH_TABLE_VIEWS = {
        sales: { view: 'sales', fn: () => window.renderSalesModule?.() },
        expenses: { view: 'expenses', fn: () => window.renderExpensesModule?.() },
        inventory: { view: 'inventory', fn: () => window.renderInventoryModule?.() },
        customers: { view: 'customers', fn: () => window.renderCustomersModule?.() },
        tasks: { view: 'tasks', fn: () => window.renderBranchTasks?.() },
        notes: { view: 'notes', fn: () => window.renderNotesModule?.() },
        loans: { view: 'loans', fn: () => window.renderLoansModule?.() },
        requests: { view: 'requests', fn: () => window.renderBranchRequestsList?.() },
        chat: { view: 'chat', fn: () => window.renderChatModule?.() },
        // dashboard listens to several tables
        _dashboard_sales: { view: 'dashboard', fn: () => window.renderBranchDashboard?.() },
        _dashboard_expenses: { view: 'dashboard', fn: () => window.renderBranchDashboard?.() },
        _dashboard_tasks: { view: 'dashboard', fn: () => window.renderBranchDashboard?.() },
    };

    const OWNER_TABLE_VIEWS = {
        requests: { view: 'requests', fn: () => window.renderRequestsList?.() },
        access_requests: { view: 'overview', fn: () => window.renderOwnerOverview?.() },
        branches: { view: 'branches', fn: () => window.renderBranchesManagement?.() },
        tasks: { view: 'tasks', fn: () => window.renderTasksManagement?.() },
        // overview & analytics react to sales / expenses across all branches
        sales: { view: 'overview', fn: () => window.renderOwnerOverview?.() },
        expenses: { view: 'overview', fn: () => window.renderOwnerOverview?.() },
        _analytics_sales: { view: 'analytics', fn: () => window.renderAnalytics?.() },
        _analytics_expenses: { view: 'analytics', fn: () => window.renderAnalytics?.() },
        chat: { view: 'chat', fn: () => window.renderChatModule?.() },
    };

    // Tables to subscribe to and which logical key to use for each role
    const SUBSCRIPTIONS = [
        // table,            branchKey,              ownerKey
        ['sales', 'sales', 'sales'],
        ['expenses', 'expenses', 'expenses'],
        ['inventory', 'inventory', null],
        ['customers', 'customers', null],
        ['tasks', 'tasks', 'tasks'],
        ['notes', 'notes', null],
        ['loans', 'loans', null],
        ['requests', 'requests', 'requests'],
        ['access_requests', null, 'access_requests'],
        ['branches', null, 'branches'],
        ['messages', 'chat', 'chat'],
    ];

    let _channel = null;
    let _debounceTimers = {};

    // ─── Debounced re-render to avoid rapid-fire re-renders ──────────────────
    function debounce(key, fn, delay = 400) {
        clearTimeout(_debounceTimers[key]);
        _debounceTimers[key] = setTimeout(fn, delay);
    }

    // ─── Get the active view for the current role ─────────────────────────────
    function getActiveView() {
        if (!window.state) return null;
        if (state.role === 'owner') return localStorage.getItem('lastOwnerView') || 'overview';
        if (state.role === 'branch') return localStorage.getItem('lastBranchView') || 'dashboard';
        return null;
    }

    // ─── Handle a database change event ──────────────────────────────────────
    function handleChange(table, payload) {
        if (!window.state || !state.role || !state.profile) return;

        const activeView = getActiveView();
        const routeMap = state.role === 'owner' ? OWNER_TABLE_VIEWS : BRANCH_TABLE_VIEWS;

        // Find all route entries for this table (incl. _alias_ entries)
        const matchingEntries = Object.entries(routeMap).filter(([key, val]) => {
            // key may be the exact table name or a prefixed alias like _dashboard_sales
            const baseTable = key.replace(/^_[^_]+_/, '');
            return baseTable === table || key === table;
        });

        matchingEntries.forEach(([key, entry]) => {
            if (entry.view === activeView) {
                // Debounce per view so multiple rapid events merge into one render
                debounce(`${state.role}-${entry.view}`, () => {
                    try { entry.fn(); } catch (e) { console.warn('[Realtime] Re-render error:', e); }
                }, 350);
            }
        });

        // Always refresh notification badge silently
        debounce('notifications', () => {
            window.checkNotifications?.(true);
        }, 600);

        // Specific trigger for Chat
        if (table === 'messages') {
            window.refreshChat?.(payload);
        }
    }

    // ─── Build and subscribe the Supabase Realtime channel ───────────────────
    window.initRealtimeSync = function () {
        if (!window.supabaseClient || !window.state?.profile) return;

        // Clean up any previous channel
        if (_channel) {
            supabaseClient.removeChannel(_channel);
            _channel = null;
        }

        _channel = supabaseClient.channel('bms-live', {
            config: { broadcast: { self: false } }
        });

        const events = ['INSERT', 'UPDATE', 'DELETE'];

        SUBSCRIPTIONS.forEach(([table, branchKey, ownerKey]) => {
            // Only subscribe to tables relevant to the current role
            const isRelevant = state.role === 'owner' ? ownerKey !== null : branchKey !== null;
            if (!isRelevant) return;

            events.forEach(event => {
                // Add a filter where possible to limit server-side traffic
                let opts = { event, schema: 'public', table };

                if (state.role === 'branch' && state.branchId) {
                    // Tables that have a branch_id column
                    const branchScopedTables = ['sales', 'expenses', 'inventory', 'customers', 'tasks', 'notes', 'loans', 'requests', 'messages'];
                    if (branchScopedTables.includes(table)) {
                        opts.filter = `branch_id=eq.${state.branchId}`;
                    }
                } else if (state.role === 'owner' && state.profile?.id) {
                    if (table === 'requests') {
                        opts.filter = `owner_id=eq.${state.profile.id}`;
                    } else if (table === 'access_requests') {
                        opts.filter = `owner_id=eq.${state.profile.id}`;
                    }
                    // branches & tasks listen broadly (scoped by owner at query time)
                }

                _channel.on('postgres_changes', opts, (payload) => {
                    handleChange(table, payload);
                });
            });
        });

        _channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('[Realtime] ✅ Connected — live sync active');
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.warn('[Realtime] ⚠️ Connection issue, retrying…', status);
                setTimeout(() => window.initRealtimeSync?.(), 5000);
            }
        });
    };

    // ─── Cleanup (called on logout) ───────────────────────────────────────────
    window.destroyRealtimeSync = function () {
        if (_channel) {
            supabaseClient.removeChannel(_channel);
            _channel = null;
        }
    };

})();
