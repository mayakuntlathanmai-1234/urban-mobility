package com.urbanride.ride.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "PAYMENT-SERVICE")
public interface PaymentClient {

    @PostMapping("/api/payments/process")
    Map<String, Object> processPayment(@RequestBody Map<String, Object> paymentData);
}
