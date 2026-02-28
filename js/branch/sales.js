// ── Branch: Sales Module ──────────────────────────────────────────────────

// ── Global Helper: Receipt Generator ──
window.generateReceipt = function (sale, format) {
    console.log(`[Receipt] Generating ${format} for sale:`, sale);
    try {
        const prof = state.profile || state.currentProfile || {};

        // 1. Enterprise Name
        const entName = prof.business_name || prof.full_name || 'Business';

        // 2. Branch Name
        let branchName = state.currentUser || 'Branch';
        if (state.role === 'owner' && state.branches && state.branches.length > 0) {
            if (sale.branches && sale.branches.name) {
                branchName = sale.branches.name;
            } else if (state.branches.find(b => b.id === sale.branch_id)) {
                branchName = state.branches.find(b => b.id === sale.branch_id).name;
            }
        }

        // 3. Contact Details
        const phone = prof.mobile_number || prof.phone || '';
        const address = prof.address || '';
        const email = prof.email || '';

        // 4. Legal & Tax Identification
        const taxId = prof.tax_id || '';

        const dateObj = new Date(sale.created_at || Date.now());
        const dateStr = dateObj.toISOString().slice(0, 10);
        const timeStr = dateObj.toLocaleTimeString();
        const transId = 'S-' + (sale.id || Date.now()).toString().slice(-13);
        const totalFormatted = fmt.currency(sale.amount || 0);

        // Reverse engineer item/quantity if it matches our pattern (e.g. 1x Product)
        let itemTitle = sale.items || 'Walk-in Sale';
        let itemQty = sale.quantity || '1';
        let itemPriceRaw = sale.amount || 0;

        const match = itemTitle.match(/^(\d+)x\s*(.*)$/);
        if (match) {
            itemQty = match[1];
            itemTitle = match[2];
            itemPriceRaw = (sale.amount || 0) / parseInt(itemQty);
        }
        const priceFormatted = fmt.currency(itemPriceRaw);

        // Build receipt DOM (hidden)
        const receiptDiv = document.createElement('div');
        receiptDiv.id = 'receipt-render-target';
        receiptDiv.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;';
        receiptDiv.innerHTML = `
<div style="width:320px;font-family:'Courier New',Courier,monospace;background:#fff;color:#000;padding:0;">
    <div style="width:100%;overflow:hidden;line-height:0;">
        <svg width="320" height="14" viewBox="0 0 320 14" style="display:block;">
            <path d="M0 14 ${Array.from({ length: 32 }, (_, i) => `L${i * 10 + 5} 0 L${(i + 1) * 10} 14`).join(' ')}" fill="#000"/>
        </svg>
    </div>
    <div style="padding:16px 20px 8px;">
        <div style="text-align:center;margin-bottom:8px;">
            <div style="font-size:17px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;">${entName}</div>
            <div style="font-size:14px;font-weight:bold;margin-top:2px;text-transform:uppercase;">${branchName}</div>
            ${(phone || address || email) ? `
            <div style="font-size:11px;margin-top:6px;line-height:1.4;">
                ${address ? `<div>${address}</div>` : ''}
                ${phone ? `<div>Tel: ${phone}</div>` : ''}
                ${email ? `<div>Email: ${email}</div>` : ''}
            </div>
            ` : ''}
            ${taxId ? `
            <div style="font-size:11px;margin-top:4px;font-weight:bold;">Tax ID: ${taxId}</div>
            ` : ''}
        </div>
        <div style="border-top:2px solid #000;margin:10px 0;"></div>
        <div style="text-align:center;font-size:15px;font-weight:bold;margin:8px 0;">SALES RECEIPT</div>
        <div style="border-top:1px solid #000;margin:8px 0;"></div>
        <div style="font-size:12px;line-height:1.7;">
            <div>Date: ${dateStr}</div>
            <div>Time: ${timeStr}</div>
            <div>Customer: ${(sale.customer || 'WALK IN').toUpperCase()}</div>
        </div>
        <div style="border-top:1px solid #000;margin:8px 0;"></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:bold;margin-bottom:4px;">
            <span style="flex:2;">ITEM/DESCRIPTION</span>
            <span style="flex:0.5;text-align:right;">QTY</span>
            <span style="flex:1;text-align:right;">PRICE</span>
        </div>
        <div style="font-size:12px;margin-bottom:2px;">${itemTitle}</div>
        <div style="display:flex;justify-content:space-between;font-size:12px;">
            <span style="flex:2;"></span>
            <span style="flex:0.5;text-align:right;">${itemQty}</span>
            <span style="flex:1;text-align:right;">${priceFormatted}</span>
        </div>
        <div style="height:16px;"></div>
        <div style="border-top:1px solid #000;margin:8px 0;"></div>
        <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
            <span>Subtotal:</span><span>${totalFormatted}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold;margin-bottom:8px;">
            <span>TOTAL:</span><span>${totalFormatted}</span>
        </div>
        <div style="font-size:12px;margin-bottom:4px;">Payment: ${sale.payment || 'Cash'}</div>
        <div style="border-top:1px solid #000;margin:10px 0;"></div>
        <div style="text-align:center;font-size:12px;line-height:1.6;margin-bottom:8px;">
            <div style="font-weight:bold;">Thank you for your business!</div>
            <div>Visit us again</div>
        </div>
        <div style="border-top:1px dashed #000;margin:8px 0;"></div>
        <div style="text-align:center;font-size:10px;color:#444;margin-bottom:8px;">Trans ID: ${transId}</div>
    </div>
    <div style="width:100%;overflow:hidden;line-height:0;">
        <svg width="320" height="14" viewBox="0 0 320 14" style="display:block;">
            <path d="M0 0 ${Array.from({ length: 32 }, (_, i) => `L${i * 10 + 5} 14 L${(i + 1) * 10} 0`).join(' ')}" fill="#000"/>
        </svg>
    </div>
</div>`;
        document.body.appendChild(receiptDiv);

        const loadScript = (url) => new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = url;
            s.onload = res;
            s.onerror = rej;
            document.head.appendChild(s);
        });

        if (format === 'print') {
            const printWin = window.open('', '_blank');
            if (printWin) {
                printWin.document.write(`
                    <html>
                        <head>
                            <title>Receipt ${transId}</title>
                            <style>
                                html, body { height: 100%; margin: 0; }
                                body { display: flex; justify-content: center; align-items: center; background: #fff; }
                                @media print { 
                                    @page { margin: 0; size: auto; } 
                                    html, body { height: 100%; margin: 0; }
                                    body { display: flex; justify-content: center; align-items: center; }
                                }
                            </style>
                        </head>
                        <body>
                            ${receiptDiv.innerHTML}
                            <script>
                                setTimeout(() => {
                                    window.print();
                                    window.close();
                                }, 500);
                            </script>
                        </body>
                    </html>
                `);
                printWin.document.close();
                receiptDiv.remove();
            } else {
                showToast('Popup blocked. Please allow popups to print.', 'error');
                receiptDiv.remove();
            }
        } else if (format === 'pdf') {
            const target = receiptDiv.querySelector('div');
            const doPdf = async () => {
                try {
                    const cvs = await window.html2canvas(target, { scale: 2, backgroundColor: '#fff' });
                    const imgData = cvs.toDataURL('image/png');
                    const pxW = cvs.width;
                    const pxH = cvs.height;
                    const mmW = (pxW / 2) * 0.264583;
                    const mmH = (pxH / 2) * 0.264583;
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF({ unit: 'mm', format: [mmW, mmH] });
                    pdf.addImage(imgData, 'PNG', 0, 0, mmW, mmH);
                    pdf.save(`receipt-${transId}.pdf`);
                    showToast('PDF receipt downloaded', 'success');
                } catch (err) {
                    console.error(err);
                    showToast('Failed to generate PDF', 'error');
                } finally {
                    receiptDiv.remove();
                }
            };
            const needed = [];
            if (!window.html2canvas) needed.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'));
            if (!window.jspdf) needed.push(loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'));
            Promise.all(needed).then(doPdf).catch(() => {
                receiptDiv.remove();
                showToast('Failed to load PDF library', 'error');
            });
        } else if (format === 'img') {
            const target = receiptDiv.querySelector('div');
            const doImg = () => {
                window.html2canvas(target, { scale: 2, backgroundColor: '#fff' }).then(cvs => {
                    const link = document.createElement('a');
                    link.download = `receipt-${transId}.png`;
                    link.href = cvs.toDataURL('image/png');
                    link.click();
                    receiptDiv.remove();
                    showToast('Image receipt downloaded', 'success');
                }).catch(err => {
                    console.error(err);
                    receiptDiv.remove();
                    showToast('Failed to generate image', 'error');
                });
            };
            if (window.html2canvas) {
                doImg();
            } else {
                loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js')
                    .then(doImg)
                    .catch(() => {
                        receiptDiv.remove();
                        showToast('Failed to load image library', 'error');
                    });
            }
        }
    } catch (err) {
        console.error('[Receipt] Fatal error in generateReceipt:', err);
        showToast('Receipt generation failed', 'error');
    }
};

