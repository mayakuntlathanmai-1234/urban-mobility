package com.urbanride.service;

import com.urbanride.dto.CreateRideRequest;
import com.urbanride.entity.Driver;
import com.urbanride.entity.Payment;
import com.urbanride.entity.Ride;
import com.urbanride.entity.User;
import com.urbanride.enums.PaymentMethod;
import com.urbanride.enums.PaymentStatus;
import com.urbanride.enums.RideStatus;
import com.urbanride.enums.RideType;
import com.urbanride.repository.DriverRepository;
import com.urbanride.repository.PaymentRepository;
import com.urbanride.repository.RideRepository;
import com.urbanride.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private FareService fareService;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public Ride createRide(String passengerId, CreateRideRequest request) {
        User passenger = userRepository.findById(passengerId)
                .orElseThrow(() -> new RuntimeException("Passenger not found"));

        double distanceKm = calculateHaversineDistance(
                request.getPickupLat(), request.getPickupLng(),
                request.getDestLat(), request.getDestLng()
        );

        int estimatedTimeMin = Math.max(5, (int) Math.round((distanceKm / 30.0) * 60));
        RideType selectedType = request.getRideType() != null ? request.getRideType() : RideType.SEDAN;

        Map<String, Object> fare = fareService.calculateFare(selectedType, distanceKm, estimatedTimeMin);
        double estFare = ((Number) fare.get("estimatedFare")).doubleValue();
        double baseFare = ((Number) fare.get("baseFare")).doubleValue();
        double perKmFare = ((Number) fare.get("perKmFare")).doubleValue();

        String rideNumber = "URM-" + (10000 + new Random().nextInt(90000));

        Ride ride = Ride.builder()
                .rideNumber(rideNumber)
                .passenger(passenger)
                .pickupLat(request.getPickupLat())
                .pickupLng(request.getPickupLng())
                .pickupAddress(request.getPickupAddress())
                .destLat(request.getDestLat())
                .destLng(request.getDestLng())
                .destAddress(request.getDestAddress())
                .rideType(selectedType)
                .status(RideStatus.SEARCHING_DRIVER)
                .distanceKm(Math.round(distanceKm * 10.0) / 10.0)
                .estimatedTimeMin(estimatedTimeMin)
                .baseFare(baseFare)
                .perKmFare(perKmFare)
                .estimatedFare(estFare)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.CASH)
                .paymentStatus(PaymentStatus.PENDING)
                .requestedAt(LocalDateTime.now())
                .build();

        ride = rideRepository.save(ride);

        Payment payment = Payment.builder()
                .rideId(ride.getId())
                .amount(estFare)
                .paymentMethod(ride.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        broadcastRideUpdate(ride.getId(), ride.getStatus().name(), ride);

        return ride;
    }

    public Ride acceptRide(String rideId, String driverUserId, String driverProfileId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));

        Driver driver = null;
        if (driverProfileId != null) {
            driver = driverRepository.findById(driverProfileId).orElse(null);
        }
        if (driver == null && driverUserId != null) {
            driver = driverRepository.findByUserId(driverUserId).orElse(null);
        }

        if (driver == null) {
            throw new RuntimeException("Driver profile not found");
        }

        if (ride.getStatus() != RideStatus.REQUESTED && ride.getStatus() != RideStatus.SEARCHING_DRIVER) {
            if (ride.getStatus() == RideStatus.DRIVER_ASSIGNED && ride.getDriver() != null && ride.getDriver().getId().equals(driver.getId())) {
                return ride; // Already assigned to this driver
            }
            throw new RuntimeException("Ride cannot be accepted in state " + ride.getStatus());
        }

        ride.setDriver(driver);
        ride.setStatus(RideStatus.DRIVER_ASSIGNED);
        ride.setAssignedAt(LocalDateTime.now());
        ride = rideRepository.save(ride);

        broadcastRideUpdate(ride.getId(), RideStatus.DRIVER_ASSIGNED.name(), ride);
        return ride;
    }

    public Ride markArrived(String rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus(RideStatus.DRIVER_ARRIVED);
        ride.setArrivedAt(LocalDateTime.now());
        ride = rideRepository.save(ride);
        broadcastRideUpdate(ride.getId(), RideStatus.DRIVER_ARRIVED.name(), ride);
        return ride;
    }

    public Ride startRide(String rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus(RideStatus.RIDE_STARTED);
        ride.setStartedAt(LocalDateTime.now());
        ride = rideRepository.save(ride);
        broadcastRideUpdate(ride.getId(), RideStatus.RIDE_STARTED.name(), ride);
        return ride;
    }

    public Ride completeRide(String rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus(RideStatus.COMPLETED);
        ride.setFinalFare(ride.getEstimatedFare());
        ride.setPaymentStatus(PaymentStatus.SUCCESS);
        ride.setCompletedAt(LocalDateTime.now());
        ride = rideRepository.save(ride);

        Payment payment = paymentRepository.findByRideId(rideId).orElse(null);
        if (payment != null) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setAmount(ride.getFinalFare());
            payment.setTransactionId("TXN-" + System.currentTimeMillis());
            paymentRepository.save(payment);
        }

        if (ride.getDriver() != null) {
            Driver d = ride.getDriver();
            d.setTotalRides(d.getTotalRides() + 1);
            d.setTotalEarnings(d.getTotalEarnings() + ride.getFinalFare());
            driverRepository.save(d);
        }

        broadcastRideUpdate(ride.getId(), RideStatus.COMPLETED.name(), ride);
        return ride;
    }

    public Ride cancelRide(String rideId, String reason, boolean isDriver) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new RuntimeException("Ride not found"));
        RideStatus status = isDriver ? RideStatus.CANCELLED_BY_DRIVER : RideStatus.CANCELLED_BY_RIDER;
        ride.setStatus(status);
        ride.setCancelledAt(LocalDateTime.now());
        ride.setCancelReason(reason != null ? reason : (isDriver ? "Driver cancelled" : "Passenger cancelled"));
        ride = rideRepository.save(ride);
        broadcastRideUpdate(ride.getId(), status.name(), ride);
        return ride;
    }

    public List<Ride> listRides(String userId, String role, String driverId) {
        if ("PASSENGER".equalsIgnoreCase(role)) {
            return rideRepository.findByPassengerIdOrderByRequestedAtDesc(userId);
        } else if ("DRIVER".equalsIgnoreCase(role) && driverId != null) {
            return rideRepository.findByDriverIdOrderByRequestedAtDesc(driverId);
        }
        return rideRepository.findAllByOrderByRequestedAtDesc();
    }

    private void broadcastRideUpdate(String rideId, String status, Ride ride) {
        if (messagingTemplate != null) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("rideId", rideId);
            payload.put("status", status);
            payload.put("ride", ride);
            messagingTemplate.convertAndSend("/topic/ride." + rideId, payload);
            messagingTemplate.convertAndSend("/topic/rides", payload);
        }
    }

    public double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0);
        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        return R * c;
    }
}
