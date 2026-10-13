package com.smarthealth.controller;

import com.smarthealth.dto.common.ApiResponse;
import com.smarthealth.dto.department.DepartmentDto;
import com.smarthealth.dto.department.SpecializationDto;
import com.smarthealth.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@Tag(name = "Departments", description = "Endpoints for medical departments and specializations")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @Operation(summary = "List all medical departments")
    public ResponseEntity<ApiResponse<List<DepartmentDto>>> getAllDepartments() {
        List<DepartmentDto> list = departmentService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get department by ID")
    public ResponseEntity<ApiResponse<DepartmentDto>> getDepartmentById(@PathVariable Long id) {
        DepartmentDto department = departmentService.getDepartmentById(id);
        return ResponseEntity.ok(ApiResponse.success(department));
    }

    @GetMapping("/{id}/specializations")
    @Operation(summary = "Get specializations for a department")
    public ResponseEntity<ApiResponse<List<SpecializationDto>>> getSpecializations(@PathVariable Long id) {
        List<SpecializationDto> list = departmentService.getSpecializationsByDepartment(id);
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
