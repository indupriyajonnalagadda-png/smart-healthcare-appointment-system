package com.smarthealth.controller;

import com.smarthealth.dto.admin.AdminDashboardStatsDto;
import com.smarthealth.dto.admin.AuditLogDto;
import com.smarthealth.dto.appointment.AppointmentResponseDto;
import com.smarthealth.dto.auth.UserSummaryDto;
import com.smarthealth.dto.common.ApiResponse;
import com.smarthealth.dto.common.PageResponse;
import com.smarthealth.dto.department.DepartmentCreateRequest;
import com.smarthealth.dto.department.DepartmentDto;
import com.smarthealth.dto.department.SpecializationCreateRequest;
import com.smarthealth.dto.department.SpecializationDto;
import com.smarthealth.dto.doctor.DoctorApprovalRequest;
import com.smarthealth.dto.doctor.DoctorCreateRequest;
import com.smarthealth.dto.doctor.DoctorDetailDto;
import com.smarthealth.dto.doctor.DoctorSummaryDto;
import com.smarthealth.entity.Appointment;
import com.smarthealth.entity.Role;
import com.smarthealth.service.AdminService;
import com.smarthealth.service.AppointmentService;
import com.smarthealth.service.AuditLogService;
import com.smarthealth.service.DepartmentService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration", description = "Endpoints for administrator analytics, user management, and clinic controls")
public class AdminController {

    private final AdminService adminService;
    private final AppointmentService appointmentService;
    private final DepartmentService departmentService;
    private final AuditLogService auditLogService;

    public AdminController(AdminService adminService,
                           AppointmentService appointmentService,
                           DepartmentService departmentService,
                           AuditLogService auditLogService) {
        this.adminService = adminService;
        this.appointmentService = appointmentService;
        this.departmentService = departmentService;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get administrative metrics, revenue, and department breakdown")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getDashboardStats() {
        AdminDashboardStatsDto stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/users")
    @Operation(summary = "List and paginate all user accounts")
    public ResponseEntity<ApiResponse<PageResponse<UserSummaryDto>>> getAllUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PageResponse<UserSummaryDto> response = adminService.getAllUsers(role, PageRequest.of(page, size, Sort.by("id").descending()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Activate or deactivate a user account")
    public ResponseEntity<ApiResponse<UserSummaryDto>> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> payload) {
        boolean enabled = payload.getOrDefault("enabled", true);
        UserSummaryDto updated = adminService.updateUserStatus(id, enabled);
        return ResponseEntity.ok(ApiResponse.success("User status updated", updated));
    }

    @GetMapping("/doctors")
    @Operation(summary = "List doctors with approval statuses")
    public ResponseEntity<ApiResponse<PageResponse<DoctorSummaryDto>>> getAllDoctors(
            @RequestParam(required = false) String approvalStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PageResponse<DoctorSummaryDto> response = adminService.getAllDoctors(approvalStatus, PageRequest.of(page, size, Sort.by("id").descending()));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/doctors")
    @Operation(summary = "Provision a doctor account")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> createDoctor(@Valid @RequestBody DoctorCreateRequest request) {
        DoctorDetailDto created = adminService.createDoctor(request);
        return new ResponseEntity<>(ApiResponse.success("Doctor created successfully", created), HttpStatus.CREATED);
    }

    @PatchMapping("/doctors/{id}/approval")
    @Operation(summary = "Approve or reject doctor account registration")
    public ResponseEntity<ApiResponse<DoctorDetailDto>> approveDoctor(
            @PathVariable Long id,
            @Valid @RequestBody DoctorApprovalRequest request) {
        DoctorDetailDto updated = adminService.approveDoctor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Doctor approval updated", updated));
    }

    @GetMapping("/appointments")
    @Operation(summary = "Search all appointments globally with filters")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponseDto>>> searchAppointments(
            @RequestParam(required = false) Appointment.Status status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        PageResponse<AppointmentResponseDto> response = appointmentService.searchAppointmentsForAdmin(
                status, date, doctorId, patientId, query, PageRequest.of(page, size, Sort.by("appointmentDate").descending().and(Sort.by("startTime").descending()))
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/departments")
    @Operation(summary = "Create medical department")
    public ResponseEntity<ApiResponse<DepartmentDto>> createDepartment(@Valid @RequestBody DepartmentCreateRequest request) {
        DepartmentDto created = departmentService.createDepartment(request);
        return new ResponseEntity<>(ApiResponse.success("Department created successfully", created), HttpStatus.CREATED);
    }

    @PostMapping("/specializations")
    @Operation(summary = "Create specialization under a department")
    public ResponseEntity<ApiResponse<SpecializationDto>> createSpecialization(@Valid @RequestBody SpecializationCreateRequest request) {
        SpecializationDto created = departmentService.createSpecialization(request);
        return new ResponseEntity<>(ApiResponse.success("Specialization created successfully", created), HttpStatus.CREATED);
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "Get paginated audit logs")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogDto>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageResponse<AuditLogDto> response = auditLogService.getAuditLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
