// BBC Veterinary Clinic - Authentication Module

// Login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const userType = document.querySelector('input[name="user-type"]:checked').value;
    
    if (!email || !password) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    // Simulate authentication
    authenticateUser(email, password, userType);
}

// Handle registration
function handleRegister(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('reg-firstname').value.trim();
    const lastName = document.getElementById('reg-lastname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const password = document.getElementById('reg-password').value;
    
    if (!firstName || !lastName || !email || !phone || !address || !password) {
        showAlert('Please fill in all fields', 'danger');
        return;
    }
    
    if (!isValidEmail(email)) {
        showAlert('Please enter a valid email address', 'danger');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters long', 'danger');
        return;
    }
    
    // Check if user already exists
    if (userExists(email)) {
        showAlert('An account with this email already exists', 'danger');
        return;
    }
    
    // Create new user
    createUser(firstName, lastName, email, phone, address, password);
}

// Authenticate user
function authenticateUser(email, password, userType) {
    let user = null;
    
    if (userType === 'admin') {
        // Check admin credentials
        const adminUser = localStorage.getItem('bbc_clinic_admin');
        if (adminUser) {
            const admin = JSON.parse(adminUser);
            if (admin.email === email && admin.password === password) {
                user = admin;
            }
        }
    } else {
        // Check regular user credentials
        // For demo, check demo user
        if (email === 'demo@example.com' && password === 'demo123') {
            user = JSON.parse(localStorage.getItem('bbc_clinic_user_demo'));
        } else {
            // Check all registered users
            user = findUserByCredentials(email, password);
        }
    }
    
    if (user) {
        // Login successful
        AppState.currentUser = user;
        AppState.isLoggedIn = true;
        AppState.userType = user.type;
        
        // Save to localStorage
        localStorage.setItem('bbc_clinic_user', JSON.stringify(user));
        
        // Update navigation
        updateNavigation();
        
        // Load user data
        loadUserData();
        
        // Show dashboard
        showDashboard();
        
        showAlert(`Welcome back, ${user.firstName}!`, 'success');
    } else {
        showAlert('Invalid email or password', 'danger');
    }
}

// Create new user
function createUser(firstName, lastName, email, phone, address, password) {
    const userId = generateId('user');
    
    const newUser = {
        id: userId,
        email: email,
        password: password, // In real app, this would be hashed
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        address: address,
        type: 'user',
        createdAt: new Date().toISOString()
    };
    
    // Save user to localStorage
    localStorage.setItem(`bbc_clinic_user_${userId}`, JSON.stringify(newUser));
    
    // Add to users list
    const usersList = getUsersList();
    usersList.push({
        id: userId,
        email: email,
        name: `${firstName} ${lastName}`
    });
    localStorage.setItem('bbc_clinic_users_list', JSON.stringify(usersList));
    
    showAlert('Account created successfully! Please login.', 'success');
    showLogin();
    
    // Pre-fill login form
    setTimeout(() => {
        document.getElementById('login-email').value = email;
    }, 100);
}

// Check if user exists
function userExists(email) {
    // Check admin
    const adminUser = localStorage.getItem('bbc_clinic_admin');
    if (adminUser) {
        const admin = JSON.parse(adminUser);
        if (admin.email === email) return true;
    }
    
    // Check demo user
    if (email === 'demo@example.com') return true;
    
    // Check registered users
    const usersList = getUsersList();
    return usersList.some(user => user.email === email);
}

// Find user by credentials
function findUserByCredentials(email, password) {
    const usersList = getUsersList();
    const userRef = usersList.find(user => user.email === email);
    
    if (userRef) {
        const userData = localStorage.getItem(`bbc_clinic_user_${userRef.id}`);
        if (userData) {
            const user = JSON.parse(userData);
            if (user.password === password) {
                return user;
            }
        }
    }
    
    return null;
}

// Get users list
function getUsersList() {
    const usersList = localStorage.getItem('bbc_clinic_users_list');
    return usersList ? JSON.parse(usersList) : [];
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Demo login functions for quick testing
function loginAsDemo() {
    document.getElementById('login-email').value = 'demo@example.com';
    document.getElementById('login-password').value = 'demo123';
    document.querySelector('input[value="user"]').checked = true;
    handleLogin(new Event('submit'));
}

function loginAsAdmin() {
    document.getElementById('login-email').value = 'admin@bbcclinic.com';
    document.getElementById('login-password').value = 'admin123';
    document.querySelector('input[value="admin"]').checked = true;
    handleLogin(new Event('submit'));
}

// Export functions
window.loginAsDemo = loginAsDemo;
window.loginAsAdmin = loginAsAdmin;