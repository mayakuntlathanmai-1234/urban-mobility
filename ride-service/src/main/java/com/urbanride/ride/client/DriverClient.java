package com.urbanride.ride.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "DRIVER-SERVICE")
public interface DriverClient {

    @GetMapping("/api/drivers/nearby")
    Map<String, Object> getNearbyDrivers();

    @GetMapping("/api/drivers/{id}")
    Map<String, Object> getDriverById(@PathVariable("id") String id);
}
