package com.smarthealth.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DoctorRecommendationRequest {

    @NotBlank(message = "Symptom description is required")
    @Size(min = 5, max = 2000, message = "Symptom description must be between 5 and 2000 characters")
    private String symptomDescription;

    private Integer age;
    private String gender;

    public DoctorRecommendationRequest() {
    }

    public DoctorRecommendationRequest(String symptomDescription) {
        this.symptomDescription = symptomDescription;
    }

    public String getSymptomDescription() {
        return symptomDescription;
    }

    public void setSymptomDescription(String symptomDescription) {
        this.symptomDescription = symptomDescription;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
