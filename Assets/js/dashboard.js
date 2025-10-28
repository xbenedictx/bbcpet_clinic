// BBC Veterinary Clinic - Dashboard Module

// Render dashboard based on user type
function renderDashboard() {
    const dashboardPage = document.getElementById("dashboard-page");

    if (AppState.userType === "admin") {
        renderAdminDashboard(dashboardPage);
    } else {
        renderUserDashboard(dashboardPage);
    }
}

// Render admin dashboard
function renderAdminDashboard(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2 class="fw-bold mb-0 text-white">
                    <i class="fas fa-tachometer-alt me-2"></i>
                    Admin Dashboard
                </h2>
                <p class="text-white">Welcome back, ${AppState.currentUser.firstName}!</p>
            </div>
        </div>
        
        <!-- Quick Stats -->
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="stat-card primary">
                    <div class="stat-icon primary">
                        <i class="fas fa-users"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="total-clients">0</h3>
                    <p class="text-muted mb-0">Total Clients</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card success">
                    <div class="stat-icon success">
                        <i class="fas fa-paw"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="total-pets">0</h3>
                    <p class="text-muted mb-0">Total Pets</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card warning">
                    <div class="stat-icon warning">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="today-appointments">0</h3>
                    <p class="text-muted mb-0">Today's Appointments</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card info">
                    <div class="stat-icon info">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="monthly-revenue">₱0</h3>
                    <p class="text-muted mb-0">Monthly Revenue</p>
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">
                            <i class="fas fa-bolt text-warning me-2"></i>
                            Quick Actions
                        </h5>
                        <div class="row">
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-primary w-100" onclick="showAppointments()">
                                    <i class="fas fa-calendar-plus me-2"></i>
                                    View Appointments
                                </button>
                            </div>
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-success w-100" onclick="showPets()">
                                    <i class="fas fa-paw me-2"></i>
                                    Manage Pets
                                </button>
                            </div>
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-info w-100" onclick="showHealthRecords()">
                                    <i class="fas fa-file-medical me-2"></i>
                                    Health Records
                                </button>
                            </div>
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-warning w-100" onclick="showBilling()">
                                    <i class="fas fa-file-invoice-dollar me-2"></i>
                                    Billing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="row">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">
                            <i class="fas fa-clock text-info me-2"></i>
                            Recent Appointments
                        </h5>
                        <div id="recent-appointments">
                            <!-- Recent appointments will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">
                            <i class="fas fa-exclamation-triangle text-warning me-2"></i>
                            Pending Actions
                        </h5>
                        <div id="pending-actions">
                            <!-- Pending actions will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load admin dashboard data
    loadAdminDashboardData();
}

// Render user dashboard
function renderUserDashboard(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <h2 class="fw-bold text-white mb-0">
                    <i class="fas fa-home me-2"></i>
                    Welcome, ${AppState.currentUser.firstName}!
                </h2>
                <p class="text-white">Manage your pets' health and appointments</p>
            </div>
        </div>
        
        <!-- Pet Summary -->
        <div class="row mb-4">
            <div class="col-md-3 mb-3">
                <div class="stat-card primary">
                    <div class="stat-icon primary">
                        <i class="fas fa-paw"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="user-total-pets">0</h3>
                    <p class="text-muted mb-0">My Pets</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card success">
                    <div class="stat-icon success">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="user-upcoming-appointments">0</h3>
                    <p class="text-muted mb-0">Upcoming Appointments</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card warning">
                    <div class="stat-icon warning">
                        <i class="fas fa-file-medical"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="user-health-records">0</h3>
                    <p class="text-muted mb-0">Health Records</p>
                </div>
            </div>
            <div class="col-md-3 mb-3">
                <div class="stat-card info">
                    <div class="stat-icon info">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <h3 class="fw-bold mb-1" id="user-invoices">0</h3>
                    <p class="text-muted mb-0">Invoices</p>
                </div>
            </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="row mb-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">
                            <i class="fas fa-bolt text-warning me-2"></i>
                            Quick Actions
                        </h5>
                        <div class="row">
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-primary w-100" onclick="showBookAppointment()">
                                    <i class="fas fa-calendar-plus me-2"></i>
                                    Book Appointment
                                </button>
                            </div>
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-success w-100" onclick="showPets()">
                                    <i class="fas fa-paw me-2"></i>
                                    My Pets
                                </button>
                            </div>
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-info w-100" onclick="showHealthRecords()">
                                    <i class="fas fa-file-medical me-2"></i>
                                    Health Records
                                </button>
                            </div>
                            <div class="col-md-3 mb-2">
                                <button class="btn btn-warning w-100" onclick="showBilling()">
                                    <i class="fas fa-file-invoice-dollar me-2"></i>
                                    My Bills
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- My Pets -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="card-title fw-bold mb-0">
                                <i class="fas fa-paw text-success me-2"></i>
                                My Pets
                            </h5>
                            <button class="btn btn-sm btn-outline-primary" onclick="showAddPetModal()">
                                <i class="fas fa-plus me-1"></i>Add Pet
                            </button>
                        </div>
                        <div id="user-pets-list">
                            <!-- User pets will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title fw-bold mb-3">
                            <i class="fas fa-calendar text-info me-2"></i>
                            Upcoming Appointments
                        </h5>
                        <div id="user-upcoming-list">
                            <!-- Upcoming appointments will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load user dashboard data
    loadUserDashboardData();
}

