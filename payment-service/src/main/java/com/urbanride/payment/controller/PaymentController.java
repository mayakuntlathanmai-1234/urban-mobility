package com.urbanride.payment.controller;

import com.urbanride.payment.entity.Payment;
import com.urbanride.payment.repository.PaymentRepository;
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
            Double amount = body.get("amount") != null ? ((Number) body.get("amount")).doubleValue() : 184.0;
            String paymentMethod = body.get("paymentMethod") != null ? (String) body.get("paymentMethod") : "CASH";

            Payment payment = paymentRepository.findByRideId(rideId).orElse(null);
            if (payment == null) {
                payment = Payment.builder()
                        .rideId(rideId)
                        .amount(amount)
                        .paymentMethod(paymentMethod)
                        .status("SUCCESS")
                        .transactionId("TXN-" + System.currentTimeMillis())
                        .build();
            } else {
                payment.setStatus("SUCCESS");
                payment.setTransactionId("TXN-" + System.currentTimeMillis());
            }

            paymentRepository.save(payment);
            return ResponseEntity.ok(Map.of("message", "Payment processed successfully", "payment", payment));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/ride/{rideId}")
    public ResponseEntity<?> getPaymentByRideId(@PathVariable String rideId) {
        Payment payment = paymentRepository.findByRideId(rideId).orElse(null);
        if (payment == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Payment not found for rideId: " + rideId));
        }
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "PAYMENT-SERVICE"));
    }
}
