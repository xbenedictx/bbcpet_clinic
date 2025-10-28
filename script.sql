-- BBC Veterinary Clinic Database Schema
-- MySQL Database Design for Production System

CREATE DATABASE IF NOT EXISTS bbc_clinic_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bbc_clinic_db;

-- =====================================================
-- User Management Tables
-- =====================================================

-- Main users table for both clients and admin users
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type ENUM('admin', 'client', 'veterinarian', 'staff') NOT NULL DEFAULT 'client',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    emergency_contact VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_user_type (user_type),
    INDEX idx_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Admin/Staff specific information
CREATE TABLE admin_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    license_number VARCHAR(50),
    specialization VARCHAR(100),
    department VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(10,2),
    is_veterinarian BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_license (license_number)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);

-- =====================================================
-- Pet Management Tables
-- =====================================================

-- Main pets table
CREATE TABLE pets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pet_uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    owner_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    species ENUM('Dog', 'Cat', 'Bird', 'Rabbit', 'Hamster', 'Guinea Pig', 'Ferret', 'Other') NOT NULL,
    breed VARCHAR(100),
    age_years INT,
    age_months INT DEFAULT 0,
    weight_lbs DECIMAL(6,2),
    color VARCHAR(50),
    gender ENUM('Male', 'Female', 'Unknown') DEFAULT 'Unknown',
    spayed_neutered BOOLEAN DEFAULT NULL,
    insurance_info TEXT,
    special_needs TEXT,
    behavioral_notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    date_of_birth DATE,
    date_acquired DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_species (species),
    INDEX idx_active (is_active),
    INDEX idx_name (name)
);

-- Pet emergency contacts
CREATE TABLE pet_emergency_contacts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    INDEX idx_pet_id (pet_id)
);

-- Pet photos/documents
CREATE TABLE pet_media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('photo', 'document', 'xray', 'lab_result') NOT NULL,
    mime_type VARCHAR(100),
    file_size INT,
    description TEXT,
    uploaded_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON SET NULL,
    INDEX idx_pet_id (pet_id),
    INDEX idx_file_type (file_type)
);

-- =====================================================
-- Appointment Management Tables
-- =====================================================

-- Appointment types/services
CREATE TABLE appointment_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    duration_minutes INT DEFAULT 30,
    base_price DECIMAL(8,2) DEFAULT 0.00,
    requires_fasting BOOLEAN DEFAULT FALSE,
    preparation_instructions TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_active (is_active)
);

-- Main appointments table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    pet_id INT NOT NULL,
    owner_id INT NOT NULL,
    veterinarian_id INT,
    appointment_type_id INT,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    reason_for_visit TEXT,
    special_instructions TEXT,
    priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
    reminder_sent BOOLEAN DEFAULT FALSE,
    reminder_sent_at TIMESTAMP NULL,
    checked_in_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (veterinarian_id) REFERENCES users(id) ON SET NULL,
    FOREIGN KEY (appointment_type_id) REFERENCES appointment_types(id) ON SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON SET NULL,
    
    INDEX idx_pet_id (pet_id),
    INDEX idx_owner_id (owner_id),
    INDEX idx_veterinarian_id (veterinarian_id),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_appointment_datetime (appointment_date, appointment_time),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    
    UNIQUE KEY unique_vet_datetime (veterinarian_id, appointment_date, appointment_time)
);

-- Appointment reminders log
CREATE TABLE appointment_reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    appointment_id INT NOT NULL,
    reminder_type ENUM('email', 'sms', 'phone') NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recipient_contact VARCHAR(255),
    status ENUM('sent', 'delivered', 'failed') DEFAULT 'sent',
    message_content TEXT,
    
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_sent_at (sent_at)
);

-- =====================================================
-- Health Records & Medical History
-- =====================================================

-- Main health records/visits
CREATE TABLE health_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    record_uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    pet_id INT NOT NULL,
    appointment_id INT,
    veterinarian_id INT NOT NULL,
    visit_date DATE NOT NULL,
    visit_time TIME,
    visit_reason VARCHAR(255),
    chief_complaint TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    prognosis TEXT,
    follow_up_instructions TEXT,
    next_visit_date DATE,
    visit_type ENUM('routine', 'emergency', 'surgery', 'follow_up', 'consultation') DEFAULT 'routine',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON SET NULL,
    FOREIGN KEY (veterinarian_id) REFERENCES users(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON SET NULL,
    
    INDEX idx_pet_id (pet_id),
    INDEX idx_appointment_id (appointment_id),
    INDEX idx_veterinarian_id (veterinarian_id),
    INDEX idx_visit_date (visit_date),
    INDEX idx_visit_type (visit_type)
);

