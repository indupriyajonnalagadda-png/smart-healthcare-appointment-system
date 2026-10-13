package com.smarthealth.controller;

import com.smarthealth.dto.appointment.*;
import com.smarthealth.dto.common.ApiResponse;
import com.smarthealth.entity.Appointment;
import com.smarthealth.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments", description = "Endpoints for appointment booking, status updates, and cancellation")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    @Operation(summary = "Book an appointment slot with a doctor")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> bookAppointment(@Valid @RequestBody AppointmentBookingRequest request) {
        AppointmentResponseDto response = appointmentService.bookAppointment(request);
        return new ResponseEntity<>(ApiResponse.success("Appointment booked successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @Operation(summary = "Get currently authenticated user's appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponseDto>>> getMyAppointments(
            @RequestParam(required = false) Appointment.Status status) {
        List<AppointmentResponseDto> appointments = appointmentService.getMyAppointments(status);
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment details by ID")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> getAppointmentById(@PathVariable Long id) {
        AppointmentResponseDto appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(ApiResponse.success(appointment));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel an appointment subject to cutoff policy")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) AppointmentCancelRequest request) {
        String reason = request != null ? request.getReason() : null;
        AppointmentResponseDto cancelled = appointmentService.cancelAppointment(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled successfully", cancelled));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN')")
    @Operation(summary = "Update appointment status (CONFIRMED, COMPLETED, NO_SHOW)")
    public ResponseEntity<ApiResponse<AppointmentResponseDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        AppointmentResponseDto updated = appointmentService.updateAppointmentStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", updated));
    }
}
