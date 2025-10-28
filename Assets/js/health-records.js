// BBC Veterinary Clinic - Health Records Module

// Render health records page
function renderHealthRecordsPage() {
    const healthRecordsPage = document.getElementById("health-records-page");

    if (AppState.userType === "admin") {
        renderAdminHealthRecordsPage(healthRecordsPage);
    } else {
        renderUserHealthRecordsPage(healthRecordsPage);
    }
}

// Render admin health records page
function renderAdminHealthRecordsPage(container) {
    const allHealthRecords = getAllHealthRecords();

    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="fw-bold text-white mb-0">
                            <i class="fas fa-file-medical me-2"></i>
                            Health Records Management
                        </h2>
                        <p class="text-white">Manage electronic health records for all pets</p>
                    </div>
                    <button class="btn btn-primary" onclick="showAddHealthRecordModal()">
                        <i class="fas fa-plus me-2"></i>Add Health Record
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Search and Filter -->
        <div class="row mb-4">
            <div class="col-md-4">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="fas fa-search"></i>
                    </span>
                    <input type="text" class="form-control" id="record-search" placeholder="Search records..." onkeyup="filterHealthRecords()">
                </div>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="pet-filter" onchange="filterHealthRecords()">
                    <option value="">All Pets</option>
                    ${getAllPets()
                        .map(
                            (pet) =>
                                `<option value="${pet.id}">${pet.name} (${pet.species})</option>`
                        )
                        .join("")}
                </select>
            </div>
            <div class="col-md-3">
                <input type="date" class="form-control" id="date-filter" onchange="filterHealthRecords()" placeholder="Filter by date">
            </div>
            <div class="col-md-2">
                <button class="btn btn-outline-secondary w-100" onclick="clearHealthRecordFilters()">
                    Clear
                </button>
            </div>
        </div>
        
        <!-- Health Records List -->
        <div class="row">
            <div class="col-12">
                <div id="health-records-list">
                    ${renderHealthRecordsList(allHealthRecords)}
                </div>
            </div>
        </div>
    `;
}

// Render user health records page
function renderUserHealthRecordsPage(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="fw-bold text-white mb-0">
                            <i class="fas fa-file-medical me-2"></i>
                            My Pets' Health Records
                        </h2>
                        <p class="text-white">View your pets' medical history and health records</p>
                    </div>
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
                            <p class="text-muted mb-4">Add your pets to start tracking their health records.</p>
                            <button class="btn btn-primary btn-lg" onclick="showPets()">
                                <i class="fas fa-plus me-2"></i>Add Your First Pet
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
                : `
            <!-- Pet Selector -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <label class="form-label">Select Pet to View Records</label>
                    <select class="form-select" id="user-pet-selector" onchange="filterUserHealthRecords()">
                        <option value="">All Pets</option>
                        ${AppState.pets
                            .map(
                                (pet) =>
                                    `<option value="${pet.id}">${pet.name} (${pet.species})</option>`
                            )
                            .join("")}
                    </select>
                </div>
                <div class="col-md-6 d-flex align-items-end">
                    <button class="btn btn-outline-primary text-white" onclick="downloadHealthRecordsPDF()">
                        <i class="fas fa-download me-2"></i>Download PDF Report
                    </button>
                </div>
            </div>
            
            <!-- Health Records -->
            <div class="row">
                <div class="col-12">
                    <div id="user-health-records-list">
                        ${renderHealthRecordsList(AppState.healthRecords)}
                    </div>
                </div>
            </div>
        `
        }
    `;
}

