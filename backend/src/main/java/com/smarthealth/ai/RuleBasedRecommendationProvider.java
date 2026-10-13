package com.smarthealth.ai;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Locale;

@Component
public class RuleBasedRecommendationProvider implements LlmProvider {

    @Override
    public String getProviderName() {
        return "RULE_BASED_FALLBACK";
    }

    @Override
    public boolean isAvailable() {
        return true;
    }

    @Override
    public LlmRecommendationResult getRecommendation(String symptomText, Integer age, String gender) {
        String text = symptomText.toLowerCase(Locale.ROOT);

        // Dermatology
        if (containsAny(text, "skin", "rash", "itch", "acne", "pimple", "eczema", "psoriasis", "mole", "hives", "dermatitis", "dry skin", "blister", "hair loss")) {
            return new LlmRecommendationResult(
                    "Dermatology",
                    List.of("Dermatologist"),
                    "The described symptoms involve cutaneous or dermatological signs, which are best evaluated by a skin specialist.",
                    "ROUTINE",
                    getProviderName()
            );
        }

        // Cardiology
        if (containsAny(text, "chest", "heart", "palpitation", "high blood pressure", "hypertension", "angina", "irregular heartbeat", "pulse")) {
            return new LlmRecommendationResult(
                    "Cardiology",
                    List.of("Cardiologist"),
                    "Symptoms suggest cardiovascular concerns that warrant evaluation by a cardiology specialist.",
                    "ELEVATED",
                    getProviderName()
            );
        }

        // Orthopedics
        if (containsAny(text, "joint", "knee", "bone", "back pain", "spine", "fracture", "sprain", "shoulder", "hip", "arthritis", "ligament", "muscle pain", "tendon")) {
            return new LlmRecommendationResult(
                    "Orthopedics",
                    List.of("Orthopedic Surgeon", "Sports Medicine Specialist"),
                    "The symptoms describe musculoskeletal discomfort or injury, suitable for an orthopedic examination.",
                    "ROUTINE",
                    getProviderName()
            );
        }

        // Pediatrics (if patient is child or pediatric keywords)
        if ((age != null && age < 16) || containsAny(text, "child", "infant", "toddler", "baby", "pediatric", "vaccination child", "growth")) {
            return new LlmRecommendationResult(
                    "Pediatrics",
                    List.of("Pediatrician"),
                    "Concerns regarding infant, child, or adolescent health are best evaluated by a pediatrician.",
                    "ROUTINE",
                    getProviderName()
            );
        }

        // Neurology
        if (containsAny(text, "headache", "migraine", "vertigo", "dizziness", "seizure", "numbness", "tingling", "tremor", "nerve", "memory loss", "confusion")) {
            return new LlmRecommendationResult(
                    "Neurology",
                    List.of("Neurologist"),
                    "The presented signs indicate neurological or sensory symptoms appropriate for a neurology specialist.",
                    "ROUTINE",
                    getProviderName()
            );
        }

        // Psychiatry / Mental Health
        if (containsAny(text, "anxiety", "depression", "panic", "stress", "insomnia", "mental", "mood", "sadness", "overwhelmed", "ptsd")) {
            return new LlmRecommendationResult(
                    "Psychiatry",
                    List.of("Psychiatrist"),
                    "Emotional, cognitive, or sleep difficulties may benefit from evaluation by a psychiatric specialist.",
                    "ROUTINE",
                    getProviderName()
            );
        }

        // Ophthalmology
        if (containsAny(text, "eye", "vision", "blur", "blurry", "cataract", "red eye", "ocular", "glaucoma", "double vision")) {
            return new LlmRecommendationResult(
                    "Ophthalmology",
                    List.of("Ophthalmologist"),
                    "Visual or ocular complaints are best diagnosed by an ophthalmology specialist.",
                    "ROUTINE",
                    getProviderName()
            );
        }

        // Default to General Medicine
        return new LlmRecommendationResult(
                "General Medicine",
                List.of("General Physician", "Internal Medicine Specialist"),
                "The described symptoms are broad and best evaluated first by a General Physician for primary assessment and targeted referral if needed.",
                "ROUTINE",
                getProviderName()
        );
    }

    private boolean containsAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) {
                return true;
            }
        }
        return false;
    }
}