window.copySale = async function (saleStr) {
    try {
        const sale = JSON.parse(decodeURIComponent(saleStr));
        const dateObj = new Date(sale.created_at || Date.now());
        const text = [
            `Product: ${sale.items || 'Unknown'}`,
            `Total: ${fmt.currency(sale.amount || 0)}`,
            `Payment: ${sale.payment || 'Cash'}`,
            `Customer: ${sale.customer || 'Walk-in'}`,
            `Date: ${dateObj.toLocaleString()}`
        ].join('\n');

        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard', 'success');
    } catch (err) {
        showToast('Copy failed', 'error');
    }
};

// ── Receipt Format Dialog ──
window.showReceiptDialog = function (saleStr) {
    console.log('[Receipt] showReceiptDialog called with:', saleStr);
    try {
        const sale = JSON.parse(decodeURIComponent(saleStr));
        console.log('[Receipt] Parsed sale:', sale);

        // Remove any existing receipt popup
        document.querySelectorAll('.receipt-format-popup').forEach(el => {
            console.log('[Receipt] Removing old popup');
            el.remove();
        });

        const popup = document.createElement('div');
        popup.className = 'receipt-format-popup';
        // Force fixed centered positioning via inline style as fallback
        popup.style.cssText = 'position:fixed !important; inset:0 !important; z-index:10000 !important; display:flex !important; align-items:center !important; justify-content:center !important; padding:1rem;';

        popup.innerHTML = `
            <div class="receipt-format-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(4px);"></div>
            <div class="receipt-format-dialog" style="position:relative; background:white; border-radius:1.5rem; padding:1.75rem; width:100%; max-width:320px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                <div style="font-weight:800; font-size:1.2rem; margin-bottom:1.25rem; text-align:center; color:#111827; letter-spacing:-0.025em;">Download Receipt</div>
                <div style="display:flex; gap:0.75rem; margin-bottom:1rem;">
                    <button class="receipt-fmt-btn" data-fmt="img" style="background:linear-gradient(135deg, #10b981, #059669); flex:1; border:none; color:white; padding:0.85rem; border-radius:1rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
                        <i data-lucide="image" class="w-4 h-4"></i> Image
                    </button>
                    <button class="receipt-fmt-btn" data-fmt="pdf" style="background:linear-gradient(135deg, #ef4444, #dc2626); flex:1; border:none; color:white; padding:0.85rem; border-radius:1rem; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:0.5rem;">
                        <i data-lucide="file-text" class="w-4 h-4"></i> PDF
                    </button>
                </div>
                <div style="text-align:center; margin-top:1.5rem; margin-bottom:0.5rem;">
                    <a href="#" class="receipt-fmt-print" style="color:#4f46e5; text-decoration:none; font-size:0.95rem; font-weight:700; border-bottom:2px solid #4f46e5; padding-bottom:2px;">Print Receipt</a>
                </div>
                <button class="receipt-fmt-cancel" style="width:100%; margin-top:1.25rem; font-size:0.85rem; font-weight:600; color:#9ca3af; background:transparent; border:none; cursor:pointer;">Cancel</button>
            </div>
        `;
        document.body.appendChild(popup);

        if (window.lucide) {
            window.lucide.createIcons();
        } else {
            console.warn('[Receipt] Lucide not found, icons will not render');
        }

        // Close handler
        const closePopup = () => {
            console.log('[Receipt] Closing popup');
            popup.remove();
        };
        popup.querySelector('.receipt-format-overlay').addEventListener('click', closePopup);
        popup.querySelector('.receipt-fmt-cancel').addEventListener('click', closePopup);

        // Print handler
        popup.querySelector('.receipt-fmt-print').addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[Receipt] Print clicked');
            closePopup();
            window.generateReceipt(sale, 'print');
        });

        // Format click handler
        popup.querySelectorAll('.receipt-fmt-btn').forEach(fmtBtn => {
            fmtBtn.addEventListener('click', () => {
                const fmt = fmtBtn.dataset.fmt;
                console.log(`[Receipt] Format clicked: ${fmt}`);
                closePopup();
                window.generateReceipt(sale, fmt);
            });
        });

        console.log('[Receipt] Popup displayed successfully');
    } catch (err) {
        console.error('[Receipt] Error in showReceiptDialog:', err);
        showToast('Failed to open receipt dialog', 'error');
    }
};

