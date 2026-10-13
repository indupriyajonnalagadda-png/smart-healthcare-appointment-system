package com.smarthealth.service;

import com.smarthealth.dto.appointment.AppointmentBookingRequest;
import com.smarthealth.entity.*;
import com.smarthealth.exception.ConflictException;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.*;
import com.smarthealth.security.UserPrincipal;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AppointmentStatusHistoryRepository statusHistoryRepository;

    @Mock
    private PatientProfileRepository patientProfileRepository;

    @Mock
    private DoctorProfileRepository doctorProfileRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private EntityDtoMapper mapper;

    @InjectMocks
    private AppointmentService appointmentService;

    @BeforeEach
    void setUpSecurity() {
        UserPrincipal principal = new UserPrincipal(
                10L, "patient@test.com", "pass", "ROLE_PATIENT", true,
                List.of(new SimpleGrantedAuthority("ROLE_PATIENT"))
        );
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void clearSecurity() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Should reject booking when concurrent conflict exists")
    void testRejectConflictingBooking() {
        Long doctorId = 5L;
        LocalDate futureDate = LocalDate.now().plusDays(2);
        LocalTime slotTime = LocalTime.of(10, 0);

        AppointmentBookingRequest request = new AppointmentBookingRequest();
        request.setDoctorId(doctorId);
        request.setAppointmentDate(futureDate);
        request.setStartTime(slotTime);

        PatientProfile patient = new PatientProfile();
        patient.setId(1L);

        DoctorProfile doctor = new DoctorProfile();
        doctor.setId(doctorId);
        doctor.setActive(true);
        doctor.setApprovalStatus("APPROVED");

        Appointment existingAppointment = new Appointment();
        existingAppointment.setId(99L);

        when(patientProfileRepository.findByUserId(10L)).thenReturn(Optional.of(patient));
        when(doctorProfileRepository.findById(doctorId)).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findActiveConflictingAppointments(doctorId, futureDate, slotTime))
                .thenReturn(List.of(existingAppointment));

        assertThrows(ConflictException.class, () -> appointmentService.bookAppointment(request));
    }
}
