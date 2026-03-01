// ═══════════════════════════════════════════════════════════════════════════
//  JS MODULE LOAD ORDER (dependencies first)
// ═══════════════════════════════════════════════════════════════════════════

// 1. Supabase Client
import './supabase.js';

// 2. Shared State
import { state } from './state.js';

// 3. Database Layer
import * as dbObj from './db.js';

// 4. Core Utilities
import * as Theme from './theme.js';
import * as Utils from './utils.js';
import * as Auth from './auth.js';
import './modals.js';

// 5. UI View Observers
import { initDashboardView } from './ui/dashboardView.js';
initDashboardView();

// 6. Owner Modules (named imports for ES6 exports)
import * as OwnerOverview from './owner/overview.js';
import * as OwnerBranches from './owner/branches.js';
import * as OwnerTasks from './owner/tasks.js';
import * as OwnerAnalytics from './owner/analytics.js';
import * as OwnerBilling from './owner/billing.js';
import * as OwnerSecurity from './owner/security.js';
import * as OwnerRequests from './owner/requests.js';
import * as OwnerSettings from './owner/settings.js';
import * as OwnerStaff from './owner/staff.js';
import * as OwnerSuppliers from './owner/suppliers.js';
import * as OwnerQuotations from './owner/quotations.js';

// 6. Branch Modules (named imports for ES6 exports)
import * as BranchDashboard from './branch/dashboard.js';
import * as BranchSales from './branch/sales.js';
import * as BranchExpenses from './branch/expenses.js';
import * as BranchInventory from './branch/inventory.js';
import * as BranchCustomers from './branch/customers.js';
import * as BranchTasks from './branch/tasks.js';
import * as BranchReports from './branch/reports.js';
import * as BranchNotes from './branch/notes.js';
import * as BranchLoans from './branch/loans.js';
import * as BranchStaff from './branch/staff.js';
import * as BranchSuppliers from './branch/suppliers.js';
import * as BranchQuotations from './branch/quotations.js';
import * as BranchInvoices from './branch/invoices.js';
import * as BranchRequests from './branch/requests.js';
import * as BranchSettings from './branch/settings.js';
import './chat.js';

// 7. Realtime WebSocket layer
import './realtime.js';

// 8. Main App Router (last — depends on everything above)
import * as App from './app.js';

// 9. Particles
import './particles.js';

// ═══════════════════════════════════════════════════════════════════════════
// GLOBAL BRIDGING FOR HTML ONCLICK HANDLERS
// ═══════════════════════════════════════════════════════════════════════════
window.login = Auth.login;
window.setLoginRole = Auth.setLoginRole;
window.togglePasswordVisibility = App.togglePasswordVisibility;
window.toggleResetPassword = Auth.toggleResetPassword;
window.handlePasswordReset = Auth.handlePasswordReset;
window.toggleRegistration = Auth.toggleRegistration;
window.register = Auth.register;
window.toggleBranchPinReset = Auth.toggleBranchPinReset;
window.requestPinReset = Auth.requestPinReset;
window.logout = Auth.logout;
window.updateSidebarAvatar = Auth.updateSidebarAvatar;

window.switchView = App.switchView;
window.toggleSidebar = App.toggleSidebar;
window.showNotifications = App.showNotifications;
window.closeNotifications = App.closeNotifications;
window.approveReset = App.approveReset;
window.denyReset = App.denyReset;

window.toggleTheme = Theme.toggleTheme;

window.openModal = Utils.openModal;
window.closeModal = Utils.closeModal;
window.showToast = Utils.showToast;
window.playSound = Utils.playSound;
window.fmt = Utils.fmt;
window.showLoader = Utils.showLoader;
window.hideLoader = Utils.hideLoader;
window.renderPremiumLoader = Utils.renderPremiumLoader;

// Expose all utility functions to window for legacy HTML handlers
for (const key in Utils) {
    if (typeof Utils[key] === 'function') {
        window[key] = Utils[key];
    }
}

// Expose state and DB objects for remaining non-module files
window.state = state;
window.supabaseClient = dbObj.supabase;
for (const key in dbObj) {
    if (key.startsWith('db')) {
        window[key] = dbObj[key];
    }
}

// Expose all Owner module exports to window for HTML onclick handlers
const ownerModules = [
    OwnerOverview, OwnerBranches, OwnerTasks, OwnerAnalytics,
    OwnerBilling, OwnerSecurity, OwnerRequests, OwnerStaff,
    OwnerSuppliers, OwnerQuotations, OwnerSettings
];
for (const mod of ownerModules) {
    for (const key in mod) {
        if (typeof mod[key] === 'function') {
            window[key] = mod[key];
        }
    }
}

// Expose all Branch module exports to window for HTML onclick handlers
const branchModules = [
    BranchDashboard, BranchSales, BranchExpenses, BranchInventory,
    BranchCustomers, BranchTasks, BranchReports, BranchNotes,
    BranchLoans, BranchStaff, BranchSuppliers, BranchQuotations,
    BranchInvoices, BranchRequests, BranchSettings
];
for (const mod of branchModules) {
    for (const key in mod) {
        if (typeof mod[key] === 'function') {
            window[key] = mod[key];
        }
    }
}
