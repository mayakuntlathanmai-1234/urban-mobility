package com.urbanride.driver.config;

import com.urbanride.driver.entity.Driver;
import com.urbanride.driver.entity.Vehicle;
import com.urbanride.driver.repository.DriverRepository;
import com.urbanride.driver.repository.VehicleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (driverRepository.count() == 0) {
            System.out.println("🌱 Seeding Demo Drivers & Vehicles into urban_driver_db...");

            Driver d1 = driverRepository.save(Driver.builder()
                    .id("driver-101")
                    .userId("user-driver-101")
                    .name("Rahul Kumar")
                    .phone("+919876543211")
                    .licenseNumber("DL-1420110012345")
                    .isOnline(true)
                    .currentLat(37.7749)
                    .currentLng(-122.4194)
                    .rating(4.85)
                    .totalRides(142)
                    .totalEarnings(15420.0)
                    .build());

            vehicleRepository.save(Vehicle.builder()
                    .id("vehicle-101")
                    .driverId(d1.getId())
                    .make("Hyundai")
                    .model("i20 Sedan")
                    .year(2022)
                    .color("White")
                    .plateNumber("AP 39 AB 1234")
                    .type("SEDAN")
                    .build());

            Driver d2 = driverRepository.save(Driver.builder()
                    .id("driver-102")
                    .userId("user-driver-102")
                    .name("Venkatesh Rao")
                    .phone("+919876543213")
                    .licenseNumber("DL-1420110099999")
                    .isOnline(true)
                    .currentLat(37.7760)
                    .currentLng(-122.4180)
                    .rating(4.90)
                    .totalRides(98)
                    .totalEarnings(9850.0)
                    .build());

            vehicleRepository.save(Vehicle.builder()
                    .id("vehicle-102")
                    .driverId(d2.getId())
                    .make("Toyota")
                    .model("Innova Crysta")
                    .year(2023)
                    .color("Black")
                    .plateNumber("AP 39 SUV 7777")
                    .type("SUV")
                    .build());

            System.out.println("✅ Demo Drivers & Vehicles Seeded Successfully into urban_driver_db!");
        }
    }
}
