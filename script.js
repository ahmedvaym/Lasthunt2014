
  // Initialize jsPDF
        const { jsPDF } = window.jspdf;
        
        // Data storage
        let sales = JSON.parse(localStorage.getItem('sales')) || [];
        let purchaseOrders = JSON.parse(localStorage.getItem('purchaseOrders')) || [];
        let salesItemCount = 1;
        let poItemCount = 1;
        
        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            // Set default dates to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('saleDate').value = today;
            document.getElementById('poDate').value = today;
            document.getElementById('salesStartDate').value = today;
            document.getElementById('salesEndDate').value = today;
            document.getElementById('poStartDate').value = today;
            document.getElementById('poEndDate').value = today;
            
            // Set up event listeners for buttons
            document.getElementById('salesBtn').addEventListener('click', () => showSection('salesSection'));
            document.getElementById('requestPurchaseBtn').addEventListener('click', () => showSection('requestPurchaseSection'));
            document.getElementById('viewSalesBtn').addEventListener('click', () => {
                showSection('viewSalesSection');
                loadSalesTable();
            });
            document.getElementById('viewPurchaseBtn').addEventListener('click', () => {
                showSection('viewPurchaseSection');
                loadPurchaseTable();
            });
            
            // Calculate initial totals
            calculateSalesTotalAmount();
            calculatePOTotalAmount();
        });
        
        // Show selected section
        function showSection(sectionId) {
            // Hide all sections
            document.querySelectorAll('.section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show selected section
            document.getElementById(sectionId).classList.add('active');
            
            // Update button states
            document.querySelectorAll('.button-group button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Set active button
            if (sectionId === 'salesSection') {
                document.getElementById('salesBtn').classList.add('active');
            } else if (sectionId === 'requestPurchaseSection') {
                document.getElementById('requestPurchaseBtn').classList.add('active');
            } else if (sectionId === 'viewSalesSection') {
                document.getElementById('viewSalesBtn').classList.add('active');
            } else if (sectionId === 'viewPurchaseSection') {
                document.getElementById('viewPurchaseBtn').classList.add('active');
            }
        }
        
        // ==================== SALES FUNCTIONS ====================
        function addSalesItem() {
            salesItemCount++;
            const container = document.getElementById('salesItemsContainer');
            const newItem = document.createElement('div');
            newItem.className = 'item-row';
            newItem.innerHTML = `
                <div class="form-group">
                    <label for="itemCategory${salesItemCount}">Category</label>
                    <select id="itemCategory${salesItemCount}" class="item-category">
                        <option value="">Select Category</option>
                        <option value="Wheel Barrow">Wheel Barrow</option>
                        <option value="Fiber Items">Fiber Items</option>
                        <option value="Hardware">Hardware</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="itemName${salesItemCount}">Item Description</label>
                    <input type="text" id="itemName${salesItemCount}" class="item-name" placeholder="Item description">
                </div>
                <div class="form-group">
                    <label for="itemQty${salesItemCount}">Quantity</label>
                    <input type="number" id="itemQty${salesItemCount}" class="item-qty" min="1" value="1" oninput="calculateSalesRowTotal(this)">
                </div>
                <div class="form-group">
                    <label for="itemPrice${salesItemCount}">Price</label>
                    <input type="number" id="itemPrice${salesItemCount}" class="item-price" min="0" step="0.01" placeholder="0.00" oninput="calculateSalesRowTotal(this)">
                </div>
                <div class="form-group">
                    <label>Total</label>
                    <div class="item-total">0.00</div>
                </div>
                <button class="remove-btn" onclick="removeSalesItem(this)">Remove</button>
            `;
            container.appendChild(newItem);
        }
        
        function removeSalesItem(button) {
            const container = document.getElementById('salesItemsContainer');
            if (container.children.length > 1) {
                button.parentElement.remove();
                calculateSalesTotalAmount();
            } else {
                alert("You must have at least one item in the sale.");
            }
        }
        
        function calculateSalesRowTotal(input) {
            const row = input.closest('.item-row');
            const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const total = qty * price;
            
            row.querySelector('.item-total').textContent = total.toFixed(2);
            calculateSalesTotalAmount();
        }
        
        function calculateSalesTotalAmount() {
            let totalAmount = 0;
            const rows = document.querySelectorAll('#salesItemsContainer .item-row');
            
            rows.forEach(row => {
                const total = parseFloat(row.querySelector('.item-total').textContent) || 0;
                totalAmount += total;
            });
            
            document.getElementById('salesTotalAmount').textContent = totalAmount.toFixed(2);
        }
        
        function saveSale() {
            const date = document.getElementById('saleDate').value;
            const customer = document.getElementById('customerName').value.trim();
            const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
            
            if (!date) {
                showAlert('salesAlert', 'Please select a date', 'error');
                return;
            }
            
            if (!customer) {
                showAlert('salesAlert', 'Please enter customer name', 'error');
                return;
            }
            
            if (!invoiceNumber) {
                showAlert('salesAlert', 'Please enter invoice number', 'error');
                return;
            }
            
            // Collect items
            const items = [];
            let totalAmount = 0;
            const itemRows = document.querySelectorAll('#salesItemsContainer .item-row');
            
            itemRows.forEach(row => {
                const category = row.querySelector('.item-category').value || 'Uncategorized';
                const name = row.querySelector('.item-name').value.trim();
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const total = parseFloat(row.querySelector('.item-total').textContent) || 0;
                
                if (name && qty > 0) {
                    items.push({
                        category,
                        name,
                        quantity: qty,
                        price,
                        total
                    });
                    totalAmount += total;
                }
            });
            
            if (items.length === 0) {
                showAlert('salesAlert', 'Please add at least one valid item', 'error');
                return;
            }
            
            // Create sale object
            const sale = {
                id: 'sale-' + Date.now(),
                date,
                invoiceNumber,
                customer,
                items,
                totalAmount,
                timestamp: new Date().toISOString()
            };
            
            // Save to storage
            sales.push(sale);
            localStorage.setItem('sales', JSON.stringify(sales));
            
            showAlert('salesAlert', 'Sale saved successfully!', 'success');
            
            // Reset form (keep one empty row)
            document.getElementById('customerName').value = '';
            document.getElementById('invoiceNumber').value = '';
            document.getElementById('salesItemsContainer').innerHTML = `
                <div class="item-row">
                    <div class="form-group">
                        <label for="itemCategory1">Category</label>
                        <select id="itemCategory1" class="item-category">
                            <option value="">Select Category</option>
                            <option value="Wheel Barrow">Wheel Barrow</option>
                            <option value="Fiber Items">Fiber Items</option>
                            <option value="Hardware">Hardware</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="itemName1">Item Description</label>
                        <input type="text" id="itemName1" class="item-name" placeholder="Item description">
                    </div>
                    <div class="form-group">
                        <label for="itemQty1">Quantity</label>
                        <input type="number" id="itemQty1" class="item-qty" min="1" value="1" oninput="calculateSalesRowTotal(this)">
                    </div>
                    <div class="form-group">
                        <label for="itemPrice1">Price</label>
                        <input type="number" id="itemPrice1" class="item-price" min="0" step="0.01" placeholder="0.00" oninput="calculateSalesRowTotal(this)">
                    </div>
                    <div class="form-group">
                        <label>Total</label>
                        <div class="item-total">0.00</div>
                    </div>
                    <button class="remove-btn" onclick="removeSalesItem(this)">Remove</button>
                </div>
            `;
            document.getElementById('salesTotalAmount').textContent = '0.00';
            salesItemCount = 1;
            
            // Reload the sales table
            loadSalesTable();
        }
        
        function downloadSale() {
            const date = document.getElementById('saleDate').value;
            const customer = document.getElementById('customerName').value.trim();
            const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
            
            if (!date) {
                showAlert('salesAlert', 'Please select a date', 'error');
                return;
            }
            
            if (!customer) {
                showAlert('salesAlert', 'Please enter customer name', 'error');
                return;
            }
            
            if (!invoiceNumber) {
                showAlert('salesAlert', 'Please enter invoice number', 'error');
                return;
            }
            
            // Collect items
            const items = [];
            let totalAmount = 0;
            const itemRows = document.querySelectorAll('#salesItemsContainer .item-row');
            
            itemRows.forEach(row => {
                const category = row.querySelector('.item-category').value || 'Uncategorized';
                const name = row.querySelector('.item-name').value.trim();
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const total = parseFloat(row.querySelector('.item-total').textContent) || 0;
                
                if (name && qty > 0) {
                    items.push({
                        category,
                        name,
                        quantity: qty,
                        price,
                        total
                    });
                    totalAmount += total;
                }
            });
            
            if (items.length === 0) {
                showAlert('salesAlert', 'Please add at least one valid item', 'error');
                return;
            }
            
            // Create CSV content
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `Sales Invoice\n`;
            csvContent += `Date: ${date}\n`;
            csvContent += `Invoice Number: ${invoiceNumber}\n`;
            csvContent += `Customer: ${customer}\n`;
            csvContent += `Total Amount: ${totalAmount.toFixed(2)}\n\n`;
            csvContent += "Category,Item Description,Quantity,Price,Total\n";
            
            items.forEach(item => {
                csvContent += `"${item.category}","${item.name}",${item.quantity},${item.price.toFixed(2)},${item.total.toFixed(2)}\n`;
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Invoice_${invoiceNumber}_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        function exportSaleToPDF() {
            const date = document.getElementById('saleDate').value;
            const customer = document.getElementById('customerName').value.trim();
            const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
            
            if (!date) {
                showAlert('salesAlert', 'Please select a date', 'error');
                return;
            }
            
            if (!customer) {
                showAlert('salesAlert', 'Please enter customer name', 'error');
                return;
            }
            
            if (!invoiceNumber) {
                showAlert('salesAlert', 'Please enter invoice number', 'error');
                return;
            }
            
            // Collect items
            const items = [];
            let totalAmount = 0;
            const itemRows = document.querySelectorAll('#salesItemsContainer .item-row');
            
            itemRows.forEach(row => {
                const category = row.querySelector('.item-category').value || 'Uncategorized';
                const name = row.querySelector('.item-name').value.trim();
                const qty = parseFloat(row.querySelector('.item-qty').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const total = parseFloat(row.querySelector('.item-total').textContent) || 0;
                
                if (name && qty > 0) {
                    items.push({
                        category,
                        name,
                        quantity: qty,
                        price,
                        total
                    });
                    totalAmount += total;
                }
            });
            
            if (items.length === 0) {
                showAlert('salesAlert', 'Please add at least one valid item', 'error');
                return;
            }
            
            // Create PDF document
            const doc = new jsPDF();
            
            // Add header
            doc.setFontSize(18);
            doc.text('SALES INVOICE', 105, 15, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`Invoice Number: ${invoiceNumber}`, 14, 25);
            doc.text(`Date: ${date}`, 14, 30);
            doc.text(`Customer: ${customer}`, 14, 35);
            
            // Add items table
            const tableData = items.map(item => [
                item.category,
                item.name,
                item.quantity,
                `$${item.price.toFixed(2)}`,
                `$${item.total.toFixed(2)}`
            ]);
            
            // Add total amount
            tableData.push(['', '', '', 'Total:', `$${totalAmount.toFixed(2)}`]);
            
            doc.autoTable({
                head: [['Category', 'Description', 'Qty', 'Unit Price', 'Total']],
                body: tableData,
                startY: 45,
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    halign: 'right'
                },
                columnStyles: {
                    0: { halign: 'left' },
                    1: { halign: 'left' }
                },
                margin: { top: 45 }
            });
            
            // Save the PDF
            doc.save(`Invoice_${invoiceNumber}_${date}.pdf`);
        }
        
        function loadSalesTable() {
            const tableBody = document.querySelector('#salesTable tbody');
            tableBody.innerHTML = '';
            
            if (sales.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No sales records found</td></tr>';
                return;
            }
            
            // Sort by date (newest first)
            sales.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            sales.forEach(sale => {
                const row = document.createElement('tr');
                const itemsText = sale.items.map(item => 
                    `${item.quantity} x ${item.name} (${item.price.toFixed(2)})`
                ).join(', ');
                
                row.innerHTML = `
                    <td>${sale.date}</td>
                    <td>${sale.invoiceNumber}</td>
                    <td>${sale.customer}</td>
                    <td>${itemsText}</td>
                    <td>${sale.totalAmount.toFixed(2)}</td>
                    <td>
                        <button onclick="downloadSingleSale('${sale.id}')">CSV</button>
                        <button class="pdf-btn" onclick="exportSingleSaleToPDF('${sale.id}')">PDF</button>
                        <button class="remove-btn" onclick="deleteSale('${sale.id}')">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        function filterSales() {
            const startDate = document.getElementById('salesStartDate').value;
            const endDate = document.getElementById('salesEndDate').value;
            const customerFilter = document.getElementById('salesCustomerFilter').value.toLowerCase();
            
            const filteredSales = sales.filter(sale => {
                const dateMatch = (!startDate || sale.date >= startDate) && 
                                (!endDate || sale.date <= endDate);
                const customerMatch = !customerFilter || 
                                    sale.customer.toLowerCase().includes(customerFilter);
                return dateMatch && customerMatch;
            });
            
            const tableBody = document.querySelector('#salesTable tbody');
            tableBody.innerHTML = '';
            
            if (filteredSales.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No matching sales found</td></tr>';
                return;
            }
            
            filteredSales.forEach(sale => {
                const row = document.createElement('tr');
                const itemsText = sale.items.map(item => 
                    `${item.quantity} x ${item.name} (${item.price.toFixed(2)})`
                ).join(', ');
                
                row.innerHTML = `
                    <td>${sale.date}</td>
                    <td>${sale.invoiceNumber}</td>
                    <td>${sale.customer}</td>
                    <td>${itemsText}</td>
                    <td>${sale.totalAmount.toFixed(2)}</td>
                    <td>
                        <button onclick="downloadSingleSale('${sale.id}')">CSV</button>
                        <button class="pdf-btn" onclick="exportSingleSaleToPDF('${sale.id}')">PDF</button>
                        <button class="remove-btn" onclick="deleteSale('${sale.id}')">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        function downloadSingleSale(saleId) {
            const sale = sales.find(s => s.id === saleId);
            if (!sale) return;
            
            // Create CSV content
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `Sales Invoice\n`;
            csvContent += `Date: ${sale.date}\n`;
            csvContent += `Invoice Number: ${sale.invoiceNumber}\n`;
            csvContent += `Customer: ${sale.customer}\n`;
            csvContent += `Total Amount: ${sale.totalAmount.toFixed(2)}\n\n`;
            csvContent += "Category,Item Description,Quantity,Price,Total\n";
            
            sale.items.forEach(item => {
                csvContent += `"${item.category || 'Uncategorized'}","${item.name}",${item.quantity},${item.price.toFixed(2)},${item.total.toFixed(2)}\n`;
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `Invoice_${sale.invoiceNumber}_${sale.date}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        function exportSingleSaleToPDF(saleId) {
            const sale = sales.find(s => s.id === saleId);
            if (!sale) return;
            
            // Create PDF document
            const doc = new jsPDF();
            
            // Add header
            doc.setFontSize(18);
            doc.text('SALES INVOICE', 105, 15, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`Invoice Number: ${sale.invoiceNumber}`, 14, 25);
            doc.text(`Date: ${sale.date}`, 14, 30);
            doc.text(`Customer: ${sale.customer}`, 14, 35);
            
            // Add items table
            const tableData = sale.items.map(item => [
                item.category || 'Uncategorized',
                item.name,
                item.quantity,
                `$${item.price.toFixed(2)}`,
                `$${item.total.toFixed(2)}`
            ]);
            
            // Add total amount
            tableData.push(['', '', '', 'Total:', `$${sale.totalAmount.toFixed(2)}`]);
            
            doc.autoTable({
                head: [['Category', 'Description', 'Qty', 'Unit Price', 'Total']],
                body: tableData,
                startY: 45,
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    halign: 'right'
                },
                columnStyles: {
                    0: { halign: 'left' },
                    1: { halign: 'left' }
                },
                margin: { top: 45 }
            });
            
            // Save the PDF
            doc.save(`Invoice_${sale.invoiceNumber}_${sale.date}.pdf`);
        }
        
        function exportAllSalesToPDF() {
            if (sales.length === 0) {
                alert('No sales to export');
                return;
            }
            
            // Create PDF document
            const doc = new jsPDF();
            let yPos = 15;
            
            // Sort by date (oldest first for the report)
            const sortedSales = [...sales].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Add a title
            doc.setFontSize(18);
            doc.text('SALES REPORT', 105, yPos, { align: 'center' });
            yPos += 15;
            
            // Add date range
            const startDate = document.getElementById('salesStartDate').value || 'N/A';
            const endDate = document.getElementById('salesEndDate').value || 'N/A';
            doc.setFontSize(12);
            doc.text(`Date Range: ${startDate} to ${endDate}`, 14, yPos);
            yPos += 10;
            
            // Add customer filter if applied
            const customerFilter = document.getElementById('salesCustomerFilter').value;
            if (customerFilter) {
                doc.text(`Customer Filter: ${customerFilter}`, 14, yPos);
                yPos += 10;
            }
            
            yPos += 5;
            
            // Add summary table
            const summaryData = sortedSales.map(sale => [
                sale.date,
                sale.invoiceNumber,
                sale.customer,
                sale.items.length,
                `$${sale.totalAmount.toFixed(2)}`
            ]);
            
            // Add total
            const grandTotal = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
            summaryData.push(['', '', '', 'Total:', `$${grandTotal.toFixed(2)}`]);
            
            doc.autoTable({
                head: [['Date', 'Invoice #', 'Customer', 'Items', 'Total']],
                body: summaryData,
                startY: yPos,
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    halign: 'right'
                },
                columnStyles: {
                    0: { halign: 'left' },
                    1: { halign: 'left' },
                    2: { halign: 'left' }
                },
                margin: { top: yPos }
            });
            
            // Save the PDF
            doc.save(`Sales_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        }
        
        function downloadAllSales() {
            if (sales.length === 0) {
                alert('No sales to download');
                return;
            }
            
            // Create CSV content
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Date,Invoice Number,Customer,Category,Item Description,Quantity,Price,Total\n";
            
            sales.forEach(sale => {
                sale.items.forEach(item => {
                    csvContent += `${sale.date},${sale.invoiceNumber},"${sale.customer}","${item.category || 'Uncategorized'}","${item.name}",${item.quantity},${item.price.toFixed(2)},${item.total.toFixed(2)}\n`;
                });
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `All_Sales_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        function deleteSale(saleId) {
            if (confirm('Are you sure you want to delete this sale?')) {
                sales = sales.filter(sale => sale.id !== saleId);
                localStorage.setItem('sales', JSON.stringify(sales));
                loadSalesTable();
            }
        }
        
        // ==================== PURCHASE ORDER FUNCTIONS ====================
        function addPOItem() {
            poItemCount++;
            const container = document.getElementById('poItemsContainer');
            const newItem = document.createElement('div');
            newItem.className = 'item-row';
            newItem.innerHTML = `
                <div class="form-group">
                    <label for="poItemName${poItemCount}">Item Description</label>
                    <input type="text" id="poItemName${poItemCount}" class="po-item-name" placeholder="Item description">
                </div>
                <div class="form-group">
                    <label for="poItemQty${poItemCount}">Quantity</label>
                    <input type="number" id="poItemQty${poItemCount}" class="po-item-qty" min="1" value="1" oninput="calculatePORowTotal(this)">
                </div>
                <div class="form-group">
                    <label for="poItemUnit${poItemCount}">Unit</label>
                    <select id="poItemUnit${poItemCount}" class="po-item-unit">
                        <option value="Pcs">Pcs</option>
                        <option value="Kg">Kg</option>
                        <option value="Ltr">Ltr</option>
                        <option value="Box">Box</option>
                        <option value="Set">Set</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="poItemPrice${poItemCount}">Unit Price</label>
                    <input type="number" id="poItemPrice${poItemCount}" class="po-item-price" min="0" step="0.01" placeholder="0.00" oninput="calculatePORowTotal(this)">
                </div>
                <div class="form-group">
                    <label>Total</label>
                    <div class="po-item-total">0.00</div>
                </div>
                <button class="remove-btn" onclick="removePOItem(this)">Remove</button>
            `;
            container.appendChild(newItem);
        }
        
        function removePOItem(button) {
            const container = document.getElementById('poItemsContainer');
            if (container.children.length > 1) {
                button.parentElement.remove();
                calculatePOTotalAmount();
            } else {
                alert("You must have at least one item in the purchase order.");
            }
        }
        
        function calculatePORowTotal(input) {
            const row = input.closest('.item-row');
            const qty = parseFloat(row.querySelector('.po-item-qty').value) || 0;
            const price = parseFloat(row.querySelector('.po-item-price').value) || 0;
            const total = qty * price;
            
            row.querySelector('.po-item-total').textContent = total.toFixed(2);
            calculatePOTotalAmount();
        }
        
        function calculatePOTotalAmount() {
            let totalAmount = 0;
            const rows = document.querySelectorAll('#poItemsContainer .item-row');
            
            rows.forEach(row => {
                const total = parseFloat(row.querySelector('.po-item-total').textContent) || 0;
                totalAmount += total;
            });
            
            document.getElementById('poTotalAmount').textContent = totalAmount.toFixed(2);
        }
        
        function savePurchaseOrder() {
            const date = document.getElementById('poDate').value;
            const supplier = document.getElementById('supplierName').value.trim();
            const poNumber = document.getElementById('poNumber').value.trim();
            
            if (!date) {
                showAlert('poAlert', 'Please select a date', 'error');
                return;
            }
            
            if (!supplier) {
                showAlert('poAlert', 'Please enter supplier name', 'error');
                return;
            }
            
            if (!poNumber) {
                showAlert('poAlert', 'Please enter PO number', 'error');
                return;
            }
            
            // Collect items
            const items = [];
            let totalAmount = 0;
            const itemRows = document.querySelectorAll('#poItemsContainer .item-row');
            
            itemRows.forEach(row => {
                const name = row.querySelector('.po-item-name').value.trim();
                const qty = parseFloat(row.querySelector('.po-item-qty').value) || 0;
                const unit = row.querySelector('.po-item-unit').value;
                const price = parseFloat(row.querySelector('.po-item-price').value) || 0;
                const total = parseFloat(row.querySelector('.po-item-total').textContent) || 0;
                
                if (name && qty > 0) {
                    items.push({
                        name,
                        quantity: qty,
                        unit,
                        price,
                        total
                    });
                    totalAmount += total;
                }
            });
            
            if (items.length === 0) {
                showAlert('poAlert', 'Please add at least one valid item', 'error');
                return;
            }
            
            // Create purchase order object
            const po = {
                id: 'po-' + Date.now(),
                date,
                poNumber,
                supplier,
                items,
                totalAmount,
                timestamp: new Date().toISOString()
            };
            
            // Save to storage
            purchaseOrders.push(po);
            localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
            
            showAlert('poAlert', 'Purchase order saved successfully!', 'success');
            
            // Reset form (keep one empty row)
            document.getElementById('supplierName').value = '';
            document.getElementById('poNumber').value = '';
            document.getElementById('poItemsContainer').innerHTML = `
                <div class="item-row">
                    <div class="form-group">
                        <label for="poItemName1">Item Description</label>
                        <input type="text" id="poItemName1" class="po-item-name" placeholder="Item description">
                    </div>
                    <div class="form-group">
                        <label for="poItemQty1">Quantity</label>
                        <input type="number" id="poItemQty1" class="po-item-qty" min="1" value="1" oninput="calculatePORowTotal(this)">
                    </div>
                    <div class="form-group">
                        <label for="poItemUnit1">Unit</label>
                        <select id="poItemUnit1" class="po-item-unit">
                            <option value="Pcs">Pcs</option>
                            <option value="Kg">Kg</option>
                            <option value="Ltr">Ltr</option>
                            <option value="Box">Box</option>
                            <option value="Set">Set</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="poItemPrice1">Unit Price</label>
                        <input type="number" id="poItemPrice1" class="po-item-price" min="0" step="0.01" placeholder="0.00" oninput="calculatePORowTotal(this)">
                    </div>
                    <div class="form-group">
                        <label>Total</label>
                        <div class="po-item-total">0.00</div>
                    </div>
                    <button class="remove-btn" onclick="removePOItem(this)">Remove</button>
                </div>
            `;
            document.getElementById('poTotalAmount').textContent = '0.00';
            poItemCount = 1;
            
            // Reload the purchase orders table
            loadPurchaseTable();
        }
        
        function downloadPurchaseOrder() {
            const date = document.getElementById('poDate').value;
            const supplier = document.getElementById('supplierName').value.trim();
            const poNumber = document.getElementById('poNumber').value.trim();
            
            if (!date) {
                showAlert('poAlert', 'Please select a date', 'error');
                return;
            }
            
            if (!supplier) {
                showAlert('poAlert', 'Please enter supplier name', 'error');
                return;
            }
            
            if (!poNumber) {
                showAlert('poAlert', 'Please enter PO number', 'error');
                return;
            }
            
            // Collect items
            const items = [];
            let totalAmount = 0;
            const itemRows = document.querySelectorAll('#poItemsContainer .item-row');
            
            itemRows.forEach(row => {
                const name = row.querySelector('.po-item-name').value.trim();
                const qty = parseFloat(row.querySelector('.po-item-qty').value) || 0;
                const unit = row.querySelector('.po-item-unit').value;
                const price = parseFloat(row.querySelector('.po-item-price').value) || 0;
                const total = parseFloat(row.querySelector('.po-item-total').textContent) || 0;
                
                if (name && qty > 0) {
                    items.push({
                        name,
                        quantity: qty,
                        unit,
                        price,
                        total
                    });
                    totalAmount += total;
                }
            });
            
            if (items.length === 0) {
                showAlert('poAlert', 'Please add at least one valid item', 'error');
                return;
            }
            
            // Create CSV content
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `Purchase Order Request\n`;
            csvContent += `Date: ${date}\n`;
            csvContent += `PO Number: ${poNumber}\n`;
            csvContent += `Supplier: ${supplier}\n`;
            csvContent += `Total Amount: ${totalAmount.toFixed(2)}\n\n`;
            csvContent += "Item Description,Quantity,Unit,Unit Price,Total\n";
            
            items.forEach(item => {
                csvContent += `"${item.name}",${item.quantity},${item.unit},${item.price.toFixed(2)},${item.total.toFixed(2)}\n`;
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `PO_Request_${poNumber}_${date}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        function exportPOToPDF() {
            const date = document.getElementById('poDate').value;
            const supplier = document.getElementById('supplierName').value.trim();
            const poNumber = document.getElementById('poNumber').value.trim();
            
            if (!date) {
                showAlert('poAlert', 'Please select a date', 'error');
                return;
            }
            
            if (!supplier) {
                showAlert('poAlert', 'Please enter supplier name', 'error');
                return;
            }
            
            if (!poNumber) {
                showAlert('poAlert', 'Please enter PO number', 'error');
                return;
            }
            
            // Collect items
            const items = [];
            let totalAmount = 0;
            const itemRows = document.querySelectorAll('#poItemsContainer .item-row');
            
            itemRows.forEach(row => {
                const name = row.querySelector('.po-item-name').value.trim();
                const qty = parseFloat(row.querySelector('.po-item-qty').value) || 0;
                const unit = row.querySelector('.po-item-unit').value;
                const price = parseFloat(row.querySelector('.po-item-price').value) || 0;
                const total = parseFloat(row.querySelector('.po-item-total').textContent) || 0;
                
                if (name && qty > 0) {
                    items.push({
                        name,
                        quantity: qty,
                        unit,
                        price,
                        total
                    });
                    totalAmount += total;
                }
            });
            
            if (items.length === 0) {
                showAlert('poAlert', 'Please add at least one valid item', 'error');
                return;
            }
            
            // Create PDF document
            const doc = new jsPDF();
            
            // Add header
            doc.setFontSize(18);
            doc.text('PURCHASE ORDER REQUEST', 105, 15, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`PO Number: ${poNumber}`, 14, 25);
            doc.text(`Date: ${date}`, 14, 30);
            doc.text(`Supplier: ${supplier}`, 14, 35);
            
            // Add items table
            const tableData = items.map(item => [
                item.name,
                item.quantity,
                item.unit,
                `$${item.price.toFixed(2)}`,
                `$${item.total.toFixed(2)}`
            ]);
            
            // Add total amount
            tableData.push(['', '', '', 'Total:', `$${totalAmount.toFixed(2)}`]);
            
            doc.autoTable({
                head: [['Description', 'Qty', 'Unit', 'Unit Price', 'Total']],
                body: tableData,
                startY: 45,
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    halign: 'right'
                },
                columnStyles: {
                    0: { halign: 'left' }
                },
                margin: { top: 45 }
            });
            
            // Save the PDF
            doc.save(`PO_Request_${poNumber}_${date}.pdf`);
        }
        
        function loadPurchaseTable() {
            const tableBody = document.querySelector('#purchaseTable tbody');
            tableBody.innerHTML = '';
            
            if (purchaseOrders.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No purchase orders found</td></tr>';
                return;
            }
            
            // Sort by date (newest first)
            purchaseOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            purchaseOrders.forEach(po => {
                const row = document.createElement('tr');
                const itemsText = po.items.map(item => 
                    `${item.quantity} ${item.unit} ${item.name}`
                ).join(', ');
                
                row.innerHTML = `
                    <td>${po.date}</td>
                    <td>${po.poNumber}</td>
                    <td>${po.supplier}</td>
                    <td>${itemsText}</td>
                    <td>${po.totalAmount.toFixed(2)}</td>
                    <td>
                        <button onclick="downloadSinglePO('${po.id}')">CSV</button>
                        <button class="pdf-btn" onclick="exportSinglePOToPDF('${po.id}')">PDF</button>
                        <button class="remove-btn" onclick="deletePO('${po.id}')">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        function filterPurchaseOrders() {
            const startDate = document.getElementById('poStartDate').value;
            const endDate = document.getElementById('poEndDate').value;
            const supplierFilter = document.getElementById('poSupplierFilter').value.toLowerCase();
            
            const filteredPOs = purchaseOrders.filter(po => {
                const dateMatch = (!startDate || po.date >= startDate) && 
                                (!endDate || po.date <= endDate);
                const supplierMatch = !supplierFilter || 
                                    po.supplier.toLowerCase().includes(supplierFilter);
                return dateMatch && supplierMatch;
            });
            
            const tableBody = document.querySelector('#purchaseTable tbody');
            tableBody.innerHTML = '';
            
            if (filteredPOs.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6">No matching purchase orders found</td></tr>';
                return;
            }
            
            filteredPOs.forEach(po => {
                const row = document.createElement('tr');
                const itemsText = po.items.map(item => 
                    `${item.quantity} ${item.unit} ${item.name}`
                ).join(', ');
                
                row.innerHTML = `
                    <td>${po.date}</td>
                    <td>${po.poNumber}</td>
                    <td>${po.supplier}</td>
                    <td>${itemsText}</td>
                    <td>${po.totalAmount.toFixed(2)}</td>
                    <td>
                        <button onclick="downloadSinglePO('${po.id}')">CSV</button>
                        <button class="pdf-btn" onclick="exportSinglePOToPDF('${po.id}')">PDF</button>
                        <button class="remove-btn" onclick="deletePO('${po.id}')">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
        
        function downloadSinglePO(poId) {
            const po = purchaseOrders.find(p => p.id === poId);
            if (!po) return;
            
            // Create CSV content
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `Purchase Order Request\n`;
            csvContent += `Date: ${po.date}\n`;
            csvContent += `PO Number: ${po.poNumber}\n`;
            csvContent += `Supplier: ${po.supplier}\n`;
            csvContent += `Total Amount: ${po.totalAmount.toFixed(2)}\n\n`;
            csvContent += "Item Description,Quantity,Unit,Unit Price,Total\n";
            
            po.items.forEach(item => {
                csvContent += `"${item.name}",${item.quantity},${item.unit},${item.price.toFixed(2)},${item.total.toFixed(2)}\n`;
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `PO_Request_${po.poNumber}_${po.date}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        function exportSinglePOToPDF(poId) {
            const po = purchaseOrders.find(p => p.id === poId);
            if (!po) return;
            
            // Create PDF document
            const doc = new jsPDF();
            
            // Add header
            doc.setFontSize(18);
            doc.text('PURCHASE ORDER REQUEST', 105, 15, { align: 'center' });
            
            doc.setFontSize(12);
            doc.text(`PO Number: ${po.poNumber}`, 14, 25);
            doc.text(`Date: ${po.date}`, 14, 30);
            doc.text(`Supplier: ${po.supplier}`, 14, 35);
            
            // Add items table
            const tableData = po.items.map(item => [
                item.name,
                item.quantity,
                item.unit,
                `$${item.price.toFixed(2)}`,
                `$${item.total.toFixed(2)}`
            ]);
            
            // Add total amount
            tableData.push(['', '', '', 'Total:', `$${po.totalAmount.toFixed(2)}`]);
            
            doc.autoTable({
                head: [['Description', 'Qty', 'Unit', 'Unit Price', 'Total']],
                body: tableData,
                startY: 45,
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    halign: 'right'
                },
                columnStyles: {
                    0: { halign: 'left' }
                },
                margin: { top: 45 }
            });
            
            // Save the PDF
            doc.save(`PO_Request_${po.poNumber}_${po.date}.pdf`);
        }
        
        function exportAllPOsToPDF() {
            if (purchaseOrders.length === 0) {
                alert('No purchase orders to export');
                return;
            }
            
            // Create PDF document
            const doc = new jsPDF();
            let yPos = 15;
            
            // Sort by date (oldest first for the report)
            const sortedPOs = [...purchaseOrders].sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Add a title
            doc.setFontSize(18);
            doc.text('PURCHASE ORDER REPORT', 105, yPos, { align: 'center' });
            yPos += 15;
            
            // Add date range
            const startDate = document.getElementById('poStartDate').value || 'N/A';
            const endDate = document.getElementById('poEndDate').value || 'N/A';
            doc.setFontSize(12);
            doc.text(`Date Range: ${startDate} to ${endDate}`, 14, yPos);
            yPos += 10;
            
            // Add supplier filter if applied
            const supplierFilter = document.getElementById('poSupplierFilter').value;
            if (supplierFilter) {
                doc.text(`Supplier Filter: ${supplierFilter}`, 14, yPos);
                yPos += 10;
            }
            
            yPos += 5;
            
            // Add summary table
            const summaryData = sortedPOs.map(po => [
                po.date,
                po.poNumber,
                po.supplier,
                po.items.length,
                `$${po.totalAmount.toFixed(2)}`
            ]);
            
            // Add total
            const grandTotal = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
            summaryData.push(['', '', '', 'Total:', `$${grandTotal.toFixed(2)}`]);
            
            doc.autoTable({
                head: [['Date', 'PO #', 'Supplier', 'Items', 'Total']],
                body: summaryData,
                startY: yPos,
                styles: {
                    fontSize: 10,
                    cellPadding: 3,
                    halign: 'right'
                },
                columnStyles: {
                    0: { halign: 'left' },
                    1: { halign: 'left' },
                    2: { halign: 'left' }
                },
                margin: { top: yPos }
            });
            
            // Save the PDF
            doc.save(`PO_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        }
        
        function downloadAllPurchaseOrders() {
            if (purchaseOrders.length === 0) {
                alert('No purchase orders to download');
                return;
            }
            
            // Create CSV content
            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += "Date,PO Number,Supplier,Item Description,Quantity,Unit,Unit Price,Total\n";
            
            purchaseOrders.forEach(po => {
                po.items.forEach(item => {
                    csvContent += `${po.date},${po.poNumber},"${po.supplier}","${item.name}",${item.quantity},${item.unit},${item.price.toFixed(2)},${item.total.toFixed(2)}\n`;
                });
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `All_PO_Requests_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        function deletePO(poId) {
            if (confirm('Are you sure you want to delete this purchase order?')) {
                purchaseOrders = purchaseOrders.filter(po => po.id !== poId);
                localStorage.setItem('purchaseOrders', JSON.stringify(purchaseOrders));
                loadPurchaseTable();
            }
        }
        
        // Utility functions
        function showAlert(elementId, message, type) {
            const element = document.getElementById(elementId);
            element.textContent = message;
            element.classList.remove('hidden');
            element.className = 'alert ' + (type === 'success' ? 'alert-success' : 'alert-error');
            setTimeout(() => element.classList.add('hidden'), 3000);
        }