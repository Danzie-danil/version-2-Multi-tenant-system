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
    signUp: (email, password, options = {}) =>
        _db.auth.signUp({
            email,
            password,
            options
        })
};

// ═══════════════════════════════════════════════════════════════════════════
// PROFILES (Global Settings)
// ═══════════════════════════════════════════════════════════════════════════

window.dbProfile = {
    /** Fetch profile by user ID */
    fetch: async (ownerId) => {
        const { data, error } = await _db
            .from('profiles')
            .select('*')
            .eq('id', ownerId)
            .single();

        // Return null instead of throwing error if not found, 
        // to handle first-time users smoothly
        if (error && error.code === 'PGRST116') return null;

        return _check({ data, error }, 'fetchProfile');
    },

    /** Update or create profile */
    upsert: async (ownerId, profileData) => {
        const payload = { id: ownerId, ...profileData, updated_at: new Date().toISOString() };
        console.log('[DEBUG] profileData to upsert:', payload);
        const res = await _db
            .from('profiles')
            .upsert(payload, { onConflict: 'id' })
            .select('*')
            .single();

        if (res.error) console.error('[DEBUG] Upsert Error:', res.error);
        return _check(res, 'upsertProfile');
    },

    /** Specific helper for theme sync */
    updateTheme: async (ownerId, theme) => {
        const res = await _db
            .from('profiles')
            .update({ theme })
            .eq('id', ownerId);
        return _check(res, 'updateProfileTheme');
    },

    /** Update security policies */
    updateSecurity: async (ownerId, data) => {
        const res = await _db
            .from('profiles')
            .update({
                pin_expiry_days: data.pin_expiry_days,
                session_duration_hrs: data.session_duration_hrs,
                updated_at: new Date().toISOString()
            })
            .eq('id', ownerId);
        return _check(res, 'updateSecurityPolicies');
    }
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

    /** Fetch single branch managed by the given manager user ID */
    fetchByManager: async (managerId) => {
        const res = await _db
            .from('branches')
            .select('*')
            .eq('manager_id', managerId)
            .maybeSingle();
        return _check(res, 'fetchBranchByManager');
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

    /** Request access (PIN reset) */
    requestAccess: async (ownerEmail, branchName) => {
        // 1. Find Owner ID first
        const { data: owners, error: ownerError } = await _db
            .from('branches')
            .select('owner_id')
            .ilike('owner_email', ownerEmail)
            .limit(1);

        if (ownerError || !owners || !owners.length) throw new Error('Owner email not found.');
        const ownerId = owners[0].owner_id;

        // 2. Find Branch ID
        const { data: branches, error: branchError } = await _db
            .from('branches')
            .select('id')
            .eq('owner_id', ownerId)
            .ilike('name', branchName)
            .maybeSingle();

        if (branchError || !branches) throw new Error('Branch not found.');

        // 3. Insert Request
        const { error: reqError } = await _db
            .from('access_requests')
            .insert({
                branch_id: branches.id,
                owner_id: ownerId,
                requester_email: ownerEmail,
                status: 'pending'
            });

        if (reqError) throw new Error('Failed to send request: ' + reqError.message);
        return true;
    },

    add: async (ownerId, { name, location, manager, target, managerEmail, branchPassword, currency }) => {
        let managerId = null;

        // 1. Create the manager user via RPC ONLY if credentials provided
        if (managerEmail && branchPassword) {
            const meta = { role: 'branch_manager', branch_name: name };
            const { data, error: rpcError } = await _db.rpc('create_branch_manager', {
                mgr_email: managerEmail,
                mgr_password: branchPassword,
                mgr_meta: meta
            });

            if (rpcError) {
                console.error('[DB] create_branch_manager error:', rpcError);
                // If it fails because the function is missing, give a better error
                if (rpcError.code === 'PGRST202' || rpcError.message?.includes('not found')) {
                    throw new Error('Database setup incomplete: Missing "create_branch_manager" function. Please run the migration script.');
                }
                throw new Error('Failed to create manager account: ' + rpcError.message);
            }
            managerId = data;
        }

        // 2. Insert the branch record
        const payload = {
            owner_id: ownerId,
            manager_id: managerId,
            manager_email: managerEmail,
            name,
            location,
            manager,
            target
        };
        if (currency) payload.currency = currency;

        const res = await _db
            .from('branches')
            .insert(payload)
            .select()
            .single();
        return _check(res, 'addBranch');
    },

    /** Update core branch info (Admin Level) */
    updateAdmin: async (branchId, { name, manager, location, target, currency }) => {
        const payload = { name, manager, location, target };
        if (currency) payload.currency = currency;

        const res = await _db
            .from('branches')
            .update(payload)
            .eq('id', branchId)
            .select()
            .single();
        return _check(res, 'updateBranchAdmin');
    },

    /** Reset Manager Password */
    updateManagerPassword: async (branchId, newPassword) => {
        // Find the manager's auth user ID first
        const { data: branch, error: fetchErr } = await _db
            .from('branches')
            .select('manager_id')
            .eq('id', branchId)
            .single();

        if (fetchErr || !branch || !branch.manager_id) {
            throw new Error('This branch does not have a manager account assigned to it.');
        }

        const { error: rpcError } = await _db.rpc('reset_branch_manager_password', {
            mgr_id: branch.manager_id,
            new_password: newPassword
        });

        if (rpcError) throw new Error('Failed to update password: ' + rpcError.message);
        return true;
    },

    /** Update branch profile details */
    updateProfile: async (branchId, profileData) => {
        // Only allow updating safe fields
        const safeData = {
            branch_reg_no: profileData.branch_reg_no,
            branch_tin: profileData.branch_tin,
            phone: profileData.phone,
            email: profileData.email,
            address: profileData.address,
            tax_rate: profileData.tax_rate,
            opening_time: profileData.opening_time,
            closing_time: profileData.closing_time,
            low_stock_notifications: profileData.low_stock_notifications,
            avatar_url: profileData.avatar_url ?? undefined
        };
        // Remove undefined keys to avoid overwriting existing values with null
        Object.keys(safeData).forEach(k => safeData[k] === undefined && delete safeData[k]);
        const res = await _db
            .from('branches')
            .update(safeData)
            .eq('id', branchId)
            .select()
            .single();
        return _check(res, 'updateBranchProfile');
    },

    /** Update branch status */
    updateStatus: async (branchId, status) => {
        const res = await _db
            .from('branches')
            .update({ status })
            .eq('id', branchId);
        return _check(res, 'updateBranchStatus');
    },

    /** Specific helper for branch theme sync */
    updateTheme: async (branchId, theme) => {
        const res = await _db
            .from('branches')
            .update({ theme })
            .eq('id', branchId);
        return _check(res, 'updateBranchTheme');
    },

    /** Fetch a single branch by ID */
    fetchOne: async (branchId) => {
        const res = await _db
            .from('branches')
            .select('*')
            .eq('id', branchId)
            .single();
        return _check(res, 'fetchOneBranch');
    },

    /** Update branch-level action preferences (allowlist toggles) */
    updatePreferences: async (branchId, preferences) => {
        const res = await _db
            .from('branches')
            .update({ preferences })
            .eq('id', branchId)
            .select()
            .single();
        return _check(res, 'updateBranchPreferences');
    },

    /** Delete a branch */
    delete: async (branchId) => {
        const res = await _db
            .from('branches')
            .delete()
            .eq('id', branchId);
        return _check(res, 'deleteBranch');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// SALES
// ═══════════════════════════════════════════════════════════════════════════

window.dbSales = {
    /** Fetch paginated sales for a branch */
    fetchAll: async (branchId, { page = 1, pageSize = 10, dateFilter = null } = {}) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = _db
            .from('sales')
            .select('*', { count: 'exact' })
            .eq('branch_id', branchId);

        if (dateFilter) {
            query = query.gte('created_at', dateFilter instanceof Date ? dateFilter.toISOString() : dateFilter);
        }

        const res = await query.order('created_at', { ascending: false }).range(from, to);
        const data = _check(res, 'fetchSales');
        return { items: data, count: res.count || 0 };
    },

    /** Fetch branch sales summary (Today's stats) */
    fetchSummary: async (branchId) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const res = await _db.rpc('get_branch_sales_summary', {
            p_branch_id: branchId,
            p_today_start: today.toISOString()
        });
        const data = _check(res, 'fetchSalesSummary');
        return data[0] || { today_total: 0, transaction_count: 0, avg_sale: 0 };
    },

    /** Fetch gross profit stats */
    fetchProfit: async (branchId) => {
        const res = await _db.rpc('get_branch_profit_stats', { p_branch_id: branchId });
        const data = _check(res, 'fetchProfitStats');
        return data[0] || { gross_profit: 0 };
    },

    fetchOne: async (id) => {
        const res = await _db.from('sales').select('*').eq('id', id).single();
        return _check(res, 'fetchOneSale');
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

    /** Record a new sale and deduct inventory */
    add: async (branchId, sale) => {
        const { customer, items, amount, payment, productId, qty } = sale;

        const res = await _db
            .from('sales')
            .insert([{
                branch_id: branchId,
                customer,
                items,
                amount,
                payment,
                product_id: productId, // Track specific item
                quantity: qty         // Track specific qty
            }])
            .select()
            .single();

        const addedSale = _check(res, 'addSale');

        // Inventory Reduction Logic (already implemented in previous sessions)
        if (productId && qty) {
            try {
                const { data: item } = await _db.from('inventory').select('quantity').eq('id', productId).single();
                if (item) {
                    const newQty = Math.max(0, item.quantity - parseInt(qty));
                    await _db.from('inventory').update({ quantity: newQty }).eq('id', productId);
                }
            } catch (err) {
                console.warn('[DB] Inventory reduction failed:', err.message);
            }
        }

        return addedSale;
    },

    update: async (id, { customer, items, amount, payment }) => {
        const res = await _db
            .from('sales')
            .update({ customer, items, amount, payment })
            .eq('id', id);
        return _check(res, 'updateSale');
    },

    delete: async (id) => {
        const res = await _db.from('sales').delete().eq('id', id);
        return _check(res, 'deleteSale');
    },

    /** Bulk Delete Sales */
    bulkDelete: async (ids) => {
        const res = await _db.from('sales').delete().in('id', ids);
        return _check(res, 'bulkDeleteSales');
    },

    /** Fetch historical sales for trend analysis */
    fetchHistory: async (branchIds, days = 7) => {
        const date = new Date();
        date.setDate(date.getDate() - days);
        const iso = date.toISOString().split('T')[0];

        const res = await _db
            .from('sales')
            .select('amount, created_at, branch_id')
            .in('branch_id', branchIds)
            .gte('created_at', iso)
            .order('created_at', { ascending: true });
        return _check(res, 'fetchSalesHistory');
    }
};

window.dbSaleTags = {
    fetchAll: async (branchId) => {
        const res = await _db.from('sale_tags').select('*').eq('branch_id', branchId);
        return _check(res, 'fetchSaleTags');
    },
    add: async (branchId, saleId, tag) => {
        const res = await _db.from('sale_tags').insert([{ branch_id: branchId, sale_id: saleId, tag }]);
        return _check(res, 'addSaleTag');
    },
    delete: async (tagId) => {
        const res = await _db.from('sale_tags').delete().eq('id', tagId);
        return _check(res, 'deleteSaleTag');
    },
    deleteBySale: async (saleId) => {
        const res = await _db.from('sale_tags').delete().eq('sale_id', saleId);
        return _check(res, 'deleteSaleTagsBySale');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPENSES
// ═══════════════════════════════════════════════════════════════════════════

window.dbExpenses = {
    /** Fetch paginated expenses for a branch */
    fetchAll: async (branchId, { page = 1, pageSize = 10 } = {}) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const res = await _db
            .from('expenses')
            .select('*', { count: 'exact' })
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false })
            .range(from, to);
        const data = _check(res, 'fetchExpenses');
        return { items: data, count: res.count || 0 };
    },

    fetchOne: async (id) => {
        const res = await _db.from('expenses').select('*').eq('id', id).single();
        return _check(res, 'fetchOneExpense');
    },

    add: async (branchId, { category, description, amount }) => {
        const res = await _db
            .from('expenses')
            .insert({ branch_id: branchId, category, description, amount })
            .select()
            .single();
        return _check(res, 'addExpense');
    },

    update: async (id, { category, description, amount }) => {
        const res = await _db
            .from('expenses')
            .update({ category, description, amount })
            .eq('id', id);
        return _check(res, 'updateExpense');
    },

    delete: async (id) => {
        const res = await _db.from('expenses').delete().eq('id', id);
        return _check(res, 'deleteExpense');
    },
    bulkDelete: async (ids) => {
        const res = await _db.from('expenses').delete().in('id', ids);
        return _check(res, 'bulkDeleteExpenses');
    },
    bulkAdd: async (records) => {
        const res = await _db.from('expenses').insert(records);
        return _check(res, 'bulkAddExpenses');
    }
};

window.dbExpenseTags = {
    fetchAll: async (branchId) => {
        const res = await _db.from('expense_tags').select('*').eq('branch_id', branchId);
        return _check(res, 'fetchExpenseTags');
    },
    add: async (branchId, expenseId, tag) => {
        const res = await _db.from('expense_tags').insert([{ branch_id: branchId, expense_id: expenseId, tag }]);
        return _check(res, 'addExpenseTag');
    },
    delete: async (tagId) => {
        const res = await _db.from('expense_tags').delete().eq('id', tagId);
        return _check(res, 'deleteExpenseTag');
    }
};

// INCOME (Redundant - Income records are stored in the loans table)

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════════════════

window.dbCustomers = {
    fetchAll: async (branchId, { page = 1, pageSize = 10 } = {}) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const res = await _db
            .from('customers')
            .select('*', { count: 'exact' })
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false })
            .range(from, to);
        const data = _check(res, 'fetchCustomers');
        return { items: data, count: res.count || 0 };
    },

    fetchAllList: async (branchId) => {
        const res = await _db.from('customers').select('*').eq('branch_id', branchId).order('name', { ascending: true });
        return _check(res, 'fetchCustomersList');
    },

    fetchOne: async (id) => {
        const res = await _db.from('customers').select('*').eq('id', id).single();
        return _check(res, 'fetchOneCustomer');
    },

    add: async (branchId, { name, phone, email }) => {
        const res = await _db
            .from('customers')
            .insert({ branch_id: branchId, name, phone, email })
            .select()
            .single();
        return _check(res, 'addCustomer');
    },

    update: async (id, { name, phone, email }) => {
        const res = await _db
            .from('customers')
            .update({ name, phone, email })
            .eq('id', id);
        return _check(res, 'updateCustomer');
    },

    delete: async (id) => {
        const res = await _db.from('customers').delete().eq('id', id);
        return _check(res, 'deleteCustomer');
    },
    bulkDelete: async (ids) => {
        const res = await _db.from('customers').delete().in('id', ids);
        return _check(res, 'bulkDeleteCustomers');
    },
    bulkAdd: async (records) => {
        const res = await _db.from('customers').insert(records);
        return _check(res, 'bulkAddCustomers');
    }
};

