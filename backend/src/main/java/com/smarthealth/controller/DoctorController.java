package com.smarthealth.controller;

import com.smarthealth.dto.appointment.TimeSlotDto;
import com.smarthealth.dto.common.ApiResponse;
import com.smarthealth.dto.common.PageResponse;
import com.smarthealth.dto.doctor.*;
import com.smarthealth.service.DoctorService;
import com.smarthealth.service.SlotGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Doctors", description = "Endpoints for doctor discovery, doctor profiles, and doctor availability")
public class DoctorController {

    private final DoctorService doctorService;
    private final SlotGenerationService slotGenerationService;

    public DoctorController(DoctorService doctorService, SlotGenerationService slotGenerationService) {
        this.doctorService = doctorService;
        this.slotGenerationService = slotGenerationService;
    }

    @GetMapping
    @Operation(summary = "Search and filter approved doctors")
    public ResponseEntity<ApiResponse<PageResponse<DoctorSummaryDto>>> searchDoctors(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long specializationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "rating") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageResponse<DoctorSummaryDto> response = doctorService.searchDoctors(query, departmentId, specializationId, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed profile of a doctor")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> getDoctorById(@PathVariable Long id) {
        DoctorDetailDto doctor = doctorService.getDoctorById(id);
        return ResponseEntity.ok(ApiResponse.success(doctor));
    }

    @GetMapping("/{id}/availability")
    @Operation(summary = "Get real-time appointment slots for a doctor on a specific date")
    public ResponseEntity<ApiResponse<List<TimeSlotDto>>> getDoctorAvailability(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<TimeSlotDto> slots = slotGenerationService.getAvailableSlots(id, date);
        return ResponseEntity.ok(ApiResponse.success(slots));
    }

    @GetMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get currently authenticated doctor's profile")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> getMyProfile() {
        DoctorDetailDto profile = doctorService.getCurrentDoctorProfile();
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update currently authenticated doctor's profile details")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> updateMyProfile(@Valid @RequestBody DoctorProfileUpdateRequest request) {
        DoctorDetailDto updated = doctorService.updateCurrentDoctorProfile(request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "View current doctor's weekly recurring shifts")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityDto>>> getMyAvailability() {
        List<DoctorAvailabilityDto> list = doctorService.getCurrentDoctorAvailability();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PutMapping("/me/availability")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Update current doctor's recurring weekly shift hours")
    public ResponseEntity<ApiResponse<List<DoctorAvailabilityDto>>> updateMyAvailability(@RequestBody List<DoctorAvailabilityDto> list) {
        List<DoctorAvailabilityDto> updated = doctorService.updateCurrentDoctorAvailability(list);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully", updated));
    }

    @PostMapping("/me/exceptions")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Block a specific date or time range")
    public ResponseEntity<ApiResponse<AvailabilityExceptionDto>> addException(@Valid @RequestBody AvailabilityExceptionDto dto) {
        AvailabilityExceptionDto created = doctorService.addAvailabilityException(dto);
        return new ResponseEntity<>(ApiResponse.success("Exception added successfully", created), HttpStatus.CREATED);
    }

    @DeleteMapping("/me/exceptions/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Remove a blocked date or time range")
    public ResponseEntity<ApiResponse<Void>> deleteException(@PathVariable Long id) {
        doctorService.deleteAvailabilityException(id);
        return ResponseEntity.ok(ApiResponse.success("Exception removed successfully", null));
    }
}
