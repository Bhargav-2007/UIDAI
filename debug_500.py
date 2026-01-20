import requests

url = "http://localhost:8000/api/unified/descriptive?before=true"
headers = {"Origin": "http://localhost:5173"}

print(f"Checking URL: {url}")
try:
    res = requests.get(url, headers=headers)
    print(f"Status: {res.status_code}")
    if res.status_code == 500:
        print("Response Body:")
        print(res.text)
    else:
        print("Success!")
except Exception as e:
    print(f"Error: {e}")