// Render health records list
function renderHealthRecordsList(records) {
    if (records.length === 0) {
        return `
            <div class="card text-center py-5">
                <div class="card-body">
                    <i class="fas fa-file-medical fa-4x text-muted mb-4"></i>
                    <h4 class="text-muted mb-3">No health records found</h4>
                    <p class="text-muted">Health records will appear here after veterinary visits.</p>
                </div>
            </div>
        `;
    }

    return records
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(
            (record) => `
            <div class="health-record-card mb-4 record-item" data-pet="${
                record.petId
            }" data-date="${record.date}">
                <div class="health-record-header">
                    <div>
                        <h5 class="fw-bold mb-1">${record.petName}</h5>
                        <p class="text-muted mb-0">${record.visitReason}</p>
                    </div>
                    <div class="text-end">
                        <div class="record-date">${formatDate(
                            record.date
                        )}</div>
                        <small class="text-muted">Dr. ${
                            record.veterinarian
                        }</small>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <div class="card bg-light">
                            <div class="card-body py-2">
                                <h6 class="card-title mb-2 text-primary">
                                    <i class="fas fa-stethoscope me-1"></i>Diagnosis
                                </h6>
                                <p class="card-text mb-0">${
                                    record.diagnosis
                                }</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card bg-light">
                            <div class="card-body py-2">
                                <h6 class="card-title mb-2 text-success">
                                    <i class="fas fa-pills me-1"></i>Treatment
                                </h6>
                                <p class="card-text mb-0">${
                                    record.treatment
                                }</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${
                    record.prescription
                        ? `
                    <div class="mb-3">
                        <div class="card bg-warning bg-opacity-10">
                            <div class="card-body py-2">
                                <h6 class="card-title mb-2 text-warning">
                                    <i class="fas fa-prescription me-1"></i>Prescription
                                </h6>
                                <p class="card-text mb-0">${record.prescription}</p>
                            </div>
                        </div>
                    </div>
                `
                        : ""
                }
                
                <!-- Vital Signs -->
                <div class="row mb-3">
                    <div class="col-md-4">
                        <div class="text-center p-2 border rounded">
                            <div class="text-muted small">Weight</div>
                            <div class="fw-bold">${record.weight} lbs</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-center p-2 border rounded">
                            <div class="text-muted small">Temperature</div>
                            <div class="fw-bold">${record.temperature}°F</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="text-center p-2 border rounded">
                            <div class="text-muted small">Heart Rate</div>
                            <div class="fw-bold">${record.heartRate} bpm</div>
                        </div>
                    </div>
                </div>
                
                ${
                    record.notes
                        ? `
                    <div class="mb-3">
                        <h6 class="text-info mb-2">
                            <i class="fas fa-sticky-note me-1"></i>Additional Notes
                        </h6>
                        <p class="text-muted mb-0">${record.notes}</p>
                    </div>
                `
                        : ""
                }
                
                ${
                    record.nextVisit
                        ? `
                    <div class="alert alert-info mb-0">
                        <i class="fas fa-calendar-plus me-2"></i>
                        <strong>Next Recommended Visit:</strong> ${formatDate(
                            record.nextVisit
                        )}
                    </div>
                `
                        : ""
                }
                
                ${
                    AppState.userType === "admin"
                        ? `
                    <div class="d-flex justify-content-end mt-3">
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editHealthRecord('${record.id}')">
                            <i class="fas fa-edit me-1"></i>Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteHealthRecord('${record.id}')">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                `
                        : ""
                }
            </div>
        `
        )
        .join("");
}

// Show add health record modal (admin only)
function showAddHealthRecordModal() {
    if (AppState.userType !== "admin") {
        showAlert("Access denied", "danger");
        return;
    }

    const modalHtml = `
        <div class="modal fade" id="addHealthRecordModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-plus text-success me-2"></i>
                            Add Health Record
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="add-health-record-form" onsubmit="handleAddHealthRecord(event)">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Pet *</label>
                                    <select class="form-select" id="health-record-pet" required onchange="loadPetInfo()">
                                        <option value="">Select Pet</option>
                                        ${getAllPets()
                                            .map(
                                                (pet) =>
                                                    `<option value="${
                                                        pet.id
                                                    }">${pet.name} (${
                                                        pet.species
                                                    }) - ${getOwnerName(
                                                        pet.ownerId
                                                    )}</option>`
                                            )
                                            .join("")}
                                    </select>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Visit Date *</label>
                                    <input type="date" class="form-control" id="health-record-date" value="${
                                        new Date().toISOString().split("T")[0]
                                    }" required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Veterinarian *</label>
                                    <input type="text" class="form-control" id="health-record-vet" value="Dr. Sarah Johnson" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Visit Reason *</label>
                                    <select class="form-select" id="health-record-reason" required>
                                        <option value="">Select reason</option>
                                        <option value="Annual Checkup">Annual Checkup</option>
                                        <option value="Vaccination">Vaccination</option>
                                        <option value="Sick Visit">Sick Visit</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Surgery">Surgery</option>
                                        <option value="Dental Cleaning">Dental Cleaning</option>
                                        <option value="Follow-up">Follow-up</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Diagnosis *</label>
                                    <textarea class="form-control" id="health-record-diagnosis" rows="3" required placeholder="Primary diagnosis and findings..."></textarea>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Treatment *</label>
                                    <textarea class="form-control" id="health-record-treatment" rows="3" required placeholder="Treatment provided..."></textarea>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Prescription</label>
                                <textarea class="form-control" id="health-record-prescription" rows="2" placeholder="Medications prescribed with dosage and instructions..."></textarea>
                            </div>
                            
                            <!-- Vital Signs -->
                            <div class="card mb-3">
                                <div class="card-header">
                                    <h6 class="mb-0">Vital Signs</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">Weight (lbs)</label>
                                            <input type="number" class="form-control" id="health-record-weight" step="0.1" min="0">
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">Temperature (°F)</label>
                                            <input type="number" class="form-control" id="health-record-temperature" step="0.1" min="90" max="110">
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="form-label">Heart Rate (bpm)</label>
                                            <input type="number" class="form-control" id="health-record-heartrate" min="0" max="300">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Additional Notes</label>
                                    <textarea class="form-control" id="health-record-notes" rows="3" placeholder="Any additional observations or notes..."></textarea>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Next Recommended Visit</label>
                                    <input type="date" class="form-control" id="health-record-next-visit">
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save me-2"></i>Save Health Record
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById("addHealthRecordModal");
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.getElementById("modal-container").innerHTML = modalHtml;

    // Show modal
    const modal = new bootstrap.Modal(
        document.getElementById("addHealthRecordModal")
    );
    modal.show();
}

