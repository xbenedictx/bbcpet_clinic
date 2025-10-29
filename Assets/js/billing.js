// BBC Veterinary Clinic - Billing Module

// Render billing page
function renderBillingPage() {
    const billingPage = document.getElementById("billing-page");

    if (AppState.userType === "admin") {
        renderAdminBillingPage(billingPage);
    } else {
        renderUserBillingPage(billingPage);
    }
}

// Render admin billing page
function renderAdminBillingPage(container) {
    const allInvoices = getAllInvoices();

    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="fw-bold text-white mb-0">
                            <i class="fas fa-file-invoice-dollar me-2"></i>
                            Billing Management
                        </h2>
                        <p class="text-white">Manage invoices and billing for all clients</p>
                    </div>
                    <button class="btn btn-primary" onclick="showCreateInvoiceModal()">
                        <i class="fas fa-plus me-2"></i>Create Invoice
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Billing Stats -->
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="stat-card success">
                    <div class="stat-icon success">
                        <i class="fas fa-money-bill-alt"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="total-revenue">₱0</h3>
                    <p class="text-muted mb-0">Total Revenue</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card warning">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="pending-invoices">0</h3>
                    <p class="text-muted mb-0">Pending Invoices</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card info">
                    <div class="stat-icon info">
                        <i class="fas fa-calendar-month"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="monthly-revenue">₱0</h3>
                    <p class="text-muted mb-0">This Month</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card primary">
                    <div class="stat-icon primary">
                        <i class="fas fa-file-invoice"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="total-invoices">0</h3>
                    <p class="text-muted mb-0">Total Invoices</p>
                </div>
            </div>
        </div>
        
        <!-- Filter and Search -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="fas fa-search"></i>
                    </span>
                    <input type="text" class="form-control" id="invoice-search" placeholder="Search invoices..." onkeyup="filterInvoices()">
                </div>
            </div>
            <div class="col-md-2">
                <select class="form-select" id="status-filter" onchange="filterInvoices()">
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="overdue">Overdue</option>
                </select>
            </div>
            <div class="col-md-3">
                <input type="month" class="form-control" id="month-filter" onchange="filterInvoices()">
            </div>
            <div class="col-md-3">
                <button class="btn btn-outline-secondary w-100" onclick="clearInvoiceFilters()">
                    Clear Filters
                </button>
            </div>
        </div>
        
        <!-- Invoices List -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <div id="invoices-list">
                            ${renderInvoicesList(allInvoices)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    updateBillingStats();
}

// Render user billing page
function renderUserBillingPage(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="fw-bold text-white mb-0">
                            <i class="fas fa-receipt me-2"></i>
                            My Invoices & Bills
                        </h2>
                        <p class="text-white">View and manage your pet care invoices</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Invoice Summary -->
        <div class="row mb-4">
            <div class="col-md-4 mb-3">
                <div class="stat-card success">
                    <div class="stat-icon success">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="user-paid-invoices">0</h3>
                    <p class="text-muted mb-0">Paid Invoices</p>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="stat-card warning">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="user-pending-invoices">0</h3>
                    <p class="text-muted mb-0">Pending Payment</p>
                </div>
            </div>
            <div class="col-md-4 mb-3">
                <div class="stat-card info">
                    <div class="stat-icon info">
                        <i class="fas fa-money-bill-alt"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="user-total-spent">₱0</h3>
                    <p class="text-muted mb-0">Total Spent</p>
                </div>
            </div>
        </div>
        
        <!-- Invoices -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">All Invoices</h6>
                    </div>
                    <div class="card-body">
                        <div id="user-invoices-list">
                            ${renderInvoicesList(AppState.invoices)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    updateUserBillingStats();
}

// Render invoices list
function renderInvoicesList(invoices) {
    if (invoices.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="fas fa-file-invoice fa-4x text-muted mb-4"></i>
                <h4 class="text-muted mb-3">No invoices found</h4>
                <p class="text-muted">Invoices will appear here after veterinary services.</p>
            </div>
        `;
    }

    return invoices
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(
            (invoice) => `
            <div class="invoice-card mb-4 invoice-item" data-status="${
                invoice.status
            }" data-date="${invoice.date}">
                <div class="invoice-header">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <div class="invoice-number mb-2">${
                                invoice.number
                            }</div>
                            <h5 class="fw-bold mb-1">${invoice.clientName}</h5>
                            <p class="text-muted mb-0">Pet: ${
                                invoice.petName
                            }</p>
                        </div>
                        <div class="text-end">
                            <div class="h4 fw-bold text-success mb-1">₱${invoice.total.toFixed(
                                2
                            )}</div>
                            <span class="status-badge status-${invoice.status}">
                                ${capitalizeFirst(invoice.status)}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <p class="text-muted mb-1 small">
                            <i class="fas fa-calendar me-1"></i>
                            Date: ${formatDate(invoice.date)}
                        </p>
                    </div>
                    <div class="col-md-6">
                        <p class="text-muted mb-1 small">Subtotal: ₱${invoice.subtotal.toFixed(
                            2
                        )}</p>
                        <p class="text-muted mb-1 small">Tax: ₱${invoice.tax.toFixed(
                            2
                        )}</p>
                    </div>
                </div>
                
                <!-- Services -->
                <div class="mb-3">
                    <h6 class="text-primary mb-2">Services</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${invoice.services
                                    .map(
                                        (service) => `
                                    <tr>
                                        <td>${service.description}</td>
                                        <td>${service.quantity}</td>
                                        <td>₱${service.price.toFixed(2)}</td>
                                        <td>₱${(
                                            service.quantity * service.price
                                        ).toFixed(2)}</td>
                                    </tr>
                                `
                                    )
                                    .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <button class="btn btn-outline-primary btn-sm" onclick="viewInvoiceDetails('${
                            invoice.id
                        }')">
                            <i class="fas fa-eye me-1"></i>View Details
                        </button>
                        <button class="btn btn-outline-success btn-sm" onclick="downloadInvoicePDF('${
                            invoice.id
                        }')">
                            <i class="fas fa-download me-1"></i>Download PDF
                        </button>
                    </div>
                    ${
                        AppState.userType === "admin" &&
                        invoice.status === "pending"
                            ? `
                        <button class="btn btn-success btn-sm" onclick="markInvoicePaid('${invoice.id}')">
                            <i class="fas fa-check me-1"></i>Mark Paid
                        </button>
                    `
                            : ""
                    }
                </div>
            </div>
        `
        )
        .join("");
}

// Show create invoice modal (admin only)
function showCreateInvoiceModal() {
    if (AppState.userType !== "admin") {
        showAlert("Access denied", "danger");
        return;
    }

    const modalHtml = `
        <div class="modal fade" id="createInvoiceModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-plus text-success me-2"></i>
                            Create New Invoice
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="create-invoice-form" onsubmit="handleCreateInvoice(event)">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Client *</label>
                                    <select class="form-select" id="invoice-client" required onchange="loadClientPets()">
                                        <option value="">Select Client</option>
                                        ${getAllClients()
                                            .map(
                                                (client) =>
                                                    `<option value="${client.id}">${client.name}</option>`
                                            )
                                            .join("")}
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Pet *</label>
                                    <select class="form-select" id="invoice-pet" required>
                                        <option value="">Select Pet</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Invoice Date *</label>
                                    <input type="date" class="form-control" id="invoice-date" value="${
                                        new Date().toISOString().split("T")[0]
                                    }" required>
                                </div>
                            </div>
                            
                            <!-- Services Section -->
                            <div class="card mb-3">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h6 class="mb-0">Services & Items</h6>
                                    <button type="button" class="btn btn-sm btn-outline-primary" onclick="addServiceRow()">
                                        <i class="fas fa-plus me-1"></i>Add Service
                                    </button>
                                </div>
                                <div class="card-body">
                                    <div id="services-container">
                                        <div class="service-row mb-3">
                                            <div class="row">
                                                <div class="col-md-5">
                                                    <input type="text" class="form-control" placeholder="Service description" name="service-description" required>
                                                </div>
                                                <div class="col-md-2">
                                                    <input type="number" class="form-control" placeholder="Qty" name="service-quantity" min="1" value="1" required onchange="calculateServiceTotal(this)">
                                                </div>
                                                <div class="col-md-3">
                                                    <input type="number" class="form-control" placeholder="Price" name="service-price" step="0.01" min="0" required onchange="calculateServiceTotal(this)">
                                                </div>
                                                <div class="col-md-2">
                                                    <div class="input-group">
                                                        <span class="input-group-text">₱</span>
                                                        <input type="number" class="form-control service-total" placeholder="0.00" readonly>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Invoice Totals -->
                            <div class="card">
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-8"></div>
                                        <div class="col-md-4">
                                            <div class="d-flex justify-content-between mb-2">
                                                <span>Subtotal:</span>
                                                <span id="invoice-subtotal">₱0.00</span>
                                            </div>
                                            <hr>
                                            <div class="d-flex justify-content-between h5">
                                                <span>Total:</span>
                                                <span id="invoice-total">₱0.00</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save me-2"></i>Create Invoice
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById("createInvoiceModal");
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.getElementById("modal-container").innerHTML = modalHtml;

    // Show modal
    const modal = new bootstrap.Modal(
        document.getElementById("createInvoiceModal")
    );
    modal.show();
}

