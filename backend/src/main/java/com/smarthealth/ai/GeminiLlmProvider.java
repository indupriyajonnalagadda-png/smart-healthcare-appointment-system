package com.smarthealth.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class GeminiLlmProvider implements LlmProvider {

    private static final Logger log = LoggerFactory.getLogger(GeminiLlmProvider.class);

    @Value("${smarthealth.ai.gemini.api-key:}")
    private String apiKey;

    @Value("${smarthealth.ai.gemini.model:gemini-1.5-flash}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final RuleBasedRecommendationProvider fallbackProvider;

    public GeminiLlmProvider(RuleBasedRecommendationProvider fallbackProvider) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.fallbackProvider = fallbackProvider;
    }

    @Override
    public String getProviderName() {
        return "GEMINI_API";
    }

    @Override
    public boolean isAvailable() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.contains("your_");
    }

    @Override
    public LlmRecommendationResult getRecommendation(String symptomText, Integer age, String gender) {
        if (!isAvailable()) {
            return fallbackProvider.getRecommendation(symptomText, age, gender);
        }

        try {
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

            String prompt = """
                    You are a healthcare navigation assistant. Analyze the following patient symptoms and recommend a suitable medical department and specializations.
                    You must NOT diagnose any disease, prescribe medications, or give treatment.
                    Return ONLY valid JSON matching this schema:
                    {
                      "recommendedDepartment": "string",
                      "recommendedSpecializations": ["string"],
                      "reason": "string",
                      "urgency": "ROUTINE" | "ELEVATED" | "EMERGENCY"
                    }
                    Available departments: Cardiology, Dermatology, Orthopedics, Pediatrics, Neurology, General Medicine, Psychiatry, Ophthalmology.
                    Patient Age: %s, Gender: %s
                    Symptoms: %s
                    """.formatted(age != null ? age : "Unknown", gender != null ? gender : "Unknown", symptomText);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)
                            ))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode candidateTextNode = root.at("/candidates/0/content/parts/0/text");
                if (!candidateTextNode.isMissingNode()) {
                    String rawText = candidateTextNode.asText().trim();
                    // Clean markdown code blocks if present
                    if (rawText.startsWith("```json")) {
                        rawText = rawText.substring(7);
                    } else if (rawText.startsWith("```")) {
                        rawText = rawText.substring(3);
                    }
                    if (rawText.endsWith("```")) {
                        rawText = rawText.substring(0, rawText.length() - 3);
                    }
                    rawText = rawText.trim();

                    JsonNode parsed = objectMapper.readTree(rawText);
                    String dept = parsed.path("recommendedDepartment").asText("General Medicine");
                    String reason = parsed.path("reason").asText("Clinical symptom evaluation.");
                    String urgency = parsed.path("urgency").asText("ROUTINE");

                    List<String> specs = new ArrayList<>();
                    if (parsed.has("recommendedSpecializations") && parsed.get("recommendedSpecializations").isArray()) {
                        for (JsonNode item : parsed.get("recommendedSpecializations")) {
                            specs.add(item.asText());
                        }
                    }

                    return new LlmRecommendationResult(dept, specs, reason, urgency, getProviderName());
                }
            }
        } catch (Exception e) {
            log.warn("Gemini API call failed, safely defaulting to RuleBasedRecommendationProvider: {}", e.getMessage());
        }

        return fallbackProvider.getRecommendation(symptomText, age, gender);
    }
}
