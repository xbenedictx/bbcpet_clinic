// BBC Veterinary Clinic - Main Application JavaScript

// Global App State
const AppState = {
    currentUser: null,
    currentPage: "login",
    isLoggedIn: false,
    userType: null, // 'user' or 'admin'
    pets: [],
    appointments: [],
    healthRecords: [],
    clients: [], // For admin use
    invoices: [],
};

// Initialize Application
document.addEventListener("DOMContentLoaded", function () {
    // Simulate loading
    setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("main-app").style.display = "block";

        // Check if user is already logged in (simulate with localStorage)
        checkAuthStatus();

        // Initialize sample data
        initializeSampleData();

        // Show appropriate page
        if (AppState.isLoggedIn) {
            showDashboard();
        } else {
            showLogin();
        }
    }, 2000);
});

// Check authentication status
function checkAuthStatus() {
    const savedUser = localStorage.getItem("bbc_clinic_user");
    if (savedUser) {
        AppState.currentUser = JSON.parse(savedUser);
        AppState.isLoggedIn = true;
        AppState.userType = AppState.currentUser.type;
        updateNavigation();
        loadUserData();
    }
}

// Update navigation based on auth status
function updateNavigation() {
    const userMenu = document.getElementById("user-menu");
    const loginBtn = document.getElementById("login-btn");
    const userName = document.getElementById("user-name");

    if (AppState.isLoggedIn) {
        userMenu.style.display = "block";
        loginBtn.style.display = "none";
        userName.textContent =
            AppState.currentUser.firstName +
            " " +
            AppState.currentUser.lastName;
    } else {
        userMenu.style.display = "none";
        loginBtn.style.display = "block";
    }
}

// Show/Hide page functions
function showPage(pageId) {
    // Hide all pages
    cleanupModals();
    const pages = document.querySelectorAll(".page-content");
    pages.forEach((page) => (page.style.display = "none"));

    // Show requested page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.style.display = "block";
        AppState.currentPage = pageId.replace("-page", "");
    }
}

function showLogin() {
    showPage("login-page");
}

function showRegister() {
    showPage("register-page");
}

function showDashboard() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }
    showPage("dashboard-page");
    renderDashboard();
}

function showPets() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }
    showPage("pets-page");
    renderPetsPage();
}

function showAppointments() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }
    showPage("appointments-page");
    renderAppointmentsPage();
}

function showHealthRecords() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }
    showPage("health-records-page");
    renderHealthRecordsPage();
}

function showBilling() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }
    showPage("billing-page");
    renderBillingPage();
}

function showProfile() {
    if (!AppState.isLoggedIn) {
        showLogin();
        return;
    }
    showPage("profile-page");
    renderProfilePage();
}

// Logout function
function logout() {
    AppState.currentUser = null;
    AppState.isLoggedIn = false;
    AppState.userType = null;
    AppState.pets = [];
    AppState.appointments = [];
    AppState.healthRecords = [];
    AppState.invoices = [];

    localStorage.removeItem("bbc_clinic_user");
    localStorage.removeItem("bbc_clinic_pets");
    localStorage.removeItem("bbc_clinic_appointments");
    localStorage.removeItem("bbc_clinic_health_records");
    localStorage.removeItem("bbc_clinic_invoices");

    updateNavigation();
    showLogin();
    showAlert("Logged out successfully!", "success");
}

// Load user data from localStorage
function loadUserData() {
    if (!AppState.currentUser) return;

    const savedPets = localStorage.getItem(
        `bbc_clinic_pets_${AppState.currentUser.id}`
    );
    if (savedPets) {
        AppState.pets = JSON.parse(savedPets);
    }

    const savedAppointments = localStorage.getItem(
        `bbc_clinic_appointments_${AppState.currentUser.id}`
    );
    if (savedAppointments) {
        AppState.appointments = JSON.parse(savedAppointments);
    }

    const savedHealthRecords = localStorage.getItem(
        `bbc_clinic_health_records_${AppState.currentUser.id}`
    );
    if (savedHealthRecords) {
        AppState.healthRecords = JSON.parse(savedHealthRecords);
    }

    const savedInvoices = localStorage.getItem(
        `bbc_clinic_invoices_${AppState.currentUser.id}`
    );
    if (savedInvoices) {
        AppState.invoices = JSON.parse(savedInvoices);
    }

    // Load all data for admin
    if (AppState.userType === "admin") {
        loadAdminData();
    }
}

