package com.smarthealth.repository;

import com.smarthealth.entity.AppointmentStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentStatusHistoryRepository extends JpaRepository<AppointmentStatusHistory, Long> {
    List<AppointmentStatusHistory> findByAppointmentIdOrderByChangedAtAsc(Long appointmentId);
}
