package com.urbanride.ride.service;

import com.urbanride.ride.client.PaymentClient;
import com.urbanride.ride.entity.Ride;
import com.urbanride.ride.enums.PaymentMethod;
import com.urbanride.ride.enums.RideStatus;
import com.urbanride.ride.enums.RideType;
import com.urbanride.ride.repository.RideRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired(required = false)
    private PaymentClient paymentClient;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public Ride createRide(String passengerId, Map<String, Object> body) {
        Double pickupLat = body.get("pickupLat") != null ? ((Number) body.get("pickupLat")).doubleValue() : 0.0;
        Double pickupLng = body.get("pickupLng") != null ? ((Number) body.get("pickupLng")).doubleValue() : 0.0;
        String pickupAddress = (String) body.get("pickupAddress");
        
        Object dLatObj = body.get("destLat") != null ? body.get("destLat") : body.get("dropoffLat");
        Double destLat = dLatObj != null ? ((Number) dLatObj).doubleValue() : 0.0;

        Object dLngObj = body.get("destLng") != null ? body.get("destLng") : body.get("dropoffLng");
        Double destLng = dLngObj != null ? ((Number) dLngObj).doubleValue() : 0.0;

        String destAddress = body.get("destAddress") != null ? (String) body.get("destAddress") : (String) body.get("dropoffAddress");

        String rideTypeStr = body.get("rideType") != null ? (String) body.get("rideType") : "SEDAN";
        RideType rideType = RideType.SEDAN;
        try { rideType = RideType.valueOf(rideTypeStr.toUpperCase()); } catch (Exception e) {}

        double distanceKm = calculateHaversineDistance(pickupLat, pickupLng, destLat, destLng);
        int estimatedTimeMin = Math.max(5, (int) Math.round((distanceKm / 30.0) * 60));

        double baseFare = rideType == RideType.BIKE ? 30.0 : rideType == RideType.AUTO ? 40.0 : rideType == RideType.SUV ? 80.0 : 60.0;
        double perKmFare = rideType == RideType.BIKE ? 10.0 : rideType == RideType.AUTO ? 14.0 : rideType == RideType.SUV ? 22.0 : 18.0;
        double estFare = Math.round(baseFare + (distanceKm * perKmFare));

        String rideNumber = "URM-" + (10000 + new Random().nextInt(90000));

        Ride ride = Ride.builder()
                .rideNumber(rideNumber)
                .passengerId(passengerId != null ? passengerId : "passenger-101")
                .pickupLat(pickupLat)
                .pickupLng(pickupLng)
                .pickupAddress(pickupAddress)
                .destLat(destLat)
                .destLng(destLng)
                .destAddress(destAddress)
                .rideType(rideType)
                .status(RideStatus.WAITING_FOR_DRIVER)
                .distanceKm(Math.round(distanceKm * 10.0) / 10.0)
                .estimatedTimeMin(estimatedTimeMin)
                .baseFare(baseFare)
                .perKmFare(perKmFare)
                .estimatedFare(estFare)
                .paymentMethod(PaymentMethod.CASH)
                .paymentStatus("PENDING")
                .requestedAt(LocalDateTime.now())
                .build();

        ride = rideRepository.save(ride);

        // Broadcast NEW_RIDE_AVAILABLE to ALL online drivers in real time
        broadcastEvent("NEW_RIDE_AVAILABLE", ride);

        return ride;
    }

    /**
     * ATOMIC RIDE ACCEPTANCE LOGIC
     * Prevents two drivers from accepting the same ride concurrently.
     */
    @Transactional
    public Ride acceptRideAtomic(String rideId, String driverId) {
        int updatedRows = rideRepository.acceptRideAtomic(rideId, driverId);

        if (updatedRows == 0) {
            throw new IllegalStateException("Ride has already been accepted by another driver.");
        }

        Ride ride = rideRepository.findById(rideId).orElseThrow();

        // Broadcast RIDE_ACCEPTED to passenger & RIDE_NO_LONGER_AVAILABLE to all other drivers
        broadcastEvent("RIDE_ACCEPTED", ride);
        broadcastEvent("RIDE_NO_LONGER_AVAILABLE", Map.of("rideId", rideId, "acceptedDriverId", driverId));

        return ride;
    }

    public Ride markArrived(String rideId) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus(RideStatus.DRIVER_ARRIVED);
        ride.setArrivedAt(LocalDateTime.now());
        ride = rideRepository.save(ride);
        broadcastEvent("DRIVER_ARRIVED", ride);
        return ride;
    }

    public Ride startRide(String rideId) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus(RideStatus.RIDE_STARTED);
        ride.setStartedAt(LocalDateTime.now());
        ride = rideRepository.save(ride);
        broadcastEvent("RIDE_STARTED", ride);
        return ride;
    }

    public Ride completeRide(String rideId) {
        Ride ride = rideRepository.findById(rideId).orElseThrow(() -> new RuntimeException("Ride not found"));
        ride.setStatus(RideStatus.RIDE_COMPLETED);
        ride.setFinalFare(ride.getEstimatedFare());
        ride.setPaymentStatus("SUCCESS");
        ride.setCompletedAt(LocalDateTime.now());
        ride = rideRepository.save(ride);

        // Process Payment asynchronously or via OpenFeign
        if (paymentClient != null) {
            try {
                paymentClient.processPayment(Map.of(
                        "rideId", rideId,
                        "amount", ride.getFinalFare(),
                        "paymentMethod", ride.getPaymentMethod().name()
                ));
            } catch (Exception e) {
                System.err.println("OpenFeign Payment Service call error: " + e.getMessage());
            }
        }

        broadcastEvent("RIDE_COMPLETED", ride);
        return ride;
    }

    public void broadcastEvent(String eventType, Object data) {
        if (messagingTemplate != null) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("type", eventType);
            payload.put("data", data);
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
        return R * 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
    }
}