// ── Bulk Actions & Selection State ───────────────────────────────────────────
window.salesSelection = new Set();
window.salesPageState = {
    page: 1,
    pageSize: 5,
    totalCount: 0
};

window.changeSalesPage = function (delta) {
    const newPage = window.salesPageState.page + delta;
    const maxPage = Math.ceil(window.salesPageState.totalCount / window.salesPageState.pageSize) || 1;
    if (newPage < 1 || newPage > maxPage) return;
    window.salesPageState.page = newPage;
    renderSalesModule();
};

window.toggleSaleSelection = function (id) {
    if (window.salesSelection.has(id)) {
        window.salesSelection.delete(id);
    } else {
        window.salesSelection.add(id);
    }
    updateBulkActionBar();
};

window.toggleSelectAllSales = function (checked) {
    const checkboxes = document.querySelectorAll('.sale-checkbox');
    window.salesSelection.clear();
    checkboxes.forEach(cb => {
        cb.checked = checked;
        if (checked) window.salesSelection.add(cb.value);
    });
    updateBulkActionBar();
};

window.updateBulkActionBar = function () {
    const count = window.salesSelection.size;
    const countSpan = document.getElementById('salesSelectedCount');
    if (countSpan) countSpan.textContent = `${count} selected`;

    const deleteBtn = document.getElementById('btnBulkDeleteSales');
    if (deleteBtn) deleteBtn.disabled = count === 0;

    const tagBtn = document.getElementById('btnBulkTagSales');
    if (tagBtn) tagBtn.disabled = count === 0;

    // Update Select All checkbox indeterminate state
    const selectAll = document.getElementById('selectAllSales');
    const checkboxes = document.querySelectorAll('.sale-checkbox');
    if (selectAll && checkboxes.length > 0) {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        selectAll.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
        selectAll.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
    }
};

