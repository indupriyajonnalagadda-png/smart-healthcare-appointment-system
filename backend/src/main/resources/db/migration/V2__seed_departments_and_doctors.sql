-- V2__seed_departments_and_doctors.sql: Initial Seed Data for Departments, Specializations, Doctors, and Admin

-- Departments
INSERT INTO departments (id, name, description, icon_name) VALUES
(1, 'Cardiology', 'Care and treatment for cardiovascular, vascular, and heart conditions.', 'HeartPulse'),
(2, 'Dermatology', 'Specialized skin, hair, nail pathology, and cosmetic care.', 'Sparkles'),
(3, 'Orthopedics', 'Musculoskeletal system, bone fractures, joints, and sports injuries.', 'Activity'),
(4, 'Pediatrics', 'Comprehensive medical care for infants, children, and adolescents.', 'Baby'),
(5, 'Neurology', 'Brain, spinal cord, neurological, and nerve disorders.', 'Brain'),
(6, 'General Medicine', 'Primary care, preventive medicine, fever, and internal pathology.', 'Stethoscope'),
(7, 'Psychiatry', 'Mental health evaluations, behavioral medicine, and therapy.', 'Smile'),
(8, 'Ophthalmology', 'Vision care, ocular diagnostics, cataract, and eye health.', 'Eye');

-- Specializations
INSERT INTO specializations (id, department_id, name, description) VALUES
(1, 1, 'Cardiologist', 'Diagnosis and medical management of heart disease.'),
(2, 1, 'Interventional Cardiologist', 'Catheter-based treatment of structural heart diseases.'),
(3, 2, 'Dermatologist', 'Clinical diagnosis of skin rashes, acne, psoriasis, and dermatitis.'),
(4, 2, 'Cosmetic Dermatologist', 'Aesthetic and cosmetic skin care therapies.'),
(5, 3, 'Orthopedic Surgeon', 'Surgical correction of spine, bones, and joint disorders.'),
(6, 3, 'Sports Medicine Specialist', 'Rehabilitation and care for athletic and sports injuries.'),
(7, 4, 'Pediatrician', 'General pediatric development, vaccines, and childhood illness.'),
(8, 5, 'Neurologist', 'Care for migraines, epilepsy, neuropathy, and stroke recovery.'),
(9, 6, 'General Physician', 'First-line clinical diagnoses, acute viral fever, and annual checkups.'),
(10, 6, 'Internal Medicine Specialist', 'Chronic diseases management including diabetes and hypertension.'),
(11, 7, 'Psychiatrist', 'Psychiatric assessments, anxiety, depression, and therapy.'),
(12, 8, 'Ophthalmologist', 'Ocular exams, refractive errors, glaucoma, and vision therapy.');

-- Admin User (Password will also be confirmed/ensured by DataInitializer with BCrypt)
-- Hash below corresponds to: Admin@123
INSERT INTO users (id, email, password, role, first_name, last_name, phone, enabled) VALUES
(1, 'admin@smarthealth.com', '$2a$10$wE7iS8L6l2v8oG3y3O4fjeVdF9g1kM0aK1c6e1r0G2y4o5r6T7u8e', 'ROLE_ADMIN', 'System', 'Admin', '+1-555-0100', TRUE);

-- Doctor Users (Password: Doctor@123)
INSERT INTO users (id, email, password, role, first_name, last_name, phone, enabled) VALUES
(2, 'dr.sarah@smarthealth.com', '$2a$10$wE7iS8L6l2v8oG3y3O4fjeVdF9g1kM0aK1c6e1r0G2y4o5r6T7u8e', 'ROLE_DOCTOR', 'Sarah', 'Jenkins', '+1-555-0101', TRUE),
(3, 'dr.marcus@smarthealth.com', '$2a$10$wE7iS8L6l2v8oG3y3O4fjeVdF9g1kM0aK1c6e1r0G2y4o5r6T7u8e', 'ROLE_DOCTOR', 'Marcus', 'Chen', '+1-555-0102', TRUE),
(4, 'dr.elena@smarthealth.com', '$2a$10$wE7iS8L6l2v8oG3y3O4fjeVdF9g1kM0aK1c6e1r0G2y4o5r6T7u8e', 'ROLE_DOCTOR', 'Elena', 'Rostova', '+1-555-0103', TRUE),
(5, 'dr.david@smarthealth.com', '$2a$10$wE7iS8L6l2v8oG3y3O4fjeVdF9g1kM0aK1c6e1r0G2y4o5r6T7u8e', 'ROLE_DOCTOR', 'David', 'Patel', '+1-555-0104', TRUE),
(6, 'dr.maya@smarthealth.com', '$2a$10$wE7iS8L6l2v8oG3y3O4fjeVdF9g1kM0aK1c6e1r0G2y4o5r6T7u8e', 'ROLE_DOCTOR', 'Maya', 'Lin', '+1-555-0105', TRUE),
(7, 'dr.robert@smarthealth.com', '$2a$10$wE7iS8L6l2v8oG3y3O4fjeVdF9g1kM0aK1c6e1r0G2y4o5r6T7u8e', 'ROLE_DOCTOR', 'Robert', 'Hayes', '+1-555-0106', TRUE);

-- Patient Users (Password: Patient@123)
INSERT INTO users (id, email, password, role, first_name, last_name, phone, enabled) VALUES
(8, 'patient.john@smarthealth.com', '$2a$10$wE7iS8L6l2v8oG3y3O4fjeVdF9g1kM0aK1c6e1r0G2y4o5r6T7u8e', 'ROLE_PATIENT', 'John', 'Doe', '+1-555-0110', TRUE),
(9, 'patient.jane@smarthealth.com', '$2a$10$wE7iS8L6l2v8oG3y3O4fjeVdF9g1kM0aK1c6e1r0G2y4o5r6T7u8e', 'ROLE_PATIENT', 'Jane', 'Smith', '+1-555-0111', TRUE);

