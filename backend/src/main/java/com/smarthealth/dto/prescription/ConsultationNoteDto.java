package com.smarthealth.dto.prescription;

import java.time.LocalDateTime;

public class ConsultationNoteDto {
    private Long id;
    private Long appointmentId;
    private String patientVitals;
    private String subjectiveNotes;
    private String objectiveFindings;
    private String assessment;
    private String plan;
    private LocalDateTime createdAt;

    public ConsultationNoteDto() {
    }

    public ConsultationNoteDto(Long id, Long appointmentId, String patientVitals, String subjectiveNotes,
                               String objectiveFindings, String assessment, String plan, LocalDateTime createdAt) {
        this.id = id;
        this.appointmentId = appointmentId;
        this.patientVitals = patientVitals;
        this.subjectiveNotes = subjectiveNotes;
        this.objectiveFindings = objectiveFindings;
        this.assessment = assessment;
        this.plan = plan;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
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
}
