package com.urbanride.repository;

import com.urbanride.entity.FareConfig;
import com.urbanride.enums.RideType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FareConfigRepository extends JpaRepository<FareConfig, String> {
    Optional<FareConfig> findByRideType(RideType rideType);
}
