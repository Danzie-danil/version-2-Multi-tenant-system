// ── Modal HTML Templates & Form Handlers ──────────────────────────────────

window.getModalHTML = function (type, data) {
    switch (type) {
        /* ── Request Attention (Branch -> Admin) ─── */
        case 'requestAttention': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <i data-lucide="message-square" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Request Attention</h3>
                        <p class="text-xs text-gray-500 font-medium">Message for Approval concerning this ${data.type}</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleRequestAttention(event)" class="space-y-4">
                <input type="hidden" id="reqType" value="${data.type}">
                <input type="hidden" id="reqRelatedId" value="${data.id}">
                <input type="hidden" id="reqSummary" value="${data.summary}">
                
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                    <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Related to</p>
                    <p class="text-sm font-semibold text-gray-800">${data.summary}</p>
                </div>

                <div>
                    <label for="reqSubject" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input type="text" id="reqSubject" required class="form-input" placeholder="What's this about?">
                </div>
                <div>
                    <label for="reqPriority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select id="reqPriority" class="form-input">
                        <option value="low">Low - General Feedback</option>
                        <option value="medium" selected>Medium - Needs Review</option>
                        <option value="high">High - Immediate Attention</option>
                    </select>
                </div>
                <div>
                    <label for="reqMessage" class="block text-sm font-medium text-gray-700 mb-1">Your Message / Suggestion</label>
                    <textarea id="reqMessage" required rows="4" class="form-input" placeholder="Explain your proposal or concern..."></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Request Approval</button>
                </div>
            </form>
        </div>`;


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
                    <label for="taskBranch" class="block text-sm font-medium text-gray-700 mb-1">Assign to Branch</label>
                    <select id="taskBranch" class="form-input">
                        ${state.branches.map(b => `<option value="${b.id}">${b.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="taskTitle" class="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                    <input type="text" id="taskTitle" required class="form-input" placeholder="Enter task title">
                </div>
                <div>
                    <label for="taskDesc" class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                    <textarea id="taskDesc" rows="2" class="form-input" placeholder="Add details..."></textarea>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="taskPriority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select id="taskPriority" class="form-input">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label for="taskDeadline" class="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
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
                    <label for="saleCustomer" class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input type="text" id="saleCustomer" class="form-input" placeholder="Walk-in Customer">
                </div>
                
                <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
                    <div>
                        <label for="saleProduct" class="block text-sm font-medium text-gray-700 mb-1">Select Product</label>
                        <div class="flex gap-2">
                            <select id="saleProduct" class="form-input flex-1" onchange="updateSaleTotal()">
                                <option value="" disabled selected>Select a product...</option>
                                ${productOptions}
                            </select>
                            <button type="button" onclick="refreshSaleProducts()" class="p-2 text-gray-500 hover:text-indigo-600 border border-gray-300 rounded-lg flex items-center justify-center min-w-[38px] min-h-[38px]" title="Refresh Products">
                                <i data-lucide="refresh-cw" class="w-4 h-4"></i>
                            </button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label for="saleQty" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input type="text" inputmode="decimal" id="saleQty" value="1" class="form-input number-format" oninput="updateSaleTotal()">
                        </div>
                        <div>
                            <label for="saleAmount" class="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
                            <input type="text" inputmode="decimal" id="saleAmount" required class="form-input number-format font-bold text-emerald-600" placeholder="0.00">
                        </div>
                    </div>
                </div>

                <div>
                    <label for="salePayment" class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
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
                    <label for="expenseCategory" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
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
                    <label for="expenseDesc" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" id="expenseDesc" required class="form-input" placeholder="Enter description">
                </div>
                <div>
                    <label for="expenseAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="text" inputmode="decimal" id="expenseAmount" required class="form-input number-format" placeholder="0">
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
                    <label for="customerName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="customerName" required class="form-input" placeholder="Enter full name">
                </div>
                <div>
                    <label for="customerPhone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" id="customerPhone" class="form-input" placeholder="+1 (555) 000-0000">
                </div>
                <div>
                    <label for="customerEmail" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                    <label for="newPin" class="block text-sm font-medium text-gray-700 mb-1">New 6-Digit PIN</label>
                    <div class="relative">
                        <input type="password" id="newPin" required maxlength="6" pattern="[0-9]{6}" class="form-input text-center tracking-widest pr-10" placeholder="••••••">
                        <button type="button" onclick="togglePasswordVisibility('newPin', this)"
                            class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none">
                            <i data-lucide="eye" class="w-4 h-4 text-gray-400"></i>
                        </button>
                    </div>
                </div>
                <div>
                    <label for="confirmPin" class="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
                    <div class="relative">
                        <input type="password" id="confirmPin" required maxlength="6" pattern="[0-9]{6}" class="form-input text-center tracking-widest pr-10" placeholder="••••••">
                        <button type="button" onclick="togglePasswordVisibility('confirmPin', this)"
                            class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none">
                            <i data-lucide="eye" class="w-4 h-4 text-gray-400"></i>
                        </button>
                    </div>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Reset PIN</button>
                </div>
            </form>
        </div>`;
        }

        /* ── Add Branch (Owner) ─────────────────── */
        case 'addBranch':
            // Default to Owner's chosen global currency
            const defCurr = (state.profile && state.profile.currency) ? state.profile.currency : 'USD';

            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Add New Branch</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddBranch(event)" class="space-y-4">
                <div>
                    <label for="branchName" class="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                    <input type="text" id="branchName" required class="form-input" placeholder="e.g. Westside Branch">
                </div>
                <div>
                    <label for="branchLocation" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" id="branchLocation" class="form-input" placeholder="e.g. 123 Main St">
                </div>
                <div>
                    <label for="branchManager" class="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                    <input type="text" id="branchManager" class="form-input" placeholder="Manager's full name">
                </div>
                <div>
                    <label for="branchOwnerEmail" class="block text-sm font-medium text-gray-700 mb-1">Admin Owner Email (for App Login)</label>
                    <input type="email" id="branchOwnerEmail" required class="form-input" placeholder="admin@example.com" autocomplete="email">
                    <p class="text-xs text-gray-400 mt-1">Branch will use this email alongside their Name & PIN to log in.</p>
                </div>
                <div>
                    <label for="branchPin" class="block text-sm font-medium text-gray-700 mb-1">Initial PIN (6 digits)</label>
                    <div class="relative">
                        <input type="password" id="branchPin" required maxlength="6" pattern="[0-9]{6}" class="form-input text-center tracking-widest pr-10" placeholder="••••••">
                        <button type="button" onclick="togglePasswordVisibility('branchPin', this)"
                            class="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none">
                            <i data-lucide="eye" class="w-4 h-4 text-gray-400"></i>
                        </button>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="branchCurrency" class="block text-sm font-medium text-gray-700 mb-1">Branch Currency</label>
                        <select id="branchCurrency" class="form-input w-full">
                            <option value="USD" ${defCurr === 'USD' ? 'selected' : ''}>USD ($)</option>
                            <option value="EUR" ${defCurr === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                            <option value="GBP" ${defCurr === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                            <option value="KES" ${defCurr === 'KES' ? 'selected' : ''}>KES (KSh)</option>
                            <option value="TZS" ${defCurr === 'TZS' ? 'selected' : ''}>TZS (TSh)</option>
                            <option value="NGN" ${defCurr === 'NGN' ? 'selected' : ''}>NGN (₦)</option>
                            <option value="UGX" ${defCurr === 'UGX' ? 'selected' : ''}>UGX (USh)</option>
                            <option value="ZAR" ${defCurr === 'ZAR' ? 'selected' : ''}>ZAR (R)</option>
                            <option value="INR" ${defCurr === 'INR' ? 'selected' : ''}>INR (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label for="branchTarget" class="block text-sm font-medium text-gray-700 mb-1">Sales Target</label>
                        <input type="text" inputmode="decimal" id="branchTarget" required class="form-input number-format" placeholder="15000">
                    </div>
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Create Branch</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Branch (Owner) ─────────────────── */
        case 'editBranch':
            // Provide a fallback if branch lacks a currency
            const defaultEditCurr = data.currency || (state.profile?.currency || 'USD');
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Edit Branch Settings</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditBranch(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editBranchName" class="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                    <input type="text" id="editBranchName" value="${data.name}" required class="form-input">
                </div>
                <div>
                    <label for="editBranchLocation" class="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" id="editBranchLocation" value="${data.location || ''}" class="form-input">
                </div>
                <div>
                    <label for="editBranchManager" class="block text-sm font-medium text-gray-700 mb-1">Manager Name</label>
                    <input type="text" id="editBranchManager" value="${data.manager || ''}" class="form-input">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label for="editBranchCurrency" class="block text-sm font-medium text-gray-700 mb-1">Branch Currency</label>
                        <select id="editBranchCurrency" class="form-input w-full">
                            <option value="USD" ${defaultEditCurr === 'USD' ? 'selected' : ''}>USD ($)</option>
                            <option value="EUR" ${defaultEditCurr === 'EUR' ? 'selected' : ''}>EUR (€)</option>
                            <option value="GBP" ${defaultEditCurr === 'GBP' ? 'selected' : ''}>GBP (£)</option>
                            <option value="KES" ${defaultEditCurr === 'KES' ? 'selected' : ''}>KES (KSh)</option>
                            <option value="TZS" ${defaultEditCurr === 'TZS' ? 'selected' : ''}>TZS (TSh)</option>
                            <option value="NGN" ${defaultEditCurr === 'NGN' ? 'selected' : ''}>NGN (₦)</option>
                            <option value="UGX" ${defaultEditCurr === 'UGX' ? 'selected' : ''}>UGX (USh)</option>
                            <option value="ZAR" ${defaultEditCurr === 'ZAR' ? 'selected' : ''}>ZAR (R)</option>
                            <option value="INR" ${defaultEditCurr === 'INR' ? 'selected' : ''}>INR (₹)</option>
                        </select>
                    </div>
                    <div>
                        <label for="editBranchTarget" class="block text-sm font-medium text-gray-700 mb-1">Sales Target ($)</label>
                        <input type="text" inputmode="decimal" id="editBranchTarget" value="${data.target}" required class="form-input number-format">
                    </div>
                </div>
                <div class="flex gap-3 pt-4">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Save Changes</button>
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
                    <label for="noteTitle" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="noteTitle" required class="form-input" placeholder="Note title">
                </div>
                <div>
                    <label for="noteContent" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea id="noteContent" required rows="5" class="form-input" placeholder="Write your note..."></textarea>
                </div>
                <div>
                    <label for="noteTag" class="block text-sm font-medium text-gray-700 mb-1">Tag</label>
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
                    <label for="loanType" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select id="loanType" class="form-input">
                        <option value="income">Other Income</option>
                        <option value="loan_given">Loan Given</option>
                        <option value="loan_received">Loan Received</option>
                        <option value="repayment">Repayment Received</option>
                    </select>
                </div>
                <div>
                    <label for="loanParty" class="block text-sm font-medium text-gray-700 mb-1">Party (Name)</label>
                    <input type="text" id="loanParty" class="form-input" placeholder="Customer or entity name">
                </div>
                <div>
                    <label for="loanAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="text" inputmode="decimal" id="loanAmount" required class="form-input number-format" placeholder="0">
                </div>
                <div>
                    <label for="loanNotes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea id="loanNotes" rows="2" class="form-input" placeholder="Additional details..."></textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Save Record</button>
                </div>
            </form>
        </div>`;

        /* ── Add Inventory Item (Request Approval) ─── */
        case 'addInventoryItem': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">Request New Stock</h3>
                    <p class="text-xs text-gray-500 font-medium">Additions require approval</p>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleAddInventoryItem(event)" class="space-y-4">
                <div class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 mb-4">
                    <p class="text-[10px] text-blue-600 uppercase font-black tracking-wider mb-2">Item Information</p>
                    <div class="space-y-3">
                        <div>
                            <label for="itemName" class="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                            <input type="text" id="itemName" required class="form-input" placeholder="e.g. Product A">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="itemSku" class="block text-sm font-bold text-gray-700 mb-1">SKU</label>
                                <input type="text" id="itemSku" class="form-input" placeholder="PRD-001" value="${data && data.suggestedSku ? data.suggestedSku : ''}">
                            </div>
                            <div>
                                <label for="itemCategory" class="block text-sm font-bold text-gray-700 mb-1">Category</label>
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
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-4">
                    <p class="text-[10px] text-amber-600 uppercase font-black tracking-wider mb-2">Purchase & Supplier Details</p>
                    <div class="space-y-3">
                        <div>
                            <label for="itemSupplier" class="block text-sm font-bold text-gray-700 mb-1">Supplier Name</label>
                            <input type="text" id="itemSupplier" required class="form-input text-amber-900" placeholder="e.g. Acme Corp">
                        </div>
                        <div class="grid grid-cols-3 gap-3">
                            <div class="col-span-1">
                                <label for="itemQty" class="block text-sm font-bold text-gray-700 mb-1">Qty</label>
                                <input type="text" inputmode="decimal" id="itemQty" required class="form-input number-format" placeholder="0">
                            </div>
                            <div class="col-span-1">
                                <label for="itemCost" class="block text-sm font-bold text-gray-700 mb-1">Unit Cost</label>
                                <input type="text" inputmode="decimal" id="itemCost" required class="form-input number-format font-bold text-amber-600" placeholder="0.00">
                            </div>
                            <div class="col-span-1">
                                <label for="itemPrice" class="block text-sm font-bold text-gray-700 mb-1">Sale Price</label>
                                <input type="text" inputmode="decimal" id="itemPrice" required class="form-input number-format font-bold text-emerald-600" placeholder="0.00">
                            </div>
                        </div>
                        <div>
                            <label for="itemMinThreshold" class="block text-sm font-bold text-gray-700 mb-1">Min. Alert Threshold</label>
                            <input type="text" inputmode="decimal" id="itemMinThreshold" required class="form-input number-format" placeholder="10">
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center font-black">Submit for Approval</button>
                </div>
            </form>
        </div>`;

        /* ── Restock Stock (Request Approval) ───────── */
        case 'restockStock': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">Request Stock Addition</h3>
                    <p class="text-xs text-gray-500 font-medium">${data.name} (SKU: ${data.sku || 'N/A'})</p>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleRestockStock(event, '${data.id}')" class="space-y-4">
                <input type="hidden" id="restockName" value="${data.name}">
                
                <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-4">
                    <p class="text-[10px] text-amber-600 uppercase font-black tracking-wider mb-2">Purchase & Supplier Details</p>
                    <div class="space-y-3">
                        <div>
                            <label for="restockSupplier" class="block text-sm font-bold text-gray-700 mb-1">Supplier Name</label>
                            <input type="text" id="restockSupplier" required class="form-input text-amber-900" placeholder="e.g. Acme Corp">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="restockQty" class="block text-sm font-bold text-gray-700 mb-1">Quantity to Add</label>
                                <input type="text" inputmode="decimal" id="restockQty" required class="form-input number-format" placeholder="0">
                            </div>
                            <div>
                                <label for="restockCost" class="block text-sm font-bold text-gray-700 mb-1">Unit Cost</label>
                                <input type="text" inputmode="decimal" id="restockCost" required class="form-input number-format font-bold text-amber-600" placeholder="0.00">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center font-black">Submit Request</button>
                </div>
            </form>
        </div>`;

        /* ── Edit General Request (Branch) ─── */
        case 'editGeneralRequest': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <i data-lucide="edit-3" class="w-5 h-5"></i>
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900">Edit Request</h3>
                        <p class="text-xs text-gray-500 font-medium truncate w-48">${data.subject}</p>
                    </div>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditGeneralRequest(event, '${data.id}')" class="space-y-4">
                <div>
                    <label for="editReqSubject" class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input type="text" id="editReqSubject" required class="form-input" value="${data.subject}">
                </div>
                <div>
                    <label for="editReqPriority" class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select id="editReqPriority" class="form-input">
                        <option value="low" ${data.priority === 'low' ? 'selected' : ''}>Low - General Feedback</option>
                        <option value="medium" ${data.priority === 'medium' ? 'selected' : ''}>Medium - Needs Review</option>
                        <option value="high" ${data.priority === 'high' ? 'selected' : ''}>High - Immediate Attention</option>
                    </select>
                </div>
                <div>
                    <label for="editReqMessage" class="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
                    <textarea id="editReqMessage" required rows="4" class="form-input">${data.message}</textarea>
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center">Update Request</button>
                </div>
            </form>
        </div>`;

        /* ── Edit Inventory Add Request (Branch) ─── */
        case 'editInventoryAddRequest': {
            const meta = data.metadata || {};
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">Edit Stock Request</h3>
                    <p class="text-xs text-gray-500 font-medium">Update proposed item details</p>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditInventoryAddRequest(event, '${data.id}')" class="space-y-4">
                <div class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50 mb-4">
                    <p class="text-[10px] text-blue-600 uppercase font-black tracking-wider mb-2">Item Information</p>
                    <div class="space-y-3">
                        <div>
                            <label for="editItemNameAdd" class="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                            <input type="text" id="editItemNameAdd" required class="form-input" value="${meta.name || ''}">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="editItemSkuAdd" class="block text-sm font-bold text-gray-700 mb-1">SKU</label>
                                <input type="text" id="editItemSkuAdd" class="form-input" value="${meta.sku || ''}">
                            </div>
                            <div>
                                <label for="editItemCategoryAdd" class="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select id="editItemCategoryAdd" class="form-input">
                                    <option value="General" ${meta.category === 'General' ? 'selected' : ''}>General</option>
                                    <option value="Electronics" ${meta.category === 'Electronics' ? 'selected' : ''}>Electronics</option>
                                    <option value="Clothing" ${meta.category === 'Clothing' ? 'selected' : ''}>Clothing</option>
                                    <option value="Groceries" ${meta.category === 'Groceries' ? 'selected' : ''}>Groceries</option>
                                    <option value="Home & Garden" ${meta.category === 'Home & Garden' ? 'selected' : ''}>Home & Garden</option>
                                    <option value="Health & Beauty" ${meta.category === 'Health & Beauty' ? 'selected' : ''}>Health & Beauty</option>
                                    <option value="Stationery" ${meta.category === 'Stationery' ? 'selected' : ''}>Stationery</option>
                                    <option value="Services" ${meta.category === 'Services' ? 'selected' : ''}>Services</option>
                                    <option value="Other" ${meta.category === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-4">
                    <p class="text-[10px] text-amber-600 uppercase font-black tracking-wider mb-2">Purchase & Supplier Details</p>
                    <div class="space-y-3">
                        <div>
                            <label for="editItemSupplierAdd" class="block text-sm font-bold text-gray-700 mb-1">Supplier Name</label>
                            <input type="text" id="editItemSupplierAdd" required class="form-input text-amber-900" value="${meta.supplier || ''}">
                        </div>
                        <div class="grid grid-cols-3 gap-3">
                            <div class="col-span-1">
                                <label for="editItemQtyAdd" class="block text-sm font-bold text-gray-700 mb-1">Qty</label>
                                <input type="text" inputmode="decimal" id="editItemQtyAdd" required class="form-input number-format" value="${meta.quantity !== undefined ? meta.quantity : ''}">
                            </div>
                            <div class="col-span-1">
                                <label for="editItemCostAdd" class="block text-sm font-bold text-gray-700 mb-1">Unit Cost</label>
                                <input type="text" inputmode="decimal" id="editItemCostAdd" required class="form-input number-format font-bold text-amber-600" value="${meta.cost_price !== undefined ? meta.cost_price : ''}">
                            </div>
                            <div class="col-span-1">
                                <label for="editItemPriceAdd" class="block text-sm font-bold text-gray-700 mb-1">Sale Price</label>
                                <input type="text" inputmode="decimal" id="editItemPriceAdd" required class="form-input number-format font-bold text-emerald-600" value="${meta.price !== undefined ? meta.price : ''}">
                            </div>
                        </div>
                        <div>
                            <label for="editItemMinThresholdAdd" class="block text-sm font-bold text-gray-700 mb-1">Min. Alert Threshold</label>
                            <input type="text" inputmode="decimal" id="editItemMinThresholdAdd" required class="form-input number-format" value="${meta.min_threshold !== undefined ? meta.min_threshold : ''}">
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center font-black">Update Request</button>
                </div>
            </form>
        </div>`;
        }

        /* ── Edit Restock Request (Branch) ───────── */
        case 'editRestockRequest': {
            const meta = data.metadata || {};
            return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">Edit Restock Request</h3>
                    <p class="text-xs text-gray-500 font-medium">${meta.name || ''} (SKU: ${meta.sku || 'N/A'})</p>
                </div>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <form onsubmit="handleEditRestockRequest(event, '${data.id}')" class="space-y-4">
                <input type="hidden" id="editRestockName" value="${meta.name || ''}">
                <input type="hidden" id="editRestockInvId" value="${meta.inventory_id || ''}">
                
                <div class="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50 mb-4">
                    <p class="text-[10px] text-amber-600 uppercase font-black tracking-wider mb-2">Purchase & Supplier Details</p>
                    <div class="space-y-3">
                        <div>
                            <label for="editRestockSupplier" class="block text-sm font-bold text-gray-700 mb-1">Supplier Name</label>
                            <input type="text" id="editRestockSupplier" required class="form-input text-amber-900" value="${meta.supplier || ''}">
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label for="editRestockQty" class="block text-sm font-bold text-gray-700 mb-1">Quantity to Add</label>
                                <input type="text" inputmode="decimal" id="editRestockQty" required class="form-input number-format" value="${meta.quantity !== undefined ? meta.quantity : ''}">
                            </div>
                            <div>
                                <label for="editRestockCost" class="block text-sm font-bold text-gray-700 mb-1">Unit Cost</label>
                                <input type="text" inputmode="decimal" id="editRestockCost" required class="form-input number-format font-bold text-amber-600" value="${meta.cost_price !== undefined ? meta.cost_price : ''}">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary justify-center font-black">Update Request</button>
                </div>
            </form>
        </div>`;
        }

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
                    <label for="editSaleCustomer" class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                    <input type="text" id="editSaleCustomer" value="${data.customer}" class="form-input">
                </div>
                <div>
                    <label for="editSaleItems" class="block text-sm font-medium text-gray-700 mb-1">Items / Description</label>
                    <input type="text" id="editSaleItems" value="${data.items || ''}" class="form-input">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="editSaleAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                        <input type="text" inputmode="decimal" id="editSaleAmount" value="${data.amount}" required class="form-input number-format">
                    </div>
                    <div>
                        <label for="editSalePayment" class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
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
                    <label for="editItemName" class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                    <input type="text" id="editItemName" value="${data.name}" required class="form-input">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label for="editItemSku" class="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                        <input type="text" id="editItemSku" value="${data.sku || ''}" class="form-input">
                    </div>
                    <div>
                        <label for="editItemCategory" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
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
                        <label for="editItemPrice" class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                        <input type="text" inputmode="decimal" id="editItemPrice" value="${data.price}" required class="form-input number-format">
                    </div>
                    <div>
                        <label for="editItemQty" class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="text" inputmode="decimal" id="editItemQty" value="${data.quantity}" required class="form-input number-format">
                    </div>
                </div>
                <div class="pt-2">
                    <label for="editItemMinThreshold" class="block text-sm font-medium text-gray-700 mb-1">Min. Threshold</label>
                    <input type="text" inputmode="decimal" id="editItemMinThreshold" value="${data.min_threshold}" required class="form-input number-format">
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
                    <label for="editNoteTitle" class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="editNoteTitle" value="${data.title}" required class="form-input">
                </div>
                <div>
                    <label for="editNoteContent" class="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea id="editNoteContent" required rows="5" class="form-input">${data.content}</textarea>
                </div>
                <div>
                    <label for="editNoteTag" class="block text-sm font-medium text-gray-700 mb-1">Tag</label>
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
                    <label for="editExpenseCategory" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
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
                    <label for="editExpenseDesc" class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input type="text" id="editExpenseDesc" value="${data.description}" required class="form-input">
                </div>
                <div>
                    <label for="editExpenseAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="text" inputmode="decimal" id="editExpenseAmount" value="${data.amount}" required class="form-input number-format">
                </div>
                <div class="flex gap-3 pt-2">
                    <button type="button" onclick="closeModal()" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 text-sm">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary btn-danger justify-center">Update Expense</button>
                </div>
            </form>
        </div>`;

        case 'editCustomer': return _getEditCustomerHTML(data);
        case 'editLoan': return _getEditLoanHTML(data);

        /* ── Detail Views ────────────────────────── */
        case 'saleDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Sale Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Customer</p>
                    <p class="text-sm font-semibold">${data.customer || 'Walk-in'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Revenue</p>
                    <p class="text-sm font-black text-emerald-600">${fmt.currency(data.amount)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Est. Profit</p>
                    <p class="text-sm font-black text-indigo-600">${data.profit !== undefined ? fmt.currency(data.profit) : '—'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Items / Description</p>
                    <p class="text-sm font-medium text-gray-800">${data.items || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Payment</p>
                    <p class="text-sm font-semibold capitalize text-gray-700">${data.payment}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Date & Time</p>
                    <p class="text-[11px] font-medium text-gray-600">${new Date(data.created_at).toLocaleString()}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-8">
                <button onclick="openEditModal('editSale', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit
                </button>
                <button onclick="showReceiptDialog('${encodeURIComponent(JSON.stringify(data))}')" class="flex items-center justify-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors">
                    <i data-lucide="download" class="w-4 h-4"></i> Receipt
                </button>
                <button onclick="openRequestModal('sale', '${data.id}', 'Sale: ${data.customer || 'Walk-in'} - ${fmt.currency(data.amount)}')" class="flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <i data-lucide="message-square" class="w-4 h-4"></i> Request
                </button>
                <button onclick="confirmDelete('sale', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
                </button>
            </div>
        </div>`;

        case 'inventoryDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Product Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-2">
                    <h4 class="text-lg font-bold text-indigo-900 mb-1">${data.name}</h4>
                    <p class="text-xs text-indigo-600 font-medium">SKU: ${data.sku || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Category</p>
                    <p class="text-sm font-semibold">${data.category || 'General'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Unit Price</p>
                    <p class="text-sm font-bold text-gray-900">${fmt.currency(data.price)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">In Stock</p>
                    <p class="text-sm font-bold ${data.quantity <= data.min_threshold ? 'text-red-600' : 'text-emerald-600'}">${data.quantity} units</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                    <p class="text-[10px] text-gray-500 uppercase font-bold">Min Threshold</p>
                    <p class="text-sm font-semibold">${data.min_threshold} units</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-8">
                <button onclick="openEditModal('editInventoryItem', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit Product
                </button>
                <button onclick="openModal('restockStock', ${JSON.stringify(data).replace(/"/g, '&quot;')})" class="flex items-center justify-center gap-2 p-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors">
                    <i data-lucide="plus-circle" class="w-4 h-4"></i> Restock Stock
                </button>
                <button onclick="openInventoryTagModal('${data.id}', false)" class="flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <i data-lucide="tag" class="w-4 h-4"></i> Tags
                </button>
                <button onclick="openRequestModal('inventory', '${data.id}', 'Item: ${data.name} (SKU: ${data.sku || 'N/A'})')" class="flex items-center justify-center gap-2 p-2.5 bg-blue-50 text-blue-700 rounded-xl font-bold text-xs hover:bg-blue-100 transition-colors">
                    <i data-lucide="message-square" class="w-4 h-4"></i> Request Attention
                </button>
                <button onclick="confirmDelete('inventory', '${data.id}', '${data.name}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors col-span-2">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete Product
                </button>
            </div>
        </div>`;

        case 'expenseDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Expense Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-red-50 p-4 rounded-2xl border border-red-100 mb-2">
                    <p class="text-[10px] text-red-600 uppercase font-bold mb-1">Total Amount</p>
                    <p class="text-2xl font-black text-red-700">${fmt.currency(data.amount)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Category</p>
                    <p class="text-sm font-semibold capitalize w-2/3">${data.category}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-start text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3 pt-0.5">Description</p>
                    <p class="text-sm w-2/3">${data.description || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Date recorded</p>
                    <p class="text-xs w-2/3">${new Date(data.created_at).toLocaleDateString()} at ${new Date(data.created_at).toLocaleTimeString()}</p>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-8">
                <button onclick="openEditModal('editExpense', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit
                </button>
                <button onclick="openRequestModal('expense', '${data.id}', 'Expense: ${data.description || 'N/A'} - ${fmt.currency(data.amount)}')" class="flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <i data-lucide="message-square" class="w-4 h-4"></i> Request
                </button>
                <button onclick="confirmDelete('expense', '${data.id}', '${data.description}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
                </button>
            </div>
        </div>`;

        case 'customerDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Customer Profile</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center mb-2">
                    <div class="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i data-lucide="user" class="w-8 h-8"></i>
                    </div>
                    <h4 class="text-lg font-bold text-blue-900 mb-1">${data.name}</h4>
                    <p class="text-xs text-blue-600 font-medium">${data.customer_id || 'ID: ' + data.id.slice(0, 8)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Phone</p>
                    <p class="text-sm font-semibold w-2/3">${data.phone || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Email</p>
                    <p class="text-sm font-semibold truncate w-2/3" title="${data.email || ''}">${data.email || 'N/A'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-start text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3 pt-0.5">Notes</p>
                    <p class="text-xs font-semibold italic text-gray-400 w-2/3">Integration pending...</p>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-8">
                <button onclick="openEditModal('editCustomer', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit
                </button>
                <button onclick="openRequestModal('customer', '${data.id}', 'Customer: ${data.name}')" class="flex items-center justify-center gap-2 p-2.5 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 transition-colors">
                    <i data-lucide="message-square" class="w-4 h-4"></i> Request
                </button>
                <button onclick="confirmDelete('customer', '${data.id}', '${data.name}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Remove
                </button>
            </div>
        </div>`;

        case 'noteDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Note Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center mb-2">
                    <h4 class="text-lg font-bold text-amber-900 mb-1">${data.title}</h4>
                    <span class="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">${data.tag || 'General'}</span>
                </div>
                <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[100px]">
                    <p class="text-[10px] text-gray-500 uppercase font-bold mb-2">Content</p>
                    <p class="text-sm text-gray-700 whitespace-pre-wrap">${data.content}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-8">
                <button onclick="openEditModal('editNote', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit Note
                </button>
                <button onclick="confirmDelete('note', '${data.id}', '${data.title}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete Note
                </button>
            </div>
        </div>`;

        case 'loanDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Transaction Record</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center mb-2">
                    <p class="text-[10px] text-emerald-600 uppercase font-bold mb-1">${data.type.replace('_', ' ')}</p>
                    <p class="text-2xl font-black text-emerald-700">${fmt.currency(data.amount)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Party</p>
                    <p class="text-sm font-semibold w-2/3">${data.party || 'Anonymous'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Date</p>
                    <p class="text-sm font-semibold w-2/3">${fmt.date(data.created_at)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-start text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3 pt-0.5">Notes</p>
                    <p class="text-xs text-gray-600 italic w-2/3">${data.notes || 'No additional notes provided.'}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-3 mt-8">
                <button onclick="openEditModal('editLoan', '${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="edit-2" class="w-4 h-4"></i> Edit Record
                </button>
                <button onclick="confirmDelete('loan', '${data.id}', 'this record')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete Record
                </button>
            </div>
        </div>`;

        case 'branchDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Branch Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 text-center mb-2">
                    <h4 class="text-xl font-bold text-indigo-900 mb-1">${data.name}</h4>
                    <p class="text-sm text-indigo-600 font-medium">
                        <i data-lucide="map-pin" class="w-3.5 h-3.5 inline mr-1"></i>${data.location || 'No location set'}
                    </p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Manager</p>
                    <p class="text-sm font-semibold w-2/3">${data.manager || '—'}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Status</p>
                    <div class="w-2/3 flex justify-end">
                        <span class="badge ${data.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}">${data.status}</span>
                    </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Target</p>
                    <p class="text-lg font-bold text-gray-900 w-2/3">${fmt.currency(data.target)}</p>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Currency</p>
                    <p class="text-sm font-semibold uppercase w-2/3">${data.currency || 'Not set'}</p>
                </div>
            </div>
            <div class="grid grid-cols-3 gap-2 mt-8">
                <button onclick='openModal("editBranch", ${JSON.stringify(data).replace(/'/g, "&apos;")})' class="flex items-center justify-center gap-2 p-2.5 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-colors">
                    <i data-lucide="settings" class="w-4 h-4"></i> Settings
                </button>
                <button onclick="openModal('resetPin','${data.id}')" class="flex items-center justify-center gap-2 p-2.5 bg-violet-50 text-violet-700 rounded-xl font-bold text-xs hover:bg-violet-100 transition-colors">
                    <i data-lucide="key" class="w-4 h-4"></i> PIN
                </button>
                <button onclick="deleteBranchRow('${data.id}', '${data.name}')" class="flex items-center justify-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors">
                    <i data-lucide="trash-2" class="w-4 h-4"></i> Delete
                </button>
            </div>
        </div>`;

        case 'taskDetails': return `
        <div class="p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-gray-900">Task Details</h3>
                <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            <div class="space-y-3">
                <div class="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 mb-2">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Task</span>
                        ${priorityBadge(data.priority)}
                    </div>
                    <h4 class="text-lg font-bold text-indigo-900">${data.title}</h4>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start">
                    <div class="flex flex-col w-full">
                        <p class="text-[10px] text-gray-500 uppercase font-bold mb-1">Instructions</p>
                        <p class="text-sm text-gray-700">${data.description || 'No description provided.'}</p>
                    </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Status</p>
                    <div class="w-2/3 flex justify-end">
                        ${statusBadge(data.status)}
                    </div>
                </div>
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between items-center text-right">
                    <p class="text-[10px] text-gray-500 uppercase font-bold text-left w-1/3">Deadline</p>
                    <p class="text-sm font-bold text-red-600 w-2/3">${fmt.date(data.deadline)}</p>
                </div>
                </div>
            </div>
            <div class="mt-8">
                ${data.status !== 'completed' ? `
                    <button onclick="window.updateTaskStatus ? updateTaskStatus('${data.id}', 'completed') : showToast('Status update pending branch implementation')" class="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
                        <i data-lucide="check-circle" class="w-5 h-5"></i> Mark as Completed
                    </button>
                ` : `
                    <div class="text-center py-3 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100">
                        <i data-lucide="check-circle" class="w-5 h-5 inline-block mr-1"></i> Task Completed
                    </div>
                `}
            </div>
        </div>`;

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
                    <label for="editCustomerName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input type="text" id="editCustomerName" value="${data.name}" required class="form-input">
                </div>
                <div>
                    <label for="editCustomerPhone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input type="tel" id="editCustomerPhone" value="${data.phone || ''}" class="form-input">
                </div>
                <div>
                    <label for="editCustomerEmail" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                    <label for="editLoanType" class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select id="editLoanType" class="form-input">
                        <option value="income" ${data.type === 'income' ? 'selected' : ''}>Other Income</option>
                        <option value="loan_given" ${data.type === 'loan_given' ? 'selected' : ''}>Loan Given</option>
                        <option value="loan_received" ${data.type === 'loan_received' ? 'selected' : ''}>Loan Received</option>
                        <option value="repayment" ${data.type === 'repayment' ? 'selected' : ''}>Repayment Received</option>
                    </select>
                </div>
                <div>
                    <label for="editLoanParty" class="block text-sm font-medium text-gray-700 mb-1">Party (Name)</label>
                    <input type="text" id="editLoanParty" value="${data.party || ''}" class="form-input">
                </div>
                <div>
                    <label for="editLoanAmount" class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                    <input type="text" inputmode="decimal" id="editLoanAmount" value="${data.amount}" required class="form-input number-format">
                </div>
                <div>
                    <label for="editLoanNotes" class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
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
        const amount = fmt.parseNumber(document.getElementById('saleAmount').value);
        const customer = document.getElementById('saleCustomer').value || 'Walk-in Customer';
        const payment = document.getElementById('salePayment').value;

        // Build items string from selection
        const productSelect = document.getElementById('saleProduct');
        const qty = document.getElementById('saleQty').value;
        let items = '';
        let productId = null;

        if (productSelect && productSelect.selectedIndex > 0) {
            const option = productSelect.options[productSelect.selectedIndex];
            const name = option.getAttribute('data-name');
            items = `${qty}x ${name}`;
            productId = productSelect.value;
        } else {
            // Fallback if they didn't select (shouldn't happen with required)
            items = 'Custom Item';
        }

        await dbSales.add(state.branchId, { customer, items, amount, payment, productId, qty });
        closeModal();
        const branch = state.branches.find(b => b.id === state.branchId) || { name: 'Branch' };
        addActivity('sale', `New sale to ${customer}`, branch.name, amount);
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
        const amount = fmt.parseNumber(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;
        const description = document.getElementById('expenseDesc').value;
        await dbExpenses.add(state.branchId, { category, description, amount });
        closeModal();
        const branch = state.branches.find(b => b.id === state.branchId) || { name: 'Branch' };
        addActivity('expense', `Expense: ${description}`, branch.name, amount);
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
        const target = fmt.parseNumber(document.getElementById('branchTarget').value) || 10000;
        const ownerEmail = document.getElementById('branchOwnerEmail').value.trim() || state.currentUser;
        const currency = document.getElementById('branchCurrency').value || 'USD';

        const branch = await dbBranches.add(state.ownerId, {
            name,
            location,
            manager,
            pin,
            target,
            owner_email: ownerEmail,
            currency
        });
        state.branches.push(branch);
        closeModal();
        showToast('Branch added successfully!', 'success');
        switchView('branches');
    } catch (err) {
        showToast('Failed to add branch: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Create Branch');
    }
};

window.handleEditBranch = async function (e, branchId) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Save Changes');
    try {
        const payload = {
            name: document.getElementById('editBranchName').value.trim(),
            location: document.getElementById('editBranchLocation').value.trim(),
            manager: document.getElementById('editBranchManager').value.trim(),
            target: fmt.parseNumber(document.getElementById('editBranchTarget').value) || 10000,
            currency: document.getElementById('editBranchCurrency').value
        };

        const updatedBranch = await dbBranches.updateAdmin(branchId, payload);

        // Update local state without needing to refetch all
        const index = state.branches.findIndex(b => b.id === branchId);
        if (index !== -1) {
            state.branches[index] = { ...state.branches[index], ...updatedBranch };
        }

        closeModal();
        showToast('Branch updated successfully!', 'success');
        switchView('branches'); // re-render the list
    } catch (err) {
        showToast('Failed to edit branch: ' + err.message, 'error');
        _setSubmitLoading(e.target, false, 'Save Changes');
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
        const amount = fmt.parseNumber(document.getElementById('loanAmount').value);
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
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    const itemData = {
        name: document.getElementById('itemName').value,
        sku: document.getElementById('itemSku').value,
        category: document.getElementById('itemCategory').value,
        price: fmt.parseNumber(document.getElementById('itemPrice').value) || 0,
        quantity: fmt.parseNumber(document.getElementById('itemQty').value) || 0,
        min_threshold: fmt.parseNumber(document.getElementById('itemMinThreshold').value) || 10,
        cost_price: fmt.parseNumber(document.getElementById('itemCost').value) || 0,
        supplier: document.getElementById('itemSupplier').value
    };

    // Mandatory Approval Flow
    const requestPayload = {
        branch_id: state.branchId,
        owner_id: state.profile.id,
        type: 'inventory_add',
        subject: `New Stock Request: ${itemData.name}`,
        message: `Requesting to add ${itemData.quantity} units of ${itemData.name}. Supplier: ${itemData.supplier}. Total Cost Basis: ${fmt.currency(itemData.quantity * itemData.cost_price)}`,
        metadata: itemData,
        priority: 'medium',
        status: 'pending'
    };

    try {
        _setSubmitLoading(btn, true, 'Submitting...');
        await dbRequests.add(requestPayload);
        showToast('Stock addition request submitted for approval!', 'success');
        closeModal();
        if (window.renderInventoryModule) renderInventoryModule();
    } catch (err) {
        showToast('Failed to submit request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Submit for Approval');
    }
};

window.handleRestockStock = async function (e, id) {
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    const restockData = {
        inventory_id: id,
        name: document.getElementById('restockName').value,
        quantity: fmt.parseNumber(document.getElementById('restockQty').value) || 0,
        cost_price: fmt.parseNumber(document.getElementById('restockCost').value) || 0,
        supplier: document.getElementById('restockSupplier').value
    };

    const requestPayload = {
        branch_id: state.branchId,
        owner_id: state.profile.id,
        type: 'inventory_update', // restock existing
        subject: `Restock Request: ${restockData.name}`,
        message: `Requesting restock of ${restockData.quantity} units for ${restockData.name}. Supplier: ${restockData.supplier}. Cost: ${fmt.currency(restockData.quantity * restockData.cost_price)}`,
        metadata: restockData,
        priority: 'medium',
        status: 'pending'
    };

    try {
        _setSubmitLoading(btn, true, 'Submitting...');
        await dbRequests.add(requestPayload);
        showToast('Restock request submitted!', 'success');
        closeModal();
    } catch (err) {
        showToast('Failed to submit request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Submit Request');
    }
};

window.handleEditSale = async function (e, id) {
    e.preventDefault();
    _setSubmitLoading(e.target, true, 'Update Sale');
    try {
        const amount = fmt.parseNumber(document.getElementById('editSaleAmount').value);
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
        const price = fmt.parseNumber(document.getElementById('editItemPrice').value);
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
        const amount = fmt.parseNumber(document.getElementById('editExpenseAmount').value);
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
        const amount = fmt.parseNumber(document.getElementById('editLoanAmount').value);
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

/* ── Request Attention Handlers ─────────────────── */
window.openRequestModal = function (type, id, summary) {
    openModal('requestAttention', { type, id, summary });
};

window.handleRequestAttention = async function (e) {
    if (e) e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('button[type="submit"]');

    const payload = {
        branch_id: state.branchId,
        owner_id: state.profile.id, // Profile ID is the owner's UUID
        type: document.getElementById('reqType').value,
        related_id: document.getElementById('reqRelatedId').value,
        related_summary: document.getElementById('reqSummary').value,
        subject: document.getElementById('reqSubject').value,
        message: document.getElementById('reqMessage').value,
        priority: document.getElementById('reqPriority').value,
        status: 'pending'
    };

    try {
        _setSubmitLoading(btn, true, 'Sending...');
        await dbRequests.add(payload);
        showToast('Approval request sent successfully!');
        closeModal();
    } catch (err) {
        showToast('Failed to send request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Request Approval');
    }
};

window.handleEditGeneralRequest = async function (e, id) {
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const updateData = {
        subject: document.getElementById('editReqSubject').value,
        message: document.getElementById('editReqMessage').value,
        priority: document.getElementById('editReqPriority').value
    };
    try {
        _setSubmitLoading(btn, true, 'Updating...');
        await dbRequests.update(id, updateData);
        showToast('Request updated successfully!', 'success');
        closeModal();
        if (window.renderBranchRequestsList) renderBranchRequestsList();
    } catch (err) {
        showToast('Failed to update request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Update Request');
    }
};

window.handleEditInventoryAddRequest = async function (e, id) {
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    const itemData = {
        name: document.getElementById('editItemNameAdd').value,
        sku: document.getElementById('editItemSkuAdd').value,
        category: document.getElementById('editItemCategoryAdd').value,
        price: fmt.parseNumber(document.getElementById('editItemPriceAdd').value) || 0,
        quantity: fmt.parseNumber(document.getElementById('editItemQtyAdd').value) || 0,
        min_threshold: fmt.parseNumber(document.getElementById('editItemMinThresholdAdd').value) || 10,
        cost_price: fmt.parseNumber(document.getElementById('editItemCostAdd').value) || 0,
        supplier: document.getElementById('editItemSupplierAdd').value
    };

    const updateData = {
        subject: `New Stock Request: ${itemData.name} (Updated)`,
        message: `Requesting to add ${itemData.quantity} units of ${itemData.name}. Supplier: ${itemData.supplier}. Total Cost Basis: ${fmt.currency(itemData.quantity * itemData.cost_price)}`,
        metadata: itemData
    };

    try {
        _setSubmitLoading(btn, true, 'Updating...');
        await dbRequests.update(id, updateData);
        showToast('Stock request updated!', 'success');
        closeModal();
        if (window.renderBranchRequestsList) renderBranchRequestsList();
    } catch (err) {
        showToast('Failed to update request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Update Request');
    }
};

window.handleEditRestockRequest = async function (e, id) {
    if (e) e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');

    const restockData = {
        inventory_id: document.getElementById('editRestockInvId').value,
        name: document.getElementById('editRestockName').value,
        quantity: fmt.parseNumber(document.getElementById('editRestockQty').value) || 0,
        cost_price: fmt.parseNumber(document.getElementById('editRestockCost').value) || 0,
        supplier: document.getElementById('editRestockSupplier').value
    };

    const updateData = {
        subject: `Restock Request: ${restockData.name} (Updated)`,
        message: `Requesting restock of ${restockData.quantity} units for ${restockData.name}. Supplier: ${restockData.supplier}. Cost: ${fmt.currency(restockData.quantity * restockData.cost_price)}`,
        metadata: restockData
    };

    try {
        _setSubmitLoading(btn, true, 'Updating...');
        await dbRequests.update(id, updateData);
        showToast('Restock request updated!', 'success');
        closeModal();
        if (window.renderBranchRequestsList) renderBranchRequestsList();
    } catch (err) {
        showToast('Failed to update request: ' + err.message, 'error');
    } finally {
        _setSubmitLoading(btn, false, 'Update Request');
    }
};


/* ── Close modal on backdrop click ──────────────── */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalOverlay')
        ?.addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });
});
