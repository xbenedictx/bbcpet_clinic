// BBC Veterinary Clinic - Pets Management Module

// Render pets page
function renderPetsPage() {
    const petsPage = document.getElementById("pets-page");

    if (AppState.userType === "admin") {
        renderAdminPetsPage(petsPage);
    } else {
        renderUserPetsPage(petsPage);
    }
}

// Render admin pets page
function renderAdminPetsPage(container) {
    const allPets = getAllPets();

    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="fw-bold text-white mb-0">
                            <i class="fas fa-paw me-2"></i>
                            Pet Management
                        </h2>
                        <p class="text-white">Manage all pets in the clinic</p>
                    </div>
                    <button class="btn btn-primary" onclick="showAddPetModal()">
                        <i class="fas fa-plus me-2"></i>Add New Pet
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Search and Filter -->
        <div class="row mb-4">
            <div class="col-md-6">
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="fas fa-search"></i>
                    </span>
                    <input type="text" class="form-control" id="pet-search" placeholder="Search pets..." onkeyup="filterPets()">
                </div>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="species-filter" onchange="filterPets()">
                    <option value="">All Species</option>
                    <option value="Dog">Dogs</option>
                    <option value="Cat">Cats</option>
                    <option value="Bird">Birds</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="col-md-3">
                <select class="form-select" id="owner-filter" onchange="filterPets()">
                    <option value="">All Owners</option>
                    ${getAllClients()
                        .map(
                            (client) =>
                                `<option value="${client.id}">${client.name}</option>`
                        )
                        .join("")}
                </select>
            </div>
        </div>
        
        <!-- Pets Grid -->
        <div class="row" id="pets-grid">
            ${renderPetsGrid(allPets)}
        </div>
    `;
}

// Render user pets page
function renderUserPetsPage(container) {
    container.innerHTML = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 class="fw-bold text-white mb-0">
                            <i class="fas fa-paw me-2"></i>
                            My Pets
                        </h2>
                        <p class="text-white">Manage your furry family members</p>
                    </div>
                    <button class="btn btn-primary" onclick="showAddPetModal()">
                        <i class="fas fa-plus me-2"></i>Add New Pet
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Pets Grid -->
        <div class="row" id="pets-grid">
            ${renderPetsGrid(AppState.pets)}
        </div>
    `;

    if (AppState.pets.length === 0) {
        document.getElementById("pets-grid").innerHTML = `
            <div class="col-12">
                <div class="card text-center py-5">
                    <div class="card-body">
                        <i class="fas fa-paw fa-4x text-muted mb-4"></i>
                        <h4 class="text-muted mb-3">No pets added yet</h4>
                        <p class="text-muted mb-4">Add your first pet to get started with managing their health and appointments.</p>
                        <button class="btn btn-primary btn-lg" onclick="showAddPetModal()">
                            <i class="fas fa-plus me-2"></i>Add Your First Pet
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Render pets grid
function renderPetsGrid(pets) {
    return pets
        .map(
            (pet) => `
        <div class="col-lg-4 col-md-6 mb-4 pet-item" data-species="${
            pet.species
        }" data-owner="${pet.ownerId}" data-name="${pet.name.toLowerCase()}">
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="pet-avatar me-3">
                            <i class="fas fa-${getPetIcon(pet.species)}"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h5 class="card-title fw-bold mb-1">${pet.name}</h5>
                            <p class="text-muted mb-0 small">${pet.breed}</p>
                        </div>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" onclick="viewPetDetails('${
                                    pet.id
                                }')">
                                    <i class="fas fa-eye me-2"></i>View Details
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="editPet('${
                                    pet.id
                                }')">
                                    <i class="fas fa-edit me-2"></i>Edit
                                </a></li>
                                <li><a class="dropdown-item" href="#" onclick="bookAppointmentForPet('${
                                    pet.id
                                }')">
                                    <i class="fas fa-calendar-plus me-2"></i>Book Appointment
                                </a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item text-danger" href="#" onclick="deletePet('${
                                    pet.id
                                }')">
                                    <i class="fas fa-trash me-2"></i>Delete
                                </a></li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-6">
                            <p class="mb-1 small text-muted">Species</p>
                            <p class="mb-0 fw-semibold">${pet.species}</p>
                        </div>
                        <div class="col-6">
                            <p class="mb-1 small text-muted">Age</p>
                            <p class="mb-0 fw-semibold">${pet.age} years</p>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-6">
                            <p class="mb-1 small text-muted">Weight</p>
                            <p class="mb-0 fw-semibold">${pet.weight} lbs</p>
                        </div>
                        <div class="col-6">
                            <p class="mb-1 small text-muted">Gender</p>
                            <p class="mb-0 fw-semibold">${pet.gender}</p>
                        </div>
                    </div>
                    
                    ${
                        AppState.userType === "admin"
                            ? `
                        <div class="mb-3">
                            <p class="mb-1 small text-muted">Owner</p>
                            <p class="mb-0 fw-semibold small">${getOwnerName(
                                pet.ownerId
                            )}</p>
                        </div>
                    `
                            : ""
                    }
                </div>
                
                <div class="card-footer bg-transparent">
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewPetDetails('${
                            pet.id
                        }')">
                            <i class="fas fa-eye me-1"></i>View
                        </button>
                        <button class="btn btn-primary btn-sm" onclick="bookAppointmentForPet('${
                            pet.id
                        }')">
                            <i class="fas fa-calendar-plus me-1"></i>Book
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
        )
        .join("");
}

