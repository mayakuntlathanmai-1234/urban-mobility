package com.urbanride.repository;

import com.urbanride.entity.Ride;
import com.urbanride.enums.RideStatus;
import com.urbanride.enums.RideType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RideRepository extends JpaRepository<Ride, String> {
    List<Ride> findByPassengerIdOrderByRequestedAtDesc(String passengerId);
    List<Ride> findByDriverIdOrderByRequestedAtDesc(String driverId);
    List<Ride> findAllByOrderByRequestedAtDesc();
    
    Optional<Ride> findFirstByPassengerIdAndStatusInOrderByRequestedAtDesc(String passengerId, Collection<RideStatus> statuses);
    Optional<Ride> findFirstByDriverIdAndStatusInOrderByRequestedAtDesc(String driverId, Collection<RideStatus> statuses);
    Optional<Ride> findFirstByStatusInAndRideTypeOrderByRequestedAtDesc(Collection<RideStatus> statuses, RideType rideType);
    Optional<Ride> findFirstByStatusInOrderByRequestedAtDesc(Collection<RideStatus> statuses);

    List<Ride> findByDriverIdAndStatusAndCompletedAtGreaterThanEqual(String driverId, RideStatus status, LocalDateTime start);
    List<Ride> findByStatus(RideStatus status);
}
