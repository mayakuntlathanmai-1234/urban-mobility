package com.urbanride.service;

import com.urbanride.entity.FareConfig;
import com.urbanride.enums.RideType;
import com.urbanride.repository.FareConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class FareService {

    @Autowired
    private FareConfigRepository fareConfigRepository;

    public Map<String, Object> calculateFare(RideType rideType, double distanceKm, int estimatedTimeMin) {
        FareConfig config = fareConfigRepository.findByRideType(rideType)
                .orElse(getDefaultConfig(rideType));

        double baseFare = config.getBaseFare();
        double perKmFare = config.getPerKmFare();
        double perMinFare = config.getPerMinFare();
        double minimumFare = config.getMinimumFare();

        double calculatedFare = baseFare + (distanceKm * perKmFare) + (estimatedTimeMin * perMinFare);
        double finalFare = Math.round(Math.max(calculatedFare, minimumFare));

        Map<String, Object> result = new HashMap<>();
        result.put("baseFare", baseFare);
        result.put("perKmFare", perKmFare);
        result.put("perMinFare", perMinFare);
        result.put("estimatedFare", finalFare);
        return result;
    }

    public Map<String, Map<String, Object>> getAllFareEstimates(double distanceKm, int estimatedTimeMin) {
        Map<String, Map<String, Object>> estimates = new HashMap<>();
        for (RideType type : RideType.values()) {
            estimates.put(type.name(), calculateFare(type, distanceKm, estimatedTimeMin));
        }
        return estimates;
    }

    private FareConfig getDefaultConfig(RideType rideType) {
        switch (rideType) {
            case BIKE:
                return FareConfig.builder().rideType(RideType.BIKE).baseFare(30.0).perKmFare(10.0).perMinFare(1.0).minimumFare(40.0).build();
            case AUTO:
                return FareConfig.builder().rideType(RideType.AUTO).baseFare(40.0).perKmFare(14.0).perMinFare(1.5).minimumFare(50.0).build();
            case SUV:
                return FareConfig.builder().rideType(RideType.SUV).baseFare(80.0).perKmFare(22.0).perMinFare(2.5).minimumFare(120.0).build();
            case SEDAN:
            default:
                return FareConfig.builder().rideType(RideType.SEDAN).baseFare(60.0).perKmFare(18.0).perMinFare(2.0).minimumFare(80.0).build();
        }
    }
}
