package com.smarthealth.repository;

import com.smarthealth.entity.DoctorProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorProfileRepository extends JpaRepository<DoctorProfile, Long> {

    Optional<DoctorProfile> findByUserId(Long userId);

    Optional<DoctorProfile> findByUserEmail(String email);

    long countByApprovalStatusAndActive(String approvalStatus, boolean active);

    @Query("SELECT DISTINCT d FROM DoctorProfile d " +
           "LEFT JOIN d.user u " +
           "LEFT JOIN d.department dep " +
           "LEFT JOIN d.specializations s " +
           "WHERE (:approvalStatus IS NULL OR d.approvalStatus = :approvalStatus) " +
           "AND (:active IS NULL OR d.active = :active) " +
           "AND (:departmentId IS NULL OR dep.id = :departmentId) " +
           "AND (:specializationId IS NULL OR s.id = :specializationId) " +
           "AND (:query IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(dep.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<DoctorProfile> searchDoctors(
            @Param("query") String query,
            @Param("departmentId") Long departmentId,
            @Param("specializationId") Long specializationId,
            @Param("approvalStatus") String approvalStatus,
            @Param("active") Boolean active,
            Pageable pageable
    );

    @Query("SELECT DISTINCT d FROM DoctorProfile d " +
           "JOIN d.specializations s " +
           "WHERE d.approvalStatus = 'APPROVED' AND d.active = true " +
           "AND LOWER(s.name) IN :specializationNames")
    List<DoctorProfile> findBySpecializationNames(@Param("specializationNames") List<String> specializationNames);
}
