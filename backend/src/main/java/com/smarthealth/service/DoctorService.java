package com.smarthealth.service;

import com.smarthealth.dto.common.PageResponse;
import com.smarthealth.dto.doctor.*;
import com.smarthealth.entity.*;
import com.smarthealth.exception.BadRequestException;
import com.smarthealth.exception.ForbiddenException;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.*;
import com.smarthealth.security.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private final DoctorProfileRepository doctorProfileRepository;
    private final DoctorAvailabilityRepository availabilityRepository;
    private final AvailabilityExceptionRepository exceptionRepository;
    private final DepartmentRepository departmentRepository;
    private final SpecializationRepository specializationRepository;
    private final UserRepository userRepository;
    private final EntityDtoMapper mapper;

    public DoctorService(DoctorProfileRepository doctorProfileRepository,
                         DoctorAvailabilityRepository availabilityRepository,
                         AvailabilityExceptionRepository exceptionRepository,
                         DepartmentRepository departmentRepository,
                         SpecializationRepository specializationRepository,
                         UserRepository userRepository,
                         EntityDtoMapper mapper) {
        this.doctorProfileRepository = doctorProfileRepository;
        this.availabilityRepository = availabilityRepository;
        this.exceptionRepository = exceptionRepository;
        this.departmentRepository = departmentRepository;
        this.specializationRepository = specializationRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public PageResponse<DoctorSummaryDto> searchDoctors(String query, Long departmentId, Long specializationId, Pageable pageable) {
        Page<DoctorProfile> page = doctorProfileRepository.searchDoctors(
                query, departmentId, specializationId, "APPROVED", true, pageable
        );
        return PageResponse.of(page, page.getContent().stream().map(mapper::toDoctorSummaryDto).collect(Collectors.toList()));
    }

    @Transactional(readOnly = true)
    public DoctorDetailDto getDoctorById(Long id) {
        DoctorProfile doctor = doctorProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id: " + id));
        return mapper.toDoctorDetailDto(doctor);
    }

    @Transactional(readOnly = true)
    public DoctorDetailDto getCurrentDoctorProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for current user"));
        return mapper.toDoctorDetailDto(doctor);
    }

    @Transactional
    public DoctorDetailDto updateCurrentDoctorProfile(DoctorProfileUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        User user = doctor.getUser();
        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().isBlank()) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        userRepository.save(user);

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
            doctor.setDepartment(department);
        }

        if (request.getSpecializationIds() != null && !request.getSpecializationIds().isEmpty()) {
            List<Specialization> specs = specializationRepository.findAllById(request.getSpecializationIds());
            doctor.setSpecializations(new HashSet<>(specs));
        }

        if (request.getQualifications() != null) {
            doctor.setQualifications(request.getQualifications());
        }
        if (request.getExperienceYears() > 0) {
            doctor.setExperienceYears(request.getExperienceYears());
        }
        if (request.getConsultationFee() != null) {
            doctor.setConsultationFee(request.getConsultationFee());
        }
        if (request.getBio() != null) {
            doctor.setBio(request.getBio());
        }
        if (request.getConsultationModes() != null) {
            doctor.setConsultationModes(request.getConsultationModes());
        }

        DoctorProfile updated = doctorProfileRepository.save(doctor);
        return mapper.toDoctorDetailDto(updated);
    }

    @Transactional(readOnly = true)
    public List<DoctorAvailabilityDto> getCurrentDoctorAvailability() {
        Long userId = SecurityUtils.getCurrentUserId();
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));
        return availabilityRepository.findByDoctorId(doctor.getId()).stream()
                .map(mapper::toDoctorAvailabilityDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<DoctorAvailabilityDto> updateCurrentDoctorAvailability(List<DoctorAvailabilityDto> dtoList) {
        Long userId = SecurityUtils.getCurrentUserId();
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        availabilityRepository.deleteByDoctorId(doctor.getId());
        availabilityRepository.flush();

        List<DoctorAvailability> newAvailabilities = dtoList.stream().map(dto -> {
            DoctorAvailability avail = new DoctorAvailability();
            avail.setDoctor(doctor);
            avail.setDayOfWeek(dto.getDayOfWeek());
            avail.setStartTime(dto.getStartTime());
            avail.setEndTime(dto.getEndTime());
            avail.setSlotDurationMinutes(dto.getSlotDurationMinutes() > 0 ? dto.getSlotDurationMinutes() : 30);
            avail.setActive(dto.isActive());
            return avail;
        }).collect(Collectors.toList());

        List<DoctorAvailability> saved = availabilityRepository.saveAll(newAvailabilities);
        return saved.stream().map(mapper::toDoctorAvailabilityDto).collect(Collectors.toList());
    }

    @Transactional
    public AvailabilityExceptionDto addAvailabilityException(AvailabilityExceptionDto dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        if (dto.getExceptionDate().isBefore(LocalDate.now())) {
            throw new BadRequestException("Exception date cannot be in the past");
        }

        AvailabilityException exception = new AvailabilityException();
        exception.setDoctor(doctor);
        exception.setExceptionDate(dto.getExceptionDate());
        exception.setStartTime(dto.getStartTime());
        exception.setEndTime(dto.getEndTime());
        exception.setReason(dto.getReason());
        exception.setAllDay(dto.isAllDay());

        AvailabilityException saved = exceptionRepository.save(exception);
        return mapper.toAvailabilityExceptionDto(saved);
    }

    @Transactional
    public void deleteAvailabilityException(Long exceptionId) {
        Long userId = SecurityUtils.getCurrentUserId();
        DoctorProfile doctor = doctorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found"));

        AvailabilityException exception = exceptionRepository.findById(exceptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Availability exception not found"));

        if (!exception.getDoctor().getId().equals(doctor.getId())) {
            throw new ForbiddenException("Cannot delete another doctor's availability exception");
        }

        exceptionRepository.delete(exception);
    }
}
