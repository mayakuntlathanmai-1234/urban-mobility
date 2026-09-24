package com.urbanride.controller;

import com.urbanride.entity.Payment;
import com.urbanride.enums.PaymentStatus;
import com.urbanride.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @PostMapping("/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> body) {
        try {
            String rideId = (String) body.get("rideId");
            Payment payment = paymentRepository.findByRideId(rideId).orElse(null);
            if (payment != null) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setTransactionId("TXN-" + System.currentTimeMillis());
                paymentRepository.save(payment);
                return ResponseEntity.ok(Map.of("message", "Payment processed successfully", "payment", payment));
            }
            return ResponseEntity.status(404).body(Map.of("error", "Payment not found"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