// Load client pets when client is selected
function loadClientPets() {
    const clientId = document.getElementById("invoice-client").value;
    const petSelect = document.getElementById("invoice-pet");

    petSelect.innerHTML = '<option value="">Select Pet</option>';

    if (clientId) {
        const clientPets = JSON.parse(
            localStorage.getItem(`bbc_clinic_pets_${clientId}`) || "[]"
        );
        clientPets.forEach((pet) => {
            const option = document.createElement("option");
            option.value = pet.id;
            option.textContent = `${pet.name} (${pet.species})`;
            petSelect.appendChild(option);
        });
    }
}

// Add service row
function addServiceRow() {
    const container = document.getElementById("services-container");
    const newRow = document.createElement("div");
    newRow.className = "service-row mb-3";
    newRow.innerHTML = `
        <div class="row">
            <div class="col-md-5">
                <input type="text" class="form-control" placeholder="Service description" name="service-description" required>
            </div>
            <div class="col-md-2">
                <input type="number" class="form-control" placeholder="Qty" name="service-quantity" min="1" value="1" required onchange="calculateServiceTotal(this)">
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control" placeholder="Price" name="service-price" step="0.01" min="0" required onchange="calculateServiceTotal(this)">
            </div>
            <div class="col-md-1">
                <div class="input-group">
                    <span class="input-group-text">₱</span>
                    <input type="number" class="form-control service-total" placeholder="0.00" readonly>
                </div>
            </div>
            <div class="col-md-1">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeServiceRow(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(newRow);
}

// Remove service row
function removeServiceRow(button) {
    button.closest(".service-row").remove();
    calculateInvoiceTotal();
}

// Calculate service total
function calculateServiceTotal(input) {
    const row = input.closest(".service-row");
    const quantity = row.querySelector('[name="service-quantity"]').value || 0;
    const price = row.querySelector('[name="service-price"]').value || 0;
    const total = quantity * price;

    row.querySelector(".service-total").value = total.toFixed(2);
    calculateInvoiceTotal();
}

// Calculate invoice total
function calculateInvoiceTotal() {
    const serviceTotals = document.querySelectorAll(".service-total");
    let subtotal = 0;

    serviceTotals.forEach((input) => {
        subtotal += parseFloat(input.value) || 0;
    });

    const total = subtotal; // No tax

    document.getElementById(
        "invoice-subtotal"
    ).textContent = `₱${subtotal.toFixed(2)}`;
    // Remove document.getElementById("invoice-tax") line
    document.getElementById("invoice-total").textContent = `₱${total.toFixed(
        2
    )}`;
}
// Save invoices to localStorage
function saveInvoices() {
    if (!AppState.currentUser) return;

    // Save to the current user's invoice storage
    localStorage.setItem(
        `bbc_clinic_invoices_${AppState.currentUser.id}`,
        JSON.stringify(AppState.invoices)
    );
}

function getAllClients() {
    const clients = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
            key &&
            key.startsWith("bbc_clinic_user_") &&
            key !== "bbc_clinic_user"
        ) {
            const user = JSON.parse(localStorage.getItem(key));
            if (user.type !== "admin") {
                clients.push({
                    id: user.id,
                    name: `${user.firstName} ${user.lastName}`,
                    email: user.email,
                    phone: user.phone,
                });
            }
        }
    }
    // Also check the main admin account storage
    const adminData = localStorage.getItem("bbc_clinic_admin");
    if (adminData) {
        // Admin might have a clients list
    }
    return clients;
}
// Get all invoices from localStorage
function getAllInvoices() {
    if (AppState.userType === "admin") {
        // Admin: collect invoices from all users
        const allInvoices = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith("bbc_clinic_invoices_")) {
                const invoices = JSON.parse(localStorage.getItem(key));
                allInvoices.push(...invoices);
            }
        }
        return allInvoices;
    } else {
        // Regular user: return only their invoices
        return AppState.invoices;
    }
}

// Handle create invoice form submission
function handleCreateInvoice(event) {
    event.preventDefault();

    const clientId = document.getElementById("invoice-client").value;
    const petId = document.getElementById("invoice-pet").value;
    const date = document.getElementById("invoice-date").value;

    // Get client and pet info
    const client = getAllClients().find((c) => c.id === clientId);
    const clientPets = JSON.parse(
        localStorage.getItem(`bbc_clinic_pets_${clientId}`) || "[]"
    );
    const pet = clientPets.find((p) => p.id === petId);

    if (!client || !pet) {
        showAlert("Please select valid client and pet", "danger");
        return;
    }

    // Get services
    const serviceRows = document.querySelectorAll(".service-row");
    const services = [];

    serviceRows.forEach((row) => {
        const description = row
            .querySelector('[name="service-description"]')
            .value.trim();
        const quantity =
            parseInt(row.querySelector('[name="service-quantity"]').value) || 0;
        const price =
            parseFloat(row.querySelector('[name="service-price"]').value) || 0;

        if (description && quantity > 0 && price > 0) {
            services.push({ description, quantity, price });
        }
    });

    if (services.length === 0) {
        showAlert("Please add at least one service", "danger");
        return;
    }

    // Calculate totals
    const subtotal = services.reduce(
        (sum, service) => sum + service.quantity * service.price,
        0
    );
    const total = subtotal;

    // Generate invoice number
    const invoiceNumber = `BBC-${new Date().getFullYear()}-${String(
        Date.now()
    ).slice(-6)}`;

    const invoiceData = {
        id: generateId("inv"),
        number: invoiceNumber,
        clientId: clientId,
        clientName: client.name,
        petId: petId,
        petName: pet.name,
        date: date,
        services: services,
        subtotal: subtotal,
        tax: 0,
        total: total,
        status: "pending",
    };
    // Save the invoice
    AppState.invoices.push(invoiceData);
    saveInvoices();

    // Close modal and show success
    const modal = bootstrap.Modal.getInstance(
        document.getElementById("createInvoiceModal")
    );
    modal.hide();

    // Refresh the page and show confirmation
    renderBillingPage();
    showAlert("Invoice created successfully!", "success");
}

// ========================
// Update Billing Statistics
// ========================
function updateBillingStats() {
    const allInvoices = getAllInvoices();

    let totalRevenue = 0;
    let pendingInvoices = 0;
    let monthlyRevenue = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    allInvoices.forEach((invoice) => {
        const invDate = new Date(invoice.date);
        const isThisMonth =
            invDate.getMonth() === currentMonth &&
            invDate.getFullYear() === currentYear;

        const amount = invoice.total || 0;

        if (invoice.status === "paid") {
            totalRevenue += amount;
            if (isThisMonth) monthlyRevenue += amount;
        } else if (invoice.status === "pending") {
            pendingInvoices++;
        }
    });

    // Update UI elements if they exist
    const totalRevenueElem = document.getElementById("total-revenue");
    const pendingElem = document.getElementById("pending-invoices");
    const monthlyElem = document.getElementById("monthly-revenue");
    const totalInvoicesElem = document.getElementById("total-invoices");

    if (totalRevenueElem)
        totalRevenueElem.textContent = `₱${totalRevenue.toFixed(2)}`;
    if (pendingElem) pendingElem.textContent = pendingInvoices;
    if (monthlyElem) monthlyElem.textContent = `₱${monthlyRevenue.toFixed(2)}`;
    if (totalInvoicesElem) totalInvoicesElem.textContent = allInvoices.length;
}

// Mark invoice as paid (admin only)
function markInvoicePaid(invoiceId) {
    if (AppState.userType !== "admin") {
        showAlert("Access denied", "danger");
        return;
    }

    // Find the invoice across all users
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("bbc_clinic_invoices_")) {
            const invoices = JSON.parse(localStorage.getItem(key));
            const invoice = invoices.find((inv) => inv.id === invoiceId);

            if (invoice) {
                // Update the invoice status
                invoice.status = "paid";

                // Save back to localStorage
                localStorage.setItem(key, JSON.stringify(invoices));

                // Refresh the billing page
                renderBillingPage();
                showAlert("Invoice marked as paid successfully!", "success");
                return;
            }
        }
    }

    showAlert("Invoice not found", "danger");
}

window.markInvoicePaid = markInvoicePaid;
