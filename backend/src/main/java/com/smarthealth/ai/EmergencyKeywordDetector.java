package com.smarthealth.ai;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
public class EmergencyKeywordDetector {

    private static final List<String> EMERGENCY_KEYWORDS = List.of(
            "chest pain", "crushing chest", "heart attack", "chest tightness", "pain radiating to left arm",
            "severe shortness of breath", "cannot breathe", "can't breathe", "struggling to breathe", "blue lips",
            "stroke", "facial droop", "slurred speech", "sudden paralysis", "loss of consciousness", "unconscious",
            "passed out", "fainted suddenly", "seizure", "convulsions", "severe bleeding", "vomiting blood",
            "coughing blood", "anaphylaxis", "throat swelling", "swollen tongue cannot swallow",
            "suicidal", "overdose", "poison"
    );

    public boolean isEmergency(String symptoms) {
        if (symptoms == null || symptoms.isBlank()) {
            return false;
        }
        String lower = symptoms.toLowerCase(Locale.ROOT);
        return EMERGENCY_KEYWORDS.stream().anyMatch(lower::contains);
    }

    public String getEmergencyWarning() {
        return "CRITICAL WARNING: The symptoms described may indicate an urgent or life-threatening condition. " +
                "Do not wait for a scheduled consultation. Call local emergency services (911, 112, or local emergency) " +
                "or proceed immediately to the nearest emergency hospital.";
    }
}
