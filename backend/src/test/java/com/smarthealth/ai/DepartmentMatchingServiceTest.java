package com.smarthealth.ai;

import com.smarthealth.entity.Department;
import com.smarthealth.entity.Specialization;
import com.smarthealth.repository.DepartmentRepository;
import com.smarthealth.repository.SpecializationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentMatchingServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private SpecializationRepository specializationRepository;

    private DepartmentMatchingService matchingService;

    @BeforeEach
    void setUp() {
        matchingService = new DepartmentMatchingService(departmentRepository, specializationRepository);
    }

    @Test
    @DisplayName("Should accurately match existing department and validate specializations")
    void testDirectDepartmentMatch() {
        Department cardiology = new Department("Cardiology", "Heart and circulatory health", "heart");
        cardiology.setId(1L);

        Specialization spec = new Specialization(cardiology, "Cardiologist", "Heart expert");
        spec.setId(10L);

        when(departmentRepository.findByNameIgnoreCase("Cardiology")).thenReturn(Optional.of(cardiology));
        when(specializationRepository.findByDepartmentId(1L)).thenReturn(List.of(spec));

        DepartmentMatchingService.MatchedResult result = matchingService.matchAndValidate(
                "Cardiology", List.of("Cardiologist")
        );

        assertNotNull(result);
        assertEquals("Cardiology", result.getDepartment().getName());
        assertEquals(1, result.getValidatedSpecializations().size());
        assertEquals("Cardiologist", result.getValidatedSpecializations().get(0));
    }

    @Test
    @DisplayName("Should resolve synonym keywords to standard hospital department")
    void testSynonymDepartmentResolution() {
        Department derm = new Department("Dermatology", "Skin care", "activity");
        derm.setId(2L);

        Specialization spec = new Specialization(derm, "Dermatologist", "Skin expert");
        spec.setId(20L);

        when(departmentRepository.findByNameIgnoreCase("skin rash clinic")).thenReturn(Optional.empty());
        when(departmentRepository.findByNameIgnoreCase("Dermatology")).thenReturn(Optional.of(derm));
        when(specializationRepository.findByDepartmentId(2L)).thenReturn(List.of(spec));

        DepartmentMatchingService.MatchedResult result = matchingService.matchAndValidate(
                "skin rash clinic", List.of("Dermatologist")
        );

        assertNotNull(result);
        assertEquals("Dermatology", result.getDepartment().getName());
    }
}
