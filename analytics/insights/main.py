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
from summarizer import InsightsSummarizer

# Initialize summarizer once
summarizer = InsightsSummarizer()

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


# ==============================
# DATA LOADER
# ==============================
def inventory_data():
    # data = list(collection.find())
    # df = pd.DataFrame(data)
    df = pd.read_csv('../../data/inventory.csv')
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
    Automatically adapts to dataset size.
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

    # Filter
    if category:
        df = df[df["category"] == category]
    if item_type:
        df = df[df["item_type"] == item_type]

    # Aggregate daily sales
    daily_sales = df.groupby("date")["quantity"].sum().sort_index()

    # Fill missing dates (important for continuous time series)
    all_dates = pd.date_range(start=daily_sales.index.min(), end=daily_sales.index.max())
    daily_sales = daily_sales.reindex(all_dates, fill_value=0)

    n_days = len(daily_sales)
    seasonal_periods = 7  # weekly seasonality

    # Forecast
    try:
        if n_days < seasonal_periods:
            # Very small data → simple average
            forecast_values = pd.Series(
                [daily_sales.mean()] * period_days,
                index=pd.date_range(start=daily_sales.index.max() + pd.Timedelta(days=1), periods=period_days)
            )
        elif n_days < 2 * seasonal_periods:
            # Enough for trend but not full seasonality
            model = ExponentialSmoothing(
                daily_sales,
                trend="add",
                seasonal=None
            )
            model_fit = model.fit()
            forecast_values = model_fit.forecast(period_days)
        else:
            # Enough data for full seasonal forecast
            model = ExponentialSmoothing(
                daily_sales,
                trend="add",
                seasonal="add",
                seasonal_periods=seasonal_periods
            )
            model_fit = model.fit()
            forecast_values = model_fit.forecast(period_days)
    except Exception as e:
        # fallback
        forecast_values = pd.Series(
            [daily_sales.mean()] * period_days,
            index=pd.date_range(start=daily_sales.index.max() + pd.Timedelta(days=1), periods=period_days)
        )

    # Revenue
    avg_price = df["price"].mean()
    revenue_forecast = forecast_values * avg_price

    # Historical spikes
    rolling_avg = daily_sales.rolling(seasonal_periods).mean()
    rolling_std = daily_sales.rolling(seasonal_periods).std()
    historical_spikes = daily_sales > (rolling_avg + spike_threshold * rolling_std)
    historical_spikes_dict = {str(k.date()): bool(v) for k, v in historical_spikes.items() if not pd.isna(v)}

    # Forecast spikes
    mean_hist = daily_sales.mean()
    std_hist = daily_sales.std()
    forecast_spikes = forecast_values > (mean_hist + spike_threshold * std_hist)
    forecast_spikes_dict = {str(k.date()): bool(v) for k, v in forecast_spikes.items()}

    # Format output
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
            "historical_days_used": n_days,
            "spike_threshold_multiplier": spike_threshold
        }
    }

# ==============================
# RECOMMENDATIONS ENDPOINT
# ==============================

