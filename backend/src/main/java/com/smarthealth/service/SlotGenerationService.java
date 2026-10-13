package com.smarthealth.service;

import com.smarthealth.dto.appointment.TimeSlotDto;
import com.smarthealth.entity.Appointment;
import com.smarthealth.entity.AvailabilityException;
import com.smarthealth.entity.DoctorAvailability;
import com.smarthealth.entity.DoctorProfile;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.repository.AppointmentRepository;
import com.smarthealth.repository.AvailabilityExceptionRepository;
import com.smarthealth.repository.DoctorAvailabilityRepository;
import com.smarthealth.repository.DoctorProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SlotGenerationService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final AvailabilityExceptionRepository exceptionRepository;
    private final AppointmentRepository appointmentRepository;

    public SlotGenerationService(DoctorProfileRepository doctorProfileRepository,
                                 DoctorAvailabilityRepository availabilityRepository,
                                 AvailabilityExceptionRepository exceptionRepository,
                                 AppointmentRepository appointmentRepository) {
        this.doctorProfileRepository = doctorProfileRepository;
        this.availabilityRepository = availabilityRepository;
        this.exceptionRepository = exceptionRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional(readOnly = true)
    public List<TimeSlotDto> getAvailableSlots(Long doctorId, LocalDate targetDate) {
        DoctorProfile doctor = doctorProfileRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (!doctor.isActive() || !"APPROVED".equalsIgnoreCase(doctor.getApprovalStatus())) {
            return List.of();
        }

        LocalDate today = LocalDate.now();
        if (targetDate.isBefore(today)) {
            return List.of();
        }

        // Check if there is an all-day availability exception
        List<AvailabilityException> exceptions = exceptionRepository.findByDoctorIdAndExceptionDate(doctorId, targetDate);
        boolean isAllDayBlocked = exceptions.stream().anyMatch(AvailabilityException::isAllDay);
        if (isAllDayBlocked) {
            return List.of();
        }

        // Fetch weekly recurring availability for day of week
        DayOfWeek dayOfWeek = targetDate.getDayOfWeek();
        List<DoctorAvailability> availabilities = availabilityRepository.findByDoctorIdAndDayOfWeekAndActiveTrue(doctorId, dayOfWeek);
        if (availabilities.isEmpty()) {
            return List.of();
        }

        // Fetch already booked appointments that are not cancelled
        List<Appointment> bookedAppointments = appointmentRepository.findByDoctorIdAndAppointmentDateAndStatusNot(
                doctorId, targetDate, Appointment.Status.CANCELLED
        );
        Set<LocalTime> bookedStartTimes = bookedAppointments.stream()
                .map(Appointment::getStartTime)
                .collect(Collectors.toSet());

        List<TimeSlotDto> slots = new ArrayList<>();
        LocalTime now = LocalTime.now();

        for (DoctorAvailability avail : availabilities) {
            int durationMinutes = avail.getSlotDurationMinutes() > 0 ? avail.getSlotDurationMinutes() : 30;
            LocalTime current = avail.getStartTime();
            LocalTime shiftEnd = avail.getEndTime();

            while (current.plusMinutes(durationMinutes).compareTo(shiftEnd) <= 0) {
                LocalTime slotStart = current;
                LocalTime slotEnd = current.plusMinutes(durationMinutes);

                boolean isPastToday = (targetDate.equals(today) && slotStart.isBefore(now));
                boolean isBooked = bookedStartTimes.contains(slotStart);

                // Check partial-day exceptions
                boolean isExceptionBlocked = exceptions.stream().anyMatch(ex -> {
                    if (ex.isAllDay()) return true;
                    if (ex.getStartTime() == null || ex.getEndTime() == null) return false;
                    return !slotStart.isBefore(ex.getStartTime()) && slotStart.isBefore(ex.getEndTime());
                });

                boolean available = !isPastToday && !isBooked && !isExceptionBlocked;
                String reasonUnavailable = null;
                if (isPastToday) {
                    reasonUnavailable = "Time has passed";
                } else if (isBooked) {
                    reasonUnavailable = "Already booked";
                } else if (isExceptionBlocked) {
                    reasonUnavailable = "Doctor unavailable";
                }

                slots.add(new TimeSlotDto(slotStart, slotEnd, available, reasonUnavailable));
                current = slotEnd;
            }
        }

        return slots;
    }
}
