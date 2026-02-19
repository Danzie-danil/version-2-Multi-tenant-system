// ── Main App: View Router & Entry Point ───────────────────────────────────

/**
 * switchView(viewName, clickedEl)
 * @param {string} viewName  - the view to render
 * @param {HTMLElement|null} clickedEl - the sidebar button that was clicked
 *   Pass `null` when calling programmatically (e.g. after form submit).
 */
window.switchView = function (viewName, clickedEl) {
    const mainContent = document.getElementById('mainContent');

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
        renderOwnerView(viewName, mainContent);
    } else {
        renderBranchView(viewName, mainContent);
    }

    lucide.createIcons();
};

// ── Owner View Dispatch ───────────────────────────────────────────────────

window.renderOwnerView = function (view, container) {
    switch (view) {
        case 'overview':
            container.innerHTML = renderOwnerOverview();
            break;
        case 'branches':
            container.innerHTML = renderBranchesManagement();
            break;
        case 'tasks':
            container.innerHTML = renderTasksManagement();
            break;
        case 'analytics':
            container.innerHTML = renderAnalytics();
            initAnalyticsCharts();      // charts need DOM elements first
            break;
        case 'security':
            container.innerHTML = renderSecurity();
            break;
        default:
            container.innerHTML = renderOwnerOverview();
    }
};

// ── Branch View Dispatch ──────────────────────────────────────────────────

window.renderBranchView = function (view, container) {
    switch (view) {
        case 'dashboard':
            container.innerHTML = renderBranchDashboard();
            break;
        case 'sales':
            container.innerHTML = renderSalesModule();
            break;
        case 'expenses':
            container.innerHTML = renderExpensesModule();
            break;
        case 'inventory':
            container.innerHTML = renderInventoryModule();
            break;
        case 'customers':
            container.innerHTML = renderCustomersModule();
            break;
        case 'tasks':
            container.innerHTML = renderBranchTasks();
            break;
        case 'reports':
            container.innerHTML = renderReportsModule();
            break;
        case 'notes':
            container.innerHTML = renderNotesModule();
            break;
        case 'loans':
            container.innerHTML = renderLoansModule();
            break;
        default:
            container.innerHTML = renderBranchDashboard();
    }
};

// ── Notification bell reset ───────────────────────────────────────────────
window.showNotifications = function () {
    document.getElementById('notifBadge')?.classList.add('hidden');
    showToast('No new notifications', 'info', 2000);
};