window.dbCustomerTags = {
    fetchAll: async (branchId) => {
        const res = await _db.from('customer_tags').select('*').eq('branch_id', branchId);
        return _check(res, 'fetchCustomerTags');
    },
    add: async (branchId, customerId, tag) => {
        const res = await _db.from('customer_tags').insert([{ branch_id: branchId, customer_id: customerId, tag }]);
        return _check(res, 'addCustomerTag');
    },
    delete: async (tagId) => {
        const res = await _db.from('customer_tags').delete().eq('id', tagId);
        return _check(res, 'deleteCustomerTag');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═══════════════════════════════════════════════════════════════════════════

window.dbInventory = {
    fetchAll: async (branchId, { page = 1, pageSize = 10 } = {}) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const res = await _db
            .from('inventory')
            .select('*', { count: 'exact' })
            .eq('branch_id', branchId)
            .order('name', { ascending: true })
            .range(from, to);
        const data = _check(res, 'fetchInventory');
        return { items: data, count: res.count || 0 };
    },

    fetchOne: async (id) => {
        const res = await _db.from('inventory').select('*').eq('id', id).single();
        return _check(res, 'fetchOneInventory');
    },

    add: async (branchId, { name, sku, quantity, min_threshold, price, category }) => {
        const res = await _db
            .from('inventory')
            .insert({ branch_id: branchId, name, sku, quantity, min_threshold, price, category })
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
    },

    update: async (id, { name, sku, category, quantity, min_threshold, price }) => {
        const res = await _db
            .from('inventory')
            .update({ name, sku, category, quantity, min_threshold, price })
            .eq('id', id);
        return _check(res, 'updateInventory');
    },

    delete: async (id) => {
        const res = await _db.from('inventory').delete().eq('id', id);
        return _check(res, 'deleteInventory');
    },
    bulkDelete: async (ids) => {
        const res = await _db.from('inventory').delete().in('id', ids);
        return _check(res, 'bulkDeleteInventory');
    },
    bulkAdd: async (records) => {
        const res = await _db.from('inventory').insert(records);
        return _check(res, 'bulkAddInventory');
    }
};

window.dbInventoryTags = {
    fetchAll: async (branchId) => {
        const res = await _db.from('inventory_tags').select('*').eq('branch_id', branchId);
        return _check(res, 'fetchInventoryTags');
    },
    add: async (branchId, inventoryId, tag) => {
        const res = await _db.from('inventory_tags').insert([{ branch_id: branchId, inventory_id: inventoryId, tag }]);
        return _check(res, 'addInventoryTag');
    },
    delete: async (tagId) => {
        const res = await _db.from('inventory_tags').delete().eq('id', tagId);
        return _check(res, 'deleteInventoryTag');
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
    fetchAll: async (branchId, { page = 1, pageSize = 10 } = {}) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const res = await _db
            .from('tasks')
            .select('*', { count: 'exact' })
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false })
            .range(from, to);
        const data = _check(res, 'fetchTasks');
        return { items: data, count: res.count || 0 };
    },

    /** Fetch a single task by ID (used by openDetailsModal) */
    fetchOne: async (id) => {
        const res = await _db
            .from('tasks')
            .select('*, branch:branches(name)')
            .eq('id', id)
            .single();
        return _check(res, 'fetchOneTask');
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
    },
    bulkDelete: async (ids) => {
        const res = await _db.from('tasks').delete().in('id', ids);
        return _check(res, 'bulkDeleteTasks');
    }
};

