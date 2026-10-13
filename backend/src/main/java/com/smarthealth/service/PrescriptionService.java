package com.smarthealth.service;

import com.smarthealth.dto.prescription.PrescriptionCreateRequest;
import com.smarthealth.dto.prescription.PrescriptionItemDto;
import com.smarthealth.dto.prescription.PrescriptionResponseDto;
import com.smarthealth.entity.*;
import com.smarthealth.exception.BadRequestException;
import com.smarthealth.exception.ForbiddenException;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.*;
import com.smarthealth.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final ConsultationNoteRepository consultationNoteRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentStatusHistoryRepository statusHistoryRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;
    private final EntityDtoMapper mapper;

    public PrescriptionService(PrescriptionRepository prescriptionRepository,
                               ConsultationNoteRepository consultationNoteRepository,
                               AppointmentRepository appointmentRepository,
                               AppointmentStatusHistoryRepository statusHistoryRepository,
                               PatientProfileRepository patientProfileRepository,
                               DoctorProfileRepository doctorProfileRepository,
                               UserRepository userRepository,
                               NotificationService notificationService,
                               AuditLogService auditLogService,
                               EntityDtoMapper mapper) {
        this.prescriptionRepository = prescriptionRepository;
        this.consultationNoteRepository = consultationNoteRepository;
        this.appointmentRepository = appointmentRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.mapper = mapper;
    }

    @Transactional
    public PrescriptionResponseDto createPrescription(Long appointmentId, PrescriptionCreateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        if (!appointment.getDoctor().getUser().getId().equals(userId)) {
            throw new ForbiddenException("Only the assigned doctor can add prescriptions for this appointment");
        }

        if (appointment.getStatus() == Appointment.Status.CANCELLED) {
            throw new BadRequestException("Cannot create a prescription for a cancelled appointment");
        }

        // Create or update Consultation Note if note details provided
        if (request.getAssessment() != null || request.getPlan() != null || request.getPatientVitals() != null) {
            ConsultationNote note = consultationNoteRepository.findByAppointmentId(appointmentId)
                    .orElseGet(() -> new ConsultationNote(appointment, appointment.getDoctor(), request.getAssessment(), request.getPlan()));

            note.setPatientVitals(request.getPatientVitals());
            note.setSubjectiveNotes(request.getSubjectiveNotes());
            note.setObjectiveFindings(request.getObjectiveFindings());
            note.setAssessment(request.getAssessment());
            note.setPlan(request.getPlan());
            consultationNoteRepository.save(note);
        }

        // Create or update Prescription
        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseGet(() -> new Prescription(
                        appointment,
                        appointment.getDoctor(),
                        appointment.getPatient(),
                        request.getDiagnosis(),
                        request.getClinicalAdvice()
                ));

        prescription.setDiagnosis(request.getDiagnosis());
        prescription.setClinicalAdvice(request.getClinicalAdvice());
        prescription.setFollowUpDate(request.getFollowUpDate());
        prescription.getItems().clear();

        if (request.getItems() != null) {
            for (PrescriptionItemDto itemDto : request.getItems()) {
                PrescriptionItem item = new PrescriptionItem(
                        itemDto.getMedicineName(),
                        itemDto.getDosage(),
                        itemDto.getFrequency(),
                        itemDto.getDuration(),
                        itemDto.getInstructions()
                );
                prescription.addItem(item);
            }
        }

        Prescription saved = prescriptionRepository.save(prescription);

        // Mark appointment as COMPLETED if not already
        if (appointment.getStatus() != Appointment.Status.COMPLETED) {
            Appointment.Status oldStatus = appointment.getStatus();
            appointment.setStatus(Appointment.Status.COMPLETED);
            appointmentRepository.save(appointment);

            AppointmentStatusHistory history = new AppointmentStatusHistory(
                    appointment, oldStatus, Appointment.Status.COMPLETED, currentUser, "Completed with prescription"
            );
            statusHistoryRepository.save(history);
        }

        notificationService.createNotification(
                appointment.getPatient().getUser(),
                "Prescription Ready",
                "Dr. " + appointment.getDoctor().getUser().getFullName() + " has added your prescription for appointment " + appointment.getAppointmentReference() + ".",
                "PRESCRIPTION_READY",
                appointment.getAppointmentReference()
        );

        auditLogService.logAction(currentUser, "ADD_PRESCRIPTION", "Prescription", String.valueOf(saved.getId()),
                "Added prescription for appointment " + appointment.getAppointmentReference());

        return mapper.toPrescriptionResponseDto(saved);
    }

    @Transactional(readOnly = true)
    public PrescriptionResponseDto getPrescriptionByAppointment(Long appointmentId) {
        Long userId = SecurityUtils.getCurrentUserId();
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));

        boolean isPatient = appointment.getPatient().getUser().getId().equals(userId);
        boolean isDoctor = appointment.getDoctor().getUser().getId().equals(userId);
        boolean isAdmin = SecurityUtils.hasRole("ROLE_ADMIN");

        if (!isPatient && !isDoctor && !isAdmin) {
            throw new ForbiddenException("You are not authorized to view this prescription");
        }

        Prescription prescription = prescriptionRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("No prescription found for appointment id: " + appointmentId));

        return mapper.toPrescriptionResponseDto(prescription);
    }

    @Transactional(readOnly = true)
    public List<PrescriptionResponseDto> getMyPrescriptions() {
        Long userId = SecurityUtils.getCurrentUserId();
        PatientProfile patient = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for current user"));

        return prescriptionRepository.findByPatientIdOrderByCreatedAtDesc(patient.getId()).stream()
                .map(mapper::toPrescriptionResponseDto)
                .collect(Collectors.toList());
    }
}
