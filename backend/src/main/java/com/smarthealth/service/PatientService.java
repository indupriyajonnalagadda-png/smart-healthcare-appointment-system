package com.smarthealth.service;

import com.smarthealth.dto.patient.PatientProfileDto;
import com.smarthealth.dto.patient.PatientProfileUpdateRequest;
import com.smarthealth.entity.PatientProfile;
import com.smarthealth.entity.User;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.PatientProfileRepository;
import com.smarthealth.repository.UserRepository;
import com.smarthealth.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PatientService {

    private final PatientProfileRepository patientProfileRepository;
    private final UserRepository userRepository;
    private final EntityDtoMapper mapper;

    public PatientService(PatientProfileRepository patientProfileRepository,
                          UserRepository userRepository,
                          EntityDtoMapper mapper) {
        this.patientProfileRepository = patientProfileRepository;
        this.userRepository = userRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public PatientProfileDto getCurrentPatientProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient profile not found for current user"));
        return mapper.toPatientProfileDto(profile);
    }

    @Transactional
    public PatientProfileDto updateCurrentPatientProfile(PatientProfileUpdateRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

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

        PatientProfile profile = patientProfileRepository.findByUserId(userId)
                .orElseGet(() -> new PatientProfile(user));

        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }
        if (request.getBloodGroup() != null) {
            profile.setBloodGroup(request.getBloodGroup());
        }
        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress());
        }
        if (request.getEmergencyContact() != null) {
            profile.setEmergencyContact(request.getEmergencyContact());
        }
        if (request.getMedicalHistorySummary() != null) {
            profile.setMedicalHistorySummary(request.getMedicalHistorySummary());
        }

        PatientProfile updated = patientProfileRepository.save(profile);
        return mapper.toPatientProfileDto(updated);
    }
}
