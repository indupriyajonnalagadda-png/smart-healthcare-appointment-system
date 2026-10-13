package com.smarthealth.ai;

import com.smarthealth.entity.Department;
import com.smarthealth.entity.Specialization;
import com.smarthealth.repository.DepartmentRepository;
import com.smarthealth.repository.SpecializationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DepartmentMatchingService {

    private final DepartmentRepository departmentRepository;
    private final SpecializationRepository specializationRepository;

    public DepartmentMatchingService(DepartmentRepository departmentRepository,
                                     SpecializationRepository specializationRepository) {
        this.departmentRepository = departmentRepository;
        this.specializationRepository = specializationRepository;
    }

    public static class MatchedResult {
        private final Department department;
        private final List<String> validatedSpecializations;

        public MatchedResult(Department department, List<String> validatedSpecializations) {
            this.department = department;
            this.validatedSpecializations = validatedSpecializations;
        }

        public Department getDepartment() {
            return department;
        }

        public List<String> getValidatedSpecializations() {
            return validatedSpecializations;
        }
    }

    @Transactional(readOnly = true)
    public MatchedResult matchAndValidate(String rawDepartment, List<String> rawSpecializations) {
        // Try direct case-insensitive match
        Optional<Department> deptOpt = departmentRepository.findByNameIgnoreCase(rawDepartment.trim());

        Department matchedDepartment;
        if (deptOpt.isPresent()) {
            matchedDepartment = deptOpt.get();
        } else {
            // Check synonyms
            String lower = rawDepartment.toLowerCase();
            if (lower.contains("heart") || lower.contains("cardio")) {
                matchedDepartment = departmentRepository.findByNameIgnoreCase("Cardiology").orElse(getDefaultDepartment());
            } else if (lower.contains("skin") || lower.contains("derm")) {
                matchedDepartment = departmentRepository.findByNameIgnoreCase("Dermatology").orElse(getDefaultDepartment());
            } else if (lower.contains("bone") || lower.contains("ortho") || lower.contains("joint")) {
                matchedDepartment = departmentRepository.findByNameIgnoreCase("Orthopedics").orElse(getDefaultDepartment());
            } else if (lower.contains("child") || lower.contains("pediatric")) {
                matchedDepartment = departmentRepository.findByNameIgnoreCase("Pediatrics").orElse(getDefaultDepartment());
            } else if (lower.contains("brain") || lower.contains("neuro")) {
                matchedDepartment = departmentRepository.findByNameIgnoreCase("Neurology").orElse(getDefaultDepartment());
            } else if (lower.contains("mental") || lower.contains("psych")) {
                matchedDepartment = departmentRepository.findByNameIgnoreCase("Psychiatry").orElse(getDefaultDepartment());
            } else if (lower.contains("eye") || lower.contains("ophthalm")) {
                matchedDepartment = departmentRepository.findByNameIgnoreCase("Ophthalmology").orElse(getDefaultDepartment());
            } else {
                matchedDepartment = getDefaultDepartment();
            }
        }

        // Validate specializations against DB
        List<Specialization> dbSpecs = specializationRepository.findByDepartmentId(matchedDepartment.getId());
        List<String> validatedSpecs = new ArrayList<>();

        if (rawSpecializations != null) {
            for (String rawSpec : rawSpecializations) {
                for (Specialization dbSpec : dbSpecs) {
                    if (dbSpec.getName().equalsIgnoreCase(rawSpec.trim()) ||
                        dbSpec.getName().toLowerCase().contains(rawSpec.trim().toLowerCase())) {
                        if (!validatedSpecs.contains(dbSpec.getName())) {
                            validatedSpecs.add(dbSpec.getName());
                        }
                    }
                }
            }
        }

        // If no specialization matched, include all valid ones from that department
        if (validatedSpecs.isEmpty() && !dbSpecs.isEmpty()) {
            validatedSpecs.add(dbSpecs.get(0).getName());
        }

        return new MatchedResult(matchedDepartment, validatedSpecs);
    }

    private Department getDefaultDepartment() {
        return departmentRepository.findByNameIgnoreCase("General Medicine")
                .orElseGet(() -> departmentRepository.findAll().stream().findFirst().orElse(null));
    }
}
