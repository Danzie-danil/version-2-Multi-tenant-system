// ── Central Database Layer ─────────────────────────────────────────────────
// All async CRUD operations. Uses window.supabaseClient from supabase.js.
// Called by modal handlers and module renderers.

const _db = window.supabaseClient;

// ── Helper: throw on Supabase error ───────────────────────────────────────
function _check({ data, error }, label) {
    if (error) {
        console.error(`[DB] ${label}:`, error.message);
        throw error;
    }
    return data;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════

window.dbAuth = {
    /** Owner: sign in with email + password */
    signIn: (email, password) =>
        _db.auth.signInWithPassword({ email, password }),

    /** Sign out (owner) */
    signOut: () => _db.auth.signOut(),

    /** Get current Supabase session */
    getSession: () => _db.auth.getSession(),

    /** Register new owner */
    signUp: (email, password, data) =>
        _db.auth.signUp({
            email,
            password,
            options: { data }
        })
};

// ═══════════════════════════════════════════════════════════════════════════
// BRANCHES
// ═══════════════════════════════════════════════════════════════════════════

window.dbBranches = {
    /** Fetch all branches for a given owner */
    fetchAll: async (ownerId) => {
        const res = await _db
            .from('branches')
            .select('*')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: true });
        return _check(res, 'fetchBranches');
    },

    /** Verify branch credentials: returns branch or null */
    verifyCredentials: async (ownerEmail, branchName, pin) => {
        // Case-insensitive match for email and branch name is better for UX
        const res = await _db
            .from('branches')
            .select('*')
            .ilike('owner_email', ownerEmail)
            .ilike('name', branchName)
            .eq('pin', pin)
            .maybeSingle();
        return _check(res, 'verifyBranchCredentials');
    },

    /** Create a new branch */
    add: async (ownerId, { name, location, manager, pin, target, owner_email }) => {
        const res = await _db
            .from('branches')
            .insert({ owner_id: ownerId, name, location, manager, pin, target, owner_email })
            .select()
            .single();
        return _check(res, 'addBranch');
    },

    /** Reset branch PIN */
    updatePin: async (branchId, newPin) => {
        const res = await _db
            .from('branches')
            .update({ pin: newPin })
            .eq('id', branchId);
        return _check(res, 'updateBranchPin');
    },

    /** Update branch status */
    updateStatus: async (branchId, status) => {
        const res = await _db
            .from('branches')
            .update({ status })
            .eq('id', branchId);
        return _check(res, 'updateBranchStatus');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// SALES
// ═══════════════════════════════════════════════════════════════════════════

window.dbSales = {
    /** Fetch all sales for a branch */
    fetchAll: async (branchId) => {
        const res = await _db
            .from('sales')
            .select('*')
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false });
        return _check(res, 'fetchSales');
    },

    /** Get today's sales total for a branch */
    todayTotal: async (branchId) => {
        const today = new Date().toISOString().split('T')[0];
        const res = await _db
            .from('sales')
            .select('amount')
            .eq('branch_id', branchId)
            .gte('created_at', today);
        const data = _check(res, 'salesTodayTotal');
        return data.reduce((s, r) => s + Number(r.amount), 0);
    },

    /** Record a new sale */
    add: async (branchId, { customer, items, amount, payment }) => {
        const res = await _db
            .from('sales')
            .insert({ branch_id: branchId, customer, items, amount, payment })
            .select()
            .single();
        return _check(res, 'addSale');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════════════════════

window.dbExpenses = {
    fetchAll: async (branchId) => {
        const res = await _db
            .from('expenses')
            .select('*')
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false });
        return _check(res, 'fetchExpenses');
    },

    add: async (branchId, { category, description, amount }) => {
        const res = await _db
            .from('expenses')
            .insert({ branch_id: branchId, category, description, amount })
            .select()
            .single();
        return _check(res, 'addExpense');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════

window.dbCustomers = {
    fetchAll: async (branchId) => {
        const res = await _db
            .from('customers')
            .select('*')
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false });
        return _check(res, 'fetchCustomers');
    },

    add: async (branchId, { name, phone, email }) => {
        const res = await _db
            .from('customers')
            .insert({ branch_id: branchId, name, phone, email })
            .select()
            .single();
        return _check(res, 'addCustomer');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════════════════

window.dbInventory = {
    fetchAll: async (branchId) => {
        const res = await _db
            .from('inventory')
            .select('*')
            .eq('branch_id', branchId)
            .order('name', { ascending: true });
        return _check(res, 'fetchInventory');
    },

    add: async (branchId, { name, sku, quantity, min_threshold, price }) => {
        const res = await _db
            .from('inventory')
            .insert({ branch_id: branchId, name, sku, quantity, min_threshold, price })
            .select()
            .single();
        return _check(res, 'addInventoryItem');
    },

    updateQty: async (itemId, quantity) => {
        const res = await _db
            .from('inventory')
            .update({ quantity })
            .eq('id', itemId);
        return _check(res, 'updateInventoryQty');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════════════════════════════════

window.dbTasks = {
    /** Owner: fetch tasks for all branches of this owner */
    fetchByOwner: async (ownerId) => {
        const res = await _db
            .from('tasks')
            .select('*, branches(name, owner_id)')
            .eq('branches.owner_id', ownerId)
            .order('created_at', { ascending: false });
        return _check(res, 'fetchTasksByOwner');
    },

    /** Branch: fetch tasks for this branch */
    fetchByBranch: async (branchId) => {
        const res = await _db
            .from('tasks')
            .select('*')
            .eq('branch_id', branchId)
            .order('deadline', { ascending: true });
        return _check(res, 'fetchTasksByBranch');
    },

    add: async (branchId, { title, description, priority, deadline }) => {
        const res = await _db
            .from('tasks')
            .insert({ branch_id: branchId, title, description, priority, deadline, status: 'pending' })
            .select()
            .single();
        return _check(res, 'addTask');
    },

    updateStatus: async (taskId, status) => {
        const res = await _db
            .from('tasks')
            .update({ status })
            .eq('id', taskId);
        return _check(res, 'updateTaskStatus');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════════════════════

window.dbNotes = {
    fetchAll: async (branchId) => {
        const res = await _db
            .from('notes')
            .select('*')
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false });
        return _check(res, 'fetchNotes');
    },

    add: async (branchId, { title, content, tag }) => {
        const res = await _db
            .from('notes')
            .insert({ branch_id: branchId, title, content, tag })
            .select()
            .single();
        return _check(res, 'addNote');
    },

    delete: async (noteId) => {
        const res = await _db.from('notes').delete().eq('id', noteId);
        return _check(res, 'deleteNote');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LOANS / OTHER INCOME
// ═══════════════════════════════════════════════════════════════════════════

window.dbLoans = {
    fetchAll: async (branchId) => {
        const res = await _db
            .from('loans')
            .select('*')
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false });
        return _check(res, 'fetchLoans');
    },

    add: async (branchId, { type, party, amount, notes }) => {
        const res = await _db
            .from('loans')
            .insert({ branch_id: branchId, type, party, amount, notes })
            .select()
            .single();
        return _check(res, 'addLoan');
    }
};
