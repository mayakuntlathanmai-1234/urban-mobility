package com.urbanride.repository;

import com.urbanride.entity.Driver;
import com.urbanride.enums.RideType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, String> {
    Optional<Driver> findByUserId(String userId);
    List<Driver> findByIsOnlineTrue();
    List<Driver> findByIsOnlineTrueAndVehicleType(RideType vehicleType);
}