// Save user data to localStorage
function saveUserData() {
    if (!AppState.currentUser) return;

    localStorage.setItem(
        `bbc_clinic_pets_${AppState.currentUser.id}`,
        JSON.stringify(AppState.pets)
    );
    localStorage.setItem(
        `bbc_clinic_appointments_${AppState.currentUser.id}`,
        JSON.stringify(AppState.appointments)
    );
    localStorage.setItem(
        `bbc_clinic_health_records_${AppState.currentUser.id}`,
        JSON.stringify(AppState.healthRecords)
    );
    localStorage.setItem(
        `bbc_clinic_invoices_${AppState.currentUser.id}`,
        JSON.stringify(AppState.invoices)
    );
}

// Load admin data (all users' data)
function loadAdminData() {
    // This would typically load all clients, pets, appointments, etc.
    // For demo purposes, we'll load sample data
    const savedClients = localStorage.getItem("bbc_clinic_all_clients");
    if (savedClients) {
        AppState.clients = JSON.parse(savedClients);
    }
}

// Initialize sample data for demo
function initializeSampleData() {
    // Sample admin user
    const adminExists = localStorage.getItem("bbc_clinic_admin");
    if (!adminExists) {
        const adminUser = {
            id: "admin_001",
            email: "admin@bbcclinic.com",
            password: "admin123",
            firstName: "Dr. Sarah",
            lastName: "Johnson",
            phone: "+1-555-0123",
            address: "123 Veterinary Lane, Pet City, PC 12345",
            type: "admin",
            specialization: "General Veterinary Medicine",
            license: "VET-12345",
            createdAt: new Date().toISOString(),
        };
        localStorage.setItem("bbc_clinic_admin", JSON.stringify(adminUser));
    }

    // Sample regular user
    const userExists = localStorage.getItem("bbc_clinic_user_demo");
    if (!userExists) {
        const demoUser = {
            id: "user_001",
            email: "demo@example.com",
            password: "demo123",
            firstName: "John",
            lastName: "Smith",
            phone: "+1-555-0456",
            address: "456 Pet Owner Street, Animal City, AC 67890",
            type: "user",
            createdAt: new Date().toISOString(),
        };
        localStorage.setItem("bbc_clinic_user_demo", JSON.stringify(demoUser));

        // Sample pets for demo user
        const demoPets = [
            {
                id: "pet_001",
                name: "Buddy",
                species: "Dog",
                breed: "Golden Retriever",
                age: 3,
                weight: 30,
                color: "Golden",
                gender: "Male",
                ownerId: "user_001",
                medicalNotes:
                    "Friendly and energetic. Up to date on vaccinations.",
                emergencyContact: "Jane Smith - +1-555-0789",
                createdAt: new Date().toISOString(),
            },
            {
                id: "pet_002",
                name: "Whiskers",
                species: "Cat",
                breed: "Persian",
                age: 2,
                weight: 8,
                color: "White",
                gender: "Female",
                ownerId: "user_001",
                medicalNotes: "Indoor cat. Shy but gentle.",
                emergencyContact: "Jane Smith - +1-555-0789",
                createdAt: new Date().toISOString(),
            },
        ];
        localStorage.setItem(
            "bbc_clinic_pets_user_001",
            JSON.stringify(demoPets)
        );

        // Sample appointments
        const demoAppointments = [
            {
                id: "apt_001",
                petId: "pet_001",
                petName: "Buddy",
                ownerId: "user_001",
                date: "2024-01-15",
                time: "10:00",
                reason: "Annual Checkup",
                status: "confirmed",
                veterinarian: "Dr. Sarah Johnson",
                notes: "Regular wellness exam and vaccinations",
                createdAt: new Date().toISOString(),
            },
            {
                id: "apt_002",
                petId: "pet_002",
                petName: "Whiskers",
                ownerId: "user_001",
                date: "2024-01-20",
                time: "14:30",
                reason: "Vaccination",
                status: "pending",
                veterinarian: "Dr. Sarah Johnson",
                notes: "Annual vaccine boosters",
                createdAt: new Date().toISOString(),
            },
        ];
        localStorage.setItem(
            "bbc_clinic_appointments_user_001",
            JSON.stringify(demoAppointments)
        );

        // Sample health records
        const demoHealthRecords = [
            {
                id: "hr_001",
                petId: "pet_001",
                petName: "Buddy",
                ownerId: "user_001",
                date: "2024-01-10",
                veterinarian: "Dr. Sarah Johnson",
                visitReason: "Annual Checkup",
                diagnosis: "Healthy",
                treatment: "Vaccinations administered (DHPP, Rabies)",
                prescription:
                    "Heartgard Plus - 1 tablet monthly for heartworm prevention",
                weight: 30,
                temperature: 101.5,
                heartRate: 120,
                notes: "Patient is in excellent health. Continue current diet and exercise routine.",
                nextVisit: "2025-01-10",
                createdAt: new Date().toISOString(),
            },
        ];
        localStorage.setItem(
            "bbc_clinic_health_records_user_001",
            JSON.stringify(demoHealthRecords)
        );

        // Sample invoices
        const demoInvoices = [
            {
                id: "inv_001",
                number: "BBC-2024-001",
                clientId: "user_001",
                clientName: "John Smith",
                petId: "pet_001",
                petName: "Buddy",
                date: "2024-01-10",
                services: [
                    {
                        description: "Annual Wellness Exam",
                        quantity: 1,
                        price: 75.0,
                    },
                    {
                        description: "DHPP Vaccination",
                        quantity: 1,
                        price: 25.0,
                    },
                    {
                        description: "Rabies Vaccination",
                        quantity: 1,
                        price: 20.0,
                    },
                    {
                        description: "Heartgard Plus (6 months)",
                        quantity: 1,
                        price: 45.0,
                    },
                ],
                subtotal: 165.0,
                tax: 13.2,
                total: 178.2,
                status: "paid",
                paymentMethod: "cash",
                createdAt: new Date().toISOString(),
            },
        ];
        localStorage.setItem(
            "bbc_clinic_invoices_user_001",
            JSON.stringify(demoInvoices)
        );
    }
}

