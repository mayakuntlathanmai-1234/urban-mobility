package com.urbanride.entity;

import com.urbanride.enums.RideType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "fare_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FareConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    private RideType rideType;

    @Column(nullable = false)
    private Double baseFare;

    @Column(nullable = false)
    private Double perKmFare;

    @Column(nullable = false)
    private Double perMinFare;

    @Column(nullable = false)
    private Double minimumFare;
}