-- Vital signs and measurements
CREATE TABLE vital_signs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    health_record_id INT NOT NULL,
    weight_lbs DECIMAL(6,2),
    temperature_f DECIMAL(4,1),
    heart_rate_bpm INT,
    respiratory_rate_rpm INT,
    blood_pressure_systolic INT,
    blood_pressure_diastolic INT,
    body_condition_score INT,
    pain_score INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    recorded_by INT,
    
    FOREIGN KEY (health_record_id) REFERENCES health_records(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON SET NULL,
    INDEX idx_health_record_id (health_record_id)
);

-- Prescriptions and medications
CREATE TABLE prescriptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    health_record_id INT NOT NULL,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    quantity_prescribed VARCHAR(50),
    refills_remaining INT DEFAULT 0,
    instructions TEXT,
    side_effects TEXT,
    prescribed_by INT NOT NULL,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (health_record_id) REFERENCES health_records(id) ON DELETE CASCADE,
    FOREIGN KEY (prescribed_by) REFERENCES users(id),
    INDEX idx_health_record_id (health_record_id),
    INDEX idx_medication_name (medication_name),
    INDEX idx_active (is_active)
);

-- Vaccinations
CREATE TABLE vaccinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pet_id INT NOT NULL,
    health_record_id INT,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccine_type VARCHAR(100),
    manufacturer VARCHAR(100),
    lot_number VARCHAR(50),
    expiration_date DATE,
    administered_date DATE NOT NULL,
    administered_by INT NOT NULL,
    next_due_date DATE,
    site_of_injection VARCHAR(50),
    adverse_reactions TEXT,
    is_booster BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (health_record_id) REFERENCES health_records(id) ON SET NULL,
    FOREIGN KEY (administered_by) REFERENCES users(id),
    INDEX idx_pet_id (pet_id),
    INDEX idx_administered_date (administered_date),
    INDEX idx_next_due_date (next_due_date),
    INDEX idx_vaccine_name (vaccine_name)
);

-- Lab results and tests
CREATE TABLE lab_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    health_record_id INT NOT NULL,
    test_name VARCHAR(100) NOT NULL,
    test_type VARCHAR(100),
    test_date DATE NOT NULL,
    lab_name VARCHAR(100),
    results TEXT,
    reference_range VARCHAR(100),
    abnormal_flag BOOLEAN DEFAULT FALSE,
    units VARCHAR(50),
    notes TEXT,
    ordered_by INT,
    reviewed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (health_record_id) REFERENCES health_records(id) ON DELETE CASCADE,
    FOREIGN KEY (ordered_by) REFERENCES users(id) ON SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON SET NULL,
    INDEX idx_health_record_id (health_record_id),
    INDEX idx_test_date (test_date),
    INDEX idx_test_name (test_name)
);

-- =====================================================
-- Billing & Financial Management
-- =====================================================

-- Services and pricing
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(200) NOT NULL,
    service_code VARCHAR(50),
    category VARCHAR(100),
    description TEXT,
    base_price DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    taxable BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_service_code (service_code),
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);

-- Main invoices table
CREATE TABLE invoices (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INT NOT NULL,
    pet_id INT,
    appointment_id INT,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,4) DEFAULT 0.08,
    tax_amount DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(8,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    balance_due DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled') DEFAULT 'draft',
    payment_terms VARCHAR(100) DEFAULT 'Due on receipt',
    notes TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id) ON SET NULL,
    
    INDEX idx_invoice_number (invoice_number),
    INDEX idx_client_id (client_id),
    INDEX idx_pet_id (pet_id),
    INDEX idx_invoice_date (invoice_date),
    INDEX idx_status (status),
    INDEX idx_balance_due (balance_due)
);

-- Invoice line items
CREATE TABLE invoice_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_id INT NOT NULL,
    service_id INT,
    description TEXT NOT NULL,
    quantity DECIMAL(8,2) DEFAULT 1.00,
    unit_price DECIMAL(8,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    taxable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON SET NULL,
    INDEX idx_invoice_id (invoice_id)
);