// Utility function to show alerts
function showAlert(message, type = "info", duration = 3000) {
    const alertDiv = document.createElement("div");
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText =
        "top: 100px; right: 20px; z-index: 9999; min-width: 300px;";

    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(alertDiv);

    // Auto remove after duration
    setTimeout(() => {
        if (alertDiv && alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, duration);
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

// Utility function to format time
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
}

// Utility function to generate unique ID
function generateId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Utility function to capitalize first letter
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function cleanupModals() {
    document.querySelectorAll(".modal").forEach((modal) => {
        const bsModal = bootstrap.Modal.getInstance(modal);
        if (bsModal) bsModal.dispose();
        modal.remove();
    });
    document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
}

// Export functions for use in other modules
window.AppState = AppState;
window.showPage = showPage;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.showDashboard = showDashboard;
window.showPets = showPets;
window.showAppointments = showAppointments;
window.showHealthRecords = showHealthRecords;
window.showBilling = showBilling;
window.showProfile = showProfile;
window.logout = logout;
window.saveUserData = saveUserData;
window.loadUserData = loadUserData;
window.showAlert = showAlert;
window.formatDate = formatDate;
window.formatTime = formatTime;
window.generateId = generateId;
window.capitalizeFirst = capitalizeFirst;
// modal cleanup (call every time you change page or close a modal)
window.cleanupModals = function () {
    // 1. Dispose any live Bootstrap modal instances
    document.querySelectorAll(".modal").forEach((m) => {
        const instance = bootstrap.Modal.getInstance(m);
        if (instance) instance.dispose();
    });

    // 2. Remove every modal element (including the one you just created)
    document.querySelectorAll(".modal").forEach((m) => m.remove());

    // 3. Remove every leftover backdrop
    document.querySelectorAll(".modal-backdrop").forEach((b) => b.remove());

    // 4. Reset body classes / inline styles that Bootstrap adds
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
    document.documentElement.style.overflow = "";
    document.documentElement.style.paddingRight = "";
};
