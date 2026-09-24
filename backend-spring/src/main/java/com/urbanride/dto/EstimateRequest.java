package com.urbanride.dto;

import lombok.Data;

@Data
public class EstimateRequest {
    private Double pickupLat;
    private Double pickupLng;
    private Double destLat;
    private Double destLng;
}
