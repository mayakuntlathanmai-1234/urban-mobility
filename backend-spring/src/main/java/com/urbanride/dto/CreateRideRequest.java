package com.urbanride.dto;

import com.urbanride.enums.PaymentMethod;
import com.urbanride.enums.RideType;
import lombok.Data;

@Data
public class CreateRideRequest {
    private Double pickupLat;
    private Double pickupLng;
    private String pickupAddress;
    private Double destLat;
    private Double destLng;
    private String destAddress;
    private RideType rideType;
    private PaymentMethod paymentMethod;
}
