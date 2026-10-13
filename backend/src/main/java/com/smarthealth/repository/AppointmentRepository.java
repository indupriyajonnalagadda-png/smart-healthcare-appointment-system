package com.smarthealth.repository;

import com.smarthealth.entity.Appointment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByAppointmentReference(String reference);

    List<Appointment> findByPatientIdOrderByAppointmentDateDescStartTimeDesc(Long patientId);

    List<Appointment> findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(Long doctorId);

    List<Appointment> findByDoctorIdAndAppointmentDateAndStatusNot(Long doctorId, LocalDate date, Appointment.Status status);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date " +
           "AND a.startTime = :startTime AND a.status != com.smarthealth.entity.Appointment.Status.CANCELLED")
    List<Appointment> findActiveConflictingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime
    );

    long countByStatus(Appointment.Status status);

    @Query("SELECT a FROM Appointment a " +
           "LEFT JOIN a.doctor d " +
           "LEFT JOIN d.user du " +
           "LEFT JOIN a.patient p " +
           "LEFT JOIN p.user pu " +
           "WHERE (:status IS NULL OR a.status = :status) " +
           "AND (:date IS NULL OR a.appointmentDate = :date) " +
           "AND (:doctorId IS NULL OR d.id = :doctorId) " +
           "AND (:patientId IS NULL OR p.id = :patientId) " +
           "AND (:query IS NULL OR LOWER(du.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(du.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(pu.firstName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(pu.lastName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "    OR LOWER(a.appointmentReference) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Appointment> searchAppointments(
            @Param("status") Appointment.Status status,
            @Param("date") LocalDate date,
            @Param("doctorId") Long doctorId,
            @Param("patientId") Long patientId,
            @Param("query") String query,
            Pageable pageable
    );
}
