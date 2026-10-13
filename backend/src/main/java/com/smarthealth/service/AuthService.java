package com.smarthealth.service;

import com.smarthealth.dto.auth.*;
import com.smarthealth.entity.PatientProfile;
import com.smarthealth.entity.RefreshToken;
import com.smarthealth.entity.Role;
import com.smarthealth.entity.User;
import com.smarthealth.exception.BadRequestException;
import com.smarthealth.exception.ConflictException;
import com.smarthealth.exception.ResourceNotFoundException;
import com.smarthealth.exception.UnauthorizedException;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.PatientProfileRepository;
import com.smarthealth.repository.RefreshTokenRepository;
import com.smarthealth.repository.UserRepository;
import com.smarthealth.security.JwtTokenProvider;
import com.smarthealth.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PatientProfileRepository patientProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final EntityDtoMapper mapper;
    private final AuditLogService auditLogService;

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public AuthService(UserRepository userRepository,
                       PatientProfileRepository patientProfileRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       EntityDtoMapper mapper,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.patientProfileRepository = patientProfileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.mapper = mapper;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail().toLowerCase().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.ROLE_PATIENT);
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setEnabled(true);

        User savedUser = userRepository.save(user);

        PatientProfile profile = new PatientProfile(savedUser);
        if (request.getDateOfBirth() != null && !request.getDateOfBirth().isBlank()) {
            try {
                profile.setDateOfBirth(LocalDate.parse(request.getDateOfBirth()));
            } catch (Exception ignored) {}
        }
        profile.setGender(request.getGender());
        profile.setBloodGroup(request.getBloodGroup());
        profile.setAddress(request.getAddress());
        profile.setEmergencyContact(request.getEmergencyContact());
        patientProfileRepository.save(profile);
        savedUser.setPatientProfile(profile);

        String jwt = tokenProvider.generateTokenFromUser(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        RefreshToken refreshToken = createRefreshToken(savedUser);

        auditLogService.logAction(savedUser, "REGISTER", "User", String.valueOf(savedUser.getId()), "Patient registered");

        return new AuthResponse(jwt, refreshToken.getToken(), mapper.toUserSummaryDto(savedUser));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        String jwt = tokenProvider.generateToken(authentication);
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.isEnabled()) {
            throw new UnauthorizedException("User account is disabled. Please contact administrator.");
        }

        RefreshToken refreshToken = createRefreshToken(user);

        auditLogService.logAction(user, "LOGIN", "User", String.valueOf(user.getId()), "User login successful");

        return new AuthResponse(jwt, refreshToken.getToken(), mapper.toUserSummaryDto(user));
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new UnauthorizedException("Refresh token has expired. Please log in again.");
        }

        User user = refreshToken.getUser();
        String newJwt = tokenProvider.generateTokenFromUser(user.getId(), user.getEmail(), user.getRole().name());

        return new AuthResponse(newJwt, refreshToken.getToken(), mapper.toUserSummaryDto(user));
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapper.toUserSummaryDto(user);
    }

    @Transactional
    public void logout() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId != null) {
            userRepository.findById(userId).ifPresent(refreshTokenRepository::deleteByUser);
        }
    }

    private RefreshToken createRefreshToken(User user) {
        refreshTokenRepository.deleteByUser(user);
        refreshTokenRepository.flush();

        RefreshToken refreshToken = new RefreshToken(
                user,
                UUID.randomUUID().toString(),
                Instant.now().plusMillis(refreshExpirationMs)
        );
        return refreshTokenRepository.save(refreshToken);
    }
}
