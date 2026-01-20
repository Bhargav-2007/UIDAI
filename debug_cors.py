import requests

url = "http://localhost:8000/api/unified/descriptive?before=false"
headers = {
    "Origin": "http://localhost:5173",
    "Access-Control-Request-Method": "GET"
}

print(f"Checking URL: {url}")
try:
    # Preflight
    print("\n--- PREFLIGHT ---")
    res = requests.options(url, headers=headers)
    print(f"Status: {res.status_code}")
    for k, v in res.headers.items():
        if "access-control" in k.lower():
            print(f"{k}: { v}")

    # Actual request
    print("\n--- ACTUAL REQUEST ---")
    res = requests.get(url, headers={"Origin": "http://localhost:5173"})
    print(f"Status: {res.status_code}")
    for k, v in res.headers.items():
        if "access-control" in k.lower():
            print(f"{k}: { v}")
            
    # Before=true request
    url_before = "http://localhost:8000/api/unified/descriptive?before=true"
    print(f"\n--- BEFORE=TRUE REQUEST ---")
    print(f"Checking URL: {url_before}")
    res = requests.get(url_before, headers={"Origin": "http://localhost:5173"})
    print(f"Status: {res.status_code}")
    for k, v in res.headers.items():
        if "access-control" in k.lower():
            print(f"{k}: { v}")

except Exception as e:
    print(f"Error: {e}")
