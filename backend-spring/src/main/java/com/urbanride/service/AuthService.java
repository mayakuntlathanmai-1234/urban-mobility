package com.urbanride.service;

import com.urbanride.dto.AuthResponse;
import com.urbanride.dto.LoginRequest;
import com.urbanride.dto.RegisterRequest;
import com.urbanride.entity.Driver;
import com.urbanride.entity.User;
import com.urbanride.entity.Vehicle;
import com.urbanride.enums.RideType;
import com.urbanride.enums.Role;
import com.urbanride.repository.DriverRepository;
import com.urbanride.repository.UserRepository;
import com.urbanride.repository.VehicleRepository;
import com.urbanride.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String driverId = null;
        if (user.getRole() == Role.DRIVER) {
            Optional<Driver> driverOpt = driverRepository.findByUserId(user.getId());
            if (driverOpt.isPresent()) {
                driverId = driverOpt.get().getId();
            }
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), driverId);

        return AuthResponse.builder()
                .token(token)
                .user(user)
                .driverId(driverId)
                .message("Login successful")
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.PASSENGER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone() != null ? request.getPhone() : "+91 98765 43210")
                .role(role)
                .build();

        user = userRepository.save(user);

        String driverId = null;
        if (role == Role.DRIVER) {
            RideType rideType = RideType.SEDAN;
            if (request.getVehicleType() != null) {
                try {
                    rideType = RideType.valueOf(request.getVehicleType().toUpperCase());
                } catch (Exception e) {}
            }

            Driver driver = Driver.builder()
                    .user(user)
                    .licenseNumber("DL-" + System.currentTimeMillis())
                    .isOnline(true)
                    .build();
            driver = driverRepository.save(driver);
            driverId = driver.getId();

            Vehicle vehicle = Vehicle.builder()
                    .driverId(driver.getId())
                    .type(rideType)
                    .make(request.getVehicleMake() != null ? request.getVehicleMake() : "Hyundai")
                    .model(request.getVehicleModel() != null ? request.getVehicleModel() : "i20")
                    .plateNumber(request.getVehiclePlate() != null ? request.getVehiclePlate() : "AP 39 AB " + (1000 + (int)(Math.random()*9000)))
                    .build();
            vehicle = vehicleRepository.save(vehicle);

            driver.setVehicle(vehicle);
            driverRepository.save(driver);
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), role.name(), driverId);

        return AuthResponse.builder()
                .token(token)
                .user(user)
                .driverId(driverId)
                .message("Registration successful")
                .build();
    }
}