// Load pet info when pet is selected
function loadPetInfo() {
    const petId = document.getElementById("health-record-pet").value;
    if (!petId) return;

    const pet = getAllPets().find((p) => p.id === petId);
    if (pet) {
        document.getElementById("health-record-weight").value =
            pet.weight || "";
    }
}

// Handle add health record form submission
function handleAddHealthRecord(event) {
    event.preventDefault();

    const petId = document.getElementById("health-record-pet").value;
    const selectedPet = getAllPets().find((p) => p.id === petId);

    if (!selectedPet) {
        showAlert("Please select a valid pet", "danger");
        return;
    }

    const healthRecordData = {
        id: generateId("hr"),
        petId: petId,
        petName: selectedPet.name,
        ownerId: selectedPet.ownerId,
        date: document.getElementById("health-record-date").value,
        veterinarian: document.getElementById("health-record-vet").value.trim(),
        visitReason: document.getElementById("health-record-reason").value,
        diagnosis: document
            .getElementById("health-record-diagnosis")
            .value.trim(),
        treatment: document
            .getElementById("health-record-treatment")
            .value.trim(),
        prescription: document
            .getElementById("health-record-prescription")
            .value.trim(),
        weight:
            parseFloat(document.getElementById("health-record-weight").value) ||
            0,
        temperature:
            parseFloat(
                document.getElementById("health-record-temperature").value
            ) || 0,
        heartRate:
            parseInt(
                document.getElementById("health-record-heartrate").value
            ) || 0,
        notes: document.getElementById("health-record-notes").value.trim(),
        nextVisit: document.getElementById("health-record-next-visit").value,
        createdAt: new Date().toISOString(),
    };

    // Add to the owner's health records
    const ownerHealthRecords = JSON.parse(
        localStorage.getItem(
            `bbc_clinic_health_records_${selectedPet.ownerId}`
        ) || "[]"
    );
    ownerHealthRecords.push(healthRecordData);
    localStorage.setItem(
        `bbc_clinic_health_records_${selectedPet.ownerId}`,
        JSON.stringify(ownerHealthRecords)
    );

    // Close modal
    const modal = bootstrap.Modal.getInstance(
        document.getElementById("addHealthRecordModal")
    );
    modal.hide();

    // Refresh health records page
    renderHealthRecordsPage();

    showAlert(`Health record added for ${selectedPet.name}`, "success");
}

