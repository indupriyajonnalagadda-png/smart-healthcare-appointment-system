package com.smarthealth.dto.prescription;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PrescriptionResponseDto {
    private Long id;
    private Long appointmentId;
    private String appointmentReference;
    private Long doctorId;
    private String doctorName;
    private String doctorQualifications;
    private String departmentName;
    private Long patientId;
    private String patientName;
    private String diagnosis;
    private String clinicalAdvice;
    private LocalDate followUpDate;
    private LocalDateTime createdAt;
    private List<PrescriptionItemDto> items;
    private ConsultationNoteDto consultationNote;

    public PrescriptionResponseDto() {
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

    public String getAppointmentReference() {
        return appointmentReference;
    }

    public void setAppointmentReference(String appointmentReference) {
        this.appointmentReference = appointmentReference;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorQualifications() {
        return doctorQualifications;
    }

    public void setDoctorQualifications(String doctorQualifications) {
        this.doctorQualifications = doctorQualifications;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<PrescriptionItemDto> getItems() {
        return items;
    }

    public void setItems(List<PrescriptionItemDto> items) {
        this.items = items;
    }

    public ConsultationNoteDto getConsultationNote() {
        return consultationNote;
    }

    public void setConsultationNote(ConsultationNoteDto consultationNote) {
        this.consultationNote = consultationNote;
    }
}
