package com.smarthealth.dto.prescription;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.List;

public class PrescriptionCreateRequest {

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    private String clinicalAdvice;
    private LocalDate followUpDate;

    // Optional clinical consultation note details submitted simultaneously
    private String patientVitals;
    private String subjectiveNotes;
    private String objectiveFindings;
    private String assessment;
    private String plan;

    @NotEmpty(message = "At least one prescription medicine item is required")
    @Valid
    private List<PrescriptionItemDto> items;

    public PrescriptionCreateRequest() {
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getClinicalAdvice() {
        return clinicalAdvice;
    }

    public void setClinicalAdvice(String clinicalAdvice) {
        this.clinicalAdvice = clinicalAdvice;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
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

    public List<PrescriptionItemDto> getItems() {
        return items;
    }

    public void setItems(List<PrescriptionItemDto> items) {
        this.items = items;
    }
}