window.dbTaskTags = {
    fetchAll: async (branchId) => {
        const res = await _db.from('task_tags').select('*').eq('branch_id', branchId);
        return _check(res, 'fetchTaskTags');
    },
    add: async (branchId, taskId, tag) => {
        const res = await _db.from('task_tags').insert([{ branch_id: branchId, task_id: taskId, tag }]);
        return _check(res, 'addTaskTag');
    },
    delete: async (tagId) => {
        const res = await _db.from('task_tags').delete().eq('id', tagId);
        return _check(res, 'deleteTaskTag');
    }
};

// ── Task Comments (Admin ↔ Branch reminder thread) ───────────────────────
window.dbTaskComments = {
    /** Fetch all comments for a task, oldest first */
    fetchAll: async (taskId) => {
        const res = await _db
            .from('task_comments')
            .select('*')
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });
        return _check(res, 'fetchTaskComments');
    },

    /** Post a new comment/reminder */
    add: async (taskId, senderRole, senderName, message) => {
        const res = await _db
            .from('task_comments')
            .insert({ task_id: taskId, sender_role: senderRole, sender_name: senderName, message })
            .select()
            .single();
        return _check(res, 'addTaskComment');
    },

    /** Delete a comment by ID */
    delete: async (commentId) => {
        const res = await _db.from('task_comments').delete().eq('id', commentId);
        return _check(res, 'deleteTaskComment');
    },

    /** Mark a comment as read */
    markAsRead: async (commentId) => {
        const res = await _db.from('task_comments').update({ is_read: true }).eq('id', commentId);
        return _check(res, 'markTaskCommentRead');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════════════════════

window.dbNotes = {
    fetchAll: async (branchId, { page = 1, pageSize = 10 } = {}) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const res = await _db
            .from('notes')
            .select('*', { count: 'exact' })
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false })
            .range(from, to);
        const data = _check(res, 'fetchNotes');
        return { items: data, count: res.count || 0 };
    },

    fetchOne: async (id) => {
        const res = await _db.from('notes').select('*').eq('id', id).single();
        return _check(res, 'fetchOneNote');
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
    },

    update: async (id, { title, content, tag }) => {
        const res = await _db
            .from('notes')
            .update({ title, content, tag })
            .eq('id', id);
        return _check(res, 'updateNote');
    },
    bulkDelete: async (ids) => {
        const res = await _db.from('notes').delete().in('id', ids);
        return _check(res, 'bulkDeleteNotes');
    }
};

