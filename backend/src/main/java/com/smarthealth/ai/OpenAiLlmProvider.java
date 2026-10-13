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
public class OpenAiLlmProvider implements LlmProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiLlmProvider.class);

    @Value("${smarthealth.ai.openai.api-key:}")
    private String apiKey;

    @Value("${smarthealth.ai.openai.model:gpt-4o-mini}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final RuleBasedRecommendationProvider fallbackProvider;

    public OpenAiLlmProvider(RuleBasedRecommendationProvider fallbackProvider) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.fallbackProvider = fallbackProvider;
    }

    @Override
    public String getProviderName() {
        return "OPENAI_API";
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
            String endpoint = "https://api.openai.com/v1/chat/completions";

            String prompt = """
                    You are a medical appointment navigation assistant. Analyze the following patient symptoms and recommend a suitable medical department and specializations.
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
                    "model", model,
                    "response_format", Map.of("type", "json_object"),
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are an AI healthcare navigation assistant. Never diagnose or prescribe. Output valid JSON only."),
                            Map.of("role", "user", "content", prompt)
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode contentNode = root.at("/choices/0/message/content");
                if (!contentNode.isMissingNode()) {
                    JsonNode parsed = objectMapper.readTree(contentNode.asText());
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
            log.warn("OpenAI API call failed, safely defaulting to RuleBasedRecommendationProvider: {}", e.getMessage());
        }

        return fallbackProvider.getRecommendation(symptomText, age, gender);
    }
}
