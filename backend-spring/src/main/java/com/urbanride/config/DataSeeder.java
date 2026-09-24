package com.urbanride.config;

import com.urbanride.entity.*;
import com.urbanride.enums.*;
import com.urbanride.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private FareConfigRepository fareConfigRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("🌱 Database already contains seeded data.");
            return;
        }

        System.out.println("🚀 Seeding initial PostgreSQL data for Urban Ride Mobility...");

        String passwordHash = passwordEncoder.encode("password123");

        // 1. Create Passenger
        User passenger = User.builder()
                .name("Ramesh Varma")
                .email("passenger@urbanride.com")
                .password(passwordHash)
                .phone("+91 98765 11111")
                .role(Role.PASSENGER)
                .build();
        passenger = userRepository.save(passenger);

        // 2. Create Admin
        User admin = User.builder()
                .name("System Admin")
                .email("admin@urbanride.com")
                .password(passwordHash)
                .phone("+91 98765 99999")
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);

        // 3. Create Drivers & Vehicles
        // Driver 1: Sedan
        User d1User = User.builder()
                .name("Rahul Kumar")
                .email("driver@urbanride.com")
                .password(passwordHash)
                .phone("+91 98765 22222")
                .role(Role.DRIVER)
                .build();
        d1User = userRepository.save(d1User);

        Driver d1 = Driver.builder()
                .user(d1User)
                .licenseNumber("AP-DL-2024-00123")
                .isOnline(true)
                .currentLat(16.5062)
                .currentLng(80.6480)
                .rating(4.8)
                .totalRides(12)
                .totalEarnings(2480.0)
                .build();
        d1 = driverRepository.save(d1);

        Vehicle v1 = Vehicle.builder()
                .driverId(d1.getId())
                .type(RideType.SEDAN)
                .make("Hyundai")
                .model("i20")
                .year(2022)
                .color("White")
                .plateNumber("AP 39 AB 1234")
                .build();
        v1 = vehicleRepository.save(v1);
        d1.setVehicle(v1);
        driverRepository.save(d1);

        // Driver 2: Bike
        User d2User = User.builder()
                .name("Venkatesh Rao")
                .email("driver.bike@urbanride.com")
                .password(passwordHash)
                .phone("+91 98765 33333")
                .role(Role.DRIVER)
                .build();
        d2User = userRepository.save(d2User);

        Driver d2 = Driver.builder()
                .user(d2User)
                .licenseNumber("AP-DL-2024-00456")
                .isOnline(true)
                .currentLat(16.5120)
                .currentLng(80.6420)
                .rating(4.9)
                .totalRides(25)
                .totalEarnings(3200.0)
                .build();
        d2 = driverRepository.save(d2);

        Vehicle v2 = Vehicle.builder()
                .driverId(d2.getId())
                .type(RideType.BIKE)
                .make("Hero")
                .model("Splendor Plus")
                .year(2023)
                .color("Black")
                .plateNumber("AP 39 BK 9999")
                .build();
        v2 = vehicleRepository.save(v2);
        d2.setVehicle(v2);
        driverRepository.save(d2);

        // Driver 3: Auto
        User d3User = User.builder()
                .name("Suresh Babu")
                .email("driver.auto@urbanride.com")
                .password(passwordHash)
                .phone("+91 98765 44444")
                .role(Role.DRIVER)
                .build();
        d3User = userRepository.save(d3User);

        Driver d3 = Driver.builder()
                .user(d3User)
                .licenseNumber("AP-DL-2024-00789")
                .isOnline(true)
                .currentLat(16.4980)
                .currentLng(80.6540)
                .rating(4.7)
                .totalRides(18)
                .totalEarnings(1950.0)
                .build();
        d3 = driverRepository.save(d3);

        Vehicle v3 = Vehicle.builder()
                .driverId(d3.getId())
                .type(RideType.AUTO)
                .make("Bajaj")
                .model("RE Auto")
                .year(2021)
                .color("Yellow-Green")
                .plateNumber("AP 39 AT 5555")
                .build();
        v3 = vehicleRepository.save(v3);
        d3.setVehicle(v3);
        driverRepository.save(d3);

        // Driver 4: SUV
        User d4User = User.builder()
                .name("Anil Reddy")
                .email("driver.suv@urbanride.com")
                .password(passwordHash)
                .phone("+91 98765 55555")
                .role(Role.DRIVER)
                .build();
        d4User = userRepository.save(d4User);

        Driver d4 = Driver.builder()
                .user(d4User)
                .licenseNumber("AP-DL-2024-00999")
                .isOnline(true)
                .currentLat(16.5180)
                .currentLng(80.6350)
                .rating(4.9)
                .totalRides(30)
                .totalEarnings(6500.0)
                .build();
        d4 = driverRepository.save(d4);

        Vehicle v4 = Vehicle.builder()
                .driverId(d4.getId())
                .type(RideType.SUV)
                .make("Toyota")
                .model("Innova Crysta")
                .year(2023)
                .color("Silver")
                .plateNumber("AP 39 SUV 7777")
                .build();
        v4 = vehicleRepository.save(v4);
        d4.setVehicle(v4);
        driverRepository.save(d4);

        // 4. Create Fare Configurations
        fareConfigRepository.save(FareConfig.builder().rideType(RideType.BIKE).baseFare(30.0).perKmFare(10.0).perMinFare(1.0).minimumFare(40.0).build());
        fareConfigRepository.save(FareConfig.builder().rideType(RideType.AUTO).baseFare(40.0).perKmFare(14.0).perMinFare(1.5).minimumFare(50.0).build());
        fareConfigRepository.save(FareConfig.builder().rideType(RideType.SEDAN).baseFare(60.0).perKmFare(18.0).perMinFare(2.0).minimumFare(80.0).build());
        fareConfigRepository.save(FareConfig.builder().rideType(RideType.SUV).baseFare(80.0).perKmFare(22.0).perMinFare(2.5).minimumFare(120.0).build());

        // 5. Create Sample Completed Ride
        Ride sampleRide = Ride.builder()
                .rideNumber("URM-10482")
                .passenger(passenger)
                .driver(d1)
                .pickupLat(16.5062)
                .pickupLng(80.6480)
                .pickupAddress("Vijayawada Railway Station")
                .destLat(16.4419)
                .destLng(80.6226)
                .destAddress("KL University (KLU), Vaddeswaram")
                .rideType(RideType.SEDAN)
                .status(RideStatus.COMPLETED)
                .distanceKm(7.6)
                .estimatedTimeMin(15)
                .baseFare(60.0)
                .perKmFare(18.0)
                .estimatedFare(197.0)
                .finalFare(197.0)
                .paymentMethod(PaymentMethod.CASH)
                .paymentStatus(PaymentStatus.SUCCESS)
                .requestedAt(LocalDateTime.now().minusDays(1))
                .completedAt(LocalDateTime.now().minusDays(1).plusMinutes(20))
                .build();
        sampleRide = rideRepository.save(sampleRide);

        paymentRepository.save(Payment.builder()
                .rideId(sampleRide.getId())
                .amount(197.0)
                .paymentMethod(PaymentMethod.CASH)
                .status(PaymentStatus.SUCCESS)
                .transactionId("TXN-INITIAL-10482")
                .build());

        System.out.println("✅ Data Seeding Completed Successfully for PostgreSQL!");
    }
}
