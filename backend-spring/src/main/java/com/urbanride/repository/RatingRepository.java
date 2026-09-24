package com.urbanride.repository;

import com.urbanride.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, String> {
    Optional<Rating> findByRideId(String rideId);
    List<Rating> findByDriverId(String driverId);
}