window.bulkDeleteSelectedSales = async function () {
    const count = window.salesSelection.size;
    if (count === 0) return;

    const confirmed = await window.confirmModal('Confirm Deletion', 'Are you sure you want to delete the selected items?', 'Yes, Delete', 'Cancel');
    if (!confirmed) return;

    try {
        const ids = Array.from(window.salesSelection);
        await dbSales.bulkDelete(ids);
        window.salesSelection.clear();
        showToast(`Successfully deleted ${count} sales`, 'success');
        renderSalesModule(); // Refresh
    } catch (err) {
        showToast('Failed to delete sales: ' + err.message, 'error');
    }
};

window.bulkTagSelectedSales = async function () {
    const count = window.salesSelection.size;
    if (count === 0) return;
    openSalesTagModal(null, true);
};

window.openSalesTagModal = async function (saleId, isBulk = false) {
    // Remove existing if any
    document.querySelectorAll('.tags-modal-overlay').forEach(el => el.remove());

    const title = isBulk ? `Tag ${window.salesSelection.size} Sales` : 'Manage Sale Tags';

    // Fetch common tags or current tags for sale
    let currentTags = [];
    if (!isBulk && saleId) {
        try {
            const allTags = await dbSaleTags.fetchAll(state.branchId);
            currentTags = allTags.filter(t => t.sale_id === saleId);
        } catch (err) { console.error(err); }
    }

    const overlay = document.createElement('div');
    overlay.className = 'tags-modal-overlay fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-200';
    overlay.style.opacity = '0';

    overlay.innerHTML = `
        <div class="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden transform scale-95 transition-transform duration-200">
            <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <i data-lucide="tag" class="w-5 h-5 text-indigo-500"></i> ${title}
                </h3>
                <button type="button" class="close-tags-btn p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-xl transition-colors">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>
            
            <div class="p-6">
                <div class="flex gap-2 mb-6">
                    <input type="text" id="newTagName" placeholder="New tag name..." class="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all">
                    <button id="submitTagBtn" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                        Add
                    </button>
                </div>

                ${!isBulk ? `
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Current Tags</p>
                    <div class="flex flex-wrap gap-2 mb-6" id="modalCurrentTags">
                        ${currentTags.length ? currentTags.map(t => `
                            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                                # ${t.tag}
                                <i data-lucide="x" onclick="removeSaleTagModal('${t.id}', '${saleId}')" class="w-3.5 h-3.5 cursor-pointer hover:text-red-600"></i>
                            </span>
                        `).join('') : '<p class="text-xs text-gray-400 italic">No tags applied yet</p>'}
                    </div>
                ` : ''}

                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Suggested Tags</p>
                <div class="flex flex-wrap gap-2">
                    ${['Wholesale', 'Urgent', 'Review', 'Paid', 'Pending', 'Custom'].map(t => `
                        <button onclick="quickAddTag('${t}', '${saleId}', ${isBulk})" class="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all uppercase tracking-tight">
                            + ${t}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button class="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors close-tags-btn">
                    Done
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    lucide.createIcons();

    // Animate in
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        overlay.querySelector('.transform').classList.replace('scale-95', 'scale-100');
    });

    const closeTagsModal = () => {
        overlay.style.opacity = '0';
        overlay.querySelector('.transform').classList.replace('scale-100', 'scale-95');
        setTimeout(() => overlay.remove(), 200);
        renderSalesModule(); // Refresh list on close
    };

    overlay.querySelectorAll('.close-tags-btn').forEach(btn => btn.addEventListener('click', closeTagsModal));

    const submitBtn = overlay.querySelector('#submitTagBtn');
    const input = overlay.querySelector('#newTagName');

    const handleAdd = async () => {
        const tagName = input.value.trim();
        if (!tagName) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>';

        try {
            if (isBulk) {
                const ids = Array.from(window.salesSelection);
                await Promise.all(ids.map(id => dbSaleTags.add(state.branchId, id, tagName)));
                showToast(`Applied tag to ${ids.length} items`, 'success');
                window.salesSelection.clear();
                closeTagsModal();
            } else {
                await dbSaleTags.add(state.branchId, saleId, tagName);
                showToast('Tag added', 'success');
                openSalesTagModal(saleId, false); // Reload modal
            }
        } catch (err) {
            showToast('Error adding tag', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add';
        }
    };

    submitBtn.addEventListener('click', handleAdd);
    input.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAdd(); });

    // Global helpers for modal
    window.removeSaleTagModal = async (tagId, saleId) => {
        try {
            await dbSaleTags.delete(tagId);
            openSalesTagModal(saleId, false);
        } catch (err) { showToast('Error', 'error'); }
    };

    window.quickAddTag = async (tagName, saleId, isBulk) => {
        input.value = tagName;
        handleAdd();
    };
};

