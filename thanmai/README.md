# 🚗 Urban Ride Mobility - Microservices Ride-Booking Platform

A production-style, high-performance **Ride-Booking Web Application** built with **Java 17, Spring Boot 3, Spring Cloud Gateway, Eureka Service Discovery, PostgreSQL (Database-per-Service), and React**.

---

## 🏗️ Microservices Architecture

```
                       ┌─────────────────┐
                       │    PASSENGER    │
                       └────────┬────────┘
                                │ Book Ride
                                ▼
                       ┌─────────────────┐
                       │   API GATEWAY   │ (Port 5000)
                       └────────┬────────┘
                                │
                 ┌──────────────┼──────────────┬──────────────┐
                 ▼              ▼              ▼              ▼
           AUTH SERVICE    RIDE SERVICE  DRIVER SERVICE PAYMENT SERVICE
            (Port 8081)     (Port 8082)    (Port 8083)    (Port 8084)
                 │              │              │              │
                 ▼              ▼              ▼              ▼
           urban_auth_db  urban_ride_db urban_driver_db urban_payment_db
```

---

## 🧩 Microservices Breakdown

| Service Name | Port | Database | Primary Responsibility |
| :--- | :--- | :--- | :--- |
| **Eureka Server** | `8761` | N/A | Central Service Discovery Registry |
| **API Gateway** | `5000` | N/A | Dynamic Load-Balanced Routing & Security |
| **Auth Service** | `8081` | `urban_auth_db` | Registration, Login, JWT Token Generation |
| **Ride Service** | `8082` | `urban_ride_db` | Ride State Machine & Atomic Concurrency Locks |
| **Driver Service**| `8083` | `urban_driver_db` | Driver Profiles, Status Toggle & Live Location |
| **Payment Service**| `8084` | `urban_payment_db` | Transaction Logs & Payment Processing |
| **Frontend** | `3000` | N/A | React + Tailwind CSS Web Application |

---

## ⚡ Concurrency & Double-Booking Prevention

When multiple drivers attempt to accept the same ride simultaneously, `Ride Service` executes an **atomic PostgreSQL conditional update query**:

```sql
UPDATE rides 
SET driver_id = :driverId, status = 'DRIVER_ASSIGNED', assigned_at = LOCALTIMESTAMP 
WHERE id = :id AND (status = 'WAITING_FOR_DRIVER' OR status = 'SEARCHING_DRIVER');
```

- **Winning Driver**: Row count = 1 $\rightarrow$ Returns **HTTP 200 OK**.
- **Losing Drivers**: Row count = 0 $\rightarrow$ Throws exception returning **HTTP 409 Conflict** (`"Ride has already been accepted by another driver."`).

---

## 🚀 Quick Start

### 1. Launch All Services (One-Click)
```cmd
start-all.bat
```
*(or run `.\start-all.ps1` in PowerShell)*

### 2. Automated Integration Test
```bash
python test_concurrency.py
python test_all_apis.py
```

### 3. Open Web Dashboard
Navigate to **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📦 Postman API Collection

Import [urban_ride_mobility.postman_collection.json](./urban_ride_mobility.postman_collection.json) directly into Postman to test all endpoints.
