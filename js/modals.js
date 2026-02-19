// ── Modal HTML Templates & Form Handlers ──────────────────────────────────

window.getModalHTML = function (type, data) {
    switch (type) {

        /* ── Assign Task (Owner) ─────────────────── */
        case 'assignTask': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Assign New Task</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAssignTask(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Assign to Branch</label>
                    <select id="taskBranch" class="form-input">
                        ${state.branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                    <input type="text" id="taskTitle" required class="form-input" placeholder="Enter task title">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                    <textarea id="taskDesc" rows="2" class="form-input" placeholder="Add details..."></textarea>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select id="taskPriority" class="form-input">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                        <input type="date" id="taskDeadline" required class="form-input">
                    </div>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Assign Task</button>
                </div>
            </form>
        </div>`;

        /* ── Add Sale (Branch) ───────────────────── */
        case 'addSale': {
            const inventory = data || []; // Expect inventory array passed as data

            // Helper to generate options
            const productOptions = inventory.map(item => `
                <option value="${item.id}" data-price="${item.price}" data-name="${item.name}">
                    ${item.name} (${item.quantity} in stock) - ${fmt.currency(item.price)}
                </option>
            `).join('');

            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Record New Sale</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddSale(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input type="text" id="saleCustomer" class="form-input" placeholder="Walk-in Customer">
                </div>
                
                <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                        <div class="flex gap-2">
                            <select id="saleProduct" class="form-input flex-1" onchange="updateSaleTotal()">
                                <option value="" disabled selected>Select a product...</option>
                                ${productOptions}
                            </select>
                            <button type="button" onclick="refreshSaleProducts()" class="p-2 text-gray-500 hover:text-indigo-600 border border-gray-300 rounded-lg" title="Refresh Products">
                                <i data-lucide="refresh-cw" class="w-5 h-5"></i>
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="number" id="saleQty" min="1" value="1" class="form-input" oninput="updateSaleTotal()">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
                            <input type="number" id="saleAmount" required step="0.01" min="0.01" class="form-input font-bold text-emerald-600" placeholder="0.00">
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select id="salePayment" class="form-input">
                        <option value="cash">Cash</option>
                        <option value="card">Credit Card</option>
                        <option value="transfer">Bank Transfer</option>
                        <option value="mobile">Mobile Money</option>
                    </select>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary btn-success justify-center">Record Sale</button>
                </div>
            </form>

        </div>`;
        }

        /* ── Add Expense (Branch) ────────────────── */
        case 'addExpense': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add Expense</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddExpense(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select id="expenseCategory" class="form-input">
                        <option value="supplies">Supplies</option>
                        <option value="utilities">Utilities</option>
                        <option value="salary">Salary</option>
                        <option value="rent">Rent</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="marketing">Marketing</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" id="expenseDesc" required class="form-input" placeholder="Enter description">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="number" id="expenseAmount" required step="0.01" min="0.01" class="form-input" placeholder="0.00">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary btn-danger justify-center">Add Expense</button>
                </div>
            </form>
        </div>`;

        /* ── Add Customer (Branch) ───────────────── */
        case 'addCustomer': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add New Customer</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddCustomer(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="customerName" required class="form-input" placeholder="Enter full name">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" id="customerPhone" class="form-input" placeholder="+1 (555) 000-0000">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="customerEmail" class="form-input" placeholder="customer@example.com">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Add Customer</button>
                </div>
            </form>
        </div>`;

        /* ── Reset Branch PIN (Owner) ────────────── */
        case 'resetPin': {
            const branch = state.branches.find(b => b.id === data);
            if (!branch) return null;
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Reset Branch PIN</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                <i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"></i>
                <p class="text-sm text-yellow-800">You are resetting the PIN for <strong>${branch.name}</strong>. The branch will need to use the new PIN to log in.</p>
            </div>
            <form onsubmit="handleResetPin(event, '${data}')" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">New 6-Digit PIN</label>
                    <input type="password" id="newPin" required maxlength="6" pattern="[0-9]{6}" class="form-input text-center tracking-widest text-lg" placeholder="••••••">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
                    <input type="password" id="confirmPin" required maxlength="6" pattern="[0-9]{6}" class="form-input text-center tracking-widest text-lg" placeholder="••••••">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Reset PIN</button>
                </div>
            </form>
        </div>`;
        }

        /* ── Add Branch (Owner) ─────────────────── */
        case 'addBranch': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add New Branch</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddBranch(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                    <input type="text" id="branchName" required class="form-input" placeholder="e.g. Westside Branch">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" id="branchLocation" class="form-input" placeholder="e.g. 123 Main St">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                    <input type="text" id="branchManager" class="form-input" placeholder="Manager's full name">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Initial PIN (6 digits)</label>
                    <input type="password" id="branchPin" required maxlength="6" pattern="[0-9]{6}" class="form-input text-center tracking-widest text-lg" placeholder="••••••">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Sales Target ($)</label>
                    <input type="number" id="branchTarget" required class="form-input" placeholder="15000">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Create Branch</button>
                </div>
            </form>
        </div>`;

        /* ── Add Note (Branch) ───────────────────── */
        case 'addNote': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add Note</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddNote(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="noteTitle" required class="form-input" placeholder="Note title">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea id="noteContent" required rows="5" class="form-input" placeholder="Write your note..."></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                    <select id="noteTag" class="form-input">
                        <option value="general">General</option>
                        <option value="important">Important</option>
                        <option value="reminder">Reminder</option>
                        <option value="incident">Incident</option>
                    </select>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Save Note</button>
                </div>
            </form>
        </div>`;

        /* ── Add Loan/Income (Branch) ────────────── */
        case 'addLoan': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Record Loan / Income</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddLoan(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select id="loanType" class="form-input">
                        <option value="income">Other Income</option>
                        <option value="loan_given">Loan Given</option>
                        <option value="loan_received">Loan Received</option>
                        <option value="repayment">Repayment Received</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Party (Name)</label>
                    <input type="text" id="loanParty" class="form-input" placeholder="Customer or entity name">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="number" id="loanAmount" required step="0.01" class="form-input" placeholder="0.00">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea id="loanNotes" rows="2" class="form-input" placeholder="Additional details..."></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Save Record</button>
                </div>
            </form>
        </div>`;

        /* ── Add Inventory Item (Branch) ─────────── */
        case 'addInventoryItem': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add Inventory Item</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddInventoryItem(event)" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input type="text" id="itemName" required class="form-input" placeholder="e.g. Product A">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" id="itemSku" class="form-input" placeholder="PRD-001" value="${data && data.suggestedSku ? data.suggestedSku : ''}">
                    </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select id="itemCategory" class="form-input">
                        <option value="General">General</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Groceries">Groceries</option>
                        <option value="Home & Garden">Home & Garden</option>
                        <option value="Health & Beauty">Health & Beauty</option>
                        <option value="Stationery">Stationery</option>
                        <option value="Services">Services</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input type="number" id="itemPrice" required step="0.01" min="0" class="form-input" placeholder="0.00">
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="number" id="itemQty" required min="0" class="form-input" placeholder="0">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Min. Threshold</label>
                        <input type="number" id="itemMinThreshold" required min="0" class="form-input" placeholder="10">
                    </div>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Add Item</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Sale ───────────────────────────── */
        case 'editSale': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Sale</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditSale(event, '${data.id}')" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input type="text" id="editSaleCustomer" value="${data.customer}" class="form-input">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Items / Description</label>
                    <input type="text" id="editSaleItems" value="${data.items || ''}" class="form-input">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                        <input type="number" id="editSaleAmount" value="${data.amount}" required step="0.01" min="0.01" class="form-input">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select id="editSalePayment" class="form-input">
                            <option value="cash" ${data.payment === 'cash' ? 'selected' : ''}>Cash</option>
                            <option value="card" ${data.payment === 'card' ? 'selected' : ''}>Credit Card</option>
                            <option value="transfer" ${data.payment === 'transfer' ? 'selected' : ''}>Bank Transfer</option>
                            <option value="mobile" ${data.payment === 'mobile' ? 'selected' : ''}>Mobile Money</option>
                        </select>
                    </div>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Sale</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Inventory Item ─────────────────── */
        case 'editInventoryItem': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Item</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditInventoryItem(event, '${data.id}')" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input type="text" id="editItemName" value="${data.name}" required class="form-input">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" id="editItemSku" value="${data.sku || ''}" class="form-input">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="editItemCategory" class="form-input">
                            <option value="General" ${data.category === 'General' ? 'selected' : ''}>General</option>
                            <option value="Electronics" ${data.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
                            <option value="Clothing" ${data.category === 'Clothing' ? 'selected' : ''}>Clothing</option>
                            <option value="Groceries" ${data.category === 'Groceries' ? 'selected' : ''}>Groceries</option>
                            <option value="Home & Garden" ${data.category === 'Home & Garden' ? 'selected' : ''}>Home & Garden</option>
                            <option value="Health & Beauty" ${data.category === 'Health & Beauty' ? 'selected' : ''}>Health & Beauty</option>
                            <option value="Stationery" ${data.category === 'Stationery' ? 'selected' : ''}>Stationery</option>
                            <option value="Services" ${data.category === 'Services' ? 'selected' : ''}>Services</option>
                            <option value="Other" ${data.category === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input type="number" id="editItemPrice" value="${data.price}" required step="0.01" min="0" class="form-input">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="number" id="editItemQty" value="${data.quantity}" required min="0" class="form-input">
                    </div>
                </div>
                <div class="pt-2">
                    <label class="block text-sm font-medium text-gray-700 mb-1">Min. Threshold</label>
                    <input type="number" id="editItemMinThreshold" value="${data.min_threshold}" required min="0" class="form-input">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Item</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Note ───────────────────────────── */
        case 'editNote': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Note</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditNote(event, '${data.id}')" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="editNoteTitle" value="${data.title}" required class="form-input">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea id="editNoteContent" required rows="5" class="form-input">${data.content}</textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tag</label>
                    <select id="editNoteTag" class="form-input">
                        <option value="general" ${data.tag === 'general' ? 'selected' : ''}>General</option>
                        <option value="important" ${data.tag === 'important' ? 'selected' : ''}>Important</option>
                        <option value="reminder" ${data.tag === 'reminder' ? 'selected' : ''}>Reminder</option>
                        <option value="incident" ${data.tag === 'incident' ? 'selected' : ''}>Incident</option>
                    </select>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Note</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Expense ────────────────────────── */
        case 'editExpense': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Expense</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditExpense(event, '${data.id}')" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select id="editExpenseCategory" class="form-input">
                        <option value="supplies" ${data.category === 'supplies' ? 'selected' : ''}>Supplies</option>
                        <option value="utilities" ${data.category === 'utilities' ? 'selected' : ''}>Utilities</option>
                        <option value="salary" ${data.category === 'salary' ? 'selected' : ''}>Salary</option>
                        <option value="rent" ${data.category === 'rent' ? 'selected' : ''}>Rent</option>
                        <option value="maintenance" ${data.category === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="marketing" ${data.category === 'marketing' ? 'selected' : ''}>Marketing</option>
                        <option value="other" ${data.category === 'other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" id="editExpenseDesc" value="${data.description}" required class="form-input">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="number" id="editExpenseAmount" value="${data.amount}" required step="0.01" min="0.01" class="form-input">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary btn-danger justify-center">Update Expense</button>
                </div>
            </form>
        </div>`;

        case 'editCustomer': return _getEditCustomerHTML(data);
        case 'editLoan': return _getEditLoanHTML(data);

        default: return null;
    }
};

/* ── Edit Customer ───────────────────────── */
function _getEditCustomerHTML(data) {
    return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Customer</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditCustomer(event, '${data.id}')" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="editCustomerName" value="${data.name}" required class="form-input">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" id="editCustomerPhone" value="${data.phone || ''}" class="form-input">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="editCustomerEmail" value="${data.email || ''}" class="form-input">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Customer</button>
                </div>
            </form>
        </div>`;
}

/* ── Edit Loan ───────────────────────────── */
function _getEditLoanHTML(data) {
    return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Record</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditLoan(event, '${data.id}')" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select id="editLoanType" class="form-input">
                        <option value="income" ${data.type === 'income' ? 'selected' : ''}>Other Income</option>
                        <option value="loan_given" ${data.type === 'loan_given' ? 'selected' : ''}>Loan Given</option>
                        <option value="loan_received" ${data.type === 'loan_received' ? 'selected' : ''}>Loan Received</option>
                        <option value="repayment" ${data.type === 'repayment' ? 'selected' : ''}>Repayment Received</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Party (Name)</label>
                    <input type="text" id="editLoanParty" value="${data.party || ''}" class="form-input">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="number" id="editLoanAmount" value="${data.amount}" required step="0.01" class="form-input">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea id="editLoanNotes" rows="2" class="form-input">${data.notes || ''}</textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Record</button>
                </div>
            </form>
        </div>`;
}

// ── Shared loading button helper ──────────────────────────────────────────
function _setSubmitLoading(form, loading, originalText) {
    const btn = form.querySelector('[type="submit"]');
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? 'Saving…' : originalText;
}

// ═══════════════════════════════════════════════════════════════════════════
// Form Submit Handlers  (all async — write to Supabase)
// ═══════════════════════════════════════════════════════════════════════════

window.handleAssignTask = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Assign Task');
    try {
        const branchId = document.getElementById('taskBranch').value;
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDesc').value;
        const priority = document.getElementById('taskPriority').value;
        const deadline = document.getElementById('taskDeadline').value;
        await dbTasks.add(branchId, { title, description, priority, deadline });
        closeModal();
        const branch = state.branches.find(b => b.id === branchId);
        addActivity('task_assigned', `New task assigned: ${title}`, branch?.name || 'Branch');
        showToast('Task assigned successfully!', 'success');
        switchView('tasks');
    } catch (err) {
        showToast('Failed to assign task: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Assign Task');
    }
};

window.handleAddSale = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Record Sale');
    try {
        const amount = parseFloat(document.getElementById('saleAmount').value);
        const customer = document.getElementById('saleCustomer').value || 'Walk-in Customer';
        const payment = document.getElementById('salePayment').value;

        // Build items string from selection
        const productSelect = document.getElementById('saleProduct');
        const qty = document.getElementById('saleQty').value;
        let items = '';

        if (productSelect && productSelect.selectedIndex > 0) {
            const option = productSelect.options[productSelect.selectedIndex];
            const name = option.getAttribute('data-name');
            items = `${qty}x ${name}`;

            // Deduct stock (optional but recommended)
            const productId = productSelect.value;
            // Note: In a real app we'd handle atomic decrements. For now we assume db update.
            // We could call dbInventory.updateQty here if we wanted to decrement stock immediately.
        } else {
            // Fallback if they didn't select (shouldn't happen with required)
            items = 'Custom Item';
        }

        await dbSales.add(state.branchId, { customer, items, amount, payment });
        closeModal();
        addActivity('sale', `New sale to ${customer}`, state.currentUser, amount);
        showToast(`Sale of ${fmt.currency(amount)} recorded!`, 'success');
        switchView('sales');
    } catch (err) {
        showToast('Failed to record sale: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Record Sale');
    }
};

window.handleAddExpense = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Add Expense');
    try {
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDesc').value;
        await dbExpenses.add(state.branchId, { category, description, amount });
        closeModal();
        addActivity('expense', `Expense: ${description}`, state.currentUser, amount);
        showToast(`Expense of ${fmt.currency(amount)} recorded!`, 'success');
        switchView('expenses');
    } catch (err) {
        showToast('Failed to record expense: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Add Expense');
    }
};

window.handleAddCustomer = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Add Customer');
    try {
        const name = document.getElementById('customerName').value;
        const phone = document.getElementById('customerPhone').value;
        const email = document.getElementById('customerEmail').value;
        await dbCustomers.add(state.branchId, { name, phone, email });
        closeModal();
        showToast('Customer added successfully!', 'success');
        switchView('customers');
    } catch (err) {
        showToast('Failed to add customer: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Add Customer');
    }
};

window.handleResetPin = async function (e, branchId) {
    e.preventDefault();
    const newPin = document.getElementById('newPin').value;
    const confirmPin = document.getElementById('confirmPin').value;
    if (newPin !== confirmPin) { showToast('PINs do not match!', 'error'); return; }
    if (!/^\d{6}$/.test(newPin)) { showToast('PIN must be 6 digits', 'error'); return; }
    _setSubmitLoading(e.target, true, 'Reset PIN');
    try {
        await dbBranches.updatePin(branchId, newPin);
        // Update local state too
        const branch = state.branches.find(b => b.id === branchId);
        if (branch) branch.pin = newPin;
        closeModal();
        showToast(`PIN for ${branch?.name || 'branch'} reset successfully!`, 'success');
    } catch (err) {
        showToast('Failed to reset PIN: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Reset PIN');
    }
};

window.handleAddBranch = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Create Branch');
    try {
        const name = document.getElementById('branchName').value;
        const location = document.getElementById('branchLocation').value;
        const manager = document.getElementById('branchManager').value || 'Unassigned';
        const pin = document.getElementById('branchPin').value;
        const target = parseFloat(document.getElementById('branchTarget').value) || 10000;
        // Fix: Pass owner_email to dbBranches.add so it's saved in the database
        const branch = await dbBranches.add(state.ownerId, {
            name,
            location,
            manager,
            pin,
            target,
            owner_email: state.currentUser // Used for login lookup
        });
        state.branches.push(branch);
        closeModal();
        showToast(`Branch "${name}" created!`, 'success');
        switchView('branches');
    } catch (err) {
        showToast('Failed to create branch: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Create Branch');
    }
};

window.handleAddNote = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Save Note');
    try {
        const title = document.getElementById('noteTitle').value;
        const content = document.getElementById('noteContent').value;
        const tag = document.getElementById('noteTag').value;
        await dbNotes.add(state.branchId, { title, content, tag });
        closeModal();
        showToast('Note saved!', 'success');
        switchView('notes');
    } catch (err) {
        showToast('Failed to save note: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Save Note');
    }
};

window.handleAddLoan = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Save Record');
    try {
        const type = document.getElementById('loanType').value;
        const party = document.getElementById('loanParty').value || 'Unknown';
        const amount = parseFloat(document.getElementById('loanAmount').value);
        const notes = document.getElementById('loanNotes').value;
        await dbLoans.add(state.branchId, { type, party, amount, notes });
        closeModal();
        showToast('Record saved!', 'success');
        switchView('loans');
    } catch (err) {
        showToast('Failed to save record: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Save Record');
    }
};

window.handleAddInventoryItem = async function (e) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Add Item');
    try {
        const name = document.getElementById('itemName').value;
        const sku = document.getElementById('itemSku').value;
        const category = document.getElementById('itemCategory').value;
        const price = parseFloat(document.getElementById('itemPrice').value) || 0;
        const quantity = parseInt(document.getElementById('itemQty').value, 10) || 0;
        const min_threshold = parseInt(document.getElementById('itemMinThreshold').value, 10) || 10;

        await dbInventory.add(state.branchId, { name, sku, category, quantity, min_threshold, price });
        closeModal();
        showToast('Item added to inventory!', 'success');
        switchView('inventory');
    } catch (err) {
        showToast('Failed to add item: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Add Item');
    }
};

window.handleEditSale = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Sale');
    try {
        const amount = parseFloat(document.getElementById('editSaleAmount').value);
        const customer = document.getElementById('editSaleCustomer').value;
        const items = document.getElementById('editSaleItems').value;
        const payment = document.getElementById('editSalePayment').value;
        await dbSales.update(id, { customer, items, amount, payment });
        closeModal();
        showToast('Sale updated successfully', 'success');
        switchView('sales');
    } catch (err) {
        showToast('Failed to update sale: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Sale');
    }
};

window.handleEditInventoryItem = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Item');
    try {
        const name = document.getElementById('editItemName').value;
        const sku = document.getElementById('editItemSku').value;
        const category = document.getElementById('editItemCategory').value;
        const price = parseFloat(document.getElementById('editItemPrice').value);
        const quantity = parseInt(document.getElementById('editItemQty').value, 10);
        const min_threshold = parseInt(document.getElementById('editItemMinThreshold').value, 10);
        await dbInventory.update(id, { name, sku, category, price, quantity, min_threshold });
        closeModal();
        showToast('Item updated successfully', 'success');
        switchView('inventory');
    } catch (err) {
        showToast('Failed to update item: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Item');
    }
};

window.handleEditNote = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Note');
    try {
        const title = document.getElementById('editNoteTitle').value;
        const content = document.getElementById('editNoteContent').value;
        const tag = document.getElementById('editNoteTag').value;
        await dbNotes.update(id, { title, content, tag });
        closeModal();
        showToast('Note updated successfully', 'success');
        switchView('notes');
    } catch (err) {
        showToast('Failed to update note: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Note');
    }
};

window.handleEditExpense = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Expense');
    try {
        const amount = parseFloat(document.getElementById('editExpenseAmount').value);
        const category = document.getElementById('editExpenseCategory').value;
        const description = document.getElementById('editExpenseDesc').value;
        await dbExpenses.update(id, { category, description, amount });
        closeModal();
        showToast('Expense updated successfully', 'success');
        switchView('expenses');
    } catch (err) {
        showToast('Failed to update expense: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Expense');
    }
};

window.handleEditCustomer = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Customer');
    try {
        const name = document.getElementById('editCustomerName').value;
        const phone = document.getElementById('editCustomerPhone').value;
        const email = document.getElementById('editCustomerEmail').value;
        await dbCustomers.update(id, { name, phone, email });
        closeModal();
        showToast('Customer updated successfully', 'success');
        switchView('customers');
    } catch (err) {
        showToast('Failed to update customer: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Customer');
    }
};

window.handleEditLoan = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Record');
    try {
        const type = document.getElementById('editLoanType').value;
        const party = document.getElementById('editLoanParty').value;
        const amount = parseFloat(document.getElementById('editLoanAmount').value);
        const notes = document.getElementById('editLoanNotes').value;
        await dbLoans.update(id, { type, party, amount, notes });
        closeModal();
        showToast('Record updated successfully', 'success');
        switchView('loans');
    } catch (err) {
        showToast('Failed to update record: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Update Record');
    }
};

/* ── Close modal on backdrop click ──────────────── */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalOverlay')
        ?.addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
});
