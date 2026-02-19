// ── Utility Helpers ───────────────────────────────────────────────────────

/* ── Toast Notifications ────────────────────────── */
window.showToast = function (message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        info: 'info',
        warning: 'alert-triangle'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i data-lucide="${icons[type]}" style="width:16px;height:16px;flex-shrink:0"></i> ${message}`;
    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};

/* ── Modal System ────────────────────────────────── */
window.openModal = function (type, data = null) {
    const modal = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    const html = window.getModalHTML(type, data);
    if (!html) return;
    content.innerHTML = html;
    modal.classList.remove('hidden');
    lucide.createIcons();
};

window.closeModal = function () {
    const modal = document.getElementById('modalOverlay');
    if (modal) modal.classList.add('hidden');
};

/* ── Edit Helper ────────────────────────────────── */
window.openEditModal = async function (type, id) {
    try {
        let data = null;
        // Fetch data based on type
        switch (type) {
            case 'editSale': data = await dbSales.fetchOne(id); break;
            case 'editExpense': data = await dbExpenses.fetchOne(id); break;
            case 'editInventoryItem': data = await dbInventory.fetchOne(id); break;
            case 'editNote': data = await dbNotes.fetchOne(id); break;
            case 'editCustomer': data = await dbCustomers.fetchOne(id); break;
            case 'editLoan': data = await dbLoans.fetchOne(id); break;
        }
        if (data) openModal(type, data);
    } catch (err) {
        showToast('Failed to load data for editing: ' + err.message, 'error');
    }
};

/* ── Delete Confirmation ────────────────────────── */
window.confirmDelete = function (type, id, name = 'this item') {
    // Simple confirm for now, can be upgraded to a modal later
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
        const handlers = {
            'sale': () => dbSales.delete(id).then(() => { showToast('Sale deleted'); switchView('sales'); }),
            'expense': () => dbExpenses.delete(id).then(() => { showToast('Expense deleted'); switchView('expenses'); }),
            'inventory': () => dbInventory.delete(id).then(() => { showToast('Item deleted'); switchView('inventory'); }),
            'note': () => dbNotes.delete(id).then(() => { showToast('Note deleted'); switchView('notes'); }),
            'customer': () => dbCustomers.delete(id).then(() => { showToast('Customer deleted'); switchView('customers'); }),
            'loan': () => dbLoans.delete(id).then(() => { showToast('Record deleted'); switchView('loans'); })
        };

        if (handlers[type]) {
            handlers[type]().catch(err => showToast('Delete failed: ' + err.message, 'error'));
        }
    }
};

/* ── Formatters ──────────────────────────────────── */
window.fmt = {
    currency: (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    time: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    percent: (a, b) => b ? Math.round((a / b) * 100) : 0
};

/* ── Priority badge ──────────────────────────────── */
window.priorityBadge = function (priority) {
    const map = {
        high: 'bg-red-100 text-red-700',
        medium: 'bg-yellow-100 text-yellow-700',
        low: 'bg-green-100 text-green-700',
        urgent: 'bg-purple-100 text-purple-700'
    };
    return `<span class="badge ${map[priority] || 'bg-gray-100 text-gray-700'}">${priority}</span>`;
};

/* ── Status badge ────────────────────────────────── */
window.statusBadge = function (status) {
    const map = {
        completed: 'bg-green-100 text-green-700',
        in_progress: 'bg-blue-100  text-blue-700',
        pending: 'bg-gray-100  text-gray-700',
        active: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100   text-red-700'
    };
    return `<span class="badge ${map[status] || 'bg-gray-100 text-gray-700'}">${status.replace('_', ' ')}</span>`;
};

/* ── Close modal on backdrop click ──────────────── */
/* ── Modal System ────────────────────────────────── */
window.openModal = function (type, data = null) {
    const modal = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    const html = window.getModalHTML(type, data);
    if (!html) return;
    content.innerHTML = html;
    modal.classList.remove('hidden');
    lucide.createIcons();
};
