import requests

BASE_URL = "http://127.0.0.1:9000"  # Your FastAPI server

# ------------------------
# 1️⃣ GET INSIGHTS
# ------------------------

def test_insights(period="weekly", category=None, item_type=None):
    url = f"{BASE_URL}/insights"
    params = {"period": period}
    if category:
        params["category"] = category
    if item_type:
        params["item_type"] = item_type

    response = requests.get(url, params=params)
    print("INSIGHTS STATUS:", response.status_code)
    print(response.json())
    print("\n")


# ------------------------
# 2️⃣ GET FORECAST
# ------------------------
def test_forecast(period_days=7, category=None, item_type=None):
    url = f"{BASE_URL}/forecast"
    params = {"period_days": period_days}
    if category:
        params["category"] = category
    if item_type:
        params["item_type"] = item_type

    response = requests.get(url, params=params)
    print("FORECAST STATUS:", response.status_code)
    print(response.json())
    print("\n")

# ------------------------
# 3️⃣ GET RECOMMENDATIONS
# ------------------------
def test_recommendations(period_days=7, category=None, item_type=None):
    url = f"{BASE_URL}/recommendations"
    params = {"period_days": period_days}
    if category:
        params["category"] = category
    if item_type:
        params["item_type"] = item_type

    response = requests.get(url, params=params)
    print("RECOMMENDATIONS STATUS:", response.status_code)
    print(response.json())
    print("\n")

# ------------------------
# 4️⃣ GET SUMMARIZED INSIGHTS
# ------------------------
def test_summarize_insights(period="weekly", category=None, item_type=None):
    url = f"{BASE_URL}/summarize_insights"
    params = {"period": period}
    if category:
        params["category"] = category
    if item_type:
        params["item_type"] = item_type

    response = requests.get(url, params=params)
    print("SUMMARIZE INSIGHTS STATUS:", response.status_code)
    print(response.json())
    print("\n")

# ------------------------
# RUN ALL TESTS
# ------------------------
if __name__ == "__main__":
    test_insights()
    test_forecast()
    test_recommendations()
    test_summarize_insights()
