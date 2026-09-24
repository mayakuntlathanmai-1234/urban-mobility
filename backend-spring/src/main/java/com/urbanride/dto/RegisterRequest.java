package com.urbanride.dto;

import com.urbanride.enums.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private Role role;
    
    // Optional Driver Vehicle Info
    private String vehicleType;
    private String vehicleMake;
    private String vehicleModel;
    private String vehiclePlate;
}