// Load admin dashboard data
function loadAdminDashboardData() {
    // Get all data from localStorage
    const allClients = getAllClients();
    const allPets = getAllPets();
    const allAppointments = getAllAppointments();
    const allInvoices = getAllInvoices();

    // Update stats
    document.getElementById("total-clients").textContent = allClients.length;
    document.getElementById("total-pets").textContent = allPets.length;

    // Today's appointments
    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = allAppointments.filter(
        (apt) => apt.date === today
    );
    document.getElementById("today-appointments").textContent =
        todayAppointments.length;

    // Monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyInvoices = allInvoices.filter((inv) => {
        const invDate = new Date(inv.date);
        return (
            invDate.getMonth() === currentMonth &&
            invDate.getFullYear() === currentYear
        );
    });
    const monthlyRevenue = monthlyInvoices.reduce(
        (sum, inv) => sum + inv.total,
        0
    );
    document.getElementById(
        "monthly-revenue"
    ).textContent = `₱${monthlyRevenue.toFixed(2)}`;

    // Load recent appointments
    loadRecentAppointments();

    // Load pending actions
    loadPendingActions();
}

// Load user dashboard data
function loadUserDashboardData() {
    // Update stats
    document.getElementById("user-total-pets").textContent =
        AppState.pets.length;

    // Upcoming appointments
    const today = new Date().toISOString().split("T")[0];
    const upcomingAppointments = AppState.appointments.filter(
        (apt) => apt.date >= today
    );
    document.getElementById("user-upcoming-appointments").textContent =
        upcomingAppointments.length;

    // Health records
    document.getElementById("user-health-records").textContent =
        AppState.healthRecords.length;

    // Invoices
    document.getElementById("user-invoices").textContent =
        AppState.invoices.length;

    // Load pets list
    loadUserPetsList();

    // Load upcoming appointments list
    loadUserUpcomingAppointments();
}

// Load recent appointments for admin
function loadRecentAppointments() {
    const container = document.getElementById("recent-appointments");
    const allAppointments = getAllAppointments();
    const recentAppointments = allAppointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    if (recentAppointments.length === 0) {
        container.innerHTML =
            '<p class="text-muted text-center py-3">No recent appointments</p>';
        return;
    }

    container.innerHTML = recentAppointments
        .map(
            (appointment) => `
        <div class="appointment-card ${appointment.status} mb-3">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="fw-bold mb-1">${appointment.petName}</h6>
                    <p class="text-muted mb-1 small">
                        <i class="fas fa-calendar me-1"></i>
                        ${formatDate(appointment.date)} at ${formatTime(
                appointment.time
            )}
                    </p>
                    <p class="text-muted mb-0 small">${appointment.reason}</p>
                </div>
                <span class="status-badge status-${appointment.status}">
                    ${capitalizeFirst(appointment.status)}
                </span>
            </div>
        </div>
    `
        )
        .join("");
}

// Load pending actions for admin
function loadPendingActions() {
    const container = document.getElementById("pending-actions");
    const allAppointments = getAllAppointments();
    const pendingAppointments = allAppointments.filter(
        (apt) => apt.status === "pending"
    );

    const actions = [];

    // Pending appointments
    if (pendingAppointments.length > 0) {
        actions.push({
            icon: "calendar-check",
            text: `${pendingAppointments.length} pending appointment${
                pendingAppointments.length > 1 ? "s" : ""
            }`,
            action: "showAppointments()",
            color: "warning",
        });
    }

    // Add more pending actions as needed

    if (actions.length === 0) {
        container.innerHTML =
            '<p class="text-muted text-center py-3">No pending actions</p>';
        return;
    }

    container.innerHTML = actions
        .map(
            (action) => `
        <div class="d-flex align-items-center mb-3 p-2 border rounded cursor-pointer" onclick="${action.action}">
            <div class="me-3">
                <i class="fas fa-${action.icon} text-${action.color}"></i>
            </div>
            <div class="flex-grow-1">
                <p class="mb-0 small">${action.text}</p>
            </div>
            <div>
                <i class="fas fa-chevron-right text-muted small"></i>
            </div>
        </div>
    `
        )
        .join("");
}

