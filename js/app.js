// ── Main App: View Router & Entry Point ───────────────────────────────────

/**
 * switchView(viewName, clickedEl)
 * @param {string} viewName  - the view to render
 * @param {HTMLElement|null} clickedEl - the sidebar button that was clicked
 *   Pass `null` when calling programmatically (e.g. after form submit).
 *
 * Note: async module renderers write directly to #mainContent themselves.
 * They return '' so we don't accidentally overwrite the DOM they already set.
 */
// ── Sidebar Toggle Using Tailwind Classes ──────────────────────────────────
window.toggleSidebar = function () {
    const sidebar = document.getElementById('mainSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    // Toggle transform class
    sidebar.classList.toggle('-translate-x-full');

    // Toggle overlay visibility
    if (sidebar.classList.contains('-translate-x-full')) {
        overlay.classList.add('hidden');
    } else {
        overlay.classList.remove('hidden');
    }
};

window.switchView = function (viewId, btnElement) {
    // 1. Update active state in sidebar
    document.querySelectorAll('.sidebar-item').forEach(el => {
        el.classList.remove('active', 'text-indigo-600', 'bg-indigo-50');
        el.classList.add('text-gray-700');
    });

    if (btnElement) {
        btnElement.classList.add('active', 'text-indigo-600', 'bg-indigo-50');
        btnElement.classList.remove('text-gray-700');
    }

    // 2. Hide all views
    // (Original logic for view switching)
    if (state.role === 'owner') {
        renderOwnerView(viewId);
    } else {
        renderBranchView(viewId);
    }

    // 3. Mobile: Close sidebar after selection
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('mainSidebar');
        if (!sidebar.classList.contains('-translate-x-full')) {
            toggleSidebar();
        }
    }
};

// ── Owner View Dispatch ───────────────────────────────────────────────────

window.renderOwnerView = function (view) {
    // Each renderer is responsible for writing to #mainContent
    switch (view) {
        case 'overview':
            renderOwnerOverview();
            break;
        case 'branches':
            renderBranchesManagement();
            break;
        case 'tasks':
            renderTasksManagement();
            break;
        case 'analytics': {
            const html = renderAnalytics();
            document.getElementById('mainContent').innerHTML = html;
            lucide.createIcons();
            initAnalyticsCharts();      // charts need DOM elements first
            break;
        }
        case 'security': {
            const html = renderSecurity();
            document.getElementById('mainContent').innerHTML = html;
            lucide.createIcons();
            break;
        }
        default:
            renderOwnerOverview();
    }
};

// ── Branch View Dispatch ──────────────────────────────────────────────────

window.renderBranchView = function (view) {
    switch (view) {
        case 'dashboard':
            renderBranchDashboard();
            break;
        case 'sales':
            renderSalesModule();
            break;
        case 'expenses':
            renderExpensesModule();
            break;
        case 'inventory':
            renderInventoryModule();
            break;
        case 'customers':
            renderCustomersModule();
            break;
        case 'tasks':
            renderBranchTasks();
            break;
        case 'notes':
            renderNotesModule();
            break;
        case 'loans':
            renderLoansModule();
            break;
        default:
            renderBranchDashboard();
    }
};

// ── Notification bell reset ───────────────────────────────────────────────
window.showNotifications = function () {
    document.getElementById('notifBadge')?.classList.add('hidden');
    showToast('No new notifications', 'info', 2000);
};
