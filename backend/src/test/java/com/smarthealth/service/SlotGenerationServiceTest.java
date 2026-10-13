package com.smarthealth.service;

import com.smarthealth.dto.appointment.TimeSlotDto;
import com.smarthealth.entity.DoctorAvailability;
import com.smarthealth.entity.DoctorProfile;
import com.smarthealth.repository.AppointmentRepository;
import com.smarthealth.repository.AvailabilityExceptionRepository;
import com.smarthealth.repository.DoctorAvailabilityRepository;
import com.smarthealth.repository.DoctorProfileRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SlotGenerationServiceTest {

    @Mock
    private DoctorProfileRepository doctorProfileRepository;

    @Mock
    private DoctorAvailabilityRepository availabilityRepository;

    @Mock
    private AvailabilityExceptionRepository exceptionRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private SlotGenerationService slotGenerationService;

    @Test
    @DisplayName("Should generate valid slots for future date based on recurring shift")
    void testGenerateSlotsSuccessfully() {
        Long doctorId = 1L;
        LocalDate futureMonday = LocalDate.now().plusWeeks(1);
        while (futureMonday.getDayOfWeek() != DayOfWeek.MONDAY) {
            futureMonday = futureMonday.plusDays(1);
        }

        DoctorProfile doctor = new DoctorProfile();
        doctor.setId(doctorId);
        doctor.setActive(true);
        doctor.setApprovalStatus("APPROVED");

        DoctorAvailability avail = new DoctorAvailability(
                doctor, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(11, 0), 30
        );

        when(doctorProfileRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(exceptionRepository.findByDoctorIdAndExceptionDate(doctorId, futureMonday)).thenReturn(Collections.emptyList());
        when(availabilityRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(doctorId, DayOfWeek.MONDAY))
                .thenReturn(List.of(avail));
        when(appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusNot(eq(doctorId), eq(futureMonday), any()))
                .thenReturn(Collections.emptyList());

        List<TimeSlotDto> slots = slotGenerationService.getAvailableSlots(doctorId, futureMonday);

        assertNotNull(slots);
        assertEquals(4, slots.size()); // 9:00-9:30, 9:30-10:00, 10:00-10:30, 10:30-11:00
        assertTrue(slots.stream().allMatch(TimeSlotDto::isAvailable));
    }
}
