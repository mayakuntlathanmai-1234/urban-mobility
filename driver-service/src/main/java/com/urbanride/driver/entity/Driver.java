package com.urbanride.driver.entity;

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

    @Column(nullable = false, unique = true)
    private String userId;

    private String name;
    private String phone;
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
