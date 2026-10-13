package com.smarthealth.service;

import com.smarthealth.entity.User;
import com.smarthealth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        try {
            ensurePassword("admin@smarthealth.com", "Admin@123");
            ensurePassword("dr.sarah@smarthealth.com", "Doctor@123");
            ensurePassword("dr.marcus@smarthealth.com", "Doctor@123");
            ensurePassword("dr.elena@smarthealth.com", "Doctor@123");
            ensurePassword("dr.david@smarthealth.com", "Doctor@123");
            ensurePassword("dr.maya@smarthealth.com", "Doctor@123");
            ensurePassword("dr.robert@smarthealth.com", "Doctor@123");
            ensurePassword("patient.john@smarthealth.com", "Patient@123");
            ensurePassword("patient.jane@smarthealth.com", "Patient@123");
            log.info("Default seed user credentials verified successfully.");
        } catch (Exception ex) {
            log.warn("Notice during DataInitializer execution (may be running in schema init mode): {}", ex.getMessage());
        }
    }

    private void ensurePassword(String email, String rawPassword) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
        });
    }
}
