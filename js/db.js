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

    /** Create a new branch */
    add: async (ownerId, { name, location, manager, pin, target, owner_email, currency }) => {
        const payload = { owner_id: ownerId, name, location, manager, pin, target, owner_email };
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

    /** Reset branch PIN */
    updatePin: async (branchId, newPin) => {
        const res = await _db
            .from('branches')
            .update({ pin: newPin })
            .eq('id', branchId);
        return _check(res, 'updateBranchPin');
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
            low_stock_notifications: profileData.low_stock_notifications
        };
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