// Get pet icon based on species
function getPetIcon(species) {
    switch (species.toLowerCase()) {
        case "dog":
            return "dog";
        case "cat":
            return "cat";
        case "bird":
            return "dove";
        case "rabbit":
            return "rabbit";
        case "hamster":
            return "hamster";
        default:
            return "paw";
    }
}

// Get owner name
function getOwnerName(ownerId) {
    const clients = getAllClients();
    const owner = clients.find((client) => client.id === ownerId);
    return owner ? owner.name : "Unknown Owner";
}

// Filter pets
function filterPets() {
    const searchTerm = document
        .getElementById("pet-search")
        .value.toLowerCase();
    const speciesFilter =
        document.getElementById("species-filter")?.value || "";
    const ownerFilter = document.getElementById("owner-filter")?.value || "";

    const petItems = document.querySelectorAll(".pet-item");

    petItems.forEach((item) => {
        const petName = item.dataset.name;
        const petSpecies = item.dataset.species;
        const petOwner = item.dataset.owner;

        const matchesSearch = petName.includes(searchTerm);
        const matchesSpecies = !speciesFilter || petSpecies === speciesFilter;
        const matchesOwner = !ownerFilter || petOwner === ownerFilter;

        if (matchesSearch && matchesSpecies && matchesOwner) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// Show add pet modal
function showAddPetModal() {
    const modalHtml = `
        <div class="modal fade" id="addPetModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-plus text-success me-2"></i>
                            Add New Pet
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <form id="add-pet-form" onsubmit="handleAddPet(event)">
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Pet Name *</label>
                                    <input type="text" class="form-control" id="pet-name" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Species *</label>
                                    <select class="form-select" id="pet-species" required>
                                        <option value="">Select Species</option>
                                        <option value="Dog">Dog</option>
                                        <option value="Cat">Cat</option>
                                        <option value="Bird">Bird</option>
                                        <option value="Rabbit">Rabbit</option>
                                        <option value="Hamster">Hamster</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Breed</label>
                                    <input type="text" class="form-control" id="pet-breed">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Age (years) *</label>
                                    <input type="number" class="form-control" id="pet-age" min="0" max="30" required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Weight (lbs)</label>
                                    <input type="number" class="form-control" id="pet-weight" min="0" step="0.1">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Gender</label>
                                    <select class="form-select" id="pet-gender">
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Color</label>
                                    <input type="text" class="form-control" id="pet-color">
                                </div>
                            </div>
                            
                            ${
                                AppState.userType === "admin"
                                    ? `
                                <div class="mb-3">
                                    <label class="form-label">Owner *</label>
                                    <select class="form-select" id="pet-owner" required>
                                        <option value="">Select Owner</option>
                                        ${getAllClients()
                                            .map(
                                                (client) =>
                                                    `<option value="${client.id}">${client.name}</option>`
                                            )
                                            .join("")}
                                    </select>
                                </div>
                            `
                                    : ""
                            }
                            
                            <div class="mb-3">
                                <label class="form-label">Emergency Contact</label>
                                <input type="text" class="form-control" id="pet-emergency" placeholder="Name and phone number">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Medical Notes</label>
                                <textarea class="form-control" id="pet-notes" rows="3" placeholder="Any medical conditions, allergies, or special notes..."></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-save me-2"></i>Add Pet
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal
    const existingModal = document.getElementById("addPetModal");
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.getElementById("modal-container").innerHTML = modalHtml;

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("addPetModal"));
    modal.show();
}

// Handle add pet form submission
function handleAddPet(event) {
    event.preventDefault();

    const petData = {
        id: generateId("pet"),
        name: document.getElementById("pet-name").value.trim(),
        species: document.getElementById("pet-species").value,
        breed: document.getElementById("pet-breed").value.trim(),
        age: parseInt(document.getElementById("pet-age").value),
        weight: parseFloat(document.getElementById("pet-weight").value) || 0,
        gender: document.getElementById("pet-gender").value,
        color: document.getElementById("pet-color").value.trim(),
        ownerId:
            AppState.userType === "admin"
                ? document.getElementById("pet-owner").value
                : AppState.currentUser.id,
        emergencyContact: document.getElementById("pet-emergency").value.trim(),
        medicalNotes: document.getElementById("pet-notes").value.trim(),
        createdAt: new Date().toISOString(),
    };

    // Validate required fields
    if (!petData.name || !petData.species || !petData.age) {
        showAlert("Please fill in all required fields", "danger");
        return;
    }

    if (AppState.userType === "admin" && !petData.ownerId) {
        showAlert("Please select an owner", "danger");
        return;
    }

    // Add pet to appropriate array
    if (AppState.userType === "admin") {
        // Add to the owner's pets
        const ownerPets = JSON.parse(
            localStorage.getItem(`bbc_clinic_pets_${petData.ownerId}`) || "[]"
        );
        ownerPets.push(petData);
        localStorage.setItem(
            `bbc_clinic_pets_${petData.ownerId}`,
            JSON.stringify(ownerPets)
        );
    } else {
        // Add to current user's pets
        AppState.pets.push(petData);
        saveUserData();
    }

    // Close modal
    const modal = bootstrap.Modal.getInstance(
        document.getElementById("addPetModal")
    );
    modal.hide();

    // Refresh pets page
    renderPetsPage();

    showAlert(`${petData.name} has been added successfully!`, "success");
}

// View pet details
function viewPetDetails(petId) {
    let pet;

    if (AppState.userType === "admin") {
        pet = getAllPets().find((p) => p.id === petId);
    } else {
        pet = AppState.pets.find((p) => p.id === petId);
    }

    if (!pet) {
        showAlert("Pet not found", "danger");
        return;
    }

    const modalHtml = `
    <div class="modal fade" id="petDetailsModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${pet.name} - ${pet.breed}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-header">
                                    <h6 class="mb-0">Basic Information</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row mb-2">
                                        <div class="col-5 text-muted">Species:</div>
                                        <div class="col-7">${pet.species}</div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-5 text-muted">Breed:</div>
                                        <div class="col-7">${pet.breed}</div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-5 text-muted">Age:</div>
                                        <div class="col-7">${
                                            pet.age
                                        } years</div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-5 text-muted">Gender:</div>
                                        <div class="col-7">${pet.gender}</div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-5 text-muted">Weight:</div>
                                        <div class="col-7">${
                                            pet.weight
                                        } lbs</div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-5 text-muted">Color:</div>
                                        <div class="col-7">${pet.color}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-header">
                                    <h6 class="mb-0">Additional Information</h6>
                                </div>
                                <div class="card-body">
                                    ${
                                        AppState.userType === "admin"
                                            ? `
                                        <div class="row mb-2">
                                            <div class="col-5 text-muted">Owner:</div>
                                            <div class="col-7">${getOwnerName(
                                                pet.ownerId
                                            )}</div>
                                        </div>
                                    `
                                            : ""
                                    }
                                    ${
                                        pet.emergencyContact
                                            ? `
                                        <div class="row mb-2">
                                            <div class="col-5 text-muted">Emergency Contact:</div>
                                            <div class="col-7 small">${pet.emergencyContact}</div>
                                        </div>
                                    `
                                            : ""
                                    }
                                    <div class="row mb-2">
                                        <div class="col-5 text-muted">Added:</div>
                                        <div class="col-7 small">${formatDate(
                                            pet.createdAt
                                        )}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    ${
                        pet.medicalNotes
                            ? `
                        <div class="card">
                            <div class="card-header">
                                <h6 class="mb-0">Medical Notes</h6>
                            </div>
                            <div class="card-body">
                                <p class="mb-0">${pet.medicalNotes}</p>
                            </div>
                        </div>
                    `
                            : ""
                    }
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" onclick="editPet('${
                        pet.id
                    }')">
                        <i class="fas fa-edit me-2"></i>Edit Pet
                    </button>
                    <button type="button" class="btn btn-success" onclick="bookAppointmentForPet('${
                        pet.id
                    }')">
                        <i class="fas fa-calendar-plus me-2"></i>Book Appointment
                    </button>
                </div>
            </div>
        </div>
    </div>
`;

    // Remove existing modal
    const existingModal = document.getElementById("petDetailsModal");
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.getElementById("modal-container").innerHTML = modalHtml;

    // Show modal
    const modal = new bootstrap.Modal(
        document.getElementById("petDetailsModal")
    );
    modal.show();
}

// Edit pet
function editPet(petId) {
    // Implementation similar to showAddPetModal but with pre-filled data
    showAlert("Edit pet functionality will be implemented", "info");
}

// Delete pet
function deletePet(petId) {
    let pet;

    if (AppState.userType === "admin") {
        pet = getAllPets().find((p) => p.id === petId);
    } else {
        pet = AppState.pets.find((p) => p.id === petId);
    }

    if (!pet) {
        showAlert("Pet not found", "danger");
        return;
    }

    if (
        confirm(
            `Are you sure you want to delete ${pet.name}? This action cannot be undone.`
        )
    ) {
        if (AppState.userType === "admin") {
            // Remove from owner's pets
            const ownerPets = JSON.parse(
                localStorage.getItem(`bbc_clinic_pets_${pet.ownerId}`) || "[]"
            );
            const updatedPets = ownerPets.filter((p) => p.id !== petId);
            localStorage.setItem(
                `bbc_clinic_pets_${pet.ownerId}`,
                JSON.stringify(updatedPets)
            );
        } else {
            // Remove from current user's pets
            AppState.pets = AppState.pets.filter((p) => p.id !== petId);
            saveUserData();
        }

        // Refresh pets page
        renderPetsPage();

        showAlert(`${pet.name} has been deleted`, "success");
    }
}

// Book appointment for pet
function bookAppointmentForPet(petId) {
    // Store the pet ID for the appointment booking
    sessionStorage.setItem("selectedPetId", petId);
    showAppointments();
}

// Export functions
window.renderPetsPage = renderPetsPage;
window.filterPets = filterPets;
window.showAddPetModal = showAddPetModal;
window.handleAddPet = handleAddPet;
window.viewPetDetails = viewPetDetails;
window.editPet = editPet;
window.deletePet = deletePet;
window.bookAppointmentForPet = bookAppointmentForPet;
