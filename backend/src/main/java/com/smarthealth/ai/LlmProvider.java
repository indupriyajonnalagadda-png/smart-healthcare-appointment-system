package com.smarthealth.ai;

public interface LlmProvider {
    LlmRecommendationResult getRecommendation(String symptomText, Integer age, String gender);
    String getProviderName();
    boolean isAvailable();
}
