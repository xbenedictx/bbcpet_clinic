// BBC Veterinary Clinic - Appointments Management Module

// Render appointments page
function renderAppointmentsPage() {
    const appointmentsPage = document.getElementById("appointments-page");

    if (AppState.userType === "admin") {
        renderAdminAppointmentsPage(appointmentsPage);
    } else {
        renderUserAppointmentsPage(appointmentsPage);
    }
}

// Render admin appointments page
function renderAdminAppointmentsPage(container) {
    const allAppointments = getAllAppointments();

    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="fw-bold text-white mb-0">
                            <i class="fas fa-calendar-alt me-2"></i>
                            Appointment Management
                        </h2>
                        <p class="text-white">Manage all clinic appointments</p>
                    </div>
                    <button class="btn btn-primary" onclick="showNewAppointmentModal()">
                        <i class="fas fa-plus me-2"></i>New Appointment
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Appointment Calendar and Controls -->
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <div id="appointment-calendar">
                            ${renderAppointmentCalendar()}
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">Quick Stats</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <span class="text-muted">Today's Appointments:</span>
                                <span class="fw-bold" id="today-appointments-count">0</span>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <span class="text-muted">This Week:</span>
                                <span class="fw-bold" id="week-appointments-count">0</span>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="d-flex justify-content-between">
                                <span class="text-muted">Pending:</span>
                                <span class="fw-bold text-warning" id="pending-appointments-count">0</span>
                            </div>
                        </div>
                        <div>
                            <div class="d-flex justify-content-between">
                                <span class="text-muted">Confirmed:</span>
                                <span class="fw-bold text-success" id="confirmed-appointments-count">0</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card mt-3">
                    <div class="card-header">
                        <h6 class="mb-0">Filter Appointments</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Status</label>
                            <select class="form-select" id="status-filter" onchange="filterAppointments()">
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Date Range</label>
                            <input type="date" class="form-control mb-2" id="date-from" onchange="filterAppointments()">
                            <input type="date" class="form-control" id="date-to" onchange="filterAppointments()">
                        </div>
                        <button class="btn btn-outline-secondary w-100" onclick="clearFilters()">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Appointments List -->
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0">All Appointments</h6>
                    </div>
                    <div class="card-body">
                        <div id="appointments-list">
                            ${renderAppointmentsList(allAppointments)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    updateAppointmentStats();
}

// Render user appointments page
function renderUserAppointmentsPage(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="fw-bold text-white mb-0">
                            <i class="fas fa-calendar-check me-2"></i>
                            My Appointments
                        </h2>
                        <p class="text-white">Manage your pet appointments</p>
                    </div>
                    <button class="btn btn-primary" onclick="showBookAppointmentModal()" ${
                        AppState.pets.length === 0 ? "disabled" : ""
                    }>
                        <i class="fas fa-plus me-2"></i>Book Appointment
                    </button>
                </div>
            </div>
        </div>
        
        ${
            AppState.pets.length === 0
                ? `
            <div class="row">
                <div class="col-12">
                    <div class="card text-center py-5">
                        <div class="card-body">
                            <i class="fas fa-paw fa-4x text-muted mb-4"></i>
                            <h4 class="text-muted mb-3">No pets registered</h4>
                            <p class="text-muted mb-4">You need to add a pet before booking appointments.</p>
                            <button class="btn btn-primary btn-lg" onclick="showPets()">
                                <i class="fas fa-plus me-2"></i>Add Your First Pet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
                : `
            <!-- Upcoming Appointments -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h6 class="mb-0">Upcoming Appointments</h6>
                            <span class="badge bg-primary" id="upcoming-count">0</span>
                        </div>
                        <div class="card-body">
                            <div id="upcoming-appointments">
                                ${renderUpcomingAppointments()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- All Appointments -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0">All Appointments</h6>
                        </div>
                        <div class="card-body">
                            <div id="all-appointments">
                                ${renderAppointmentsList(AppState.appointments)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
        }
    `;

    if (AppState.pets.length > 0) {
        updateUserAppointmentCounts();
    }
}

// Render appointment calendar
function renderAppointmentCalendar() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    let calendarHtml = `
        <div class="calendar-container">
            <div class="calendar-header">
                <button class="calendar-nav" onclick="changeMonth(-1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h5 class="mb-0 fw-bold">${monthNames[currentMonth]} ${currentYear}</h5>
                <button class="calendar-nav" onclick="changeMonth(1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <div class="calendar-grid">
                <div class="calendar-day fw-bold text-center py-2 bg-light">Sun</div>
                <div class="calendar-day fw-bold text-center py-2 bg-light">Mon</div>
                <div class="calendar-day fw-bold text-center py-2 bg-light">Tue</div>
                <div class="calendar-day fw-bold text-center py-2 bg-light">Wed</div>
                <div class="calendar-day fw-bold text-center py-2 bg-light">Thu</div>
                <div class="calendar-day fw-bold text-center py-2 bg-light">Fri</div>
                <div class="calendar-day fw-bold text-center py-2 bg-light">Sat</div>
    `;

    // Empty cells before the first day
    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarHtml += '<div class="calendar-day"></div>';
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = `${currentYear}-${String(currentMonth + 1).padStart(
            2,
            "0"
        )}-${String(day).padStart(2, "0")}`;
        const appointments = getAppointmentsForDate(date);
        const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

        calendarHtml += `
            <div class="calendar-day ${
                appointments.length > 0 ? "has-appointment" : ""
            } ${isToday ? "selected" : ""}" 
                 onclick="showDayAppointments('${date}')">
                <div>${day}</div>
                ${
                    appointments.length > 0
                        ? `<small class="text-success">${appointments.length}</small>`
                        : ""
                }
            </div>
        `;
    }

    calendarHtml += "</div></div>";

    return calendarHtml;
}

// Get appointments for a specific date
function getAppointmentsForDate(date) {
    const allAppointments =
        AppState.userType === "admin"
            ? getAllAppointments()
            : AppState.appointments;
    return allAppointments.filter((apt) => apt.date === date);
}

// Render appointments list
function renderAppointmentsList(appointments) {
    if (appointments.length === 0) {
        return `
            <div class="text-center py-4">
                <i class="fas fa-calendar fa-3x text-muted mb-3"></i>
                <p class="text-muted">No appointments found</p>
            </div>
        `;
    }

    return appointments
        .sort(
            (a, b) =>
                new Date(b.date + " " + b.time) -
                new Date(a.date + " " + a.time)
        )
        .map(
            (appointment) => `
            <div 
                class="appointment-card ${appointment.status} mb-3" 
                onclick="viewAppointmentDetails('${appointment.id}')" 
                style="cursor: pointer;"
            >
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <div class="d-flex align-items-center mb-2">
                            <h6 class="fw-bold mb-0 me-2">${
                                appointment.petName
                            }</h6>
                            <span class="status-badge status-${
                                appointment.status
                            }">
                                ${capitalizeFirst(appointment.status)}
                            </span>
                        </div>
                        
                        <div class="row mb-2">
                            <div class="col-md-6">
                                <p class="text-muted mb-1 small">
                                    <i class="fas fa-calendar me-1"></i>
                                    ${formatDate(appointment.date)}
                                </p>
                                <p class="text-muted mb-1 small">
                                    <i class="fas fa-clock me-1"></i>
                                    ${formatTime(appointment.time)}
                                </p>
                            </div>
                            <div class="col-md-6">
                                <p class="text-muted mb-1 small">
                                    <i class="fas fa-stethoscope me-1"></i>
                                    ${appointment.reason}
                                </p>
                                <p class="text-muted mb-1 small">
                                    <i class="fas fa-user-md me-1"></i>
                                    ${appointment.veterinarian}
                                </p>
                            </div>
                        </div>
                        
                        ${
                            AppState.userType === "admin"
                                ? `
                            <p class="text-muted mb-0 small">
                                <i class="fas fa-user me-1"></i>
                                Owner: ${getOwnerName(appointment.ownerId)}
                            </p>
                        `
                                : ""
                        }
                        
                        ${
                            appointment.notes
                                ? `
                            <p class="text-muted mb-0 small mt-2">
                                <i class="fas fa-sticky-note me-1"></i>
                                ${appointment.notes}
                            </p>
                        `
                                : ""
                        }
                    </div>
                    
                    <div class="dropdown" onclick="event.stopPropagation();"> <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" onclick="viewAppointmentDetails('${
                                appointment.id
                            }')">
                                <i class="fas fa-eye me-2"></i>View Details
                            </a></li>
                            ${
                                appointment.status === "pending" ||
                                appointment.status === "confirmed"
                                    ? `
                                <li><a class="dropdown-item" href="#" onclick="editAppointment('${appointment.id}')">
                                    <i class="fas fa-edit me-2"></i>Edit
                                </a></li>
                            `
                                    : ""
                            }
                            ${
                                AppState.userType === "admin"
                                    ? `
                                <li><a class="dropdown-item" href="#" onclick="updateAppointmentStatus('${appointment.id}', 'confirmed')">
                                    <i class="fas fa-check me-2"></i>Confirm
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="updateAppointmentStatus('${appointment.id}', 'completed')">
                                    <i class="fas fa-check-double me-2"></i>Mark Complete
                                </a></li>
                            `
                                    : ""
                            }
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger" href="#" onclick="cancelAppointment('${
                                appointment.id
                            }')">
                                <i class="fas fa-times me-2"></i>Cancel
                            </a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `
        )
        .join("");
}

// Render upcoming appointments for user
function renderUpcomingAppointments() {
    const today = new Date().toISOString().split("T")[0];
    const upcomingAppointments = AppState.appointments
        .filter((apt) => apt.date >= today && apt.status !== "cancelled")
        .sort(
            (a, b) =>
                new Date(a.date + " " + a.time) -
                new Date(b.date + " " + b.time)
        )
        .slice(0, 3);

    if (upcomingAppointments.length === 0) {
        return `
            <div class="text-center py-3">
                <p class="text-muted mb-3">No upcoming appointments</p>
                <button class="btn btn-sm btn-primary" onclick="showBookAppointmentModal()">
                    Book Your Next Appointment
                </button>
            </div>
        `;
    }

    return upcomingAppointments
        .map(
            (appointment) => `
        <div class="appointment-card ${appointment.status} mb-3">
            <div class="d-flex justify-content-between align-items-center">
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

// Show book appointment modal
function showBookAppointmentModal() {
    const selectedPetId = sessionStorage.getItem("selectedPetId");

    const modalHtml = `
        <div class="modal fade" id="bookAppointmentModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-calendar-plus text-success me-2"></i>
                            Book New Appointment
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="book-appointment-form" onsubmit="handleBookAppointment(event)">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Select Pet *</label>
                                    <select class="form-select" id="appointment-pet" required>
                                        <option value="">Choose a pet</option>
                                        ${AppState.pets
                                            .map(
                                                (pet) => `
                                            <option value="${pet.id}" ${
                                                    pet.id === selectedPetId
                                                        ? "selected"
                                                        : ""
                                                }>
                                                ${pet.name} (${pet.species})
                                            </option>
                                        `
                                            )
                                            .join("")}
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Appointment Date *</label>
                                    <input type="date" class="form-control" id="appointment-date" 
                                           min="${
                                               new Date()
                                                   .toISOString()
                                                   .split("T")[0]
                                           }" required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Preferred Time *</label>
                                    <select class="form-select" id="appointment-time" required>
                                        <option value="">Select time</option>
                                        <option value="09:00">9:00 AM</option>
                                        <option value="09:30">9:30 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="10:30">10:30 AM</option>
                                        <option value="11:00">11:00 AM</option>
                                        <option value="11:30">11:30 AM</option>
                                        <option value="14:00">2:00 PM</option>
                                        <option value="14:30">2:30 PM</option>
                                        <option value="15:00">3:00 PM</option>
                                        <option value="15:30">3:30 PM</option>
                                        <option value="16:00">4:00 PM</option>
                                        <option value="16:30">4:30 PM</option>
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Reason for Visit *</label>
                                    <select class="form-select" id="appointment-reason" required>
                                        <option value="">Select reason</option>
                                        <option value="Annual Checkup">Annual Checkup</option>
                                        <option value="Vaccination">Vaccination</option>
                                        <option value="Sick Visit">Sick Visit</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Surgery Consultation">Surgery Consultation</option>
                                        <option value="Dental Cleaning">Dental Cleaning</option>
                                        <option value="Grooming">Grooming</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Additional Notes</label>
                                <textarea class="form-control" id="appointment-notes" rows="3" 
                                          placeholder="Any specific concerns or information for the veterinarian..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-calendar-plus me-2"></i>Book Appointment
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById("bookAppointmentModal");
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.getElementById("modal-container").innerHTML = modalHtml;

    // Clear selected pet from session storage
    sessionStorage.removeItem("selectedPetId");

    // Show modal
    const modal = new bootstrap.Modal(
        document.getElementById("bookAppointmentModal")
    );
    modal.show();
}

// Handle book appointment form submission
function handleBookAppointment(event) {
    event.preventDefault();

    const petId = document.getElementById("appointment-pet").value;
    const date = document.getElementById("appointment-date").value;
    const time = document.getElementById("appointment-time").value;
    const reason = document.getElementById("appointment-reason").value;
    const notes = document.getElementById("appointment-notes").value.trim();

    // Find the selected pet
    const selectedPet = AppState.pets.find((pet) => pet.id === petId);
    if (!selectedPet) {
        showAlert("Please select a valid pet", "danger");
        return;
    }

    // Check if the appointment time is already taken
    const existingAppointment = AppState.appointments.find(
        (apt) =>
            apt.date === date && apt.time === time && apt.status !== "cancelled"
    );

    if (existingAppointment) {
        showAlert(
            "This time slot is already booked. Please choose another time.",
            "warning"
        );
        return;
    }

    const appointmentData = {
        id: generateId("apt"),
        petId: petId,
        petName: selectedPet.name,
        ownerId: AppState.currentUser.id,
        date: date,
        time: time,
        reason: reason,
        status: "pending",
        veterinarian: "Dr. Sarah Johnson",
        notes: notes,
        createdAt: new Date().toISOString(),
    };

    // Add appointment
    AppState.appointments.push(appointmentData);
    saveUserData();

    // Close modal
    const modal = bootstrap.Modal.getInstance(
        document.getElementById("bookAppointmentModal")
    );
    modal.hide();

    // Refresh appointments page
    renderAppointmentsPage();

    showAlert(
        `Appointment booked for ${selectedPet.name} on ${formatDate(
            date
        )} at ${formatTime(time)}`,
        "success"
    );
}

// Update appointment stats
function updateAppointmentStats() {
    const allAppointments = getAllAppointments();
    const today = new Date().toISOString().split("T")[0];

    // Today's appointments
    const todayAppointments = allAppointments.filter(
        (apt) => apt.date === today
    );
    document.getElementById("today-appointments-count").textContent =
        todayAppointments.length;

    // This week's appointments
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const weekAppointments = allAppointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        return aptDate >= startOfWeek && aptDate <= endOfWeek;
    });
    document.getElementById("week-appointments-count").textContent =
        weekAppointments.length;

    // Status counts
    const pendingCount = allAppointments.filter(
        (apt) => apt.status === "pending"
    ).length;
    const confirmedCount = allAppointments.filter(
        (apt) => apt.status === "confirmed"
    ).length;

    document.getElementById("pending-appointments-count").textContent =
        pendingCount;
    document.getElementById("confirmed-appointments-count").textContent =
        confirmedCount;
}

// Update user appointment counts
function updateUserAppointmentCounts() {
    const today = new Date().toISOString().split("T")[0];
    const upcomingCount = AppState.appointments.filter(
        (apt) => apt.date >= today && apt.status !== "cancelled"
    ).length;

    document.getElementById("upcoming-count").textContent = upcomingCount;
}

// Update appointment status (admin only)
function updateAppointmentStatus(appointmentId, newStatus) {
    if (AppState.userType !== "admin") {
        showAlert("Access denied", "danger");
        return;
    }

    const allAppointments = getAllAppointments();
    const appointment = allAppointments.find((apt) => apt.id === appointmentId);

    if (!appointment) {
        showAlert("Appointment not found", "danger");
        return;
    }

    // Update the appointment in the owner's data
    const ownerAppointments = JSON.parse(
        localStorage.getItem(
            `bbc_clinic_appointments_${appointment.ownerId}`
        ) || "[]"
    );
    const appointmentIndex = ownerAppointments.findIndex(
        (apt) => apt.id === appointmentId
    );

    if (appointmentIndex !== -1) {
        ownerAppointments[appointmentIndex].status = newStatus;
        localStorage.setItem(
            `bbc_clinic_appointments_${appointment.ownerId}`,
            JSON.stringify(ownerAppointments)
        );

        renderAppointmentsPage();
        showAlert(`Appointment status updated to ${newStatus}`, "success");
    }
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    if (confirm("Are you sure you want to cancel this appointment?")) {
        if (AppState.userType === "admin") {
            updateAppointmentStatus(appointmentId, "cancelled");
        } else {
            const appointmentIndex = AppState.appointments.findIndex(
                (apt) => apt.id === appointmentId
            );
            if (appointmentIndex !== -1) {
                AppState.appointments[appointmentIndex].status = "cancelled";
                saveUserData();
                renderAppointmentsPage();
                showAlert("Appointment cancelled", "success");
            }
        }
    }
}

// View appointment details
function viewAppointmentDetails(appointmentId) {
    let appointment;
    if (AppState.userType === "admin") {
        appointment = getAllAppointments().find(
            (apt) => apt.id === appointmentId
        );
    } else {
        appointment = AppState.appointments.find(
            (apt) => apt.id === appointmentId
        );
    }

    if (!appointment) {
        showAlert("Appointment not found", "danger");
        return;
    }

    const modalHtml = `
        <div class="modal fade" id="appointmentDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Appointment for ${
                            appointment.petName
                        } - ${formatDate(appointment.date)}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Date:</strong> ${formatDate(
                                    appointment.date
                                )}</p>
                                <p><strong>Time:</strong> ${formatTime(
                                    appointment.time
                                )}</p>
                                <p><strong>Status:</strong> <span class="status-badge status-${
                                    appointment.status
                                }">${capitalizeFirst(
        appointment.status
    )}</span></p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Veterinarian:</strong> ${
                                    appointment.veterinarian
                                }</p>
                                <p><strong>Reason:</strong> ${
                                    appointment.reason
                                }</p>
                                <p><strong>Notes:</strong> ${
                                    appointment.notes || "None"
                                }</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="editAppointment('${
                            appointment.id
                        }')">
                            <i class="fas fa-edit me-2"></i>Edit
                        </button>
                        <button type="button" class="btn btn-danger" onclick="cancelAppointment('${
                            appointment.id
                        }')">
                            <i class="fas fa-times me-2"></i>Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Add to modal-container (similar to pets.js)
    document.getElementById("modal-container").innerHTML = modalHtml;
    const modal = new bootstrap.Modal(
        document.getElementById("appointmentDetailsModal")
    );
    modal.show();
}

