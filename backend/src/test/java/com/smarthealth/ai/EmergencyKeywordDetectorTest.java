package com.smarthealth.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmergencyKeywordDetectorTest {

    private EmergencyKeywordDetector detector;

    @BeforeEach
    void setUp() {
        detector = new EmergencyKeywordDetector();
    }

    @Test
    @DisplayName("Should detect emergency for severe chest pain")
    void testDetectChestPainEmergency() {
        String symptoms = "I have sudden severe chest pain and radiating pain to my left arm.";
        assertTrue(detector.isEmergency(symptoms));
        assertNotNull(detector.getEmergencyWarning());
    }

    @Test
    @DisplayName("Should detect emergency for breathlessness")
    void testDetectShortnessOfBreath() {
        String symptoms = "Patient cannot breathe and has blue lips";
        assertTrue(detector.isEmergency(symptoms));
    }

    @Test
    @DisplayName("Should not flag routine symptoms as emergency")
    void testRoutineSymptomsNotEmergency() {
        String symptoms = "I have mild skin rash on my forearm and it is slightly itchy.";
        assertFalse(detector.isEmergency(symptoms));
    }
}
