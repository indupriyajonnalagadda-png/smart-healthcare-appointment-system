package com.smarthealth.dto.doctor;

import jakarta.validation.constraints.NotBlank;

public class DoctorApprovalRequest {

    @NotBlank(message = "Approval status is required")
    private String approvalStatus; // APPROVED, REJECTED, PENDING

    private Boolean active;

    public DoctorApprovalRequest() {
    }

    public String getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(String approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