@app.get("/recommendations")
def recommendation(
    period_days: int = 7,
    category: str = None,
    item_type: str = None,
    spike_threshold: float = 1.5
):

    df = load_data()
    inventory_df = inventory_data()

    if df.empty or inventory_df.empty:
        return {
            "restock": [],
            "pricing": [],
            "bundling": []
        }

    # ==============================
    # FILTER SALES
    # ==============================
    if category:
        df = df[df["category"] == category]

    if item_type:
        df = df[df["item_type"] == item_type]

    # ==============================
    # DAILY SALES + AVG DEMAND
    # ==============================
    daily_sales = df.groupby(["date", "product"])["quantity"].sum().reset_index()
    avg_daily = daily_sales.groupby("product")["quantity"].mean()
    total_sales = df.groupby("product")["quantity"].sum()

    # ==============================
    # RESTOCK RECOMMENDATIONS
    # ==============================
    restock_recommendations = []

    for _, item in inventory_df.iterrows():
        product_name = item["name"]

        if product_name not in avg_daily:
            continue

        avg_demand = avg_daily[product_name]
        current_stock = item.get("currentStock", 0)
        min_stock = item.get("minStock", 0)
        reorder_qty = item.get("reorderQty", 0)

        if avg_demand == 0:
            continue

        days_remaining = current_stock / avg_demand

        urgency = None

        if current_stock <= min_stock:
            urgency = "Critical"
        elif days_remaining < 7:
            urgency = "High"
        elif days_remaining < 14:
            urgency = "Medium"

        if urgency:
            suggested_qty = max(reorder_qty, int(avg_demand * 14))

            restock_recommendations.append({
                "product": product_name,
                "current_stock": int(current_stock),
                "days_remaining": round(days_remaining, 2),
                "suggested_reorder_qty": int(suggested_qty),
                "urgency": urgency
            })

    # ==============================
    # PRICE OPTIMIZATION
    # ==============================
    pricing_recommendations = []

    if not total_sales.empty:
        high_sales_threshold = total_sales.quantile(0.8)
        low_sales_threshold = total_sales.quantile(0.2)

        for _, item in inventory_df.iterrows():
            product_name = item["name"]

            if product_name not in total_sales:
                continue

            selling_price = item.get("sellingPrice", 0)
            buying_price = item.get("buyingPrice", 0)
            current_stock = item.get("currentStock", 0)

            if selling_price == 0:
                continue

            margin = (selling_price - buying_price) / selling_price
            product_sales = total_sales[product_name]

            suggestion = None
            reason = None

            # High demand + strong margin
            if product_sales >= high_sales_threshold and margin > 0.3:
                suggestion = "Increase price by 5%"
                reason = "High demand and strong margin"

            # Low demand + high stock
            elif product_sales <= low_sales_threshold and current_stock > 20:
                suggestion = "Consider 5-10% discount"
                reason = "Low demand and excess stock"

            # Very low margin
            elif margin < 0.1:
                suggestion = "Review pricing strategy"
                reason = "Low profit margin"

            if suggestion:
                pricing_recommendations.append({
                    "product": product_name,
                    "current_margin": round(margin, 2),
                    "suggested_action": suggestion,
                    "reason": reason
                })

    # ==============================
    # SIMPLE PRODUCT BUNDLING
    # ==============================
    from itertools import combinations
    from collections import Counter

    bundling_recommendations = []

    # Only works if you have transaction-level grouping
    if "invoice_id" in df.columns:
        transactions = (
            df.groupby("invoice_id")["product"]
            .apply(list)
            .values
        )

        pair_counter = Counter()

        for items in transactions:
            unique_items = list(set(items))
            for pair in combinations(unique_items, 2):
                pair_counter[tuple(sorted(pair))] += 1

        top_pairs = pair_counter.most_common(5)

        for pair, count in top_pairs:
            bundling_recommendations.append({
                "products": list(pair),
                "times_bought_together": count,
                "suggested_discount": "10%"
            })

    # ==============================
    # FINAL OUTPUT
    # ==============================
    return {
        "restock": restock_recommendations,
        "pricing": pricing_recommendations,
        "bundling": bundling_recommendations
    }

def insights_to_text(insights):
    best_selling = ", ".join([f"{k} with {v} units sold" for k, v in insights['sales']['best_selling_products'].items()])
    worst_selling = ", ".join([f"{k} with {v} units sold" for k, v in insights['sales']['worst_selling_products'].items()])
    peak_days = ", ".join([f"{k} with revenue ${v:.2f}" for k, v in insights['sales']['peak_sales_days'].items()])
    non_peak_days = ", ".join([f"{k} with revenue ${v:.2f}" for k, v in insights['sales']['non_peak_sales_days'].items()])
    high_margin = ", ".join([f"{k} margin {v:.2f}" for k, v in insights['items']['high_margin_items'].items()])
    low_margin = ", ".join([f"{k} margin {v:.2f}" for k, v in insights['items']['low_margin_items'].items()])
    revenue_trend = insights['revenue_trends']

    text = f"""
    The sales analysis shows that the best selling products were {best_selling}.
    The worst performing products were {worst_selling}.
    The peak sales occurred on {peak_days}, while non-peak days were {non_peak_days}.
    The overall revenue trend is {revenue_trend}.
    High margin products include {high_margin}.
    Low margin products include {low_margin}.
    """
    return text

@app.get("/summarize_insights")
def summarize_insights(period: str = "weekly", category: str = None, item_type: str = None):
    # 1️⃣ Get insights from existing function
    data = insights(period=period, category=category, item_type=item_type)

    # 2️⃣ Convert JSON insights → plain text for model
    text = insights_to_text(data)

    # 3️⃣ Generate summary paragraph
    summary_paragraph = summarizer.summarize_text(text, max_length=150, min_length=60)

    # 4️⃣ Return as JSON
    return {
        "summary": summary_paragraph,
        "raw_text": text
    }
