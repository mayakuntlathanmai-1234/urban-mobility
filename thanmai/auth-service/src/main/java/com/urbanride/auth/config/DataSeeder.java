package com.urbanride.auth.config;

import com.urbanride.auth.entity.User;
import com.urbanride.auth.enums.Role;
import com.urbanride.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            System.out.println("🌱 Seeding Demo Users into urban_auth_db...");
            
            userRepository.save(User.builder()
                    .name("Ramesh Varma (Passenger)")
                    .email("passenger@urbanride.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("+919876543210")
                    .role(Role.PASSENGER)
                    .build());

            userRepository.save(User.builder()
                    .name("Rahul Kumar (Driver)")
                    .email("driver@urbanride.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("+919876543211")
                    .role(Role.DRIVER)
                    .build());

            userRepository.save(User.builder()
                    .name("System Admin")
                    .email("admin@urbanride.com")
                    .password(passwordEncoder.encode("password123"))
                    .phone("+919876543212")
                    .role(Role.ADMIN)
                    .build());

            System.out.println("✅ Demo Users Seeded Successfully into urban_auth_db!");
        }
    }
}
