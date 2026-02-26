// ── Utility Helpers ───────────────────────────────────────────────────────

/* ── Client-Side List Search ─────────────────────── */
window.filterList = function (listId, query) {
    const list = document.getElementById(listId);
    if (!list) return;
    const q = query.trim().toLowerCase();
    list.querySelectorAll('[data-search]').forEach(item => {
        const text = item.getAttribute('data-search') || '';
        item.style.display = q === '' || text.includes(q) ? '' : 'none';
    });
};

/* ── Audio Feedback ─────────────────────────────── */
// Wait a moment for dynamic SVGs to exist before replacing
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { if (window.lucide) window.lucide.createIcons(); }, 100);
});

// Sound Management
let _lastSoundTime = {};
window.playSound = function (name) {
    if (localStorage.getItem('bms_sound_pref') === 'false') return;

    // Simple throttle to prevent barrage of the same sound
    const now = Date.now();
    if (_lastSoundTime[name] && now - _lastSoundTime[name] < 500) {
        return; // Filter sound if played within last 500ms
    }
    _lastSoundTime[name] = now;

    const audio = new window.Audio(`audio/${name}.mp3`);
    audio.volume = 0.5;
    audio.play().catch(e => {
        // Only log if it's not a generic auto-play permission error
        if (e.name !== 'NotAllowedError') console.warn('Audio play failed:', e);
    });
};

