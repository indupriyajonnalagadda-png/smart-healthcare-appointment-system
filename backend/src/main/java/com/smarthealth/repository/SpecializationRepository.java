package com.smarthealth.repository;

import com.smarthealth.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
    List<Specialization> findByDepartmentId(Long departmentId);
    Optional<Specialization> findByNameIgnoreCase(String name);
    List<Specialization> findByNameInIgnoreCase(List<String> names);
    boolean existsByNameIgnoreCase(String name);
}