window.dbNoteTags = {
    fetchAll: async (branchId) => {
        const res = await _db.from('note_tags').select('*').eq('branch_id', branchId);
        return _check(res, 'fetchNoteTags');
    },
    add: async (branchId, noteId, tag) => {
        const res = await _db.from('note_tags').insert([{ branch_id: branchId, note_id: noteId, tag }]);
        return _check(res, 'addNoteTag');
    },
    delete: async (tagId) => {
        const res = await _db.from('note_tags').delete().eq('id', tagId);
        return _check(res, 'deleteNoteTag');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// LOANS / OTHER INCOME
// ═══════════════════════════════════════════════════════════════════════════

window.dbLoans = {
    fetchAll: async (branchId, { page = 1, pageSize = 10 } = {}) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const res = await _db
            .from('loans')
            .select('*', { count: 'exact' })
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false })
            .range(from, to);
        const data = _check(res, 'fetchLoans');
        return { items: data, count: res.count || 0 };
    },

    fetchOne: async (id) => {
        const res = await _db.from('loans').select('*').eq('id', id).single();
        return _check(res, 'fetchOneLoan');
    },

    add: async (branchId, { type, party, amount, notes }) => {
        const res = await _db
            .from('loans')
            .insert({ branch_id: branchId, type, party, amount, notes })
            .select()
            .single();
        return _check(res, 'addLoan');
    },

    update: async (id, { type, party, amount, notes }) => {
        const res = await _db.from('loans').update({ type, party, amount, notes }).eq('id', id);
        return _check(res, 'updateLoan');
    },
    delete: async (id) => {
        const res = await _db.from('loans').delete().eq('id', id);
        return _check(res, 'deleteLoan');
    },
    bulkDelete: async (ids) => {
        const res = await _db.from('loans').delete().in('id', ids);
        return _check(res, 'bulkDeleteLoans');
    }
};

