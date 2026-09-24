import urllib.request
import urllib.parse
import json
import concurrent.futures
import time

GATEWAY_URL = "http://localhost:5000"

def make_request(url, method="GET", data=None, headers=None):
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

def run_tests():
    print("==================================================")
    print("URBAN RIDE MOBILITY MICROSERVICES VALIDATION TEST")
    print("==================================================")

    # 1. Health check via API Gateway
    print("\n--- 1. API GATEWAY ROUTING HEALTH CHECKS ---")
    status, res = make_request(f"{GATEWAY_URL}/api/auth/login", method="POST", data={"email": "test@urbanride.com", "password": "password"})
    print(f"[AUTH-SERVICE] Login endpoint reached via API Gateway (Status: {status}): {res}")

    # 2. Create Ride
    print("\n--- 2. CREATING RIDE REQUEST (STATUS: WAITING_FOR_DRIVER) ---")
    ride_payload = {
        "passengerId": "passenger-101",
        "passengerName": "Sarah Jenkins",
        "pickupAddress": "123 Main St, Downtown",
        "destAddress": "456 Park Ave, Uptown",
        "pickupLat": 37.7749,
        "pickupLng": -122.4194,
        "destLat": 37.7833,
        "destLng": -122.4167,
        "rideType": "SEDAN"
    }
    status, res_data = make_request(f"{GATEWAY_URL}/api/rides", method="POST", data=ride_payload)
    print(f"Ride Created HTTP Status: {status}")
    
    if status != 200 and status != 201:
        print(f"FAILED TO CREATE RIDE: {res_data}")
        return

    ride_obj = res_data.get("ride", {})
    ride_id = ride_obj.get("id")
    print(f"Created Ride ID: {ride_id} (Status: {ride_obj.get('status')})")

    # 3. Concurrent Driver Acceptance Test
    print("\n--- 3. CONCURRENT DRIVER ACCEPTANCE RACE CONDITION TEST ---")
    print(f"Simulating 3 drivers (Driver 101, Driver 102, Driver 103) attempting to accept Ride '{ride_id}' SIMULTANEOUSLY...")

    def accept_ride(driver_id):
        url = f"{GATEWAY_URL}/api/rides/{ride_id}/accept"
        headers = {"X-Driver-Id": f"driver-{driver_id}"}
        body = {"driverId": f"driver-{driver_id}"}
        return driver_id, make_request(url, method="POST", data=body, headers=headers)

    drivers = [101, 102, 103]
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        futures = [executor.submit(accept_ride, d) for d in drivers]
        results = [f.result() for f in futures]

    print("\n--- CONCURRENCY TEST RESULTS ---")
    accepted_count = 0
    rejected_count = 0

    for driver_id, (code, body) in results:
        if code == 200:
            accepted_count += 1
            print(f"[SUCCESS] Driver {driver_id}: HTTP {code} SUCCESS -> Ride successfully assigned!")
        elif code == 409:
            rejected_count += 1
            print(f"[CONFLICT] Driver {driver_id}: HTTP {code} CONFLICT -> {body.get('message', 'Already accepted by another driver')}")
        else:
            print(f"[OTHER] Driver {driver_id}: HTTP {code} -> {body}")

    print("\n--------------------------------------------------")
    if accepted_count == 1 and rejected_count == 2:
        print("SUCCESS! ATOMIC CONCURRENCY PREVENTED DOUBLE-BOOKING!")
        print("Exactly 1 driver was awarded the ride (HTTP 200 OK), and 2 drivers received HTTP 409 Conflict.")
    else:
        print(f"Test Result: Accepted={accepted_count}, Rejected={rejected_count}")
    print("--------------------------------------------------")

if __name__ == "__main__":
    run_tests()
