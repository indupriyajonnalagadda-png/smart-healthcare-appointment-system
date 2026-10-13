package com.smarthealth.controller;

import com.smarthealth.dto.common.ApiResponse;
import com.smarthealth.dto.prescription.PrescriptionCreateRequest;
import com.smarthealth.dto.prescription.PrescriptionResponseDto;
import com.smarthealth.service.PrescriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
@Tag(name = "Prescriptions", description = "Endpoints for prescriptions and clinical consultation notes")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @PostMapping("/api/appointments/{id}/prescription")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Add prescription and consultation notes for an appointment")
    public ResponseEntity<ApiResponse<PrescriptionResponseDto>> addPrescription(
            @PathVariable Long id,
            @Valid @RequestBody PrescriptionCreateRequest request) {
        PrescriptionResponseDto response = prescriptionService.createPrescription(id, request);
        return new ResponseEntity<>(ApiResponse.success("Prescription recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/api/appointments/{id}/prescription")
    @Operation(summary = "Get prescription associated with a specific appointment")
    public ResponseEntity<ApiResponse<PrescriptionResponseDto>> getPrescriptionByAppointment(@PathVariable Long id) {
        PrescriptionResponseDto response = prescriptionService.getPrescriptionByAppointment(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/api/prescriptions/my")
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Get all prescriptions for the currently authenticated patient")
    public ResponseEntity<ApiResponse<List<PrescriptionResponseDto>>> getMyPrescriptions() {
        List<PrescriptionResponseDto> list = prescriptionService.getMyPrescriptions();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