-- Payments received
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    payment_uuid CHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    invoice_id INT NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'other') NOT NULL,
    reference_number VARCHAR(100),
    check_number VARCHAR(50),
    card_last_four VARCHAR(4),
    transaction_id VARCHAR(100),
    notes TEXT,
    processed_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES users(id) ON SET NULL,
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_payment_method (payment_method)
);

-- =====================================================
-- Inventory Management (Optional)
-- =====================================================

-- Inventory items
CREATE TABLE inventory_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_code VARCHAR(50) UNIQUE NOT NULL,
    item_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    unit_of_measure VARCHAR(50),
    current_stock INT DEFAULT 0,
    minimum_stock INT DEFAULT 0,
    maximum_stock INT DEFAULT 0,
    unit_cost DECIMAL(8,2),
    selling_price DECIMAL(8,2),
    supplier VARCHAR(200),
    location VARCHAR(100),
    expiration_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_item_code (item_code),
    INDEX idx_category (category),
    INDEX idx_current_stock (current_stock),
    INDEX idx_active (is_active)
);

-- Stock movements
CREATE TABLE stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    item_id INT NOT NULL,
    movement_type ENUM('in', 'out', 'adjustment', 'expired', 'damaged') NOT NULL,
    quantity INT NOT NULL,
    unit_cost DECIMAL(8,2),
    reference_type ENUM('purchase', 'sale', 'adjustment', 'appointment', 'disposal') NOT NULL,
    reference_id INT,
    notes TEXT,
    moved_by INT,
    movement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
    FOREIGN KEY (moved_by) REFERENCES users(id) ON SET NULL,
    INDEX idx_item_id (item_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_movement_date (movement_date)
);

-- =====================================================
-- System Configuration & Logs
-- =====================================================

-- Clinic information
CREATE TABLE clinic_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_name VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('text', 'number', 'boolean', 'json') DEFAULT 'text',
    description TEXT,
    is_system BOOLEAN DEFAULT FALSE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(id) ON SET NULL,
    INDEX idx_setting_name (setting_name)
);

-- Audit log
CREATE TABLE audit_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- Default Data Inserts
-- =====================================================

-- Insert default appointment types
INSERT INTO appointment_types (type_name, description, duration_minutes, base_price) VALUES
('Annual Checkup', 'Comprehensive annual health examination', 45, 75.00),
('Vaccination', 'Routine vaccination appointment', 30, 25.00),
('Sick Visit', 'Examination for illness or injury', 30, 65.00),
('Emergency', 'Emergency examination and treatment', 60, 150.00),
('Surgery Consultation', 'Pre-surgical consultation and planning', 45, 85.00),
('Dental Cleaning', 'Professional dental cleaning', 120, 200.00),
('Grooming', 'Professional grooming services', 90, 50.00),
('Follow-up', 'Follow-up examination', 20, 45.00),
('Spay/Neuter Consultation', 'Spay or neuter consultation', 30, 50.00),
('Behavioral Consultation', 'Pet behavior assessment and training', 60, 100.00);

-- Insert default services
INSERT INTO services (service_name, service_code, category, base_price) VALUES
('Examination - Comprehensive', 'EXAM-COMP', 'Examination', 75.00),
('Examination - Brief', 'EXAM-BRIEF', 'Examination', 45.00),
('Vaccination - DHPP', 'VAC-DHPP', 'Vaccination', 25.00),
('Vaccination - Rabies', 'VAC-RAB', 'Vaccination', 20.00),
('Vaccination - Bordetella', 'VAC-BORD', 'Vaccination', 22.00),
('Blood Work - Complete Panel', 'LAB-CBC', 'Laboratory', 85.00),
('X-Ray - Single View', 'XRAY-1', 'Radiology', 120.00),
('X-Ray - Multiple Views', 'XRAY-MULT', 'Radiology', 180.00),
('Dental Cleaning', 'DENT-CLEAN', 'Dental', 200.00),
('Spay - Dog (Small)', 'SPAY-DOG-S', 'Surgery', 350.00),
('Spay - Dog (Large)', 'SPAY-DOG-L', 'Surgery', 450.00),
('Neuter - Dog', 'NEUTER-DOG', 'Surgery', 275.00),
('Spay - Cat', 'SPAY-CAT', 'Surgery', 250.00),
('Neuter - Cat', 'NEUTER-CAT', 'Surgery', 150.00),
('Emergency Examination', 'EXAM-EMERG', 'Emergency', 150.00),
('Euthanasia', 'EUTH', 'End of Life', 125.00),
('Grooming - Bath & Brush', 'GROOM-BATH', 'Grooming', 35.00),
('Grooming - Full Service', 'GROOM-FULL', 'Grooming', 65.00),
('Boarding - Per Day', 'BOARD-DAY', 'Boarding', 25.00);

