package com.urbanride.ride.repository;

import com.urbanride.ride.entity.Ride;
import com.urbanride.ride.enums.RideStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RideRepository extends JpaRepository<Ride, String> {
    List<Ride> findByPassengerIdOrderByRequestedAtDesc(String passengerId);
    List<Ride> findByDriverIdOrderByRequestedAtDesc(String driverId);
    List<Ride> findAllByOrderByRequestedAtDesc();

    List<Ride> findByStatusInOrderByRequestedAtDesc(Collection<RideStatus> statuses);
    Optional<Ride> findFirstByStatusInOrderByRequestedAtDesc(Collection<RideStatus> statuses);

    /**
     * ATOMIC CONDITIONAL UPDATE FOR CONCURRENT DRIVER ACCEPTANCE
     * Ensures only ONE driver can successfully claim a ride.
     * Returns 1 if update succeeded, 0 if another driver already claimed it.
     */
    @Modifying
    @Query("UPDATE Ride r SET r.driverId = :driverId, r.status = com.urbanride.ride.enums.RideStatus.DRIVER_ASSIGNED, r.assignedAt = CURRENT_TIMESTAMP " +
           "WHERE r.id = :rideId AND (r.status = com.urbanride.ride.enums.RideStatus.WAITING_FOR_DRIVER OR r.status = com.urbanride.ride.enums.RideStatus.SEARCHING_DRIVER)")
    int acceptRideAtomic(@Param("rideId") String rideId, @Param("driverId") String driverId);
}
