package com.smarthealth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
public class SmartHealthApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartHealthApplication.class, args);
    }
}