-- Patient Profiles
INSERT INTO patient_profiles (id, user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history_summary) VALUES
(1, 8, '1990-05-15', 'MALE', 'O_POSITIVE', '742 Evergreen Terrace, Springfield', 'Mary Doe (+1-555-0199)', 'Mild seasonal allergies. No prior surgeries.'),
(2, 9, '1994-08-22', 'FEMALE', 'A_POSITIVE', '124 Conch Street, Pacific City', 'Alex Smith (+1-555-0198)', 'History of migraine headaches.');

-- Doctor Profiles
INSERT INTO doctor_profiles (id, user_id, department_id, license_number, qualifications, experience_years, consultation_fee, bio, consultation_modes, approval_status, active, rating, review_count) VALUES
(1, 2, 1, 'MD-CARDIO-8821', 'MD (Cardiology), FACC - Johns Hopkins', 14, 120.00, 'Board-certified cardiologist specializing in preventive cardiology, coronary artery disease, and hypertension management.', 'IN_PERSON,VIDEO', 'APPROVED', TRUE, 4.95, 48),
(2, 3, 2, 'MD-DERM-4412', 'MD (Dermatology) - Stanford Medicine', 10, 95.00, 'Dermatologist with extensive expertise in eczema, psoriasis, skin cancer screenings, and advanced cosmetic therapies.', 'IN_PERSON,VIDEO', 'APPROVED', TRUE, 4.88, 36),
(3, 4, 3, 'MD-ORTHO-9910', 'MS (Orthopedics), FRCS - Mayo Clinic', 16, 150.00, 'Consultant orthopedic surgeon specializing in joint replacement, sports trauma, and arthroscopic knee/shoulder surgeries.', 'IN_PERSON', 'APPROVED', TRUE, 4.92, 52),
(4, 5, 4, 'MD-PED-7731', 'MD (Pediatrics), FAAP - Boston Childrens', 9, 80.00, 'Dedicated pediatrician committed to infant growth monitoring, immunization, and pediatric respiratory conditions.', 'IN_PERSON,VIDEO', 'APPROVED', TRUE, 4.98, 64),
(5, 6, 5, 'MD-NEURO-3301', 'DM (Neurology) - Columbia University', 12, 140.00, 'Neurology specialist focusing on headache syndromes, vertigo, seizure disorders, and peripheral neuropathy.', 'IN_PERSON,VIDEO', 'APPROVED', TRUE, 4.91, 41),
(6, 7, 6, 'MD-GENMED-1105', 'MD (Internal Medicine) - Harvard Medical', 15, 75.00, 'Primary care physician treating adult illnesses, metabolic health, lifestyle medicine, and routine wellness screenings.', 'IN_PERSON,VIDEO', 'APPROVED', TRUE, 4.87, 79);

-- Doctor Specializations mapping
INSERT INTO doctor_specializations (doctor_id, specialization_id) VALUES
(1, 1),
(2, 3),
(3, 5),
(4, 7),
(5, 8),
(6, 9),
(6, 10);

-- Doctor Availabilities (Monday through Friday, 09:00 - 17:00, 30 min duration)
INSERT INTO doctor_availabilities (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES
(1, 'MONDAY', '09:00:00', '17:00:00', 30, TRUE),
(1, 'TUESDAY', '09:00:00', '17:00:00', 30, TRUE),
(1, 'WEDNESDAY', '09:00:00', '17:00:00', 30, TRUE),
(1, 'THURSDAY', '09:00:00', '17:00:00', 30, TRUE),
(1, 'FRIDAY', '09:00:00', '17:00:00', 30, TRUE),

(2, 'MONDAY', '10:00:00', '18:00:00', 30, TRUE),
(2, 'TUESDAY', '10:00:00', '18:00:00', 30, TRUE),
(2, 'WEDNESDAY', '10:00:00', '18:00:00', 30, TRUE),
(2, 'THURSDAY', '10:00:00', '18:00:00', 30, TRUE),

(3, 'MONDAY', '08:30:00', '16:30:00', 30, TRUE),
(3, 'WEDNESDAY', '08:30:00', '16:30:00', 30, TRUE),
(3, 'FRIDAY', '08:30:00', '16:30:00', 30, TRUE),

(4, 'MONDAY', '09:00:00', '16:00:00', 30, TRUE),
(4, 'TUESDAY', '09:00:00', '16:00:00', 30, TRUE),
(4, 'THURSDAY', '09:00:00', '16:00:00', 30, TRUE),
(4, 'FRIDAY', '09:00:00', '16:00:00', 30, TRUE),

(5, 'TUESDAY', '09:00:00', '17:00:00', 30, TRUE),
(5, 'WEDNESDAY', '09:00:00', '17:00:00', 30, TRUE),
(5, 'THURSDAY', '09:00:00', '17:00:00', 30, TRUE),

(6, 'MONDAY', '08:00:00', '16:00:00', 30, TRUE),
(6, 'TUESDAY', '08:00:00', '16:00:00', 30, TRUE),
(6, 'WEDNESDAY', '08:00:00', '16:00:00', 30, TRUE),
(6, 'THURSDAY', '08:00:00', '16:00:00', 30, TRUE),
(6, 'FRIDAY', '08:00:00', '16:00:00', 30, TRUE);
