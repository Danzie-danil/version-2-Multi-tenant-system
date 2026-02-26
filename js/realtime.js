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
        inventory_purchases: { view: 'inventory', fn: () => window.renderInventoryModule?.() },
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
        _dashboard_inventory: { view: 'dashboard', fn: () => window.renderBranchDashboard?.() },
        _dashboard_requests: { view: 'dashboard', fn: () => window.renderBranchDashboard?.() },
    };

    const OWNER_TABLE_VIEWS = {
        requests: { view: 'requests', fn: () => window.renderRequestsList?.() },
        access_requests: { view: 'overview', fn: () => window.renderOwnerOverview?.() },
        branches: { view: 'branches', fn: () => window.renderBranchesManagement?.() },
        tasks: { view: 'tasks', fn: () => window.renderTasksManagement?.() },
        // overview & analytics react to sales / expenses across all branches
        sales: { view: 'overview', fn: () => window.renderOwnerOverview?.() },
        expenses: { view: 'overview', fn: () => window.renderOwnerOverview?.() },
        _overview_branches: { view: 'overview', fn: () => window.renderOwnerOverview?.() },
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
        ['inventory_purchases', 'inventory_purchases', null],
        ['customers', 'customers', null],
        ['tasks', 'tasks', 'tasks'],
        ['notes', 'notes', null],
        ['loans', 'loans', null],
        ['requests', 'requests', 'requests'],
        ['access_requests', null, 'access_requests'],
        ['branches', 'branches', 'branches'],
        ['messages', 'chat', 'chat'],
        ['chat_groups', 'chat', 'chat'],
        ['group_members', 'chat', 'chat'],
        ['pinned_messages', 'chat', 'chat'],
        ['profiles', 'settings', 'settings'],
    ];

    let _channel = null;




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
            const baseTable = key.replace(/^_[^_]+_/, '');
            return baseTable === table || key === table;
        });

        matchingEntries.forEach(([key, entry]) => {
            if (entry.view === activeView) {
                debounce(`${state.role}-${entry.view}`, () => {
                    try { entry.fn(); } catch (e) { console.warn('[Realtime] Re-render error:', e); }
                }, 350);
            }
        });

        // ─── GLOBAL REFRESHES (Hard-wired) ───────────────────────────────────

        // 1. Primary Alerts (Trigger badge check & hints)
        const alertTables = ['requests', 'access_requests', 'messages', 'profiles', 'branches'];
        if (alertTables.includes(table)) {
            debounce('global-notifications', () => {
                window.checkNotifications?.(true);
            }, 600);
        }

        // 2. Background Activities (Silent UI refresh only, no sound/badge)
        const activityTables = ['sales', 'expenses', 'tasks', 'inventory'];
        if (activityTables.includes(table)) {
            // Only refresh the notification panel if it's currently open
            const notifOverlay = document.getElementById('notifOverlay');
            if (notifOverlay && !notifOverlay.classList.contains('hidden')) {
                debounce('silent-notif-refresh', () => {
                    window.showNotifications?.();
                }, 800);
            }
        }

        // 2. Chat Sidebar (Branches, Groups, Members, Messages)
        const chatTables = ['messages', 'branches', 'chat_groups', 'group_members'];
        if (chatTables.includes(table)) {
            debounce('global-chat-sidebar', () => {
                window.updateBranchList?.();
                window.updateGroupList?.();
            }, 500);
        }

        // 3. Settings/Profile
        if (table === 'profiles') {
            debounce('global-profile', () => {
                // Refresh local state if owner profile changed
                if (state.role === 'owner' && payload.new?.id === state.profile.id) {
                    state.profile = { ...state.profile, ...payload.new };
                }
            }, 500);
        }

        if (table === 'branches') {
            debounce('global-branch-profile', () => {
                // Refresh local state if current branch profile changed
                if (state.role === 'branch' && payload.new?.id === state.branchId) {
                    state.branchProfile = { ...state.branchProfile, ...payload.new };
                }
            }, 500);
        }

        // Specific trigger for active chat history
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
            config: {
                broadcast: { self: false },
                presence: { key: state.role === 'owner' ? state.ownerId : state.branchId }
            }
        });

        // ─── Presence Tracking Logic ──────────────────────────────────────────
        _channel.on('presence', { event: 'sync' }, () => {
            const newState = _channel.presenceState();
            window.onlineUsers = {};

            Object.keys(newState).forEach(key => {
                // Supabase presence returns an array of presences for each key (multi-tab support)
                window.onlineUsers[key] = newState[key][0];
            });

            // Trigger UI update if chat is open
            if (localStorage.getItem('lastOwnerView') === 'chat' || localStorage.getItem('lastBranchView') === 'chat') {
                window.updateChatPresenceUI?.();
                window.updateBranchList?.();
            }
        });

        _channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('[Presence] JOIN:', key, newPresences);
        });

        _channel.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('[Presence] LEAVE:', key, leftPresences);
        });

        const events = ['INSERT', 'UPDATE', 'DELETE'];

        SUBSCRIPTIONS.forEach(([table, branchKey, ownerKey]) => {
            const isRelevant = state.role === 'owner' ? ownerKey !== null : branchKey !== null;
            if (!isRelevant) return;

            // Define event listener setup helper
            const setupListener = (filter = null) => {
                const events = ['INSERT', 'UPDATE', 'DELETE'];
                events.forEach(event => {
                    let opts = { event, schema: 'public', table };
                    if (filter) opts.filter = filter;

                    _channel.on('postgres_changes', opts, (payload) => {
                        console.log(`[Realtime] ${event} on ${table}:`, payload);
                        handleChange(table, payload);
                    });
                });
            };

            // Simplified: Always use broad listeners and let Supabase RLS + JS local logic
            // handle the filtering. This is much more robust than client-side UUID filters
            // which can be flaky on different devices/browsers.
            setupListener();
        });

        _channel.on('broadcast', { event: 'sync' }, (payload) => {
            console.log('[Realtime] Broadcast SYNC received:', payload);
            if (payload.table === 'messages') {
                window.refreshChat?.({ ...payload, eventType: 'BROADCAST' });
            }
        });

        _channel.on('broadcast', { event: 'typing' }, (payload) => {
            if (window.handleTypingIndicator) window.handleTypingIndicator(payload);
        });

        _channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                console.log('[Realtime] ✅ Connected — live sync active');
                window.realtimeChannel = _channel; // Expose globally for broadcasts

                // Track presence
                await _channel.track({
                    id: state.role === 'owner' ? state.ownerId : state.branchId,
                    name: state.currentUser,
                    role: state.role,
                    online_at: new Date().toISOString()
                });
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
                console.warn('[Realtime] ⚠️ Connection issue, retrying…', status);

                // Aggressive fallback for mobile connectivity issues
                setTimeout(() => {
                    if (!_channel || _channel.state !== 'joined') {
                        window.initRealtimeSync?.();
                    }
                }, 3000);
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

    // ─── Lifecycle Listeners ──────────────────────────────────────────────────
    // Handle tab closure to untrack presence immediately
    window.addEventListener('beforeunload', () => {
        window.destroyRealtimeSync();
    });

    // Handle visibility changes (e.g., coming back from sleep or switching tabs)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Re-init if channel was lost or needs a refresh
            if (!_channel || _channel.state !== 'joined') {
                console.log('[Realtime] App foregrounded, re-syncing presence...');
                window.initRealtimeSync();
            }
        }
    });

})();
