package com.smarthealth.controller;

import com.smarthealth.dto.common.ApiResponse;
import com.smarthealth.dto.patient.PatientProfileDto;
import com.smarthealth.dto.patient.PatientProfileUpdateRequest;
import com.smarthealth.service.PatientService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patients")
@Tag(name = "Patients", description = "Endpoints for patient profile retrieval and updates")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get current authenticated patient's profile")
    public ResponseEntity<ApiResponse<PatientProfileDto>> getMyProfile() {
        PatientProfileDto profile = patientService.getCurrentPatientProfile();
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Update current authenticated patient's profile")
    public ResponseEntity<ApiResponse<PatientProfileDto>> updateMyProfile(@Valid @RequestBody PatientProfileUpdateRequest request) {
        PatientProfileDto updated = patientService.updateCurrentPatientProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
