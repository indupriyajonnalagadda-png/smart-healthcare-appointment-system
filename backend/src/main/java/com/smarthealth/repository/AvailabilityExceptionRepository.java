package com.smarthealth.repository;

import com.smarthealth.entity.AvailabilityException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AvailabilityExceptionRepository extends JpaRepository<AvailabilityException, Long> {
    List<AvailabilityException> findByDoctorIdAndExceptionDate(Long doctorId, LocalDate exceptionDate);
    List<AvailabilityException> findByDoctorIdAndExceptionDateGreaterThanEqualOrderByExceptionDateAsc(Long doctorId, LocalDate date);
    List<AvailabilityException> findByDoctorIdOrderByExceptionDateDesc(Long doctorId);
}
