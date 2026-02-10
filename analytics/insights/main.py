# main.py

import os
import pandas as pd
import numpy as np
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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
