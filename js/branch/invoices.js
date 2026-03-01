// ── Branch: Invoices & Receipts Module ───────────────────────────────────

let invoicesActiveTab = 'invoice';
window.invoicesActiveTab = invoicesActiveTab;
let docCustomers = []; // Store fetched customers for auto-population

export async function renderInvoicesModule() {
    const container = document.getElementById('mainContent');

    // Load customers and invoices for dropdowns
    try {
        docCustomers = await dbCustomers.fetchAllList(state.branchId);
    } catch (e) { console.warn("Could not fetch customers", e); }

    let invoices = [];
    try {
        invoices = await dbDocuments.fetchInvoices(state.branchId);
    } catch (e) { console.warn("Could not fetch invoices", e); } // Silently fail if table not created yet

    const customerOptions = docCustomers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    const invoiceOptions = invoices.filter(i => i.type === 'invoice').map(i => `<option value="${i.id}">${i.document_number} - ${fmt.currency(i.amount)}</option>`).join('');

    container.innerHTML = `
    <div class="space-y-6 slide-in max-w-4xl mx-auto">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider">Invoices & Receipts</div>
            </div>
        </div>

        <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8">
            <h2 class="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <i data-lucide="file-text" class="w-6 h-6 text-indigo-600"></i> Create Document
            </h2>
            
            <div class="grid grid-cols-2 gap-3 mb-8 bg-gray-50 p-1.5 rounded-2xl">
                <button id="tab-invoice" onclick="switchInvoiceTab('invoice')" class="transaction-tab py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${window.invoicesActiveTab === 'invoice' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}" title="📄 Invoice">
                    📄 Invoice
                </button>
                <button id="tab-receipt" onclick="switchInvoiceTab('receipt')" class="transaction-tab py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${window.invoicesActiveTab === 'receipt' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}" title="🧾 Receipt">
                    🧾 Receipt
                </button>
            </div>

            <form onsubmit="createDocumentRecord(event)" id="documentForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group space-y-1.5">
                        <label class="block text-sm font-medium text-gray-700" id="customerLabel">Bill To</label>
                        <select id="docCustomer" onchange="updateDocCustomerField()" class="form-input w-full rounded-xl">
                            <option value="">-- Walk-in --</option>
                            ${customerOptions}
                            <option value="manual">✏️ Enter Manually</option>
                        </select>
                    </div>

                    <div id="manualCustomerField" class="hidden space-y-4 col-span-1 md:col-span-2 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                        <div class="form-group space-y-1.5">
                            <label class="block text-sm font-medium text-gray-700">Customer Name</label>
                            <input type="text" id="manualCustomerName" class="form-input w-full rounded-xl" placeholder="Enter customer name">
                        </div>
                        <div class="form-group space-y-1.5">
                            <label class="block text-sm font-medium text-gray-700">Customer Email</label>
                            <input type="email" id="manualCustomerEmail" class="form-input w-full rounded-xl" placeholder="customer@email.com">
                        </div>
                        <div class="form-group space-y-1.5">
                            <label class="block text-sm font-medium text-gray-700">Customer Phone</label>
                            <input type="text" id="manualCustomerPhone" class="form-input w-full rounded-xl" placeholder="Phone number">
                        </div>
                        <div class="form-group space-y-1.5">
                            <label class="block text-sm font-medium text-gray-700">Customer Address</label>
                            <input type="text" id="manualCustomerAddress" class="form-input w-full rounded-xl" placeholder="Customer address">
                        </div>
                    </div>
                    
                    <div class="form-group space-y-1.5 hidden col-span-1 md:col-span-2" id="invoiceSelectionGroup">
                        <label class="block text-sm font-medium text-gray-700">Related Invoice (Optional)</label>
                        <select id="docInvoice" class="form-input w-full rounded-xl">
                            <option value="">-- No Invoice --</option>
                            ${invoiceOptions}
                        </select>
                    </div>
                </div>

                <div class="form-group space-y-1.5 mt-4" id="lineItemsGroup">
                    <label class="block text-sm font-medium text-gray-700">Items / Services</label>
                    <div id="docItemsContainer" class="space-y-3">
                        <!-- Items will be generated here by initDocItemRow -->
                    </div>
                    <button type="button" onclick="window.addDocItemRow()" class="w-full py-2 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-all">
                        + ADD ITEM
                    </button>
                </div>

                <div class="form-group space-y-1.5 mt-4">
                    <label class="block text-sm font-medium text-gray-700">Description / Notes</label>
                    <textarea id="docDescription" class="form-input w-full rounded-xl" placeholder="Payment for services rendered" rows="2"></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group space-y-1.5">
                        <label class="block text-sm font-medium text-gray-700">Subtotal (Auto-calculated)</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="text-gray-500 sm:text-sm font-medium">${state.profile?.currency || 'USD'}</span>
                            </div>
                            <input type="number" step="0.01" id="docSubTotal" class="form-input w-full pl-12 rounded-xl bg-gray-50" value="0.00" readonly>
                        </div>
                    </div>
                    
                    <div class="form-group space-y-1.5">
                        <label class="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                        <input type="number" step="1" id="docTaxRate" class="form-input w-full rounded-xl" placeholder="0" value="0" oninput="window.calcDocTotal()">
                    </div>

                    <div class="form-group space-y-1.5">
                        <label class="block text-sm font-medium text-gray-700">Total Amount</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="text-gray-500 sm:text-sm font-medium">${state.profile?.currency || 'USD'}</span>
                            </div>
                            <input type="number" step="0.01" id="docAmount" class="form-input w-full pl-12 rounded-xl bg-gray-50 font-bold" value="0.00" readonly>
                        </div>
                    </div>

                    <div class="form-group space-y-1.5" id="paymentMethodGroup">
                        <label class="block text-sm font-medium text-gray-700">Payment Method</label>
                        <select id="docPaymentMethod" class="form-input w-full rounded-xl">
                            <option>Cash</option>
                            <option>M-Pesa</option>
                            <option>Bank Transfer</option>
                            <option>Card</option>
                            <option>Airtel Money</option>
                            <option>Halopesa</option>
                        </select>
                    </div>
                    <div class="form-group space-y-1.5">
                        <label class="block text-sm font-medium text-gray-700">Reference Number (Optional)</label>
                        <input type="text" id="docReference" class="form-input w-full rounded-xl" placeholder="REF123XYZ">
                    </div>
                </div>

                <div class="pt-4">
                    <button type="submit" id="docSubmitBtn" class="w-full btn-primary py-3 rounded-xl justify-center text-lg shadow-md hover:shadow-lg transition-all">
                        Create Document
                    </button>
                </div>
            </form>
        </div>
        
        <!-- Recent Documents History -->
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 mt-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Recent Documents</h3>
            <div id="recentDocumentsList" class="space-y-3">
                <div class="flex justify-center p-4"><i class="fas fa-spinner fa-spin text-gray-400"></i></div>
            </div>
        </div>
    </div>`;

    lucide.createIcons();
    switchInvoiceTab(window.invoicesActiveTab); // Apply initial state
    window.addDocItemRow(); // initialize at least 1 item
    loadRecentDocuments();
};

