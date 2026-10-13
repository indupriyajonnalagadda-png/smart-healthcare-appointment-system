package com.smarthealth.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RuleBasedRecommendationProviderTest {

    private RuleBasedRecommendationProvider provider;

    @BeforeEach
    void setUp() {
        provider = new RuleBasedRecommendationProvider();
    }

    @Test
    @DisplayName("Should recommend Dermatology for skin rash and acne")
    void testDermatologyRecommendation() {
        LlmRecommendationResult result = provider.getRecommendation("Red itchy rash and acne breakouts on facial skin", 28, "FEMALE");
        assertEquals("Dermatology", result.getDepartment());
        assertTrue(result.getSpecializations().contains("Dermatologist"));
        assertEquals("ROUTINE", result.getUrgency());
    }

    @Test
    @DisplayName("Should recommend Cardiology for irregular heart palpitations")
    void testCardiologyRecommendation() {
        LlmRecommendationResult result = provider.getRecommendation("Experiencing irregular heartbeat and heart palpitations with high blood pressure", 55, "MALE");
        assertEquals("Cardiology", result.getDepartment());
        assertTrue(result.getSpecializations().contains("Cardiologist"));
        assertEquals("ELEVATED", result.getUrgency());
    }

    @Test
    @DisplayName("Should recommend Orthopedics for joint and knee pain")
    void testOrthopedicsRecommendation() {
        LlmRecommendationResult result = provider.getRecommendation("Severe knee ache, joint stiffness, and swollen bone following a fall", 40, "FEMALE");
        assertEquals("Orthopedics", result.getDepartment());
        assertTrue(result.getSpecializations().contains("Orthopedic Surgeon"));
    }

    @Test
    @DisplayName("Should recommend General Medicine for nonspecific viral fever")
    void testGeneralMedicineDefault() {
        LlmRecommendationResult result = provider.getRecommendation("General feeling of tiredness, low fever, and fatigue for 2 days", 30, "MALE");
        assertEquals("General Medicine", result.getDepartment());
        assertTrue(result.getSpecializations().contains("General Physician"));
    }
}