// Filter health records
function filterHealthRecords() {
    const searchTerm =
        document.getElementById("record-search")?.value.toLowerCase() || "";
    const petFilter = document.getElementById("pet-filter")?.value || "";
    const dateFilter = document.getElementById("date-filter")?.value || "";

    const recordItems = document.querySelectorAll(".record-item");

    recordItems.forEach((item) => {
        const petId = item.dataset.pet;
        const recordDate = item.dataset.date;
        const textContent = item.textContent.toLowerCase();

        const matchesSearch = textContent.includes(searchTerm);
        const matchesPet = !petFilter || petId === petFilter;
        const matchesDate = !dateFilter || recordDate === dateFilter;

        if (matchesSearch && matchesPet && matchesDate) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// Filter user health records
function filterUserHealthRecords() {
    const petFilter = document.getElementById("user-pet-selector").value;

    const recordItems = document.querySelectorAll(".record-item");

    recordItems.forEach((item) => {
        const petId = item.dataset.pet;

        if (!petFilter || petId === petFilter) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// Clear health record filters
function clearHealthRecordFilters() {
    document.getElementById("record-search").value = "";
    document.getElementById("pet-filter").value = "";
    document.getElementById("date-filter").value = "";
    filterHealthRecords();
}

// Download health records PDF
function downloadHealthRecordsPDF() {
    if (typeof jsPDF === "undefined") {
        showAlert("PDF library not loaded", "danger");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("BBC Veterinary Clinic", 20, 20);
    doc.setFontSize(16);
    doc.text("Health Records Report", 20, 30);

    // Add user info
    doc.setFontSize(12);
    doc.text(
        `Owner: ${AppState.currentUser.firstName} ${AppState.currentUser.lastName}`,
        20,
        45
    );
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);

    let yPosition = 70;

    // Add records
    AppState.healthRecords.forEach((record, index) => {
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        doc.setFontSize(14);
        doc.text(
            `${record.petName} - ${formatDate(record.date)}`,
            20,
            yPosition
        );

        yPosition += 10;
        doc.setFontSize(10);
        doc.text(`Visit Reason: ${record.visitReason}`, 25, yPosition);

        yPosition += 8;
        doc.text(`Diagnosis: ${record.diagnosis}`, 25, yPosition);

        yPosition += 8;
        doc.text(`Treatment: ${record.treatment}`, 25, yPosition);

        if (record.prescription) {
            yPosition += 8;
            doc.text(`Prescription: ${record.prescription}`, 25, yPosition);
        }

        yPosition += 15;
    });

    // Save the PDF
    doc.save(
        `BBC_Health_Records_${AppState.currentUser.lastName}_${
            new Date().toISOString().split("T")[0]
        }.pdf`
    );
    showAlert("Health records PDF downloaded successfully!", "success");
}

// Edit health record (admin only)
function editHealthRecord(recordId) {
    showAlert("Edit health record functionality will be implemented", "info");
}

// Delete health record (admin only)
function deleteHealthRecord(recordId) {
    if (confirm("Are you sure you want to delete this health record?")) {
        showAlert(
            "Delete health record functionality will be implemented",
            "info"
        );
    }
}

// Get all health records (admin)
function getAllHealthRecords() {
    const usersList = getAllClients();
    const allHealthRecords = [];

    usersList.forEach((user) => {
        const userHealthRecords = JSON.parse(
            localStorage.getItem(`bbc_clinic_health_records_${user.id}`) || "[]"
        );
        allHealthRecords.push(...userHealthRecords);
    });

    return allHealthRecords;
}

// Export functions
window.renderHealthRecordsPage = renderHealthRecordsPage;
window.showAddHealthRecordModal = showAddHealthRecordModal;
window.loadPetInfo = loadPetInfo;
window.handleAddHealthRecord = handleAddHealthRecord;
window.filterHealthRecords = filterHealthRecords;
window.filterUserHealthRecords = filterUserHealthRecords;
window.clearHealthRecordFilters = clearHealthRecordFilters;
window.downloadHealthRecordsPDF = downloadHealthRecordsPDF;
window.editHealthRecord = editHealthRecord;
window.deleteHealthRecord = deleteHealthRecord;
