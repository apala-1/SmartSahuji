# main.py

import os
import pandas as pd
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from statsmodels.tsa.holtwinters import ExponentialSmoothing
print("🔥 RUNNING INSIGHTS MAIN.PY 🔥")
# ==============================
# LOAD ENV
# ==============================
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

if not MONGO_URI or not DB_NAME or not COLLECTION_NAME:
    raise Exception("Missing environment variables in .env")

# ==============================
# DATABASE CONNECTION
# ==============================
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# ==============================
# FASTAPI SETUP
# ==============================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# DATA LOADER
# ==============================
def load_data():
    # data = list(collection.find())
    # df = pd.DataFrame(data)
    df = pd.read_csv('../../data/sales_500.csv')
    print(f"Df content: {df.head()}")
    print("Loaded rows:", len(df))

    # If collection empty, create safe dataframe
    if df.empty:
        return pd.DataFrame(
            columns=["date","price","cost","quantity","category","product", "item_type"]
        )

    # ---- Ensure required columns exist ----
    if "date" not in df.columns:
        df["date"] = pd.to_datetime("today")

    if "price" not in df.columns:
        df["price"] = 0

    if "cost" not in df.columns:
        df["cost"] = 0

    if "quantity" not in df.columns:
        df["quantity"] = 1

    if "category" not in df.columns:
        df["category"] = "Unknown"

    if "item_type" not in df.columns:
        df["item_type"] = "Unknown"

    if "product" not in df.columns:
        df["product"] = "Unknown"

    # ---- item_type conversions ----
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(0)
    df["cost"] = pd.to_numeric(df["cost"], errors="coerce").fillna(0)
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(1)

    # ---- Calculations ----
    df["revenue"] = df["price"] * df["quantity"]
    df["total_cost"] = df["cost"] * df["quantity"]
    df["profit"] = df["revenue"] - df["total_cost"]
    df["margin"] = np.where(
        df["revenue"] == 0,
        np.nan,
        df["profit"] / df["revenue"]
    )

    return df

@app.get("/insights")
def insights(
    period: str = "weekly",
    start_date: str = None,
    end_date: str = None,
    category: str = None,
    item_type: str = None
):
    df = load_data()

    if df.empty:
        return {
            "sales": {
                "best_selling_products": [],
                "worst_selling_products": [],
                "peak_sales_days": [],
                "non_peak_sales_days": [],
            },
            "items": {
                "low_margin_items": [],
                "high_margin_items": [],
            },
            "revenue_trends": "Unknown", # After calculation, Upper trend or Lower trend acc to numeric value
        }

    # ==============================
    # FILTERS
    # ==============================
    if start_date:
        df = df[df["date"] >= pd.to_datetime(start_date)]

    if end_date:
        df = df[df["date"] <= pd.to_datetime(end_date)]

    if category:
        df = df[df["category"] == category]

    if item_type:
        df = df[df["item_type"] == item_type]

    # ==============================
    # PERIOD GROUPING
    # ==============================
    if period == "weekly":
        df["period"] = df["date"].dt.strftime("%Y-%U")
    elif period == "monthly":
        df["period"] = df["date"].dt.strftime("%Y-%m")
    elif period == "yearly":
        df["period"] = df["date"].dt.strftime("%Y")
    else:
        raise HTTPException(status_code=400, detail="Invalid period")

    # ==============================
    # Sales
    # ==============================
    best_selling = (
        df.groupby("product")["quantity"]
        .sum()
        .sort_values(ascending=False)
        .head(5)
    )

    worst_selling = (
        df.groupby("product")["quantity"]
        .sum()
        .sort_values(ascending=True)
        .head(5)
    )

    peak_sales = (
        df.groupby("date")["revenue"]
        .sum()
    )

    peak_thresholds = peak_sales.quantile(0.80)
    non_peak_thresholds = peak_sales.quantile(0.20)

    peak_Sales_fin = peak_sales[peak_sales >= peak_thresholds]
    non_peak_Sales_fin = peak_sales[peak_sales <= non_peak_thresholds]

    sales = {
        "best_selling_products": best_selling.to_dict(),
        "worst_selling_products": worst_selling.to_dict(),
        "peak_sales_days": peak_Sales_fin.to_dict(),
        "non_peak_sales_days": non_peak_Sales_fin.to_dict(),
    }

    # ==============================
    # Items
    # ==============================
    high_margin = (
        df.groupby("product")["margin"]
        .mean()
        .sort_values(ascending=False)
        .head(5)
    )

    low_margin = (
        df.groupby("product")["margin"]
        .mean()
        .sort_values(ascending=False)
        .tail(5)
    )

    items = {
        "low_margin_items": low_margin.to_dict(),
        "high_margin_items": high_margin.to_dict(),
    }

    # ==============================
    # Revenue Trends
    # ==============================
    revenue = (
        df.groupby("date")["revenue"]
        .sum()
        .reset_index()
    )

    revenue['pct_change'] = revenue['revenue'].pct_change()

    avg_growth = revenue['pct_change'].mean()

    if avg_growth > 0:
        revenue_trends = "Upward Trend"
    else:
        revenue_trends = "Downward Trend"

    insight_metadata = {
        "thresholds": {
            "peak_percentile": "80%",
            "non_peak_percentile": "20%",
            "peak_value": float(peak_thresholds),
            "non_peak_value": float(non_peak_thresholds)
        },
        "period_grouping": period,
        "period_sales": df.groupby("period")["revenue"].sum().to_dict()
    }


    return {
        "sales": sales,
        "items": items,
        "revenue_trends": revenue_trends,
        "insight_metadata": insight_metadata
    }