window.removeSaleTag = async function (tagId) {
    try {
        await dbSaleTags.delete(tagId);
        showToast('Tag removed', 'success');
        renderSalesModule(); // Refresh
    } catch (err) {
        showToast('Failed to remove tag: ' + err.message, 'error');
    }
};

window.renderSalesModule = function () {
    window.salesSelection.clear();
    const container = document.getElementById('mainContent');

    container.innerHTML = `
    <div class="space-y-4 slide-in">
        <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
            <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Sales Register</div>
            </div>
            <button onclick="openAddSaleModal()" class="btn-primary btn-success text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0">
                <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> New Sale
            </button>
        </div>
        ${renderPremiumLoader('Synchronizing sales history…')}
    </div>`;
    lucide.createIcons();

    // Async fetch then render
    Promise.all([
        dbSales.fetchAll(state.branchId, {
            page: window.salesPageState.page,
            pageSize: window.salesPageState.pageSize
        }),
        dbSales.fetchSummary(state.branchId),
        dbSales.fetchProfit(state.branchId),
        dbInventory.fetchAll(state.branchId),
        dbSaleTags.fetchAll(state.branchId)
    ]).then(([salesRes, summary, profit, inventoryRes, tags]) => {
        const sales = salesRes.items;
        window.salesPageState.totalCount = salesRes.count;
        const inventory = inventoryRes.items;

        const totalPages = Math.ceil(window.salesPageState.totalCount / window.salesPageState.pageSize) || 1;

        container.innerHTML = `
        <div class="space-y-4 slide-in">
            <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                    <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Sales Register</div>
                </div>
                <button onclick="openAddSaleModal()" class="btn-primary btn-success text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 font-bold">
                    <i data-lucide="plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> New Sale
                </button>
            </div>

            <!-- Stats Row -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Today's Total">Today's Total</p>
                    <p class="text-dynamic-lg font-black text-emerald-600 truncate leading-none my-auto py-1" title="${fmt.currency(summary.today_total)}">${fmt.currency(summary.today_total)}</p>
                </div>
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Today's Transactions">Today's Trx</p>
                    <p class="text-dynamic-lg font-black text-gray-900 truncate leading-none my-auto py-1">${summary.transaction_count}</p>
                </div>
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full bg-indigo-50/20 border-indigo-100">
                    <p class="text-[11px] sm:text-xs text-indigo-600 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Sales Target">Sales Target</p>
                    <p class="text-dynamic-lg font-black text-indigo-700 truncate leading-none my-auto py-1" title="${fmt.currency(state.branchProfile?.target || 0)}">${fmt.currency(state.branchProfile?.target || 0)}</p>
                </div>
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full">
                    <p class="text-[11px] sm:text-xs text-gray-500 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Average Sale">Avg Sale</p>
                    <p class="text-dynamic-lg font-black text-gray-900 truncate leading-none my-auto py-1" title="${fmt.currency(summary.avg_sale)}">${fmt.currency(summary.avg_sale)}</p>
                </div>
                <div class="bg-white px-3 py-2 rounded-2xl border border-gray-100 shadow-sm stat-card min-w-0 flex flex-col h-full bg-violet-50/20 border-violet-100">
                    <p class="text-[11px] sm:text-xs text-violet-600 uppercase tracking-tight whitespace-normal font-bold leading-tight" title="Gross Profit">Gross Profit</p>
                    <p class="text-dynamic-lg font-black text-violet-700 truncate leading-none my-auto py-1" title="${fmt.currency(profit.gross_profit)}">${fmt.currency(profit.gross_profit)}</p>
                </div>
            </div>

            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 md:p-6 mb-20 md:mb-0">
                <div class="flex items-center justify-between mb-5">
                    <h3 class="text-xl font-bold text-gray-900">Recent Sales</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400 font-medium">Page ${window.salesPageState.page} of ${totalPages}</span>
                    </div>
                </div>
                
                <!-- Search & Filters -->
                <div class="relative mb-4">
                    <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <i data-lucide="search" class="w-4 h-4 text-indigo-500"></i>
                    </div>
                    <input type="text" placeholder="Search sales..." oninput="filterList('salesList', this.value)" class="w-full pl-11 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-gray-400">
                </div>

                <!-- Select All Action Bar -->
                <div class="flex flex-wrap items-center justify-between bg-gray-50/70 border border-gray-100 rounded-xl p-2.5 md:p-3 mb-5 gap-3">
                    <div class="flex items-center gap-3 pl-2">
                        <input type="checkbox" id="selectAllSales" onchange="toggleSelectAllSales(this.checked)" class="rounded w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer">
                        <span class="text-sm font-semibold text-gray-800">Select All <span id="salesSelectedCount" class="font-normal text-xs text-gray-400 ml-1.5 hidden sm:inline-block">0 selected</span></span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <button id="btnBulkDeleteSales" disabled onclick="bulkDeleteSelectedSales()" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <i data-lucide="trash-2" class="w-3.5 h-3.5 text-gray-400"></i> <span class="hidden sm:inline-block">Delete Selected</span>
                        </button>
                        <button id="btnBulkTagSales" disabled onclick="bulkTagSelectedSales()" class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                            <i data-lucide="tag" class="w-3.5 h-3.5 text-rose-500"></i> <span class="hidden sm:inline-block">Apply Tag</span>
                        </button>
                    </div>
                </div>

                <!-- Sales List -->
                <div class="space-y-3.5" id="salesList">
                    ${sales.length === 0 ? `
                        <div class="py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                            <i data-lucide="shopping-cart" class="w-10 h-10 text-gray-300 mx-auto mb-3"></i>
                            <p class="text-gray-400 text-sm">No sales history found for this page</p>
                        </div>
                    ` : sales.map((sale, idx) => {
            const outlineColors = ['border-l-emerald-500', 'border-l-blue-500', 'border-l-indigo-500', 'border-l-purple-500', 'border-l-rose-500', 'border-l-amber-500'];
            const outlineColor = outlineColors[idx % outlineColors.length];

            let itemTitle = 'Walk-in Sale';
            let itemQty = sale.quantity || '1';
            let costPrice = 0;

            const linkedProduct = sale.product_id ? inventory.find(i => i.id === sale.product_id) : null;

            if (linkedProduct) {
                itemTitle = linkedProduct.name;
                costPrice = linkedProduct.cost_price || 0;
            } else {
                const itemStr = sale.items || 'Walk-in Sale';
                const match = itemStr.match(/^(\d+)x\s*(.*)$/);
                if (match) {
                    itemQty = match[1];
                    itemTitle = match[2];
                } else {
                    itemTitle = itemStr;
                }
            }

            const unitPrice = parseFloat(sale.amount) / parseInt(itemQty);
            const profitVal = (unitPrice - costPrice) * parseInt(itemQty);

            return `
                        <div onclick="openDetailsModal('sale', '${sale.id}')" data-search="${itemTitle.toLowerCase()} ${(sale.customer || 'walk-in').toLowerCase()} ${sale.payment.toLowerCase()} ${(sale.receipt_number || '').toLowerCase()}" class="bg-white border border-gray-200 border-l-[4px] ${outlineColor} rounded-2xl p-5 md:p-6 flex gap-4 hover:shadow-md transition-all group relative cursor-pointer">
                            
                            <div class="pt-1 pl-1.5" onclick="event.stopPropagation()">
                                <input type="checkbox" value="${sale.id}" onchange="toggleSaleSelection('${sale.id}')" class="sale-checkbox rounded w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500 cursor-pointer transition-colors" ${window.salesSelection.has(sale.id) ? 'checked' : ''}>
                            </div>

                            <div class="flex-1 min-w-0">
                                <div class="flex items-start justify-between gap-3 mb-1">
                                    <h4 class="font-bold text-gray-900 text-sm sm:text-base truncate">${itemTitle}</h4>
                                    <div class="text-right">
                                        <p class="text-[10px] uppercase font-bold text-gray-400 leading-none">${fmt.dateTime(sale.created_at)}</p>
                                    </div>
                                </div>
                                <div class="flex items-end justify-between gap-3">
                                    <div class="flex flex-wrap gap-1.5 overflow-hidden pt-1">
                                        ${tags.filter(t => t.sale_id === sale.id).map(t => `
                                            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap flex-shrink-0 cursor-default">
                                                # ${t.tag}
                                            </span>
                                        `).join('')}
                                    </div>
                                    <span class="text-sm sm:text-lg font-black text-emerald-600 whitespace-nowrap">${fmt.currency(sale.amount)}</span>
                                </div>
                            </div>
                        </div>
                        `;
        }).join('')}
                </div>

                <!-- Pagination Footer -->
                <div class="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                    <p class="text-xs text-gray-500">Showing <span class="font-bold text-gray-900">${sales.length}</span> of <span class="font-bold text-gray-900">${window.salesPageState.totalCount}</span> sales</p>
                    <div class="flex items-center gap-2">
                        <button onclick="changeSalesPage(-1)" ${window.salesPageState.page === 1 ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-left" class="w-4 h-4"></i>
                        </button>
                        <div class="flex items-center gap-1">
                            ${Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const p = i + 1; // Simplistic pagination for now
            return `<button onclick="window.salesPageState.page = ${p}; renderSalesModule()" class="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${window.salesPageState.page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-gray-500 hover:bg-gray-50'}">${p}</button>`;
        }).join('')}
                        </div>
                        <button onclick="changeSalesPage(1)" ${window.salesPageState.page === totalPages ? 'disabled' : ''} class="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <i data-lucide="chevron-right" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
        lucide.createIcons();
    }).catch(err => {
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load sales: ${err.message}</div>`;
    });

    return '';
};

