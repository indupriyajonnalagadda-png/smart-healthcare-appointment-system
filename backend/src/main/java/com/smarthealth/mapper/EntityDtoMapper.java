package com.smarthealth.mapper;

import com.smarthealth.dto.admin.AuditLogDto;
import com.smarthealth.dto.appointment.AppointmentResponseDto;
import com.smarthealth.dto.auth.UserSummaryDto;
import com.smarthealth.dto.department.DepartmentDto;
import com.smarthealth.dto.department.SpecializationDto;
import com.smarthealth.dto.doctor.AvailabilityExceptionDto;
import com.smarthealth.dto.doctor.DoctorAvailabilityDto;
import com.smarthealth.dto.doctor.DoctorDetailDto;
import com.smarthealth.dto.doctor.DoctorSummaryDto;
import com.smarthealth.dto.patient.PatientProfileDto;
import com.smarthealth.dto.prescription.ConsultationNoteDto;
import com.smarthealth.dto.prescription.PrescriptionItemDto;
import com.smarthealth.dto.prescription.PrescriptionResponseDto;
import com.smarthealth.entity.*;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class EntityDtoMapper {

    public UserSummaryDto toUserSummaryDto(User user) {
        if (user == null) return null;
        Long profileId = null;
        if (user.getRole() == Role.ROLE_PATIENT && user.getPatientProfile() != null) {
            profileId = user.getPatientProfile().getId();
        } else if (user.getRole() == Role.ROLE_DOCTOR && user.getDoctorProfile() != null) {
            profileId = user.getDoctorProfile().getId();
        }
        return new UserSummaryDto(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                profileId
        );
    }

    public PatientProfileDto toPatientProfileDto(PatientProfile profile) {
        if (profile == null) return null;
        PatientProfileDto dto = new PatientProfileDto();
        dto.setId(profile.getId());
        if (profile.getUser() != null) {
            dto.setUserId(profile.getUser().getId());
            dto.setEmail(profile.getUser().getEmail());
            dto.setFirstName(profile.getUser().getFirstName());
            dto.setLastName(profile.getUser().getLastName());
            dto.setPhone(profile.getUser().getPhone());
        }
        dto.setDateOfBirth(profile.getDateOfBirth());
        dto.setGender(profile.getGender());
        dto.setBloodGroup(profile.getBloodGroup());
        dto.setAddress(profile.getAddress());
        dto.setEmergencyContact(profile.getEmergencyContact());
        dto.setMedicalHistorySummary(profile.getMedicalHistorySummary());
        return dto;
    }

    public DoctorSummaryDto toDoctorSummaryDto(DoctorProfile doctor) {
        if (doctor == null) return null;
        DoctorSummaryDto dto = new DoctorSummaryDto();
        dto.setId(doctor.getId());
        if (doctor.getUser() != null) {
            dto.setUserId(doctor.getUser().getId());
            dto.setFirstName(doctor.getUser().getFirstName());
            dto.setLastName(doctor.getUser().getLastName());
            dto.setEmail(doctor.getUser().getEmail());
            dto.setPhone(doctor.getUser().getPhone());
        }
        if (doctor.getDepartment() != null) {
            dto.setDepartmentId(doctor.getDepartment().getId());
            dto.setDepartmentName(doctor.getDepartment().getName());
        }
        if (doctor.getSpecializations() != null) {
            dto.setSpecializations(doctor.getSpecializations().stream()
                    .map(Specialization::getName)
                    .collect(Collectors.toList()));
        }
        dto.setQualifications(doctor.getQualifications());
        dto.setExperienceYears(doctor.getExperienceYears());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setConsultationModes(doctor.getConsultationModes());
        dto.setRating(doctor.getRating());
        dto.setReviewCount(doctor.getReviewCount());
        dto.setApprovalStatus(doctor.getApprovalStatus());
        dto.setActive(doctor.isActive());
        return dto;
    }

    public DoctorDetailDto toDoctorDetailDto(DoctorProfile doctor) {
        if (doctor == null) return null;
        DoctorDetailDto dto = new DoctorDetailDto();
        dto.setId(doctor.getId());
        if (doctor.getUser() != null) {
            dto.setUserId(doctor.getUser().getId());
            dto.setFirstName(doctor.getUser().getFirstName());
            dto.setLastName(doctor.getUser().getLastName());
            dto.setEmail(doctor.getUser().getEmail());
            dto.setPhone(doctor.getUser().getPhone());
        }
        if (doctor.getDepartment() != null) {
            dto.setDepartmentId(doctor.getDepartment().getId());
            dto.setDepartmentName(doctor.getDepartment().getName());
        }
        if (doctor.getSpecializations() != null) {
            dto.setSpecializations(doctor.getSpecializations().stream()
                    .map(this::toSpecializationDto)
                    .collect(Collectors.toList()));
        }
        dto.setLicenseNumber(doctor.getLicenseNumber());
        dto.setQualifications(doctor.getQualifications());
        dto.setExperienceYears(doctor.getExperienceYears());
        dto.setConsultationFee(doctor.getConsultationFee());
        dto.setBio(doctor.getBio());
        dto.setConsultationModes(doctor.getConsultationModes());
        dto.setRating(doctor.getRating());
        dto.setReviewCount(doctor.getReviewCount());
        dto.setApprovalStatus(doctor.getApprovalStatus());
        dto.setActive(doctor.isActive());

        if (doctor.getAvailabilities() != null) {
            dto.setAvailabilities(doctor.getAvailabilities().stream()
                    .map(this::toDoctorAvailabilityDto)
                    .collect(Collectors.toList()));
        }
        if (doctor.getExceptions() != null) {
            dto.setExceptions(doctor.getExceptions().stream()
                    .map(this::toAvailabilityExceptionDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public DoctorAvailabilityDto toDoctorAvailabilityDto(DoctorAvailability avail) {
        if (avail == null) return null;
        return new DoctorAvailabilityDto(
                avail.getId(),
                avail.getDayOfWeek(),
                avail.getStartTime(),
                avail.getEndTime(),
                avail.getSlotDurationMinutes(),
                avail.isActive()
        );
    }

    public AvailabilityExceptionDto toAvailabilityExceptionDto(AvailabilityException exception) {
        if (exception == null) return null;
        return new AvailabilityExceptionDto(
                exception.getId(),
                exception.getExceptionDate(),
                exception.getStartTime(),
                exception.getEndTime(),
                exception.getReason(),
                exception.isAllDay()
        );
    }

    public DepartmentDto toDepartmentDto(Department department) {
        if (department == null) return null;
        DepartmentDto dto = new DepartmentDto(
                department.getId(),
                department.getName(),
                department.getDescription(),
                department.getIconName()
        );
        if (department.getSpecializations() != null) {
            dto.setSpecializations(department.getSpecializations().stream()
                    .map(this::toSpecializationDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    public SpecializationDto toSpecializationDto(Specialization spec) {
        if (spec == null) return null;
        return new SpecializationDto(
                spec.getId(),
                spec.getDepartment() != null ? spec.getDepartment().getId() : null,
                spec.getDepartment() != null ? spec.getDepartment().getName() : null,
                spec.getName(),
                spec.getDescription()
        );
    }

    public AppointmentResponseDto toAppointmentResponseDto(Appointment appointment) {
        if (appointment == null) return null;
        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.setId(appointment.getId());
        dto.setAppointmentReference(appointment.getAppointmentReference());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setConsultationType(appointment.getConsultationType());
        dto.setStatus(appointment.getStatus());
        dto.setSymptomSummary(appointment.getSymptomSummary());
        dto.setFee(appointment.getFee());
        dto.setPaymentStatus(appointment.getPaymentStatus());
        dto.setCancellationReason(appointment.getCancellationReason());
        dto.setCreatedAt(appointment.getCreatedAt());

        if (appointment.getPatient() != null) {
            dto.setPatientId(appointment.getPatient().getId());
            if (appointment.getPatient().getUser() != null) {
                dto.setPatientName(appointment.getPatient().getUser().getFullName());
                dto.setPatientEmail(appointment.getPatient().getUser().getEmail());
                dto.setPatientPhone(appointment.getPatient().getUser().getPhone());
            }
        }

        if (appointment.getDoctor() != null) {
            dto.setDoctorId(appointment.getDoctor().getId());
            if (appointment.getDoctor().getUser() != null) {
                dto.setDoctorName(appointment.getDoctor().getUser().getFullName());
            }
            if (appointment.getDoctor().getDepartment() != null) {
                dto.setDepartmentName(appointment.getDoctor().getDepartment().getName());
            }
            if (appointment.getDoctor().getSpecializations() != null && !appointment.getDoctor().getSpecializations().isEmpty()) {
                dto.setDoctorSpecialization(appointment.getDoctor().getSpecializations().iterator().next().getName());
            }
        }

        dto.setHasPrescription(appointment.getPrescription() != null);
        dto.setHasConsultationNote(appointment.getConsultationNote() != null);

        return dto;
    }

    public PrescriptionResponseDto toPrescriptionResponseDto(Prescription prescription) {
        if (prescription == null) return null;
        PrescriptionResponseDto dto = new PrescriptionResponseDto();
        dto.setId(prescription.getId());
        dto.setDiagnosis(prescription.getDiagnosis());
        dto.setClinicalAdvice(prescription.getClinicalAdvice());
        dto.setFollowUpDate(prescription.getFollowUpDate());
        dto.setCreatedAt(prescription.getCreatedAt());

        if (prescription.getAppointment() != null) {
            dto.setAppointmentId(prescription.getAppointment().getId());
            dto.setAppointmentReference(prescription.getAppointment().getAppointmentReference());
            if (prescription.getAppointment().getConsultationNote() != null) {
                dto.setConsultationNote(toConsultationNoteDto(prescription.getAppointment().getConsultationNote()));
            }
        }

        if (prescription.getDoctor() != null) {
            dto.setDoctorId(prescription.getDoctor().getId());
            if (prescription.getDoctor().getUser() != null) {
                dto.setDoctorName(prescription.getDoctor().getUser().getFullName());
            }
            dto.setDoctorQualifications(prescription.getDoctor().getQualifications());
            if (prescription.getDoctor().getDepartment() != null) {
                dto.setDepartmentName(prescription.getDoctor().getDepartment().getName());
            }
        }

        if (prescription.getPatient() != null) {
            dto.setPatientId(prescription.getPatient().getId());
            if (prescription.getPatient().getUser() != null) {
                dto.setPatientName(prescription.getPatient().getUser().getFullName());
            }
        }

        if (prescription.getItems() != null) {
            dto.setItems(prescription.getItems().stream()
                    .map(this::toPrescriptionItemDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public PrescriptionItemDto toPrescriptionItemDto(PrescriptionItem item) {
        if (item == null) return null;
        return new PrescriptionItemDto(
                item.getId(),
                item.getMedicineName(),
                item.getDosage(),
                item.getFrequency(),
                item.getDuration(),
                item.getInstructions()
        );
    }

    public ConsultationNoteDto toConsultationNoteDto(ConsultationNote note) {
        if (note == null) return null;
        return new ConsultationNoteDto(
                note.getId(),
                note.getAppointment() != null ? note.getAppointment().getId() : null,
                note.getPatientVitals(),
                note.getSubjectiveNotes(),
                note.getObjectiveFindings(),
                note.getAssessment(),
                note.getPlan(),
                note.getCreatedAt()
        );
    }

    public AuditLogDto toAuditLogDto(AuditLog log) {
        if (log == null) return null;
        Long userId = null;
        String userEmail = null;
        String userName = null;
        if (log.getUser() != null) {
            userId = log.getUser().getId();
            userEmail = log.getUser().getEmail();
            userName = log.getUser().getFullName();
        }
        return new AuditLogDto(
                log.getId(),
                userId,
                userEmail,
                userName,
                log.getAction(),
                log.getEntityName(),
                log.getEntityId(),
                log.getIpAddress(),
                log.getDetails(),
                log.getCreatedAt()
        );
    }
}
