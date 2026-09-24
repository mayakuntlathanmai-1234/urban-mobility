package com.urbanride.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    private String licenseNumber;

    @Builder.Default
    private Boolean isOnline = true;

    @Builder.Default
    private Double currentLat = 16.5062;

    @Builder.Default
    private Double currentLng = 80.6480;

    @Builder.Default
    private Double rating = 4.8;

    @Builder.Default
    private Integer totalRides = 12;

    @Builder.Default
    private Double totalEarnings = 2480.0;
}
