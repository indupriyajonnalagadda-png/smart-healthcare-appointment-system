package com.smarthealth.dto.ai;

import com.smarthealth.dto.doctor.DoctorSummaryDto;
import java.util.List;

public class DoctorRecommendationResponse {
    private String recommendedDepartment;
    private Long departmentId;
    private List<String> recommendedSpecializations;
    private String reason;
    private String urgency; // ROUTINE, ELEVATED, EMERGENCY
    private boolean isEmergency;
    private String emergencyMessage;
    private String disclaimer;
    private String providerUsed;
    private List<DoctorSummaryDto> recommendedDoctors;

    public DoctorRecommendationResponse() {
        this.disclaimer = "This recommendation is for healthcare navigation only and is not a medical diagnosis. If you are experiencing severe or life-threatening symptoms, contact emergency services immediately.";
    }

    public String getRecommendedDepartment() {
        return recommendedDepartment;
    }

    public void setRecommendedDepartment(String recommendedDepartment) {
        this.recommendedDepartment = recommendedDepartment;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public List<String> getRecommendedSpecializations() {
        return recommendedSpecializations;
    }

    public void setRecommendedSpecializations(List<String> recommendedSpecializations) {
        this.recommendedSpecializations = recommendedSpecializations;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getUrgency() {
        return urgency;
    }

    public void setUrgency(String urgency) {
        this.urgency = urgency;
    }

    public boolean isEmergency() {
        return isEmergency;
    }

    public void setEmergency(boolean emergency) {
        isEmergency = emergency;
    }

    public String getEmergencyMessage() {
        return emergencyMessage;
    }

    public void setEmergencyMessage(String emergencyMessage) {
        this.emergencyMessage = emergencyMessage;
    }

    public String getDisclaimer() {
        return disclaimer;
    }

    public void setDisclaimer(String disclaimer) {
        this.disclaimer = disclaimer;
    }

    public String getProviderUsed() {
        return providerUsed;
    }

    public void setProviderUsed(String providerUsed) {
        this.providerUsed = providerUsed;
    }

    public List<DoctorSummaryDto> getRecommendedDoctors() {
        return recommendedDoctors;
    }

    public void setRecommendedDoctors(List<DoctorSummaryDto> recommendedDoctors) {
        this.recommendedDoctors = recommendedDoctors;
    }
}
