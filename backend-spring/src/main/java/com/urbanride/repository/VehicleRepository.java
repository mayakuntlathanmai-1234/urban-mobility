package com.urbanride.repository;

import com.urbanride.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, String> {
    Optional<Vehicle> findByDriverId(String driverId);
    Optional<Vehicle> findByPlateNumber(String plateNumber);
}
