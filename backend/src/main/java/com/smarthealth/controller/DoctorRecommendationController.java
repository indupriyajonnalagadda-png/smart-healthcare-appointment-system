package com.smarthealth.controller;

import com.smarthealth.ai.DoctorRecommendationService;
import com.smarthealth.dto.ai.DoctorRecommendationRequest;
import com.smarthealth.dto.ai.DoctorRecommendationResponse;
import com.smarthealth.dto.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Recommendation", description = "AI-powered symptom evaluation, department matching, and emergency triage safety")
public class DoctorRecommendationController {

    private final DoctorRecommendationService recommendationService;

    public DoctorRecommendationController(DoctorRecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/doctor-recommendations")
    @Operation(summary = "Analyze symptoms in natural language and receive recommended department and doctors")
    public ResponseEntity<ApiResponse<DoctorRecommendationResponse>> recommendDoctor(
            @Valid @RequestBody DoctorRecommendationRequest request) {
        DoctorRecommendationResponse response = recommendationService.recommendDoctor(request);
        return ResponseEntity.ok(ApiResponse.success("Recommendation generated successfully", response));
    }
}
