package com.smarthealth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultation_notes")
public class ConsultationNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private DoctorProfile doctor;

    @Column(name = "patient_vitals", columnDefinition = "TEXT")
    private String patientVitals;

    @Column(name = "subjective_notes", columnDefinition = "TEXT")
    private String subjectiveNotes;

    @Column(name = "objective_findings", columnDefinition = "TEXT")
    private String objectiveFindings;

    @Column(columnDefinition = "TEXT")
    private String assessment;

    @Column(columnDefinition = "TEXT")
    private String plan;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ConsultationNote() {
    }

    public ConsultationNote(Appointment appointment, DoctorProfile doctor, String assessment, String plan) {
        this.appointment = appointment;
        this.doctor = doctor;
        this.assessment = assessment;
        this.plan = plan;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Appointment getAppointment() {
        return appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public DoctorProfile getDoctor() {
        return doctor;
    }

    public void setDoctor(DoctorProfile doctor) {
        this.doctor = doctor;
    }

    public String getPatientVitals() {
        return patientVitals;
    }

    public void setPatientVitals(String patientVitals) {
        this.patientVitals = patientVitals;
    }

    public String getSubjectiveNotes() {
        return subjectiveNotes;
    }

    public void setSubjectiveNotes(String subjectiveNotes) {
        this.subjectiveNotes = subjectiveNotes;
    }

    public String getObjectiveFindings() {
        return objectiveFindings;
    }

    public void setObjectiveFindings(String objectiveFindings) {
        this.objectiveFindings = objectiveFindings;
    }

    public String getAssessment() {
        return assessment;
    }

    public void setAssessment(String assessment) {
        this.assessment = assessment;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