# ==============================
# FORECASTING ENDPOINT
# ==============================

@app.get("/forecast")
def forecast_sales(
    period_days: int = 7,
    category: str = None,
    item_type: str = None,
    spike_threshold: float = 1.5  # Multiplier for rolling avg + std
):
    """
    Forecast sales and revenue for the next `period_days`.
    Detect demand spikes in historical and forecasted data.
    """

    df = load_data()

    if df.empty:
        return {
            "forecast": {},
            "revenue_forecast": {},
            "historical_spikes": {},
            "forecast_spikes": {},
            "message": "No sales data available"
        }

    # ------------------------------
    # FILTER DATA
    # ------------------------------
    if category:
        df = df[df["category"] == category]
    if item_type:
        df = df[df["item_type"] == item_type]

    # ------------------------------
    # AGGREGATE DAILY SALES
    # ------------------------------
    daily_sales = df.groupby("date")["quantity"].sum().sort_index()

    if len(daily_sales) < 7:
        return {
            "forecast": {},
            "revenue_forecast": {},
            "historical_spikes": {},
            "forecast_spikes": {},
            "message": "Not enough historical data for forecasting"
        }

    # ------------------------------
    # FORECAST USING HOLT-WINTERS
    # ------------------------------
    try:
        model = ExponentialSmoothing(
            daily_sales,
            trend="add",
            seasonal="add",
            seasonal_periods=7
        )
        model_fit = model.fit()
        forecast_values = model_fit.forecast(period_days)
    except Exception as e:
        return {"error": f"Forecasting failed: {str(e)}"}

    # ------------------------------
    # REVENUE PROJECTION
    # ------------------------------
    avg_price = df["price"].mean()
    revenue_forecast = forecast_values * avg_price

    # ------------------------------
    # HISTORICAL DEMAND SPIKES
    # ------------------------------
    rolling_avg = daily_sales.rolling(7).mean()
    rolling_std = daily_sales.rolling(7).std()
    historical_spikes = daily_sales > (rolling_avg + spike_threshold * rolling_std)
    historical_spikes_dict = {
        str(k.date()): bool(v) for k, v in historical_spikes.items() if not pd.isna(v)
    }

    # ------------------------------
    # FORECAST DEMAND SPIKES
    # ------------------------------
    mean_hist = daily_sales.mean()
    std_hist = daily_sales.std()
    forecast_spikes = forecast_values > (mean_hist + spike_threshold * std_hist)
    forecast_spikes_dict = {str(k.date()): bool(v) for k, v in forecast_spikes.items()}

    # ------------------------------
    # FORMAT OUTPUT
    # ------------------------------
    forecast_dict = {str(k.date()): float(v) for k, v in forecast_values.items()}
    revenue_dict = {str(k.date()): float(v) for k, v in revenue_forecast.items()}

    return {
        "forecast": forecast_dict,
        "revenue_forecast": revenue_dict,
        "historical_spikes": historical_spikes_dict,
        "forecast_spikes": forecast_spikes_dict,
        "metadata": {
            "avg_price": avg_price,
            "period_days": period_days,
            "historical_days_used": len(daily_sales),
            "spike_threshold_multiplier": spike_threshold
        }
    }