-- Insert default clinic settings
INSERT INTO clinic_settings (setting_name, setting_value, setting_type, description, is_system) VALUES
('clinic_name', 'BBC Veterinary Clinic', 'text', 'Clinic name for invoices and communications', FALSE),
('clinic_address', '123 Veterinary Lane, Pet City, PC 12345', 'text', 'Clinic address', FALSE),
('clinic_phone', '+1-555-0123', 'text', 'Main clinic phone number', FALSE),
('clinic_email', 'info@bbcclinic.com', 'text', 'Main clinic email address', FALSE),
('appointment_duration_default', '30', 'number', 'Default appointment duration in minutes', FALSE),
('tax_rate', '0.08', 'number', 'Default tax rate (8%)', FALSE),
('appointment_reminder_days', '1', 'number', 'Days before appointment to send reminder', FALSE),
('working_hours_start', '08:00', 'text', 'Clinic opening time', FALSE),
('working_hours_end', '18:00', 'text', 'Clinic closing time', FALSE),
('working_days', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', 'text', 'Days clinic is open', FALSE);

-- Create default admin user (password should be hashed in real implementation)
INSERT INTO users (email, password_hash, user_type, first_name, last_name, phone, address) VALUES
('admin@bbcclinic.com', '$2y$10$example_hash_here', 'admin', 'Dr. Sarah', 'Johnson', '+1-555-0123', '123 Veterinary Lane, Pet City, PC 12345');

-- Insert admin profile
INSERT INTO admin_profiles (user_id, license_number, specialization, is_veterinarian) VALUES
(1, 'VET-12345', 'General Veterinary Medicine', TRUE);

-- =====================================================
-- Stored Procedures for Common Operations
-- =====================================================

DELIMITER //

-- Procedure to create a new appointment
CREATE PROCEDURE CreateAppointment(
    IN p_pet_id INT,
    IN p_owner_id INT,
    IN p_veterinarian_id INT,
    IN p_appointment_type_id INT,
    IN p_appointment_date DATE,
    IN p_appointment_time TIME,
    IN p_reason TEXT,
    IN p_created_by INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    INSERT INTO appointments (
        pet_id, owner_id, veterinarian_id, appointment_type_id,
        appointment_date, appointment_time, reason_for_visit, created_by
    ) VALUES (
        p_pet_id, p_owner_id, p_veterinarian_id, p_appointment_type_id,
        p_appointment_date, p_appointment_time, p_reason, p_created_by
    );
    
    COMMIT;
    
    SELECT LAST_INSERT_ID() as appointment_id;
END //

-- Procedure to generate invoice for appointment
CREATE PROCEDURE GenerateInvoiceFromAppointment(
    IN p_appointment_id INT,
    IN p_created_by INT
)
BEGIN
    DECLARE v_invoice_number VARCHAR(50);
    DECLARE v_invoice_id INT;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;
    
    -- Generate invoice number
    SET v_invoice_number = CONCAT('BBC-', YEAR(CURDATE()), '-', LPAD(FLOOR(RAND() * 1000000), 6, '0'));
    
    -- Create invoice
    INSERT INTO invoices (
        invoice_number, client_id, pet_id, appointment_id, invoice_date, created_by
    )
    SELECT 
        v_invoice_number,
        a.owner_id,
        a.pet_id,
        a.id,
        CURDATE(),
        p_created_by
    FROM appointments a
    WHERE a.id = p_appointment_id;
    
    SET v_invoice_id = LAST_INSERT_ID();
    
    -- Add appointment type as line item
    INSERT INTO invoice_items (invoice_id, service_id, description, quantity, unit_price, total_price)
    SELECT 
        v_invoice_id,
        NULL,
        at.type_name,
        1,
        at.base_price,
        at.base_price
    FROM appointments a
    JOIN appointment_types at ON a.appointment_type_id = at.id
    WHERE a.id = p_appointment_id;
    
    -- Update invoice totals
    CALL UpdateInvoiceTotals(v_invoice_id);
    
    COMMIT;
    
    SELECT v_invoice_id as invoice_id, v_invoice_number as invoice_number;
END //

-- Procedure to update invoice totals
CREATE PROCEDURE UpdateInvoiceTotals(IN p_invoice_id INT)
BEGIN
    DECLARE v_subtotal DECIMAL(10,2);
    DECLARE v_tax_rate DECIMAL(5,4);
    DECLARE v_tax_amount DECIMAL(8,2);
    DECLARE v_total DECIMAL(10,2);
    
    -- Calculate subtotal
    SELECT COALESCE(SUM(total_price), 0) INTO v_subtotal
    FROM invoice_items
    WHERE invoice_id = p_invoice_id;
    
    -- Get tax rate
    SELECT CAST(setting_value AS DECIMAL(5,4)) INTO v_tax_rate
    FROM clinic_settings
    WHERE setting_name = 'tax_rate';
    
    SET v_tax_rate = COALESCE(v_tax_rate, 0.08);
    
    -- Calculate tax
    SET v_tax_amount = v_subtotal * v_tax_rate;
    SET v_total = v_subtotal + v_tax_amount;
    
    -- Update invoice
    UPDATE invoices
    SET 
        subtotal = v_subtotal,
        tax_rate = v_tax_rate,
        tax_amount = v_tax_amount,
        total_amount = v_total,
        balance_due = v_total - amount_paid
    WHERE id = p_invoice_id;
END //

-- Function to get next available appointment slot
CREATE FUNCTION GetNextAvailableSlot(
    p_veterinarian_id INT,
    p_date DATE,
    p_duration INT
) RETURNS TIME
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_start_time TIME DEFAULT '08:00:00';
    DECLARE v_end_time TIME DEFAULT '18:00:00';
    DECLARE v_current_time TIME;
    DECLARE v_conflict_count INT;
    DECLARE v_slot_found BOOLEAN DEFAULT FALSE;
    
    SET v_current_time = v_start_time;
    
    WHILE v_current_time < v_end_time AND NOT v_slot_found DO
        SELECT COUNT(*) INTO v_conflict_count
        FROM appointments
        WHERE veterinarian_id = p_veterinarian_id
          AND appointment_date = p_date
          AND appointment_time = v_current_time
          AND status NOT IN ('cancelled');
        
        IF v_conflict_count = 0 THEN
            SET v_slot_found = TRUE;
        ELSE
            SET v_current_time = ADDTIME(v_current_time, '00:30:00');
        END IF;
    END WHILE;
    
    IF v_slot_found THEN
        RETURN v_current_time;
    ELSE
        RETURN NULL;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- Views for Common Queries
-- =====================================================

-- View for appointment details with related information
CREATE VIEW appointment_details AS
SELECT 
    a.id,
    a.appointment_uuid,
    a.appointment_date,
    a.appointment_time,
    a.duration_minutes,
    a.status,
    a.reason_for_visit,
    a.priority,
    p.name as pet_name,
    p.species,
    p.breed,
    CONCAT(u.first_name, ' ', u.last_name) as owner_name,
    u.phone as owner_phone,
    u.email as owner_email,
    CONCAT(v.first_name, ' ', v.last_name) as veterinarian_name,
    at.type_name as appointment_type,
    at.base_price,
    a.created_at,
    a.updated_at
FROM appointments a
LEFT JOIN pets p ON a.pet_id = p.id
LEFT JOIN users u ON a.owner_id = u.id
LEFT JOIN users v ON a.veterinarian_id = v.id
LEFT JOIN appointment_types at ON a.appointment_type_id = at.id;

-- View for pet health summary
CREATE VIEW pet_health_summary AS
SELECT 
    p.id as pet_id,
    p.name as pet_name,
    p.species,
    p.breed,
    p.age_years,
    CONCAT(u.first_name, ' ', u.last_name) as owner_name,
    u.phone as owner_phone,
    (SELECT COUNT(*) FROM appointments WHERE pet_id = p.id) as total_appointments,
    (SELECT COUNT(*) FROM health_records WHERE pet_id = p.id) as total_records,
    (SELECT MAX(visit_date) FROM health_records WHERE pet_id = p.id) as last_visit_date,
    (SELECT MAX(next_due_date) FROM vaccinations WHERE pet_id = p.id) as next_vaccine_due,
    p.created_at
FROM pets p
LEFT JOIN users u ON p.owner_id = u.id
WHERE p.is_active = TRUE;

-- View for invoice summary
CREATE VIEW invoice_summary AS
SELECT 
    i.id,
    i.invoice_number,
    i.invoice_date,
    i.due_date,
    CONCAT(u.first_name, ' ', u.last_name) as client_name,
    u.phone as client_phone,
    p.name as pet_name,
    i.subtotal,
    i.tax_amount,
    i.total_amount,
    i.amount_paid,
    i.balance_due,
    i.status,
    CASE 
        WHEN i.status = 'paid' THEN 'Paid'
        WHEN i.due_date < CURDATE() AND i.balance_due > 0 THEN 'Overdue'
        WHEN i.balance_due > 0 THEN 'Outstanding'
        ELSE 'Paid'
    END as payment_status,
    i.created_at
FROM invoices i
LEFT JOIN users u ON i.client_id = u.id
LEFT JOIN pets p ON i.pet_id = p.id;

-- =====================================================
-- Triggers for Audit Logging
-- =====================================================

DELIMITER //

-- Trigger for appointment changes
CREATE TRIGGER appointment_audit_trigger
AFTER UPDATE ON appointments
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        USER(),
        'UPDATE',
        'appointments',
        NEW.id,
        JSON_OBJECT(
            'status', OLD.status,
            'appointment_date', OLD.appointment_date,
            'appointment_time', OLD.appointment_time,
            'veterinarian_id', OLD.veterinarian_id
        ),
        JSON_OBJECT(
            'status', NEW.status,
            'appointment_date', NEW.appointment_date,
            'appointment_time', NEW.appointment_time,
            'veterinarian_id', NEW.veterinarian_id
        )
    );
END //

-- Trigger for invoice updates
CREATE TRIGGER invoice_audit_trigger
AFTER UPDATE ON invoices
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
    VALUES (
        USER(),
        'UPDATE',
        'invoices',
        NEW.id,
        JSON_OBJECT(
            'status', OLD.status,
            'total_amount', OLD.total_amount,
            'amount_paid', OLD.amount_paid,
            'balance_due', OLD.balance_due
        ),
        JSON_OBJECT(
            'status', NEW.status,
            'total_amount', NEW.total_amount,
            'amount_paid', NEW.amount_paid,
            'balance_due', NEW.balance_due
        )
    );
END //

DELIMITER ;

-- =====================================================
-- Indexes for Performance Optimization
-- =====================================================

-- Additional indexes for better query performance
CREATE INDEX idx_appointments_status_date ON appointments(status, appointment_date);
CREATE INDEX idx_appointments_vet_date_time ON appointments(veterinarian_id, appointment_date, appointment_time);
CREATE INDEX idx_health_records_pet_date ON health_records(pet_id, visit_date);
CREATE INDEX idx_invoices_client_status ON invoices(client_id, status);
CREATE INDEX idx_invoices_date_status ON invoices(invoice_date, status);
CREATE INDEX idx_pets_owner_active ON pets(owner_id, is_active);
CREATE INDEX idx_users_type_active ON users(user_type, is_active);

-- =====================================================
-- Final Setup Commands
-- =====================================================

-- Grant permissions (adjust as needed for your environment)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON bbc_clinic_db.* TO 'bbc_app_user'@'localhost';
-- GRANT EXECUTE ON bbc_clinic_db.* TO 'bbc_app_user'@'localhost';

-- Show database information
SELECT 'BBC Veterinary Clinic Database Schema Created Successfully!' as Status;
SELECT COUNT(*) as 'Total Tables' FROM information_schema.tables WHERE table_schema = 'bbc_clinic_db';
SELECT COUNT(*) as 'Total Stored Procedures' FROM information_schema.routines WHERE routine_schema = 'bbc_clinic_db' AND routine_type = 'PROCEDURE';
SELECT COUNT(*) as 'Total Functions' FROM information_schema.routines WHERE routine_schema = 'bbc_clinic_db' AND routine_type = 'FUNCTION';
SELECT COUNT(*) as 'Total Views' FROM information_schema.views WHERE table_schema = 'bbc_clinic_db';