window.dbLoanTags = {
    fetchAll: async (branchId) => {
        const res = await _db.from('loan_tags').select('*').eq('branch_id', branchId);
        return _check(res, 'fetchLoanTags');
    },
    add: async (branchId, loanId, tag) => {
        const res = await _db.from('loan_tags').insert([{ branch_id: branchId, loan_id: loanId, tag }]);
        return _check(res, 'addLoanTag');
    },
    delete: async (tagId) => {
        const res = await _db.from('loan_tags').delete().eq('id', tagId);
        return _check(res, 'deleteLoanTag');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITIES (Aggregate for Owner Dashboard)
// ═══════════════════════════════════════════════════════════════════════════

window.dbActivities = {
    fetchRecent: async (branchIds, limit = 20) => {
        if (!branchIds || branchIds.length === 0) return [];

        const [salesRes, expRes, tasksRes] = await Promise.all([
            _db.from('sales').select('id, amount, created_at, branches(name)').in('branch_id', branchIds).order('created_at', { ascending: false }).limit(limit),
            _db.from('expenses').select('id, amount, description, created_at, branches(name)').in('branch_id', branchIds).order('created_at', { ascending: false }).limit(limit),
            _db.from('tasks').select('id, title, status, created_at, branches(name)').in('branch_id', branchIds).order('created_at', { ascending: false }).limit(limit)
        ]);

        const sales = _check(salesRes, 'fetchRecentSales').map(s => ({
            type: 'sale',
            message: 'New sale recorded',
            branch: s.branches?.name || 'Unknown',
            amount: s.amount,
            created_at: s.created_at,
            time: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        const expenses = _check(expRes, 'fetchRecentExpenses').map(e => ({
            type: 'expense',
            message: e.description || 'Expense recorded',
            branch: e.branches?.name || 'Unknown',
            amount: e.amount,
            created_at: e.created_at,
            time: new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        const tasks = _check(tasksRes, 'fetchRecentTasks').map(t => ({
            type: t.status === 'completed' ? 'task_completed' : 'task_assigned',
            message: t.status === 'completed' ? `Completed: ${t.title}` : `New task: ${t.title}`,
            branch: t.branches?.name || 'Unknown',
            amount: null,
            created_at: t.created_at,
            time: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));

        const all = [...sales, ...expenses, ...tasks];
        // Sort descending by created_at (newest first)
        all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return all.slice(0, limit);
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// REQUESTS & COMMUNICATION
// ═══════════════════════════════════════════════════════════════════════════

window.dbRequests = {
    /** Fetch all requests for owner (Approval Queue) */
    fetchAll: async (ownerId) => {
        const res = await _db
            .from('requests')
            .select('*, branches(name)')
            .eq('owner_id', ownerId)
            .order('created_at', { ascending: false });
        return _check(res, 'fetchRequestsAll');
    },

    /** Fetch requests for a specific branch */
    fetchByBranch: async (branchId) => {
        const res = await _db
            .from('requests')
            .select('*')
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false });
        return _check(res, 'fetchRequestsByBranch');
    },

    /** Create a new request */
    add: async (payload) => {
        const res = await _db
            .from('requests')
            .insert([payload])
            .select()
            .single();
        return _check(res, 'addRequest');
    },

    /** Update request (Admin response or status change) */
    update: async (id, data) => {
        const res = await _db
            .from('requests')
            .update({ ...data, updated_at: new Date().toISOString() })
            .eq('id', id);
        return _check(res, 'updateRequest');
    },

    /** Delete request */
    delete: async (id) => {
        const res = await _db.from('requests').delete().eq('id', id);
        return _check(res, 'deleteRequest');
    }
};

window.dbInventoryPurchases = {
    /** Log a new inventory purchase */
    add: async (payload) => {
        const res = await _db
            .from('inventory_purchases')
            .insert([payload])
            .select()
            .single();
        return _check(res, 'addInventoryPurchase');
    },

    /** Fetch purchase history for branch */
    fetchByBranch: async (branchId) => {
        const res = await _db
            .from('inventory_purchases')
            .select('*, inventory(name)')
            .eq('branch_id', branchId)
            .order('purchase_date', { ascending: false });
        return _check(res, 'fetchPurchases');
    }
};

window.dbMessages = {
    /** Send a message */
    send: async (payload) => {
        const res = await _db
            .from('messages')
            .insert([payload])
            .select()
            .single();
        return _check(res, 'sendMessage');
    },

    /** Fetch most recent message for a snippet */
    fetchLast: async (branchId, isGroup = false, groupId = null) => {
        let query = _db
            .from('messages')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (groupId) {
            query = query.eq('group_id', groupId);
        } else if (isGroup) {
            query = query.eq('is_group', true).is('group_id', null);
        } else {
            query = query.eq('branch_id', branchId).eq('is_group', false);
        }

        const res = await query;
        return res.data?.[0] || null;
    },

    /** Fetch conversation history */
    fetchConversation: async (branchId, isGroup = false, groupId = null) => {
        let query = _db
            .from('messages')
            .select('*')
            .order('created_at', { ascending: true });

        if (groupId) {
            query = query.eq('group_id', groupId);
        } else if (isGroup) {
            query = query.eq('is_group', true).is('group_id', null);
        } else {
            query = query.eq('branch_id', branchId).eq('is_group', false);
        }

        const res = await query;
        const messages = _check(res, 'fetchConversation');

        // Filter messages locally to respect soft-deletion
        const currentId = state.role === 'owner' ? state.profile.id : state.branchId;
        return messages.filter(m => {
            const deletedFor = m.deleted_for || [];
            return !deletedFor.includes(currentId);
        });
    },

    /** Mark all messages in a conversation as read (for the recipient) */
    markRead: async (branchId, role) => {
        const res = await _db
            .from('messages')
            .update({
                is_read: true,
                is_delivered: true // If it's read, it's definitely delivered
            })
            .eq('branch_id', branchId)
            .neq('sender_role', role)
            .eq('is_read', false);
        return _check(res, 'markRead');
    },

    /** Mark specific messages as delivered */
    markDelivered: async (branchId, role) => {
        const res = await _db
            .from('messages')
            .update({ is_delivered: true })
            .eq('branch_id', branchId)
            .neq('sender_role', role)
            .eq('is_delivered', false);
        return _check(res, 'markDelivered');
    },

    /** Get unread message count */
    getUnreadCount: async (branchId, role) => {
        const query = _db
            .from('messages')
            .select('branch_id, group_id')
            .neq('sender_role', role)
            .eq('is_read', false);

        if (branchId) {
            query.eq('branch_id', branchId);
        }

        const res = await query;
        const messages = res.data || [];

        if (messages.length === 0) return 0;

        // Count distinct conversations (either a distinct branch ID or a distinct group ID)
        const distinctConvos = new Set();
        messages.forEach(msg => {
            if (msg.group_id) {
                distinctConvos.add(`group_${msg.group_id}`);
            } else if (msg.branch_id) {
                distinctConvos.add(`branch_${msg.branch_id}`);
            }
        });

        return distinctConvos.size;
    },

    /** Toggle an emoji reaction on a message */
    toggleReaction: async (messageId, emoji, userRef) => {
        // userRef: {id, name}
        const { data: msg } = await _db
            .from('messages')
            .select('reactions')
            .eq('id', messageId)
            .single();

        let reactions = msg?.reactions || [];
        const index = reactions.findIndex(r => r.userId === userRef.id && r.emoji === emoji);

        if (index > -1) {
            reactions.splice(index, 1); // Remove
        } else {
            reactions.push({ userId: userRef.id, name: userRef.name, emoji }); // Add
        }

        const res = await _db
            .from('messages')
            .update({ reactions })
            .eq('id', messageId);

        return _check(res, 'toggleReaction');
    },

    /** Pin a message for a specific branch */
    pinForBranch: async (messageId, branchId) => {
        const res = await _db
            .from('pinned_messages')
            .insert([{ message_id: messageId, branch_id: branchId }]);
        return _check(res, 'pinForBranch');
    },

    /** Dismiss a pin */
    dismissPin: async (pinId) => {
        const res = await _db
            .from('pinned_messages')
            .delete()
            .eq('id', pinId);
        return _check(res, 'dismissPin');
    },

    /** Fetch active pins for a branch */
    fetchPins: async (branchId) => {
        const res = await _db
            .from('pinned_messages')
            .select('*, messages(*)')
            .eq('branch_id', branchId)
            .order('created_at', { ascending: false });
        return _check(res, 'fetchPins');
    },

    /** Advanced: Groups, Stars, Archive */
    createGroup: async (name, memberBranchIds, createdBy) => {
        const { data: group, error: gErr } = await _db
            .from('chat_groups')
            .insert([{ name, created_by: createdBy }])
            .select()
            .single();
        if (gErr) throw gErr;

        const members = memberBranchIds.map(bid => ({ group_id: group.id, branch_id: bid }));
        const { error: mErr } = await _db.from('group_members').insert(members);
        if (mErr) throw mErr;

        return group;
    },

    fetchGroups: async (branchId = null) => {
        let query = _db.from('chat_groups').select('*, group_members!inner(*)');
        if (branchId) {
            query = query.eq('group_members.branch_id', branchId);
        }
        const res = await query;
        return _check(res, 'fetchGroups');
    },

    starMessage: async (messageId, userId) => {
        const res = await _db.from('starred_messages').insert([{ message_id: messageId, user_id: userId }]);
        return _check(res, 'starMessage');
    },

    unstarMessage: async (messageId, userId) => {
        const res = await _db.from('starred_messages').delete().match({ message_id: messageId, user_id: userId });
        return _check(res, 'unstarMessage');
    },

    fetchStarred: async (userId) => {
        const res = await _db.from('starred_messages').select('*, messages(*)').eq('user_id', userId);
        return _check(res, 'fetchStarred');
    },

    archiveRoom: async (userId, targetId, type) => {
        const res = await _db.from('archived_conversations').insert([{ user_id: userId, target_id: targetId, type }]);
        return _check(res, 'archiveRoom');
    },

    fetchArchived: async (userId) => {
        const res = await _db.from('archived_conversations').select('*').eq('user_id', userId);
        return _check(res, 'fetchArchived');
    },

    /** Attachment Upload */
    uploadFile: async (file, path = 'chat-attachments') => {
        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        const filePath = `${path}/${fileName}`;

        const { data, error } = await _db.storage
            .from('chat-attachments')
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = _db.storage
            .from('chat-attachments')
            .getPublicUrl(filePath);

        return {
            url: publicUrl,
            name: file.name,
            type: file.type,
            size: file.size
        };
    },

    /** Deletion Logic */
    softDelete: async (messageId, userId) => {
        // Fetch current deleted_for
        const { data: msg } = await _db.from('messages').select('deleted_for').eq('id', messageId).single();
        const deletedFor = msg?.deleted_for || [];
        if (!deletedFor.includes(userId)) {
            deletedFor.push(userId);
        }
        const res = await _db.from('messages').update({ deleted_for: deletedFor }).eq('id', messageId);
        return _check(res, 'softDelete');
    },

    hardDelete: async (messageId) => {
        const res = await _db.from('messages').delete().eq('id', messageId);
        return _check(res, 'hardDelete');
    }
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW MODULES: HR, SUPPLIERS, PURCHASE ORDERS, QUOTATIONS
// ═══════════════════════════════════════════════════════════════════════════

window.dbStaff = {
    fetchAll: async (branchId) => {
        const res = await _db.from('staff').select('*').eq('branch_id', branchId).order('created_at', { ascending: false });
        return _check(res, 'fetchStaff');
    },
    fetchOne: async (id) => {
        const res = await _db.from('staff').select('*').eq('id', id).single();
        return _check(res, 'fetchStaffOne');
    },
    add: async (data) => {
        const res = await _db.from('staff').insert([data]).select().single();
        return _check(res, 'addStaff');
    },
    update: async (id, data) => {
        data.updated_at = new Date().toISOString();
        const res = await _db.from('staff').update(data).eq('id', id).select().single();
        return _check(res, 'updateStaff');
    },
    delete: async (id) => {
        const res = await _db.from('staff').delete().eq('id', id);
        return _check(res, 'deleteStaff');
    }
};

window.dbAttendance = {
    fetchForDate: async (branchId, date) => {
        const res = await _db
            .from('attendance')
            .select('*, staff!inner(*)')
            .eq('staff.branch_id', branchId)
            .eq('date', date);
        return _check(res, 'fetchAttendance');
    },
    mark: async (data) => {
        // data expects { staff_id, date, status, notes }
        const res = await _db.from('attendance').upsert([data], { onConflict: 'staff_id,date' }).select().single();
        return _check(res, 'markAttendance');
    }
};

window.dbSuppliers = {
    fetchAll: async (enterpriseId) => {
        const res = await _db.from('suppliers').select('*').eq('enterprise_id', enterpriseId).order('name', { ascending: true });
        return _check(res, 'fetchSuppliers');
    },
    fetchOne: async (id) => {
        const res = await _db.from('suppliers').select('*').eq('id', id).single();
        return _check(res, 'fetchSupplierOne');
    },
    add: async (data) => {
        const res = await _db.from('suppliers').insert([data]).select().single();
        return _check(res, 'addSupplier');
    },
    update: async (id, data) => {
        const res = await _db.from('suppliers').update(data).eq('id', id).select().single();
        return _check(res, 'updateSupplier');
    },
    delete: async (id) => {
        const res = await _db.from('suppliers').delete().eq('id', id);
        return _check(res, 'deleteSupplier');
    }
};

window.dbPurchaseOrders = {
    fetchAll: async (branchId) => {
        const res = await _db.from('purchase_orders').select('*, suppliers(*)').eq('branch_id', branchId).order('created_at', { ascending: false });
        // manually fetch items later if needed, or join
        return _check(res, 'fetchPOs');
    },
    fetchWithItems: async (poId) => {
        const poRes = await _db.from('purchase_orders').select('*, suppliers(*)').eq('id', poId).single();
        const po = _check(poRes, 'fetchPO');
        if (!po) return null;
        const itemsRes = await _db.from('po_items').select('*').eq('po_id', poId);
        po.items = _check(itemsRes, 'fetchPOItems');
        return po;
    },
    create: async (poData, itemsData) => {
        const { data: po, error: poErr } = await _db.from('purchase_orders').insert([poData]).select().single();
        if (poErr) throw poErr;

        const itemsToInsert = itemsData.map(item => ({ ...item, po_id: po.id }));
        const { error: itemErr } = await _db.from('po_items').insert(itemsToInsert);
        if (itemErr) throw itemErr;

        return po;
    },
    updateStatus: async (id, status) => {
        const res = await _db.from('purchase_orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        return _check(res, 'updatePOStatus');
    }
};

window.dbQuotations = {
    fetchAll: async (branchId) => {
        const res = await _db.from('quotations').select('*').eq('branch_id', branchId).order('created_at', { ascending: false });
        return _check(res, 'fetchQuotations');
    },
    fetchWithItems: async (quoteId) => {
        const qRes = await _db.from('quotations').select('*').eq('id', quoteId).single();
        const quote = _check(qRes, 'fetchQuotation');
        if (!quote) return null;
        const itemsRes = await _db.from('quotation_items').select('*').eq('quotation_id', quoteId);
        quote.items = _check(itemsRes, 'fetchQuotationItems');
        return quote;
    },
    create: async (quoteData, itemsData) => {
        const { data: quote, error: qErr } = await _db.from('quotations').insert([quoteData]).select().single();
        if (qErr) throw qErr;

        const itemsToInsert = itemsData.map(item => ({ ...item, quotation_id: quote.id }));
        const { error: itemErr } = await _db.from('quotation_items').insert(itemsToInsert);
        if (itemErr) {
            // Rollback: delete the orphaned quotation
            await _db.from('quotations').delete().eq('id', quote.id);
            throw itemErr;
        }

        return quote;
    },
    updateStatus: async (id, status) => {
        const res = await _db.from('quotations').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
        return _check(res, 'updateQuotationStatus');
    },
    delete: async (id) => {
        const res = await _db.from('quotations').delete().eq('id', id);
        return _check(res, 'deleteQuotation');
    }
};

window.dbDocuments = {
    fetchAll: async (branchId) => {
        const res = await _db.from('documents').select('*, document_items(*)').eq('branch_id', branchId).order('created_at', { ascending: false });
        return _check(res, 'fetchDocuments');
    },
    fetchOne: async (id) => {
        const res = await _db.from('documents').select('*, document_items(*)').eq('id', id).single();
        return _check(res, 'fetchOneDocument');
    },
    fetchInvoices: async (branchId) => {
        const res = await _db.from('documents').select('*, document_items(*)').eq('branch_id', branchId).eq('type', 'invoice').order('created_at', { ascending: false });
        return _check(res, 'fetchInvoices');
    },
    add: async (data, itemsData = []) => {
        const { data: doc, error: docErr } = await _db.from('documents').insert([data]).select().single();
        if (docErr) throw docErr;

        if (itemsData && itemsData.length > 0) {
            const itemsToInsert = itemsData.map(item => ({ ...item, document_id: doc.id }));
            const { error: itemErr } = await _db.from('document_items').insert(itemsToInsert);
            if (itemErr) {
                // Rollback if item inserts fail
                await _db.from('documents').delete().eq('id', doc.id);
                throw itemErr;
            }
        }
        return doc;
    },
    delete: async (id) => {
        const res = await _db.from('documents').delete().eq('id', id);
        return _check(res, 'deleteDocument');
    }
};
