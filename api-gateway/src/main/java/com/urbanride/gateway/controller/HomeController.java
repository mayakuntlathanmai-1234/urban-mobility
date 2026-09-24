package com.urbanride.gateway.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public String home() {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Urban Ride Mobility - API Gateway</title>
                <style>
                    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }
                    .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 36px; max-width: 600px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
                    h1 { color: #38bdf8; font-size: 28px; margin-top: 0; display: flex; align-items: center; gap: 12px; }
                    .badge { background: #0284c7; color: white; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
                    p { font-size: 16px; line-height: 1.6; color: #94a3b8; }
                    .btn { display: inline-block; background: #2563eb; color: white; font-weight: 600; padding: 12px 24px; border-radius: 10px; text-decoration: none; margin-top: 20px; transition: background 0.2s; }
                    .btn:hover { background: #1d4ed8; }
                    .routes { background: #0f172a; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 14px; margin-top: 20px; }
                    .route-item { color: #4ade80; margin-bottom: 6px; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h1>Urban Ride Mobility <span class="badge">API GATEWAY ACTIVE</span></h1>
                    <p>Welcome! You have reached the Spring Cloud API Gateway endpoint (Port 5000).</p>
                    <p>To access the main Urban Ride Mobility web dashboard UI, please click the button below or open <strong>http://localhost:3000</strong> in your browser.</p>
                    <a href="http://localhost:3000" class="btn">🚀 Open Frontend Application (Port 3000)</a>
                    
                    <h3>Registered Microservices Routes</h3>
                    <div class="routes">
                        <div class="route-item">➔ /api/auth/** ⟶ AUTH-SERVICE (Port 8081)</div>
                        <div class="route-item">➔ /api/rides/** ⟶ RIDE-SERVICE (Port 8082)</div>
                        <div class="route-item">➔ /api/drivers/** ⟶ DRIVER-SERVICE (Port 8083)</div>
                        <div class="route-item">➔ /api/payments/** ⟶ PAYMENT-SERVICE (Port 8084)</div>
                    </div>
                </div>
            </body>
            </html>
            """;
    }

    @GetMapping("/api/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "API-GATEWAY",
                "message", "Urban Ride Mobility API Gateway is operational",
                "frontendUrl", "http://localhost:3000",
                "eurekaUrl", "http://localhost:8761"
        ));
    }
}