/* ── Toast Notifications ────────────────────────── */
window.showToast = function (message, type = 'info', duration = 2500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // Clear existing toasts to prevent stacking
    container.innerHTML = '';

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

    // Play matching sound
    if (type === 'error') playSound('error');
    else playSound('pop-alert');

    setTimeout(() => {
        if (!toast.parentElement) return;
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

window.openDetailsModal = async function (type, id) {
    try {
        let data = null;
        // Fetch data based on type
        switch (type) {
            case 'sale':
                data = await dbSales.fetchOne(id);
                // Augment with profit info if possible
                if (data && data.product_id) {
                    try {
                        const product = await dbInventory.fetchOne(data.product_id);
                        if (product) {
                            const qty = parseInt(data.quantity || (data.items?.match(/^(\d+)x/)?.[1] || 1));
                            data.cost_price = product.cost_price || 0;
                            data.profit = parseFloat(data.amount) - (data.cost_price * qty);
                        }
                    } catch (e) { console.warn("Failed to fetch product for profit calc", e); }
                }
                break;
            case 'expense': data = await dbExpenses.fetchOne(id); break;
            case 'inventory': data = await dbInventory.fetchOne(id); break;
            case 'note': data = await dbNotes.fetchOne(id); break;
            case 'customer': data = await dbCustomers.fetchOne(id); break;
            case 'loan': data = await dbLoans.fetchOne(id); break;
            case 'task': data = await dbTasks.fetchOne ? await dbTasks.fetchOne(id) : (state.tasks ? state.tasks.find(t => t.id === id) : null); break;
            case 'branch': data = state.branches ? state.branches.find(b => b.id === id) : await dbBranches.fetchOne(id); break;
        }
        if (data) openModal(type + 'Details', data);
    } catch (err) {
        showToast('Failed to load details: ' + err.message, 'error');
    }
};

/* ── Custom Modal Confirm ────────────────────────── */
window.confirmModal = function (title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmClass = 'bg-red-600 hover:bg-red-700', requireText = null) {
    return new Promise((resolve) => {
        const modal = document.getElementById('modalOverlay');
        const content = document.getElementById('modalContent');

        const inputHtml = requireText ? `
            <div class="mt-4 mb-2">
                <label class="block text-sm font-medium text-gray-700 mb-1">Type <strong>${requireText}</strong> to confirm</label>
                <input type="text" id="confirmInputText" class="form-input w-full" autocomplete="off" onpaste="return false;" ondrop="return false;">
            </div>
        ` : '';

        content.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900">${title}</h3>
                <button id="btnConfirmCloseX" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <p class="text-gray-600 ${requireText ? '' : 'mb-6'}">${message}</p>
            ${inputHtml}
            <div class="flex gap-3 justify-end mt-6">
                <button id="btnConfirmCancel" class="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">${cancelText}</button>
                <button id="btnConfirmAccept" class="px-4 py-2 text-white rounded-lg font-medium text-sm ${confirmClass}" ${requireText ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>${confirmText}</button>
            </div>
        </div>
        `;
        lucide.createIcons();
        modal.classList.remove('hidden');

        const btnAccept = document.getElementById('btnConfirmAccept');
        const inputField = document.getElementById('confirmInputText');

        if (requireText && inputField) {
            inputField.addEventListener('input', (e) => {
                if (e.target.value === requireText) {
                    btnAccept.disabled = false;
                    btnAccept.style.opacity = '1';
                    btnAccept.style.cursor = 'pointer';
                } else {
                    btnAccept.disabled = true;
                    btnAccept.style.opacity = '0.5';
                    btnAccept.style.cursor = 'not-allowed';
                }
            });
        }

        const cleanup = () => {
            modal.classList.add('hidden');
            document.getElementById('btnConfirmCloseX').removeEventListener('click', onCancel);
            document.getElementById('btnConfirmCancel').removeEventListener('click', onCancel);
            btnAccept.removeEventListener('click', onAccept);
        };

        const onCancel = () => { cleanup(); resolve(false); };
        const onAccept = () => {
            if (requireText && inputField && inputField.value !== requireText) return;
            cleanup();
            resolve(true);
        };

        document.getElementById('btnConfirmCloseX').addEventListener('click', onCancel);
        document.getElementById('btnConfirmCancel').addEventListener('click', onCancel);
        btnAccept.addEventListener('click', onAccept);

        if (requireText && inputField) {
            setTimeout(() => inputField.focus(), 100);
        }
    });
};

/* ── Custom Modal Prompt ─────────────────────────── */
window.promptModal = function (title, message, placeholder = '') {
    return new Promise((resolve) => {
        const modal = document.getElementById('modalOverlay');
        const content = document.getElementById('modalContent');

        content.innerHTML = `
        <div class="p-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900">${title}</h3>
                <button id="btnPromptCloseX" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <p class="text-gray-600 mb-4">${message}</p>
            <input type="text" id="promptInputText" class="form-input w-full mb-6" placeholder="${placeholder}" autocomplete="off">
            <div class="flex gap-3 justify-end">
                <button id="btnPromptCancel" class="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                <button id="btnPromptSubmit" class="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 text-sm">Submit</button>
            </div>
        </div>
        `;
        lucide.createIcons();
        modal.classList.remove('hidden');

        const inputField = document.getElementById('promptInputText');
        const btnSubmit = document.getElementById('btnPromptSubmit');

        const cleanup = () => {
            modal.classList.add('hidden');
            document.getElementById('btnPromptCloseX').removeEventListener('click', onCancel);
            document.getElementById('btnPromptCancel').removeEventListener('click', onCancel);
            btnSubmit.removeEventListener('click', onSubmit);
        };

        const onCancel = () => { cleanup(); resolve(null); };
        const onSubmit = () => {
            const val = inputField.value.trim();
            cleanup();
            resolve(val);
        };

        document.getElementById('btnPromptCloseX').addEventListener('click', onCancel);
        document.getElementById('btnPromptCancel').addEventListener('click', onCancel);
        btnSubmit.addEventListener('click', onSubmit);

        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') onSubmit();
        });

        setTimeout(() => inputField.focus(), 100);
    });
};

/* ── Delete Confirmation ────────────────────────── */
window.confirmDelete = async function (type, id, name = 'this item') {
    const confirmed = await confirmModal(
        'Confirm Delete',
        `Are you sure you want to delete ${name}? This action cannot be undone.`,
        'Delete',
        'Cancel'
    );

    if (confirmed) {
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
    currency: (n) => {
        // Map common codes to symbols for cleaner display
        const symbols = {
            'USD': '$',    // US Dollar
            'EUR': '€',    // Euro
            'GBP': '£',    // British Pound
            'KES': 'KSH ', // Kenyan Shilling
            'TZS': 'TSh ', // Tanzanian Shilling
            'NGN': '₦',    // Nigerian Naira
            'UGX': 'USh ', // Ugandan Shilling
            'ZAR': 'R ',   // South African Rand
            'INR': '₹'     // Indian Rupee
        };

        // Ensure state is loaded, default to USD if not set
        const code = (window.state && window.state.profile && window.state.profile.currency) ? window.state.profile.currency : 'USD';

        const symbol = symbols[code] || (code + ' ');
        return symbol + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },
    number: (n) => {
        return Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },
    parseNumber: (val) => {
        // Strip all commas and non-numeric characters (except decimal point and minus sign)
        if (!val || typeof val !== 'string') return parseFloat(val) || 0;
        const cleaned = val.toString().replace(/,/g, '').replace(/[^\d.\-]/g, '');
        return parseFloat(cleaned) || 0;
    },
    time: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    dateTime: (d) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
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
/* ── Global Number Formatting ────────────────────── */
window.initNumberFormatting = function () {
    // Attach event listener to document for real-time number formatting
    document.addEventListener('input', function (e) {
        const target = e.target;

        // Only process inputs with the 'number-format' class
        if (!target.classList.contains('number-format')) return;

        // Get the current value and remove non-numeric characters (except decimal point and minus)
        let value = target.value.trim();

        // If empty, keep it empty (don't default to 0)
        if (!value) {
            target.value = '';
            return;
        }

        const isNegative = value.startsWith('-');

        // Strip non-numeric characters except decimal point
        let numericValue = value.replace(/[^\d.]/g, '');

        // Handle multiple decimal points (keep only the first one)
        const parts = numericValue.split('.');
        if (parts.length > 2) {
            numericValue = parts[0] + '.' + parts.slice(1).join('');
        }

        // Parse the numeric value
        const num = parseFloat(numericValue) || 0;

        // Format with thousands separators
        const parts2 = numericValue.split('.');
        const integerPart = parts2[0] || '0';
        const decimalPart = parts2[1] || '';

        // Add commas to integer part
        const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        // Reconstruct the formatted value
        let formatted = isNegative ? '-' : '';
        formatted += formattedInteger;
        if (decimalPart) {
            formatted += '.' + decimalPart;
        }

        target.value = formatted;
    });

    // Also handle blur events to ensure proper decimal formatting
    document.addEventListener('blur', function (e) {
        const target = e.target;
        if (!target.classList.contains('number-format')) return;

        const value = target.value;
        const num = fmt.parseNumber(value);

        // If it's a valid number and not empty, format it with 2 decimal places
        if (num !== 0 || value.trim() !== '') {
            const parts = value.split('.');
            const integerPart = (parts[0] || '0').replace(/[^\d\-]/g, '');
            const decimalPart = parts[1] ? parts[1].substring(0, 2) : '00';

            const isNegative = integerPart.startsWith('-');
            const cleanInteger = integerPart.replace('-', '');
            const formattedInteger = cleanInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

            target.value = (isNegative ? '-' : '') + formattedInteger + '.' + decimalPart.padEnd(2, '0');
        }
    }, true);
};

// Initialize number formatting when DOM is ready
document.addEventListener('DOMContentLoaded', initNumberFormatting);

/* ── Modal System ────────────────────────────────── */
window.openModal = function (type, data = null) {
    const modal = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    const html = window.getModalHTML(type, data);
    if (!html) return;
    content.innerHTML = html;
    modal.classList.remove('hidden');
    lucide.createIcons();
    // Reinitialize number formatting after modal content is injected
    initNumberFormatting();
};

/* ── Activity Feed Helper ────────────────────────── */
window.addActivity = function (type, message, branchName, amount = null) {
    const activity = { type, message, branch: branchName, amount, time: fmt.time() };
    if (!state.activities) state.activities = [];
    state.activities.unshift(activity); // Add to beginning
    if (state.activities.length > 50) state.activities.pop(); // Cap at 50

    // Refresh feed if visible
    const feed = document.getElementById('activityFeed');
    if (feed) {
        feed.innerHTML = renderActivities();
        lucide.createIcons();
    }

    // Badge
    const badge = document.getElementById('notifBadge');
    if (badge) badge.classList.remove('hidden');
};

/* ── App Update Utility ──────────────────────────── */
window.updateApp = async function () {
    try {
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (let registration of registrations) {
                await registration.unregister();
            }
        }

        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
        }

        // Force reload without cache
        window.location.reload(true);
    } catch (err) {
        console.error('Update failed:', err);
        // Fallback to simple reload
        window.location.reload(true);
    }
};

window.confirmUpdateApp = async function () {
    const confirmed = await confirmModal(
        'Update Application',
        'Are you sure you want to force the application to reload and fetch the latest code? Any unsaved changes may be lost.',
        'Update',
        'Cancel',
        'bg-indigo-600 hover:bg-indigo-700'
    );
    if (confirmed) {
        window.updateApp();
    }
};
/* ── Debounce Utility ────────────────────────────── */
let _globalDebounceTimers = {};
window.debounce = function (key, fn, delay = 400) {
    clearTimeout(_globalDebounceTimers[key]);
    _globalDebounceTimers[key] = setTimeout(fn, delay);
};
