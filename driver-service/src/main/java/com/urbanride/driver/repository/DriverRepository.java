package com.urbanride.driver.repository;

import com.urbanride.driver.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, String> {
    Optional<Driver> findByUserId(String userId);
    List<Driver> findByIsOnlineTrue();
}
