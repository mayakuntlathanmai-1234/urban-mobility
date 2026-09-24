import urllib.request
import urllib.parse
import json
import time

GATEWAY_URL = "http://localhost:5000"

def make_req(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    if data:
        data_bytes = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    else:
        data_bytes = None
    
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        res_body = e.read().decode('utf-8')
        try:
            parsed = json.loads(res_body)
        except Exception:
            parsed = {"error": res_body}
        return e.code, parsed
    except Exception as e:
        return 500, {"error": str(e)}

def run_all_api_tests():
    report = []
    print("==================================================")
    print(" TESTING ALL URBAN RIDE MOBILITY API ENDPOINTS")
    print("==================================================")

    # 1. Gateway Health
    code, res = make_req(f"{GATEWAY_URL}/api/health")
    report.append(("GET /api/health", code, res))

    # 2. Auth Service - Register
    reg_data = {
        "name": "Test User",
        "email": f"testuser_{int(time.time())}@urbanride.com",
        "password": "password123",
        "role": "PASSENGER",
        "phone": "+1987654321"
    }
    code, res = make_req(f"{GATEWAY_URL}/api/auth/register", method="POST", data=reg_data)
    report.append(("POST /api/auth/register", code, res))

    # 3. Auth Service - Login
    login_data = {"email": "passenger@urbanride.com", "password": "password123"}
    code, res = make_req(f"{GATEWAY_URL}/api/auth/login", method="POST", data=login_data)
    report.append(("POST /api/auth/login", code, res))

    # 4. Ride Service - Estimate
    est_data = {"pickupLat": 37.7749, "pickupLng": -122.4194, "destLat": 37.7833, "destLng": -122.4167}
    code, res = make_req(f"{GATEWAY_URL}/api/rides/estimate", method="POST", data=est_data)
    report.append(("POST /api/rides/estimate", code, res))

    # 5. Ride Service - Create Ride
    ride_data = {
        "passengerId": "passenger-101",
        "passengerName": "Sarah Jenkins",
        "pickupAddress": "123 Main St",
        "destAddress": "456 Park Ave",
        "pickupLat": 37.7749,
        "pickupLng": -122.4194,
        "destLat": 37.7833,
        "destLng": -122.4167,
        "rideType": "SEDAN"
    }
    code, res = make_req(f"{GATEWAY_URL}/api/rides", method="POST", data=ride_data)
    report.append(("POST /api/rides", code, res))
    
    ride_id = None
    if code in (200, 201):
        ride_id = res.get("ride", {}).get("id")

    # 6. Ride Service - Available Rides
    code, res = make_req(f"{GATEWAY_URL}/api/rides/available")
    report.append(("GET /api/rides/available", code, res))

    # 7. Ride Service - List All Rides
    code, res = make_req(f"{GATEWAY_URL}/api/rides")
    report.append(("GET /api/rides", code, res))

    if ride_id:
        # 8. Get Ride by ID
        code, res = make_req(f"{GATEWAY_URL}/api/rides/{ride_id}")
        report.append((f"GET /api/rides/{ride_id}", code, res))

        # 9. Accept Ride
        accept_headers = {"X-Driver-Id": "driver-101"}
        code, res = make_req(f"{GATEWAY_URL}/api/rides/{ride_id}/accept", method="POST", data={"driverId": "driver-101"}, headers=accept_headers)
        report.append((f"POST /api/rides/{ride_id}/accept", code, res))

        # 10. Driver Arrived
        code, res = make_req(f"{GATEWAY_URL}/api/rides/{ride_id}/arrive", method="POST")
        report.append((f"POST /api/rides/{ride_id}/arrive", code, res))

        # 11. Start Ride
        code, res = make_req(f"{GATEWAY_URL}/api/rides/{ride_id}/start", method="POST")
        report.append((f"POST /api/rides/{ride_id}/start", code, res))

        # 12. Complete Ride
        code, res = make_req(f"{GATEWAY_URL}/api/rides/{ride_id}/complete", method="POST")
        report.append((f"POST /api/rides/{ride_id}/complete", code, res))

        # 13. Payment Service - Get Payment by Ride ID
        code, res = make_req(f"{GATEWAY_URL}/api/payments/ride/{ride_id}")
        report.append((f"GET /api/payments/ride/{ride_id}", code, res))

    # 14. Driver Service - List Drivers
    code, res = make_req(f"{GATEWAY_URL}/api/drivers")
    report.append(("GET /api/drivers", code, res))

    # 15. Driver Service - Status
    code, res = make_req(f"{GATEWAY_URL}/api/drivers/driver-101/status", method="POST", data={"online": True})
    report.append(("POST /api/drivers/driver-101/status", code, res))

    # 16. Driver Service - Location
    code, res = make_req(f"{GATEWAY_URL}/api/drivers/driver-101/location", method="POST", data={"lat": 37.775, "lng": -122.419})
    report.append(("POST /api/drivers/driver-101/location", code, res))

    # Print Summary Report
    print("\n--------------------------------------------------")
    print(" SUMMARY API TEST RESULTS")
    print("--------------------------------------------------")
    for endpoint, status, response in report:
        status_symbol = "[PASS]" if status in (200, 201) else "[FAIL]"
        print(f"{status_symbol} {endpoint:<40} -> HTTP {status}")
        if status not in (200, 201):
            print(f"      DETAILS: {response}")

if __name__ == "__main__":
    run_all_api_tests()