// ── Helper: Open Add Sale Modal with Inventory Data ───────────────────────
// ── Helper: Open Add Sale Modal with Inventory Data ───────────────────────
window.openAddSaleModal = async function () {
    try {
        console.log(`[Sales] Fetching inventory for branch: ${state.branchId}`);
        // Support up to 1000 items in the dropdown
        const res = await dbInventory.fetchAll(state.branchId, { pageSize: 1000 });
        const inventory = res.items || [];
        console.log('[Sales] Inventory fetched:', inventory);

        if (!inventory || inventory.length === 0) {
            showToast('No products found! Please add items to Inventory first.', 'warning');
            // Still open modal so they can see it's empty, but the toast explains why
        }

        openModal('addSale', inventory);
    } catch (err) {
        console.error('[Sales] Error loading inventory:', err);
        showToast('Failed to load product list: ' + err.message, 'error');
    }
};

window.refreshSaleProducts = async function () {
    try {
        const btn = document.querySelector('button[onclick="refreshSaleProducts()"]');
        const icon = btn ? btn.querySelector('i') : null;

        if (icon) icon.classList.add('hidden');

        const res = await dbInventory.fetchAll(state.branchId, { pageSize: 1000 });
        const inventory = res.items || [];
        const select = document.getElementById('saleProduct');

        if (!inventory || inventory.length === 0) {
            showToast('No products found.', 'warning');
            if (select) select.innerHTML = `<option value="" disabled selected>No products available</option>`;
        } else {
            showToast('Products refreshed!', 'success');

            const options = inventory.map(item => `
                <option value="${item.id}" data-price="${item.price}" data-name="${item.name}">
                    ${item.name} (${item.quantity} in stock) - ${fmt.currency(item.price)}
                </option>
            `).join('');

            if (select) select.innerHTML = `<option value="" disabled selected>Select a product...</option>${options}`;
        }

        if (icon) icon.classList.remove('hidden');
    } catch (err) {
        showToast('Failed to refresh: ' + err.message, 'error');
    }
};

