package com.urbanride.entity;

import com.urbanride.enums.RideType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String driverId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RideType type;

    private String make;
    private String model;
    private Integer year;
    private String color;

    @Column(nullable = false, unique = true)
    private String plateNumber;
}
