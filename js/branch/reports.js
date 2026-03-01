// ── Branch: Reports Module ────────────────────────────────────────────────

export function renderReportsModule() {
    const container = document.getElementById('mainContent');
    // Branch info: Owner has state.branches, Branch manager has state.branchProfile
    const branch = (state.branches && state.branches.find(b => b.id === state.branchId)) || state.branchProfile;

    // Fallback if branch not found
    if (!branch) {
        container.innerHTML = '<div class="py-20 text-center text-red-500">Branch data not found.</div>';
        return;
    }

    // Ensure target is set
    branch.target = branch.target || 10000;

    // Fetch live data instead of using stale state
    Promise.all([
        dbSales.fetchAll(state.branchId, { pageSize: 5000 }),
        dbExpenses.fetchAll(state.branchId, { pageSize: 5000 }),
        dbTasks.fetchAll(state.branchId, { pageSize: 5000 }),
        dbCustomers ? dbCustomers.fetchAll(state.branchId, { pageSize: 5000 }) : Promise.resolve({ items: [] })
    ]).then(([salesRes, expensesRes, tasksRes, customersRes]) => {
        const sales = salesRes?.items || [];
        const expenses = expensesRes?.items || [];
        const tasks = tasksRes?.items || [];
        const customers = customersRes?.items || [];

        const totalSales = sales.reduce((s, r) => s + r.amount, 0);
        const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
        const netProfit = totalSales - totalExp;

        // Fetch today's sales for progress specifically if it isn't accurate from general fetch
        dbSales.todayTotal(state.branchId).then(todaySales => {
            const progress = fmt.percent(todaySales, branch.target);

            container.innerHTML = `
            <div class="space-y-4 slide-in">
                <div class="flex flex-nowrap items-center gap-2 sm:gap-3 justify-between">
                    <div class="inline-flex items-center gap-2 sm:gap-3 bg-white border border-gray-200 shadow-sm rounded-xl sm:rounded-2xl p-1 sm:p-1.5 pr-3 sm:pr-5 cursor-default hover:shadow-md transition-shadow overflow-hidden">
                        <div class="bg-indigo-50 text-indigo-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider truncate">Business Reports</div>
                    </div>
                    <div class="flex items-center gap-1.5 sm:gap-2 mr-2">
                        <button onclick="openModal('downloadReports')" class="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap flex-shrink-0 font-bold bg-violet-600 hover:bg-violet-700">
                            <i data-lucide="download" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Download Reports
                        </button>
                    </div>
                </div>

                <!-- Daily Summary Card -->
                <div class="bg-gradient-to-br from-indigo-500 to-violet-600 p-6 rounded-2xl text-white shadow-md dashboard-card">
                    <h3 class="text-lg font-semibold mb-4 opacity-90">Daily Summary – ${branch.name}</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                        <div class="min-w-0">
                            <p class="text-indigo-200 text-[10px] md:text-xs uppercase tracking-wide truncate" title="Revenue">Total Revenue</p>
                            <p class="text-dynamic-lg font-bold truncate" title="${fmt.currency(totalSales)}">${fmt.currency(totalSales)}</p>
                        </div>
                        <div class="min-w-0">
                            <p class="text-indigo-200 text-[10px] md:text-xs uppercase tracking-wide truncate" title="Expenses">Total Expenses</p>
                            <p class="text-dynamic-lg font-bold truncate" title="${fmt.currency(totalExp)}">${fmt.currency(totalExp)}</p>
                        </div>
                        <div class="min-w-0">
                            <p class="text-indigo-200 text-[10px] md:text-xs uppercase tracking-wide truncate" title="Net Profit">Net Profit</p>
                            <p class="text-dynamic-lg font-bold ${netProfit >= 0 ? 'text-emerald-200' : 'text-red-300'} truncate" title="${fmt.currency(netProfit)}">${fmt.currency(netProfit)}</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex justify-between text-xs text-indigo-200 mb-1">
                            <span>Today's Target progress</span><span>${progress}%</span>
                        </div>
                        <div class="w-full bg-white bg-opacity-20 rounded-full h-2">
                            <div class="bg-white h-2 rounded-full" style="width:${Math.min(progress, 100)}%"></div>
                        </div>
                    </div>
                </div>

                <!-- Detailed Breakdown -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 class="font-semibold text-gray-900 mb-4">Sales Summary</h3>
                        <div class="space-y-3">
                            ${[
                    ['Total Transactions', sales.length, ''],
                    ['Total Revenue', fmt.currency(totalSales), 'text-emerald-600'],
                    ['Average Sale', sales.length ? fmt.currency(totalSales / sales.length) : fmt.currency(0), ''],
                    ['Daily Target', fmt.currency(branch.target), ''],
                    ['Remaining (Today)', fmt.currency(Math.max(0, branch.target - todaySales)), 'text-amber-600']
                ].map(([label, value, cls]) => `
                            <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span class="text-sm text-gray-600">${label}</span>
                                <span class="font-semibold ${cls || 'text-gray-900'}">${value}</span>
                            </div>`).join('')}
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 class="font-semibold text-gray-900 mb-4">Expense Summary</h3>
                        <div class="space-y-3">
                            ${[
                    ['Total Expense Records', expenses.length, ''],
                    ['Total Spent', fmt.currency(totalExp), 'text-red-600'],
                    ['Net Profit', fmt.currency(netProfit), netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'],
                    ['Profit Margin', totalSales ? `${Math.round((netProfit / totalSales) * 100)}%` : '0%', ''],
                    ['Customers Recorded', customers.length, '']
                ].map(([label, value, cls]) => `
                            <div class="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span class="text-sm text-gray-600">${label}</span>
                                <span class="font-semibold ${cls || 'text-gray-900'}">${value}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                </div>

                <!-- Tasks Performance -->
                <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 class="font-semibold text-gray-900 mb-4">Task Performance</h3>
                    <div class="grid grid-cols-3 gap-4">
                        ${[['pending', 'bg-gray-100 text-gray-700', 'Pending'], ['in_progress', 'bg-blue-100 text-blue-700', 'In Progress'], ['completed', 'bg-emerald-100 text-emerald-700', 'Completed']].map(([s, cls, label]) => `
                        <div class="text-center p-4 rounded-xl bg-gray-50">
                            <p class="text-2xl font-bold text-gray-900">${tasks.filter(t => t.status === s).length}</p>
                            <span class="badge ${cls} mt-2">${label}</span>
                        </div>`).join('')}
                    </div>
                </div>
            </div>`;
            lucide.createIcons();
        });
    }).catch(err => {
        console.error("Failed to load reports data:", err);
        container.innerHTML = `<div class="py-20 text-center text-red-500">Failed to load reporting data: ${err.message}</div>`;
    });
};

export function toggleReportCustomDates(val) {
    const div = document.getElementById('reportCustomDates');
    const start = document.getElementById('reportStartDate');
    const end = document.getElementById('reportEndDate');
    if (val === 'custom') {
        div.classList.remove('hidden');
        start.required = true;
        end.required = true;
    } else {
        div.classList.add('hidden');
        start.required = false;
        end.required = false;
    }
};

export async function handleGeneratePDFReport(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Generating...';
    btn.disabled = true;
    lucide.createIcons();

    try {
        const module = document.getElementById('reportModule').value;
        const timeframe = document.getElementById('reportTimeframe').value;

        // Date range logic
        const now = new Date();
        let startDate = new Date(0);
        let endDate = new Date('2100-01-01');

        if (timeframe === 'daily') {
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000 - 1);
        } else if (timeframe === 'weekly') {
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            endDate = now;
        } else if (timeframe === 'monthly') {
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            endDate = now;
        } else if (timeframe === 'custom') {
            startDate = new Date(document.getElementById('reportStartDate').value);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(document.getElementById('reportEndDate').value);
            endDate.setHours(23, 59, 59, 999);
        }

        // Fetch Data based on module
        let data = [];
        let title = '';
        let columns = [];
        let rows = [];

        if (module === 'sales') {
            const res = await dbSales.fetchAll(state.branchId, { pageSize: 10000 });
            data = res.items.filter(s => {
                const d = new Date(s.created_at);
                return d >= startDate && d <= endDate;
            });
            title = 'Sales Report';
            columns = ['Date', 'Customer', 'Items', 'Total Amount', 'Status'];
            rows = data.map(s => [
                new Date(s.created_at).toLocaleDateString(),
                s.customer_name || 'Walk-in',
                s.items?.length || 0,
                fmt.currency(s.amount),
                s.status || 'completed'
            ]);
        } else if (module === 'expenses') {
            const res = await dbExpenses.fetchAll(state.branchId, { pageSize: 10000 });
            data = res.items.filter(e => {
                const d = new Date(e.created_at);
                return d >= startDate && d <= endDate;
            });
            title = 'Expenses Report';
            columns = ['Date', 'Category', 'Description', 'Amount'];
            rows = data.map(ex => [
                new Date(ex.created_at).toLocaleDateString(),
                ex.category || 'General',
                ex.description || 'N/A',
                fmt.currency(ex.amount)
            ]);
        } else if (module === 'inventory') {
            const res = await dbInventory.fetchAll(state.branchId, { pageSize: 10000 });
            data = res.items; // Inventory is a snapshot
            title = 'Inventory Report';
            columns = ['Product Name', 'SKU', 'Category', 'Quantity', 'Status'];
            rows = data.map(i => [
                i.name,
                i.sku || 'N/A',
                i.category || 'General',
                i.quantity,
                i.quantity <= i.min_threshold ? 'Low Stock' : 'OK'
            ]);
        } else if (module === 'loans') {
            const res = await dbLoans.fetchAll(state.branchId, { pageSize: 10000 });
            data = res.items.filter(e => {
                const d = new Date(e.created_at);
                return d >= startDate && d <= endDate;
            });
            title = 'Loans & Income Report';
            columns = ['Date', 'Type', 'Party', 'Description', 'Amount'];

            const typeMap = {
                income: { label: 'Other Income', isOut: false },
                loan_given: { label: 'Loan Given', isOut: true },
                loan_received: { label: 'Loan Received', isOut: false },
                repayment: { label: 'Repayment Received', isOut: false }
            };

            rows = data.map(ex => {
                const t = typeMap[ex.type] || typeMap.income;
                return [
                    new Date(ex.created_at).toLocaleDateString(),
                    t.label,
                    ex.party || 'Anonymous',
                    ex.notes || 'N/A',
                    `${t.isOut ? '-' : '+'}${fmt.currency(ex.amount)}`
                ];
            });
        } else if (module === 'income') {
            // Re-using dbLoans because 'income' is stored there under type 'income'
            const res = await dbLoans.fetchAll(state.branchId, { pageSize: 10000 });
            data = res.items.filter(e => {
                const d = new Date(e.created_at);
                return d >= startDate && d <= endDate && e.type === 'income';
            });
            title = 'Income Report';
            columns = ['Date', 'Source / Party', 'Description', 'Amount'];

            rows = data.map(ex => [
                new Date(ex.created_at).toLocaleDateString(),
                ex.party || 'Anonymous',
                ex.notes || 'N/A',
                fmt.currency(ex.amount)
            ]);
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        // Header Information
        const entName = (state.enterpriseName || 'BMS Enterprise').toUpperCase();
        const branch = state.branchProfile || (state.branches && state.branches.find(b => b.id === state.branchId)) || {};
        const bName = branch.name || 'Main Branch';
        const address = branch.address || branch.location || 'N/A';
        const bTin = branch.branch_tin || state.profile?.tax_id || 'N/A';
        const bRegNo = branch.branch_reg_no || branch.branch_code || 'N/A';
        const bPhone = branch.phone || state.profile?.phone || 'N/A';
        const bEmail = branch.email || state.profile?.email || 'N/A';

        // 1) HEADER BACKGROUND (Light Gray)
        doc.setFillColor(243, 244, 246); // gray-100
        doc.rect(0, 0, pageWidth, 40, 'F');

        // 2) ENTERPRISE NAME (Centered)
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39); // gray-900 (almost black)
        doc.text(entName, pageWidth / 2, 18, { align: 'center' });

        // Contact info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81); // gray-700
        const contactLine = `${address} | ${bPhone} | ${bEmail}`;
        doc.text(contactLine, pageWidth / 2, 26, { align: 'center' });

        // TIN & Reg
        const regLine = `TIN: ${bTin} | BL-No: ${bRegNo}`;
        doc.text(regLine, pageWidth / 2, 33, { align: 'center' });

        // Dark Horizontal Line separating header
        doc.setDrawColor(107, 114, 128); // gray-500
        doc.setLineWidth(0.8);
        doc.line(14, 40, pageWidth - 14, 40);

        // 3) REPORT TITLE
        let dTitle = title;
        if (timeframe === 'daily') dTitle = `Daily ${title}`;
        else if (module === 'sales') dTitle = 'Sales Report';
        else if (module === 'expenses') dTitle = 'Expenses Report';
        else if (module === 'inventory') dTitle = 'Inventory Report';
        else if (module === 'income') dTitle = 'Income Report';

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        doc.text(dTitle, 14, 52);

        // Date Line
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128); // gray-500
        let dateText = `Date: ${now.toLocaleDateString()}`;
        if (module !== 'inventory') {
            if (timeframe === 'all') {
                dateText = 'Date: All Time';
            } else if (timeframe === 'daily') {
                dateText = `Date: ${now.toLocaleDateString()}`;
            } else {
                dateText = `Date: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
            }
        }
        doc.text(dateText, 14, 60);

        // 4) SUMMARY BOX
        let currentY = 66;
        doc.setFillColor(243, 244, 246); // gray-100
        doc.setDrawColor(156, 163, 175); // border gray-400
        doc.setLineWidth(0.3);
        // doc.roundedRect(x, y, w, h, rx, ry, style)
        doc.roundedRect(14, currentY, pageWidth - 28, 40, 3, 3, 'FD');

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(17, 24, 39);
        let summaryBoxTitle = 'SUMMARY';
        if (timeframe === 'daily') summaryBoxTitle = "TODAY'S SUMMARY";
        else if (timeframe === 'weekly') summaryBoxTitle = "WEEKLY SUMMARY";
        else if (timeframe === 'monthly') summaryBoxTitle = "MONTHLY SUMMARY";
        else if (timeframe === 'custom') summaryBoxTitle = "PERIOD SUMMARY";
        doc.text(summaryBoxTitle, 18, currentY + 8);

        // Summary Text contents
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(55, 65, 81);

        let statLeft1 = '', statLeft2 = '';
        let statRight1 = '', statRight2 = '';
        let bottomStatus = '';

        if (module === 'sales') {
            const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
            statLeft1 = `Total Transactions: ${data.length}`;
            statLeft2 = `Revenue: ${fmt.currency(total)}`;
            statRight1 = `Avg Sale: ${data.length ? fmt.currency(total / data.length) : '0'}`;
            bottomStatus = total > 0 ? 'STATUS: ACTIVE SALES' : 'STATUS: NO SALES RECORDED';
        } else if (module === 'expenses') {
            const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
            statLeft1 = `Total Records: ${data.length}`;
            statLeft2 = `Expenses Amount: ${fmt.currency(total)}`;
            bottomStatus = total > 0 ? 'STATUS: EXPENSES TRACKED' : 'STATUS: NO EXPENSES';
        } else if (module === 'inventory') {
            const lowStockCount = data.filter(i => i.quantity <= i.min_threshold).length;
            statLeft1 = `Total SKU Items: ${data.length}`;
            statLeft2 = `Low Stock count: ${lowStockCount}`;
            bottomStatus = lowStockCount > 0 ? 'STATUS: ACTION NEEDED (RESTOCK)' : 'STATUS: OPTIMAL INVENTORY';
        } else if (module === 'loans') {
            const typeMap = { income: { isOut: false }, loan_given: { isOut: true }, loan_received: { isOut: false }, repayment: { isOut: false } };
            const totalIn = data.filter(r => !(typeMap[r.type] || {}).isOut).reduce((s, r) => s + (r.amount || 0), 0);
            const totalOut = data.filter(r => (typeMap[r.type] || {}).isOut).reduce((s, r) => s + (r.amount || 0), 0);
            statLeft1 = `Total Records: ${data.length}`;
            statLeft2 = `Income/Received: ${fmt.currency(totalIn)}`;
            statRight1 = `Outgoing Loans: ${fmt.currency(totalOut)}`;
            statRight2 = `Net Position: ${fmt.currency(totalIn - totalOut)}`;
            bottomStatus = totalIn >= totalOut ? 'STATUS: POSITIVE CASHFLOW' : 'STATUS: NEGATIVE CASHFLOW';
        } else if (module === 'income') {
            const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);
            statLeft1 = `Total Income Records: ${data.length}`;
            statLeft2 = `Total Income: ${fmt.currency(total)}`;
            bottomStatus = total > 0 ? 'STATUS: INCOME RECORDED' : 'STATUS: NO INCOME';
        }

        // Draw summary text
        const midX = pageWidth / 2 + 10;
        doc.text(statLeft1, 18, currentY + 16);
        doc.text(statLeft2, 18, currentY + 22);

        doc.text(statRight1, midX, currentY + 16);
        doc.text(statRight2, midX, currentY + 22);

        // Center bottom status text
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(107, 114, 128); // gray-500
        doc.text(bottomStatus, pageWidth / 2, currentY + 34, { align: 'center' });

        currentY += 50; // move past the box

        // 5) TABLE TITLE
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 41, 55); // gray-800
        doc.text(`${title} Data`, 14, currentY);

        currentY += 5;

        // 6) TABLE
        doc.autoTable({
            startY: currentY,
            head: [columns],
            body: rows,
            theme: 'striped',
            headStyles: { fillColor: [75, 85, 99], textColor: [255, 255, 255], fontStyle: 'bold' }, // grey-600
            styles: { fontSize: 9, cellPadding: 4, textColor: [55, 65, 81] },
            alternateRowStyles: { fillColor: [249, 250, 251] }, // gray-50
            margin: { top: 10, left: 14, right: 14, bottom: 20 },
            didDrawPage: function (dataInfo) {
                // PAGE FOOTER
                const str = 'Page ' + doc.internal.getNumberOfPages();
                const textFooterRight = 'BMS - Business Management System © ' + now.getFullYear();

                doc.setFillColor(243, 244, 246);
                doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');

                doc.setFontSize(9);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(107, 114, 128); // gray-500
                doc.text(str, 14, pageHeight - 6);
                doc.text(textFooterRight, pageWidth - 14, pageHeight - 6, { align: 'right' });
            }
        });

        // Save PDF
        doc.save(`${module}_report_${new Date().getTime()}.pdf`);


    } catch (err) {
        console.error("PDF generation failed:", err);
        showToast('Failed to generate report: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};
