package com.smarthealth.service;

import com.smarthealth.dto.appointment.*;
import com.smarthealth.dto.common.PageResponse;
import com.smarthealth.entity.*;
import com.smarthealth.exception.*;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.*;
import com.smarthealth.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentStatusHistoryRepository statusHistoryRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final EntityDtoMapper mapper;

    @Value("${smarthealth.scheduling.slot-duration-minutes:30}")
    private int defaultSlotDurationMinutes;

    @Value("${smarthealth.scheduling.cancellation-cutoff-hours:2}")
    private int cancellationCutoffHours;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              AppointmentStatusHistoryRepository statusHistoryRepository,
                              PatientProfileRepository patientProfileRepository,
                              DoctorProfileRepository doctorProfileRepository,
                              UserRepository userRepository,
                              NotificationService notificationService,
                              AuditLogService auditLogService,
                              EntityDtoMapper mapper) {
        this.appointmentRepository = appointmentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.mapper = mapper;
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public synchronized AppointmentResponseDto bookAppointment(AppointmentBookingRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        PatientProfile patient = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Only registered patients can book appointments. Please complete your profile."));

        DoctorProfile doctor = doctorProfileRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + request.getDoctorId()));

        if (!doctor.isActive() || !"APPROVED".equalsIgnoreCase(doctor.getApprovalStatus())) {
            throw new BadRequestException("Doctor is currently unavailable for bookings");
        }

        LocalDate today = LocalDate.now();
        if (request.getAppointmentDate().isBefore(today)) {
            throw new BadRequestException("Cannot book appointments for past dates");
        }
        if (request.getAppointmentDate().equals(today) && request.getStartTime().isBefore(LocalTime.now())) {
            throw new BadRequestException("Cannot book slots in the past");
        }

        // Concurrency check against active conflicting appointments
        List<Appointment> conflicts = appointmentRepository.findActiveConflictingAppointments(
                doctor.getId(), request.getAppointmentDate(), request.getStartTime()
        );
        if (!conflicts.isEmpty()) {
            throw new ConflictException("The selected time slot is no longer available. Please choose another slot.");
        }

        LocalTime endTime = request.getStartTime().plusMinutes(defaultSlotDurationMinutes);
        String reference = "APT-" + System.currentTimeMillis() % 100000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Appointment appointment = new Appointment(
                reference,
                patient,
                doctor,
                request.getAppointmentDate(),
                request.getStartTime(),
                endTime,
                request.getConsultationType() != null ? request.getConsultationType() : Appointment.ConsultationType.IN_PERSON,
                doctor.getConsultationFee(),
                request.getSymptomSummary()
        );

        Appointment saved = appointmentRepository.save(appointment);

        // Record Initial Status History
        User currentUser = userRepository.findById(userId).orElse(null);
        AppointmentStatusHistory history = new AppointmentStatusHistory(
                saved, null, Appointment.Status.CONFIRMED, currentUser, "Appointment booked by patient"
        );
        statusHistoryRepository.save(history);

        // Send notifications
        notificationService.createNotification(
                patient.getUser(),
                "Appointment Confirmed",
                "Your appointment with Dr. " + doctor.getUser().getFullName() + " on " + saved.getAppointmentDate() + " at " + saved.getStartTime() + " has been confirmed.",
                "APPOINTMENT_BOOKED",
                saved.getAppointmentReference()
        );

        notificationService.createNotification(
                doctor.getUser(),
                "New Consultation Booked",
                "Patient " + patient.getUser().getFullName() + " booked a consultation on " + saved.getAppointmentDate() + " at " + saved.getStartTime() + ".",
                "APPOINTMENT_BOOKED",
                saved.getAppointmentReference()
        );

        auditLogService.logAction(currentUser, "BOOK_APPOINTMENT", "Appointment", String.valueOf(saved.getId()),
                "Booked reference " + saved.getAppointmentReference());

        return mapper.toAppointmentResponseDto(saved);
    }

    @Transactional
    public AppointmentResponseDto cancelAppointment(Long appointmentId, String reason) {
        Long userId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);
        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(userId);
        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");

        if (!isPatient && !isDoctor && !isAdmin) {
            throw new ForbiddenException("You are not authorized to cancel this appointment");
        }

        if (appointment.getStatus() == Appointment.Status.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled");
        }
        if (appointment.getStatus() == Appointment.Status.COMPLETED) {
            throw new BadRequestException("Cannot cancel an already completed appointment");
        }

        // Enforce cutoff policy for patients
        if (isPatient && !isAdmin) {
            LocalDateTime appointmentDateTime = LocalDateTime.of(appointment.getAppointmentDate(), appointment.getStartTime());
            LocalDateTime now = LocalDateTime.now();
            if (appointmentDateTime.isBefore(now)) {
                throw new BadRequestException("Cannot cancel an appointment that has already passed");
            }
            long hoursUntilAppointment = Duration.between(now, appointmentDateTime).toHours();
            if (hoursUntilAppointment < cancellationCutoffHours) {
                throw new BadRequestException("Appointments cannot be cancelled within " + cancellationCutoffHours + " hours of the scheduled time.");
            }
        }

        Appointment.Status oldStatus = appointment.getStatus();
        appointment.setStatus(Appointment.Status.CANCELLED);
        appointment.setCancellationReason(reason != null && !reason.isBlank() ? reason : "Cancelled by " + currentUser.getRole().name().replace("ROLE_", ""));

        Appointment updated = appointmentRepository.save(appointment);

        AppointmentStatusHistory history = new AppointmentStatusHistory(
                updated, oldStatus, Appointment.Status.CANCELLED, currentUser, "Cancelled. Reason: " + updated.getCancellationReason()
        );
        statusHistoryRepository.save(history);

        // Notify both parties
        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Appointment Cancelled",
                "Your appointment (" + appointment.getAppointmentReference() + ") on " + appointment.getAppointmentDate() + " has been cancelled.",
                "APPOINTMENT_CANCELLED",
                appointment.getAppointmentReference()
        );

        notificationService.createNotification(
                appointment.getDoctor().getUser(),
                "Appointment Cancelled",
                "Consultation (" + appointment.getAppointmentReference() + ") on " + appointment.getAppointmentDate() + " has been cancelled.",
                "APPOINTMENT_CANCELLED",
                appointment.getAppointmentReference()
        );

        auditLogService.logAction(currentUser, "CANCEL_APPOINTMENT", "Appointment", String.valueOf(updated.getId()),
                "Cancelled with reason: " + updated.getCancellationReason());

        return mapper.toAppointmentResponseDto(updated);
    }

    @Transactional
    public AppointmentResponseDto updateAppointmentStatus(Long appointmentId, AppointmentStatusUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("User not authenticated"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(userId);
        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");

        if (!isDoctor && !isAdmin) {
            throw new ForbiddenException("Only the attending doctor or an administrator can update appointment status");
        }

        Appointment.Status oldStatus = appointment.getStatus();
        Appointment.Status newStatus = request.getStatus();

        if (oldStatus == newStatus) {
            return mapper.toAppointmentResponseDto(appointment);
        }

        // Validate state transitions
        if (oldStatus == Appointment.Status.CANCELLED) {
            throw new BadRequestException("Cannot transition a cancelled appointment");
        }
        if (oldStatus == Appointment.Status.COMPLETED && newStatus != Appointment.Status.COMPLETED) {
            throw new BadRequestException("Cannot change status of an already completed appointment");
        }

        appointment.setStatus(newStatus);
        Appointment updated = appointmentRepository.save(appointment);

        AppointmentStatusHistory history = new AppointmentStatusHistory(
                updated, oldStatus, newStatus, currentUser, request.getComments()
        );
        statusHistoryRepository.save(history);

        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Appointment Status Updated",
                "Your appointment status is now: " + newStatus.name(),
                "STATUS_CHANGE",
                appointment.getAppointmentReference()
        );

        auditLogService.logAction(currentUser, "UPDATE_APPOINTMENT_STATUS", "Appointment", String.valueOf(updated.getId()),
                "Status changed from " + oldStatus + " to " + newStatus);

        return mapper.toAppointmentResponseDto(updated);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getMyAppointments(Appointment.Status status) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Appointment> list;
        if (user.getRole() == Role.ROLE_PATIENT) {
            PatientProfile patient = patientProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found"));
            list = appointmentRepository.findByPatientIdOrderByAppointmentDateDescStartTimeDesc(patient.getId());
        } else if (user.getRole() == Role.ROLE_DOCTOR) {
            DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
            list = appointmentRepository.findByDoctorIdOrderByAppointmentDateDescStartTimeDesc(doctor.getId());
        } else {
            return List.of();
        }

        if (status != null) {
            list = list.stream().filter(a -> a.getStatus() == status).collect(Collectors.toList());
        }

        return list.stream().map(mapper::toAppointmentResponseDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentById(Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);
        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(userId);
        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");

        if (!isPatient && !isDoctor && !isAdmin) {
            throw new ForbiddenException("You are not authorized to view this appointment");
        }

        return mapper.toAppointmentResponseDto(appointment);
    }

    @Transactional(readOnly = true)
    public PageResponse<AppointmentResponseDto> searchAppointmentsForAdmin(
            Appointment.Status status, LocalDate date, Long doctorId, Long patientId, String query, Pageable pageable) {
        Page<Appointment> page = appointmentRepository.searchAppointments(status, date, doctorId, patientId, query, pageable);
        return PageResponse.of(page, page.getContent().stream().map(mapper::toAppointmentResponseDto).collect(Collectors.toList()));
    }
}