// Load user pets list
function loadUserPetsList() {
    const container = document.getElementById("user-pets-list");

    if (AppState.pets.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-paw fa-3x text-muted mb-3"></i>
                <p class="text-muted mb-3">You haven't added any pets yet</p>
                <button class="btn btn-primary" onclick="showAddPetModal()">
                    <i class="fas fa-plus me-2"></i>Add Your First Pet
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = AppState.pets
        .slice(0, 3)
        .map(
            (pet) => `
        <div class="pet-card">
            <div class="d-flex align-items-center">
                <div class="pet-avatar">
                    <i class="fas fa-${
                        pet.species.toLowerCase() === "dog" ? "dog" : "cat"
                    }"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="fw-bold mb-1">${pet.name}</h6>
                    <p class="text-muted mb-0 small">${pet.breed} • ${
                pet.age
            } years old</p>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewPetDetails('${
                        pet.id
                    }')">
                        View
                    </button>
                </div>
            </div>
        </div>
    `
        )
        .join("");

    if (AppState.pets.length > 3) {
        container.innerHTML += `
            <div class="text-center mt-3">
                <button class="btn btn-sm btn-outline-secondary" onclick="showPets()">
                    View All Pets (${AppState.pets.length})
                </button>
            </div>
        `;
    }
}

// Load user upcoming appointments
function loadUserUpcomingAppointments() {
    const container = document.getElementById("user-upcoming-list");
    const today = new Date().toISOString().split("T")[0];
    const upcomingAppointments = AppState.appointments
        .filter((apt) => apt.date >= today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    if (upcomingAppointments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-3">
                <p class="text-muted mb-3">No upcoming appointments</p>
                <button class="btn btn-sm btn-primary" onclick="showBookAppointment()">
                    Book Appointment
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = upcomingAppointments
        .map(
            (appointment) => `
        <div class="appointment-card ${appointment.status} mb-3">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <h6 class="fw-bold mb-1">${appointment.petName}</h6>
                    <p class="text-muted mb-1 small">
                        <i class="fas fa-calendar me-1"></i>
                        ${formatDate(appointment.date)}
                    </p>
                    <p class="text-muted mb-0 small">
                        <i class="fas fa-clock me-1"></i>
                        ${formatTime(appointment.time)}
                    </p>
                </div>
                <span class="status-badge status-${appointment.status}">
                    ${capitalizeFirst(appointment.status)}
                </span>
            </div>
        </div>
    `
        )
        .join("");
}

// Utility functions to get all data (for admin)
function getAllClients() {
    const usersList = JSON.parse(
        localStorage.getItem("bbc_clinic_users_list") || "[]"
    );
    return usersList;
}

function getAllPets() {
    const usersList = getAllClients();
    const allPets = [];

    usersList.forEach((user) => {
        const userPets = JSON.parse(
            localStorage.getItem(`bbc_clinic_pets_${user.id}`) || "[]"
        );
        allPets.push(...userPets);
    });

    return allPets;
}

function getAllAppointments() {
    const usersList = getAllClients();
    const allAppointments = [];

    usersList.forEach((user) => {
        const userAppointments = JSON.parse(
            localStorage.getItem(`bbc_clinic_appointments_${user.id}`) || "[]"
        );
        allAppointments.push(...userAppointments);
    });

    return allAppointments;
}

function getAllInvoices() {
    const usersList = getAllClients();
    const allInvoices = [];

    usersList.forEach((user) => {
        const userInvoices = JSON.parse(
            localStorage.getItem(`bbc_clinic_invoices_${user.id}`) || "[]"
        );
        allInvoices.push(...userInvoices);
    });

    return allInvoices;
}

// Quick action functions
function showBookAppointment() {
    showAppointments();
    // The appointments page will have a book appointment button
}

function showAddPetModal() {
    showPets();
    // The pets page will have an add pet modal
}

function viewPetDetails(petId) {
    showPets();
    // The pets page will show the specific pet details
}

// Export functions
window.renderDashboard = renderDashboard;
window.showBookAppointment = showBookAppointment;
window.showAddPetModal = showAddPetModal;
window.viewPetDetails = viewPetDetails;
