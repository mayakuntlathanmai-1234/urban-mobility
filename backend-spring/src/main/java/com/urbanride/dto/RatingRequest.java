package com.urbanride.dto;

import lombok.Data;

@Data
public class RatingRequest {
    private String rideId;
    private Integer stars;
    private String comment;
}
