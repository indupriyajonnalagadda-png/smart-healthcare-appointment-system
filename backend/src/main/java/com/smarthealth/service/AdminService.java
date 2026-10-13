package com.smarthealth.service;

import com.smarthealth.dto.admin.AdminDashboardStatsDto;
import com.smarthealth.dto.auth.UserSummaryDto;
import com.smarthealth.dto.common.PageResponse;
import com.smarthealth.dto.doctor.DoctorApprovalRequest;
import com.smarthealth.dto.doctor.DoctorCreateRequest;
import com.smarthealth.dto.doctor.DoctorDetailDto;
import com.smarthealth.dto.doctor.DoctorSummaryDto;
import com.smarthealth.entity.*;
import com.smarthealth.exception.ConflictException;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.*;
import com.smarthealth.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final DoctorProfileRepository doctorProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final SpecializationRepository specializationRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;
    private final EntityDtoMapper mapper;

    public AdminService(UserRepository userRepository,
                        DoctorProfileRepository doctorProfileRepository,
                        DepartmentRepository departmentRepository,
                        SpecializationRepository specializationRepository,
                        AppointmentRepository appointmentRepository,
                        PasswordEncoder passwordEncoder,
                        AuditLogService auditLogService,
                        EntityDtoMapper mapper) {
        this.userRepository = userRepository;
        this.doctorProfileRepository = doctorProfileRepository;
        this.departmentRepository = departmentRepository;
        this.specializationRepository = specializationRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public AdminDashboardStatsDto getDashboardStats() {
        AdminDashboardStatsDto stats = new AdminDashboardStatsDto();

        long totalPatients = userRepository.countByRole(Role.ROLE_PATIENT);
        long totalDoctors = userRepository.countByRole(Role.ROLE_DOCTOR);
        long pendingApprovals = doctorProfileRepository.countByApprovalStatusAndActive("PENDING", true);

        long totalAppointments = appointmentRepository.count();
        long confirmed = appointmentRepository.countByStatus(Appointment.Status.CONFIRMED);
        long completed = appointmentRepository.countByStatus(Appointment.Status.COMPLETED);
        long cancelled = appointmentRepository.countByStatus(Appointment.Status.CANCELLED);

        // Sum revenue of completed or confirmed appointments
        List<Appointment> allAppointments = appointmentRepository.findAll();
        BigDecimal totalRevenue = allAppointments.stream()
                .filter(a -> a.getStatus() == Appointment.Status.CONFIRMED || a.getStatus() == Appointment.Status.COMPLETED)
                .map(Appointment::getFee)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> byDepartment = new HashMap<>();
        for (Appointment a : allAppointments) {
            if (a.getDoctor() != null && a.getDoctor().getDepartment() != null) {
                String deptName = a.getDoctor().getDepartment().getName();
                byDepartment.put(deptName, byDepartment.getOrDefault(deptName, 0L) + 1L);
            }
        }

        stats.setTotalPatients(totalPatients);
        stats.setTotalDoctors(totalDoctors);
        stats.setPendingDoctorApprovals(pendingApprovals);
        stats.setTotalAppointments(totalAppointments);
        stats.setConfirmedAppointments(confirmed);
        stats.setCompletedAppointments(completed);
        stats.setCancelledAppointments(cancelled);
        stats.setTotalRevenue(totalRevenue);
        stats.setAppointmentsByDepartment(byDepartment);

        return stats;
    }

    @Transactional(readOnly = true)
    public PageResponse<UserSummaryDto> getAllUsers(Role role, Pageable pageable) {
        Page<User> page = (role != null)
                ? userRepository.findByRole(role, pageable)
                : userRepository.findAll(pageable);

        return PageResponse.of(page, page.getContent().stream().map(mapper::toUserSummaryDto).collect(Collectors.toList()));
    }

    @Transactional
    public UserSummaryDto updateUserStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setEnabled(enabled);
        User saved = userRepository.save(user);

        User currentUser = userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null);
        auditLogService.logAction(currentUser, "UPDATE_USER_STATUS", "User", String.valueOf(saved.getId()),
                "User " + saved.getEmail() + " status changed to enabled=" + enabled);

        return mapper.toUserSummaryDto(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<DoctorSummaryDto> getAllDoctors(String approvalStatus, Pageable pageable) {
        Page<DoctorProfile> page = doctorProfileRepository.searchDoctors(
                null, null, null, approvalStatus, null, pageable
        );
        return PageResponse.of(page, page.getContent().stream().map(mapper::toDoctorSummaryDto).collect(Collectors.toList()));
    }

    @Transactional
    public DoctorDetailDto approveDoctor(Long doctorId, DoctorApprovalRequest request) {
        DoctorProfile doctor = doctorProfileRepository.findById(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + doctorId));

        if (request.getApprovalStatus() != null) {
            doctor.setApprovalStatus(request.getApprovalStatus().toUpperCase());
        }
        if (request.getActive() != null) {
            doctor.setActive(request.getActive());
        }

        DoctorProfile saved = doctorProfileRepository.save(doctor);

        User currentUser = userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null);
        auditLogService.logAction(currentUser, "APPROVE_DOCTOR", "DoctorProfile", String.valueOf(saved.getId()),
                "Doctor " + saved.getUser().getEmail() + " approvalStatus=" + saved.getApprovalStatus());

        return mapper.toDoctorDetailDto(saved);
    }

    @Transactional
    public DoctorDetailDto createDoctor(DoctorCreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_DOCTOR);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        DoctorProfile doctor = new DoctorProfile(savedUser, department, request.getLicenseNumber(), request.getQualifications());
        doctor.setExperienceYears(request.getExperienceYears());
        doctor.setConsultationFee(request.getConsultationFee());
        doctor.setBio(request.getBio());
        doctor.setConsultationModes(request.getConsultationModes());
        doctor.setApprovalStatus("APPROVED");
        doctor.setActive(true);

        if (request.getSpecializationIds() != null && !request.getSpecializationIds().isEmpty()) {
            List<Specialization> specs = specializationRepository.findAllById(request.getSpecializationIds());
            doctor.setSpecializations(new HashSet<>(specs));
        }

        DoctorProfile savedDoctor = doctorProfileRepository.save(doctor);
        savedUser.setDoctorProfile(savedDoctor);

        User currentUser = userRepository.findById(SecurityUtils.getCurrentUserId()).orElse(null);
        auditLogService.logAction(currentUser, "CREATE_DOCTOR", "DoctorProfile", String.valueOf(savedDoctor.getId()),
                "Doctor created: " + savedUser.getEmail());

        return mapper.toDoctorDetailDto(savedDoctor);
    }
}