export function addDocItemRow() {
    const container = document.getElementById('docItemsContainer');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'flex gap-2 items-start';
    div.innerHTML = `
        <input type="text" class="doc-item-name form-input flex-1 text-sm rounded-xl" placeholder="Item/Service Description" required>
        <input type="number" step="1" min="1" class="doc-item-qty form-input w-20 text-sm rounded-xl" placeholder="Qty" value="1" oninput="window.calcDocTotal()" required>
        <input type="number" step="0.01" class="doc-item-price form-input w-24 text-sm rounded-xl" placeholder="Price" oninput="window.calcDocTotal()" required>
        <button type="button" onclick="this.parentElement.remove(); window.calcDocTotal()" class="h-10 w-10 bg-red-50 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors"><i data-lucide="x" class="w-4 h-4"></i></button>
    `;
    container.appendChild(div);
    lucide.createIcons();
};

export function calcDocTotal() {
    let subtotal = 0;
    const rows = document.getElementById('docItemsContainer').children;
    for (const row of rows) {
        const qty = parseFloat(row.querySelector('.doc-item-qty').value) || 0;
        const price = parseFloat(row.querySelector('.doc-item-price').value) || 0;
        subtotal += (qty * price);
    }

    const taxRate = parseFloat(document.getElementById('docTaxRate').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    document.getElementById('docSubTotal').value = subtotal.toFixed(2);
    document.getElementById('docAmount').value = total.toFixed(2);
};

export function switchInvoiceTab(tabName) {
    window.invoicesActiveTab = tabName;
    const tabInvoice = document.getElementById('tab-invoice');
    const tabReceipt = document.getElementById('tab-receipt');
    const invoiceGroup = document.getElementById('invoiceSelectionGroup');
    const paymentGroup = document.getElementById('paymentMethodGroup');
    const submitBtn = document.getElementById('docSubmitBtn');
    const customerLabel = document.getElementById('customerLabel');

    if (tabName === 'invoice') {
        tabInvoice.className = "transaction-tab py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-white text-indigo-700 shadow-sm";
        tabReceipt.className = "transaction-tab py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 text-gray-500 hover:text-gray-700";
        invoiceGroup.classList.add('hidden');
        paymentGroup.classList.add('hidden'); // Invoices usually don't have a payment method yet
        submitBtn.innerHTML = '<i data-lucide="file-plus" class="w-5 h-5 mr-2"></i> Create Invoice';
        submitBtn.className = "w-full focus:outline-none flex items-center justify-center py-3 rounded-xl text-white font-bold text-base transition-all bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg";
        customerLabel.innerText = "Bill To";
    } else {
        tabReceipt.className = "transaction-tab py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 bg-white text-emerald-700 shadow-sm";
        tabInvoice.className = "transaction-tab py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 text-gray-500 hover:text-gray-700";
        invoiceGroup.classList.remove('hidden');
        paymentGroup.classList.remove('hidden'); // Receipts have payment method
        submitBtn.innerHTML = '<i data-lucide="receipt" class="w-5 h-5 mr-2"></i> Create Receipt';
        submitBtn.className = "w-full focus:outline-none flex items-center justify-center py-3 rounded-xl text-white font-bold text-base transition-all bg-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg";
        customerLabel.innerText = "Received From";
    }
    lucide.createIcons();
};

export function updateDocCustomerField() {
    const sel = document.getElementById('docCustomer').value;
    const manualGrp = document.getElementById('manualCustomerField');
    const nameInput = document.getElementById('manualCustomerName');
    const emailInput = document.getElementById('manualCustomerEmail');
    const phoneInput = document.getElementById('manualCustomerPhone');
    const addressInput = document.getElementById('manualCustomerAddress');

    if (sel === 'manual') {
        manualGrp.classList.remove('hidden');
        nameInput.value = '';
        emailInput.value = '';
        phoneInput.value = '';
        addressInput.value = '';
        nameInput.disabled = false;
        emailInput.disabled = false;
        phoneInput.disabled = false;
        addressInput.disabled = false;
        nameInput.setAttribute('required', 'true');
    } else if (sel === '') {
        manualGrp.classList.add('hidden');
        nameInput.removeAttribute('required');
    } else {
        const customer = docCustomers.find(c => c.id === sel);
        if (customer) {
            manualGrp.classList.remove('hidden');
            nameInput.value = customer.name || '';
            emailInput.value = customer.email || '';
            phoneInput.value = customer.phone || '';
            addressInput.value = customer.address || '';

            // Disable to indicate these are auto-filled
            nameInput.disabled = true;
            emailInput.disabled = true;
            phoneInput.disabled = true;
            addressInput.disabled = true;
            nameInput.removeAttribute('required');
        } else {
            manualGrp.classList.add('hidden');
        }
    }
};

export async function createDocumentRecord(e) {
    e.preventDefault();

    const type = window.invoicesActiveTab;
    const customerSel = document.getElementById('docCustomer').value;
    const manualName = document.getElementById('manualCustomerName').value;
    const manualEmail = document.getElementById('manualCustomerEmail').value;
    const manualAddress = document.getElementById('manualCustomerAddress').value;
    const description = document.getElementById('docDescription').value;

    const amount = parseFloat(document.getElementById('docAmount').value);

    // Gather Items
    const itemsData = [];
    const rows = document.getElementById('docItemsContainer').children;
    for (const row of rows) {
        const item_name = row.querySelector('.doc-item-name').value.trim();
        const quantity = parseFloat(row.querySelector('.doc-item-qty').value) || 0;
        const unit_price = parseFloat(row.querySelector('.doc-item-price').value) || 0;
        if (item_name && quantity > 0) {
            itemsData.push({ item_name, quantity, unit_price });
        }
    }

    if (itemsData.length === 0) {
        showToast("Please add at least one item or service.", "error");
        return;
    }

    const paymentMethod = type === 'receipt' ? document.getElementById('docPaymentMethod').value : null;
    const docReference = document.getElementById('docReference').value;
    const docInvoice = document.getElementById('docInvoice') ? document.getElementById('docInvoice').value : null;

    let customer_id = null;
    let customer_name = "Walk-in";
    let customer_email = null;
    let customer_address = null;

    if (customerSel === 'manual') {
        customer_name = manualName;
        customer_email = manualEmail || null;
        customer_address = manualAddress || null;
    } else if (customerSel) {
        customer_id = customerSel;
        customer_name = manualName; // Use the value from the input which is now auto-filled
        customer_email = manualEmail || null;
        customer_address = manualAddress || null;
    }

    const docPrefix = type === 'invoice' ? 'INV' : 'REC';
    const uniqueNumber = `${docPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const data = {
        branch_id: state.branchId,
        type: type,
        customer_id: customer_id,
        customer_name: customer_name,
        customer_email: customer_email,
        customer_address: customer_address,
        description: description,
        amount: amount,
        payment_method: paymentMethod,
        reference_number: docReference || null,
        document_number: uniqueNumber,
        related_invoice_id: (type === 'receipt' && docInvoice) ? docInvoice : null
    };

    const btn = document.getElementById('docSubmitBtn');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-5 h-5 mr-2 animate-spin"></i> Saving...';

    try {
        await dbDocuments.add(data, itemsData);
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} ${uniqueNumber} created effectively!`, 'success');
        document.getElementById('documentForm').reset();
        window.updateDocCustomerField();
        document.getElementById('docItemsContainer').innerHTML = '';
        window.addDocItemRow(); // add back 1 empty row
        window.calcDocTotal();
        loadRecentDocuments();
    } catch (err) {
        showToast("Error creating document: " + err.message, "error");
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

export async function loadRecentDocuments() {
    const list = document.getElementById('recentDocumentsList');
    if (!list) return;
    try {
        const docs = await dbDocuments.fetchAll(state.branchId);
        if (!docs || docs.length === 0) {
            list.innerHTML = '<div class="text-center py-6 text-gray-400 text-sm">No documents generated yet.</div>';
            return;
        }

        // Show max 10
        list.innerHTML = docs.slice(0, 10).map(d => {
            const isInvoice = d.type === 'invoice';
            const icon = isInvoice ? 'file-text' : 'receipt';
            const color = isInvoice ? 'text-indigo-600 bg-indigo-50 border-indigo-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100';
            return `
            <div class="flex items-center justify-between p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                <div class="flex items-center gap-3 sm:gap-4 truncate mr-2">
                    <div class="w-10 h-10 rounded-lg ${color} border flex items-center justify-center flex-shrink-0">
                        <i data-lucide="${icon}" class="w-5 h-5"></i>
                    </div>
                    <div class="truncate">
                        <p class="text-sm font-bold text-gray-900 truncate">${d.document_number} &bull; ${d.customer_name || 'Walk-in'}</p>
                        <p class="text-[11px] text-gray-500 truncate pt-0.5">${d.description}</p>
                        <p class="text-[10px] text-gray-400 mt-0.5 font-medium">${fmt.date(d.created_at)}</p>
                    </div>
                </div>
                <div class="text-right flex-shrink-0 flex items-center gap-3">
                    <div class="flex flex-col items-end">
                        <span class="text-xs font-black px-2 py-0.5 rounded uppercase ${isInvoice ? 'text-indigo-500 bg-indigo-50' : 'text-emerald-500 bg-emerald-50'} mb-1 inline-block">${d.type}</span>
                        <p class="text-base font-black text-gray-900">${fmt.currency(d.amount)}</p>
                    </div>
                    <button onclick="downloadDocumentPDF('${d.id}')" title="Download Full PDF" class="p-2 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1">
                        <i data-lucide="download" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
            `;
        }).join('');
        lucide.createIcons();
    } catch (e) {
        list.innerHTML = '<div class="text-center py-6 text-red-500 text-sm">To use this module, please run the latest database migration schema containing the documents table.</div>';
    }
};
