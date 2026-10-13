package com.smarthealth.service;

import com.smarthealth.dto.auth.AuthResponse;
import com.smarthealth.dto.auth.LoginRequest;
import com.smarthealth.dto.auth.RegisterRequest;
import com.smarthealth.dto.auth.UserSummaryDto;
import com.smarthealth.entity.RefreshToken;
import com.smarthealth.entity.Role;
import com.smarthealth.entity.User;
import com.smarthealth.exception.ConflictException;
import com.smarthealth.exception.UnauthorizedException;
import com.smarthealth.mapper.EntityDtoMapper;
import com.smarthealth.repository.PatientProfileRepository;
import com.smarthealth.repository.RefreshTokenRepository;
import com.smarthealth.repository.UserRepository;
import com.smarthealth.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PatientProfileRepository patientProfileRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private EntityDtoMapper mapper;

    @Mock
    private AuditLogService auditLogService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                patientProfileRepository,
                refreshTokenRepository,
                passwordEncoder,
                authenticationManager,
                tokenProvider,
                mapper,
                auditLogService
        );
    }

    @Test
    @DisplayName("Should successfully register patient when email is not taken")
    void testRegisterSuccess() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("newpatient@example.com");
        req.setPassword("Secret@123");
        req.setFirstName("Jane");
        req.setLastName("Doe");

        when(userRepository.existsByEmail("newpatient@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret@123")).thenReturn("encodedPassword");

        User saved = new User();
        saved.setId(101L);
        saved.setEmail("newpatient@example.com");
        saved.setRole(Role.ROLE_PATIENT);
        saved.setFirstName("Jane");
        saved.setLastName("Doe");
        saved.setEnabled(true);

        when(userRepository.save(any(User.class))).thenReturn(saved);
        when(tokenProvider.generateTokenFromUser(eq(101L), eq("newpatient@example.com"), eq("ROLE_PATIENT")))
                .thenReturn("mock-jwt-token");
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArguments()[0]);

        UserSummaryDto summary = new UserSummaryDto(101L, "newpatient@example.com", Role.ROLE_PATIENT, "Jane", "Doe", null, 1L);
        when(mapper.toUserSummaryDto(saved)).thenReturn(summary);

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("mock-jwt-token", resp.getToken());
        assertEquals("newpatient@example.com", resp.getUser().getEmail());
        verify(auditLogService, times(1)).logAction(any(), eq("REGISTER"), any(), any(), any());
    }

    @Test
    @DisplayName("Should throw ConflictException on duplicate email registration")
    void testRegisterDuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@example.com");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should successfully log in valid active user")
    void testLoginSuccess() {
        LoginRequest req = new LoginRequest();
        req.setEmail("user@example.com");
        req.setPassword("Secret@123");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(tokenProvider.generateToken(auth)).thenReturn("mock-jwt");

        User user = new User();
        user.setId(5L);
        user.setEmail("user@example.com");
        user.setEnabled(true);
        user.setRole(Role.ROLE_PATIENT);

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(i -> i.getArguments()[0]);

        UserSummaryDto summary = new UserSummaryDto(5L, "user@example.com", Role.ROLE_PATIENT, "User", "One", null, 2L);
        when(mapper.toUserSummaryDto(user)).thenReturn(summary);

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("mock-jwt", resp.getToken());
        verify(auditLogService).logAction(eq(user), eq("LOGIN"), any(), any(), any());
    }

    @Test
    @DisplayName("Should reject disabled user login with UnauthorizedException")
    void testLoginDisabledUser() {
        LoginRequest req = new LoginRequest();
        req.setEmail("disabled@example.com");
        req.setPassword("Secret@123");

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any())).thenReturn(auth);

        User disabledUser = new User();
        disabledUser.setId(6L);
        disabledUser.setEmail("disabled@example.com");
        disabledUser.setEnabled(false);

        when(userRepository.findByEmail("disabled@example.com")).thenReturn(Optional.of(disabledUser));

        assertThrows(UnauthorizedException.class, () -> authService.login(req));
    }
}
