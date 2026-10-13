package com.smarthealth.service;

import com.smarthealth.dto.department.DepartmentCreateRequest;
import com.smarthealth.dto.department.DepartmentDto;
import com.smarthealth.dto.department.SpecializationCreateRequest;
import com.smarthealth.dto.department.SpecializationDto;
import com.smarthealth.entity.Department;
import com.smarthealth.entity.Specialization;
import com.smarthealth.exception.ConflictException;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.DepartmentRepository;
import com.smarthealth.repository.SpecializationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final SpecializationRepository specializationRepository;
    private final EntityDtoMapper mapper;

    public DepartmentService(DepartmentRepository departmentRepository,
                             SpecializationRepository specializationRepository,
                             EntityDtoMapper mapper) {
        this.departmentRepository = departmentRepository;
        this.specializationRepository = specializationRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(mapper::toDepartmentDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapper.toDepartmentDto(department);
    }

    @Transactional(readOnly = true)
    public List<SpecializationDto> getSpecializationsByDepartment(Long departmentId) {
        return specializationRepository.findByDepartmentId(departmentId).stream()
                .map(mapper::toSpecializationDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentCreateRequest request) {
        if (departmentRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Department already exists with name: " + request.getName());
        }
        Department department = new Department(request.getName(), request.getDescription(), request.getIconName());
        Department saved = departmentRepository.save(department);
        return mapper.toDepartmentDto(saved);
    }

    @Transactional
    public SpecializationDto createSpecialization(SpecializationCreateRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        if (specializationRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("Specialization already exists with name: " + request.getName());
        }

        Specialization spec = new Specialization(department, request.getName(), request.getDescription());
        Specialization saved = specializationRepository.save(spec);
        return mapper.toSpecializationDto(saved);
    }
}
