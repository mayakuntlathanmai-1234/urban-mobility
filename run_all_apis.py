import json
import time
import urllib.request
import urllib.parse
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://localhost:5000"

def make_request(method, path, body=None, headers=None):
    url = f"{BASE_URL}{path}"
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    
    data = json.dumps(body).encode('utf-8') if body else None
    req = urllib.request.Request(url, data=data, headers=req_headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode('utf-8')
            try:
                res_json = json.loads(content)
            except:
                res_json = content
            return status, res_json
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        try:
            res_json = json.loads(content)
        except:
            res_json = content
        return e.code, res_json
    except Exception as e:
        return 500, {"error": str(e)}

def print_header(title):
    print("\n" + "="*70)
    print(f" [API TEST] {title}")
    print("="*70)

def print_step(step_num, title, method, path, status, result):
    status_icon = "[PASS]" if status in [200, 201] else "[FAIL]"
    print(f"\n{status_icon} STEP {step_num}: {title}")
    print(f"   --> {method} {BASE_URL}{path}")
    print(f"   --> HTTP Status: {status}")
    snippet = json.dumps(result, indent=2) if isinstance(result, dict) else str(result)[:200]
    first_lines = snippet.split('\n')[:8]
    print("   --> Response:")
    for l in first_lines:
        print(f"       {l}")

def run_all_apis():
    print_header("URBAN RIDE MOBILITY - MASTER API TEST SUITE")
    print("Testing all System APIs across Gateway, Auth, Driver, Ride, Payment")
    
    results = []
    
    # 1. Health Check
    status, res = make_request("GET", "/api/health")
    print_step(1, "API Gateway Health Check", "GET", "/api/health", status, res)
    results.append(("GET /api/health", status == 200))

    # 2. Gateway Landing Dashboard
    status, res = make_request("GET", "/")
    print_step(2, "Gateway Landing Dashboard", "GET", "/", status, "HTML Landing Page Received" if status == 200 else res)
    results.append(("GET / (Landing Dashboard)", status == 200))

    # 3. Passenger Registration
    pass_email = f"passenger_{int(time.time())}@urbanride.com"
    pass_payload = {
        "name": "Test Passenger",
        "email": pass_email,
        "password": "Password123!",
        "role": "ROLE_PASSENGER",
        "phone": "+15550199"
    }
    status, res = make_request("POST", "/api/auth/register", pass_payload)
    print_step(3, "Passenger Registration", "POST", "/api/auth/register", status, res)
    results.append(("POST /api/auth/register (Passenger)", status == 201))

    # 4. Driver Registration
    driver_email = f"driver_{int(time.time())}@urbanride.com"
    driver_payload = {
        "name": "Test Driver",
        "email": driver_email,
        "password": "Password123!",
        "role": "ROLE_DRIVER",
        "phone": "+15550299"
    }
    status, res = make_request("POST", "/api/auth/register", driver_payload)
    print_step(4, "Driver Registration", "POST", "/api/auth/register", status, res)
    results.append(("POST /api/auth/register (Driver)", status == 201))

    # 5. Auth Login (Passenger)
    status, res = make_request("POST", "/api/auth/login", {"email": pass_email, "password": "Password123!"})
    print_step(5, "Passenger Login (JWT Token Issue)", "POST", "/api/auth/login", status, res)
    token = res.get("token") if isinstance(res, dict) else None
    results.append(("POST /api/auth/login", status == 200 and token is not None))

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 6. List Drivers
    status, res = make_request("GET", "/api/drivers", headers=headers)
    print_step(6, "List Available Drivers", "GET", "/api/drivers", status, res)
    results.append(("GET /api/drivers", status == 200))
    
    driver_id = "d1"
    if isinstance(res, dict) and "drivers" in res and len(res["drivers"]) > 0:
        driver_id = res["drivers"][0].get("id", "d1")

    # 7. Get Driver Detail
    status, res = make_request("GET", f"/api/drivers/{driver_id}", headers=headers)
    print_step(7, f"Get Driver Detail ({driver_id})", "GET", f"/api/drivers/{driver_id}", status, res)
    results.append(("GET /api/drivers/{driverId}", status == 200))

    # 8. Update Driver Availability Status
    status, res = make_request("POST", f"/api/drivers/{driver_id}/status", {"isOnline": True}, headers=headers)
    print_step(8, "Update Driver Status (AVAILABLE)", "POST", f"/api/drivers/{driver_id}/status", status, res)
    results.append(("POST /api/drivers/{driverId}/status", status == 200))

    # 9. Update Driver Location Telemetry
    status, res = make_request("POST", f"/api/drivers/{driver_id}/location", {"latitude": 12.9716, "longitude": 77.5946}, headers=headers)
    print_step(9, "Update Driver GPS Location", "POST", f"/api/drivers/{driver_id}/location", status, res)
    results.append(("POST /api/drivers/{driverId}/location", status == 200))

    # 10. Estimate Ride Fare
    estimate_payload = {
        "pickupLat": 12.9716,
        "pickupLng": 77.5946,
        "destLat": 12.9352,
        "destLng": 77.6245,
        "rideType": "PREMIUM"
    }
    status, res = make_request("POST", "/api/rides/estimate", estimate_payload, headers=headers)
    print_step(10, "Estimate Ride Fare & Duration", "POST", "/api/rides/estimate", status, res)
    results.append(("POST /api/rides/estimate", status == 200))

    # 11. Create Ride Request
    ride_payload = {
        "passengerId": "pass-001",
        "pickupAddress": "MG Road, Bengaluru",
        "dropoffAddress": "Koramangala, Bengaluru",
        "pickupLat": 12.9716,
        "pickupLng": 77.5946,
        "dropoffLat": 12.9352,
        "dropoffLng": 77.6245,
        "fare": 250.00,
        "rideType": "PREMIUM",
        "paymentMethod": "CREDIT_CARD"
    }
    status, res = make_request("POST", "/api/rides", ride_payload, headers=headers)
    print_step(11, "Create Ride (WAITING_FOR_DRIVER)", "POST", "/api/rides", status, res)
    
    ride_id = None
    if isinstance(res, dict):
        if "id" in res:
            ride_id = res["id"]
        elif "ride" in res and isinstance(res["ride"], dict):
            ride_id = res["ride"].get("id")
            
    results.append(("POST /api/rides", status in [200, 201] and ride_id is not None))

    # 12. Get Available Pending Rides
    status, res = make_request("GET", "/api/rides/available", headers=headers)
    print_step(12, "Get Available Pending Rides", "GET", "/api/rides/available", status, res)
    results.append(("GET /api/rides/available", status == 200))

    # 13. List All Rides
    status, res = make_request("GET", "/api/rides", headers=headers)
    print_step(13, "List All Rides", "GET", "/api/rides", status, res)
    results.append(("GET /api/rides", status == 200))

    if ride_id:
        # 14. Get Ride By ID
        status, res = make_request("GET", f"/api/rides/{ride_id}", headers=headers)
        print_step(14, "Get Ride Details by ID", "GET", f"/api/rides/{ride_id}", status, res)
        results.append(("GET /api/rides/{id}", status == 200))

        # 15. Accept Ride (Atomic Driver Concurrency Lock)
        status, res = make_request("POST", f"/api/rides/{ride_id}/accept", {"driverId": driver_id}, headers=headers)
        print_step(15, "Accept Ride (Atomic Lock)", "POST", f"/api/rides/{ride_id}/accept", status, res)
        results.append(("POST /api/rides/{id}/accept", status == 200))

        # 16. Driver Arrives at Pickup Location
        status, res = make_request("POST", f"/api/rides/{ride_id}/arrive", headers=headers)
        print_step(16, "Driver Arrives at Pickup", "POST", f"/api/rides/{ride_id}/arrive", status, res)
        results.append(("POST /api/rides/{id}/arrive", status == 200))

        # 17. Start Trip
        status, res = make_request("POST", f"/api/rides/{ride_id}/start", headers=headers)
        print_step(17, "Start Trip (RIDE_STARTED)", "POST", f"/api/rides/{ride_id}/start", status, res)
        results.append(("POST /api/rides/{id}/start", status == 200))

        # 18. Complete Trip & Trigger OpenFeign Payment
        status, res = make_request("POST", f"/api/rides/{ride_id}/complete", headers=headers)
        print_step(18, "Complete Trip & Trigger Payment", "POST", f"/api/rides/{ride_id}/complete", status, res)
        results.append(("POST /api/rides/{id}/complete", status == 200))

        # 19. Get Payment Receipt by Ride ID
        status, res = make_request("GET", f"/api/payments/ride/{ride_id}", headers=headers)
        print_step(19, "Fetch Payment Receipt (OpenFeign)", "GET", f"/api/payments/ride/{ride_id}", status, res)
        results.append(("GET /api/payments/ride/{id}", status == 200))

    # 20. Process Independent Payment
    status, res = make_request("POST", "/api/payments/process", {"rideId": f"ride-test-{int(time.time())}", "amount": 199.50, "paymentMethod": "UPI"}, headers=headers)
    print_step(20, "Process Independent Payment", "POST", "/api/payments/process", status, res)
    results.append(("POST /api/payments/process", status == 200))

    # Final Summary
    print_header("SUMMARY OF ALL API TEST EXECUTIONS")
    passed = sum(1 for _, ok in results if ok)
    total = len(results)
    
    print(f"\nFINAL RESULTS: {passed}/{total} APIs PASSED ({int(passed/total*100)}% Success Rate)\n")
    for name, ok in results:
        status_str = "PASS" if ok else "FAIL"
        print(f"   [{status_str}] {name}")
    print("="*70 + "\n")

    if passed == total:
        print("🎉 ALL APIs EXECUTED SUCCESSFULLY WITH 100% PASS RATE AND ZERO ERRORS!\n")
    else:
        sys.exit(1)

if __name__ == "__main__":
    run_all_apis()
