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
window.switchView = function (viewName, clickedEl) {
    // Update sidebar active state only when triggered by a sidebar click
    if (clickedEl) {
        document.querySelectorAll('.sidebar-item').forEach(btn => {
            btn.classList.remove('active', 'text-indigo-600', 'bg-indigo-50');
            btn.classList.add('text-gray-700');
        });
        const sidebarEl = clickedEl.closest('.sidebar-item');
        if (sidebarEl) {
            sidebarEl.classList.add('active', 'text-indigo-600', 'bg-indigo-50');
            sidebarEl.classList.remove('text-gray-700');
        }
    }

    if (state.role === 'owner') {
        renderOwnerView(viewName);
    } else {
        renderBranchView(viewName);
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