window.updateSaleTotal = function () {
    const productSelect = document.getElementById('saleProduct');
    const qtyInput = document.getElementById('saleQty');
    const amountInput = document.getElementById('saleAmount');

    if (productSelect && productSelect.selectedIndex > 0) {
        const option = productSelect.options[productSelect.selectedIndex];
        const price = parseFloat(option.getAttribute('data-price')) || 0;
        const qty = parseInt(qtyInput.value) || 0;
        amountInput.value = (price * qty).toFixed(2);
    }
};

window.handleBarcodeScan = async function (barcodeStr) {
    if (!barcodeStr || barcodeStr.trim() === '') return;
    const sku = barcodeStr.trim().toLowerCase();

    try {
        const res = await dbInventory.fetchAll(state.branchId, { pageSize: 1000 });
        const inventory = res.items || [];

        const matchedItem = inventory.find(i => (i.sku || '').toLowerCase() === sku);

        if (matchedItem) {
            const productSelect = document.getElementById('saleProduct');
            if (productSelect) {
                // Find matching option
                for (let i = 0; i < productSelect.options.length; i++) {
                    if (productSelect.options[i].value === matchedItem.id) {
                        productSelect.selectedIndex = i;
                        document.getElementById('saleBarcode').value = ''; // clear input after match
                        showToast(`Product matched: ${matchedItem.name}`, 'success');
                        window.updateSaleTotal();
                        // Focus on quantity so user can adjust
                        document.getElementById('saleQty').focus();
                        return;
                    }
                }
            }
        }
    } catch (err) {
        console.error('Barcode scan error:', err);
    }
};