function editAppointment(appointmentId) {
    let appointment;
    if (AppState.userType === "admin") {
        appointment = getAllAppointments().find(
            (apt) => apt.id === appointmentId
        );
    } else {
        appointment = AppState.appointments.find(
            (apt) => apt.id === appointmentId
        );
    }

    if (!appointment) {
        showAlert("Appointment not found", "danger");
        return;
    }

    // Close any existing modals first
    const existingDetailsModal = document.getElementById(
        "appointmentDetailsModal"
    );
    if (existingDetailsModal) {
        const modalInstance = bootstrap.Modal.getInstance(existingDetailsModal);
        if (modalInstance) {
            modalInstance.hide();
        }
    }

    // Create edit modal HTML
    const modalHtml = `
        <div class="modal fade" id="editAppointmentModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Appointment for ${
                            appointment.petName
                        }</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="edit-appointment-form">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Date</label>
                                    <input type="date" class="form-control" id="edit-date" value="${
                                        appointment.date
                                    }" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Time</label>
                                    <input type="time" class="form-control" id="edit-time" value="${
                                        appointment.time
                                    }" required>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Veterinarian</label>
                                <select class="form-select" id="edit-veterinarian" required>
                                    <option value="Dr. Sarah Johnson" ${
                                        appointment.veterinarian ===
                                        "Dr. Sarah Johnson"
                                            ? "selected"
                                            : ""
                                    }>Dr. Sarah Johnson</option>
                                    <option value="Dr. Michael Lee" ${
                                        appointment.veterinarian ===
                                        "Dr. Michael Lee"
                                            ? "selected"
                                            : ""
                                    }>Dr. Michael Lee</option>
                                    <option value="Dr. Emily Chen" ${
                                        appointment.veterinarian ===
                                        "Dr. Emily Chen"
                                            ? "selected"
                                            : ""
                                    }>Dr. Emily Chen</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Reason</label>
                                <input type="text" class="form-control" id="edit-reason" value="${
                                    appointment.reason
                                }" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="edit-notes">${
                                    appointment.notes || ""
                                }</textarea>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="handleEditAppointment('${
                            appointment.id
                        }')">
                            <i class="fas fa-save me-2"></i>Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing edit modal if any
    const existingEditModal = document.getElementById("editAppointmentModal");
    if (existingEditModal) {
        existingEditModal.remove();
    }

    // Add modal to page
    document.getElementById("modal-container").innerHTML += modalHtml;

    const modal = new bootstrap.Modal(
        document.getElementById("editAppointmentModal")
    );
    modal.show();
}
// Handle edit appointment submission
function handleEditAppointment(appointmentId) {
    const date = document.getElementById("edit-date").value;
    const time = document.getElementById("edit-time").value;
    const veterinarian = document.getElementById("edit-veterinarian").value;
    const reason = document.getElementById("edit-reason").value;
    const notes = document.getElementById("edit-notes").value.trim();

    if (AppState.userType === "admin") {
        // Update for admin
        const allAppointments = getAllAppointments();
        const appointment = allAppointments.find(
            (apt) => apt.id === appointmentId
        );

        if (appointment) {
            const ownerAppointments = JSON.parse(
                localStorage.getItem(
                    `bbc_clinic_appointments_${appointment.ownerId}`
                ) || "[]"
            );
            const appointmentIndex = ownerAppointments.findIndex(
                (apt) => apt.id === appointmentId
            );

            if (appointmentIndex !== -1) {
                ownerAppointments[appointmentIndex] = {
                    ...ownerAppointments[appointmentIndex],
                    date,
                    time,
                    veterinarian,
                    reason,
                    notes,
                };
                localStorage.setItem(
                    `bbc_clinic_appointments_${appointment.ownerId}`,
                    JSON.stringify(ownerAppointments)
                );
            }
        }
    } else {
        // Update for regular user
        const appointmentIndex = AppState.appointments.findIndex(
            (apt) => apt.id === appointmentId
        );
        if (appointmentIndex !== -1) {
            AppState.appointments[appointmentIndex] = {
                ...AppState.appointments[appointmentIndex],
                date,
                time,
                veterinarian,
                reason,
                notes,
            };
            saveUserData();
        }
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(
        document.getElementById("editAppointmentModal")
    );
    if (modal) {
        modal.hide();
    }

    // Refresh page
    renderAppointmentsPage();
    showAlert("Appointment updated successfully!", "success");
}

// Export the function
window.handleEditAppointment = handleEditAppointment;

// Show new appointment modal (admin)
function showNewAppointmentModal() {
    // Implementation for admin to create appointments for any client
    showAlert(
        "Admin new appointment functionality will be implemented",
        "info"
    );
}

// Calendar navigation functions
function changeMonth(direction) {
    // Implementation for calendar month navigation
    showAlert("Calendar navigation will be implemented", "info");
}

function showDayAppointments(date) {
    // Implementation for showing appointments for a specific day
    showAlert(`Show appointments for ${date}`, "info");
}

function filterAppointments() {
    const status = document.getElementById("status-filter").value;
    const dateFrom = document.getElementById("date-from").value;
    const dateTo = document.getElementById("date-to").value;

    let appointments = getAllAppointments(); // Or AppState.appointments for user
    if (status)
        appointments = appointments.filter((apt) => apt.status === status);
    if (dateFrom)
        appointments = appointments.filter((apt) => apt.date >= dateFrom);
    if (dateTo) appointments = appointments.filter((apt) => apt.date <= dateTo);

    document.getElementById("appointments-list").innerHTML =
        renderAppointmentsList(appointments);
}

// Clear filters
function clearFilters() {
    document.getElementById("status-filter").value = "";
    document.getElementById("date-from").value = "";
    document.getElementById("date-to").value = "";
    filterAppointments();
}

// Export functions
window.renderAppointmentsPage = renderAppointmentsPage;
window.showBookAppointmentModal = showBookAppointmentModal;
window.handleBookAppointment = handleBookAppointment;
window.updateAppointmentStatus = updateAppointmentStatus;
window.cancelAppointment = cancelAppointment;
window.viewAppointmentDetails = viewAppointmentDetails;
window.editAppointment = editAppointment;
window.showNewAppointmentModal = showNewAppointmentModal;
window.changeMonth = changeMonth;
window.showDayAppointments = showDayAppointments;
window.filterAppointments = filterAppointments;
window.clearFilters = clearFilters;
