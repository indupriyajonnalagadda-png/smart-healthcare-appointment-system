package com.smarthealth.ai;

import java.util.List;

public class LlmRecommendationResult {
    private String department;
    private List<String> specializations;
    private String reason;
    private String urgency;
    private String providerName;

    public LlmRecommendationResult() {
    }

    public LlmRecommendationResult(String department, List<String> specializations, String reason, String urgency, String providerName) {
        this.department = department;
        this.specializations = specializations;
        this.reason = reason;
        this.urgency = urgency;
        this.providerName = providerName;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public List<String> getSpecializations() {
        return specializations;
    }

    public void setSpecializations(List<String> specializations) {
        this.specializations = specializations;
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

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }
}
