import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_data():
    data = list(collection.find())
    df = pd.DataFrame(data)

    # default columns
    if "date" not in df.columns:
        df["date"] = pd.to_datetime("today")

    if "price" not in df.columns:
        df["price"] = 0

    if "cost" not in df.columns:
        df["cost"] = 0

    if "quantity" not in df.columns:
        df["quantity"] = 1

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["price"] = pd.to_numeric(df["price"], errors="coerce").fillna(0)
    df["cost"] = pd.to_numeric(df["cost"], errors="coerce").fillna(0)
    df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(1)

    df["revenue"] = df["price"] * df["quantity"]
    df["total_cost"] = df["cost"] * df["quantity"]
    df["profit"] = df["revenue"] - df["total_cost"]

    return df


@app.get("/analytics")
def analytics(
    period: str = "weekly",
    start_date: str = None,
    end_date: str = None,
    category: str = None
):
    df = load_data()

    # ====== FILTERS ======
    if start_date:
        df = df[df["date"] >= pd.to_datetime(start_date)]
    if end_date:
        df = df[df["date"] <= pd.to_datetime(end_date)]
    if category:
        df = df[df["category"] == category]

    # ====== PERIOD ======
    if period == "weekly":
        df["period"] = df["date"].dt.strftime("%Y-%U")
    elif period == "monthly":
        df["period"] = df["date"].dt.strftime("%Y-%m")
    elif period == "yearly":
        df["period"] = df["date"].dt.strftime("%Y")
    else:
        raise HTTPException(status_code=400, detail="Invalid period")

    # ====== SUMMARY ======
    summary = {
        "total_revenue": float(df["revenue"].sum()),
        "total_profit": float(df["profit"].sum()),
        "total_orders": int(df.shape[0]),
    }

    # ====== TREND CHART ======
    trend_series = (
        df.groupby("period")[["revenue", "profit"]]
          .sum()
          .reset_index()
          .sort_values("period")
          .to_dict(orient="records")
    )

    # ====== CATEGORY STATS ======
    category_stats = (
        df.groupby("category")[["revenue", "profit"]]
          .sum()
          .reset_index()
    )

    category_stats["loss"] = category_stats.apply(
        lambda x: abs(x["profit"]) if x["profit"] < 0 else 0,
        axis=1
    )

    category_stats["profit_margin"] = category_stats.apply(
        lambda x: 0 if x["revenue"] == 0 else x["profit"] / x["revenue"],
        axis=1
    )

    category_stats = category_stats.sort_values("revenue", ascending=False).to_dict(orient="records")

    # ====== TOP PRODUCTS ======
    top_products = (
        df.groupby("product")[["revenue", "profit"]]
          .sum()
          .reset_index()
          .sort_values("profit", ascending=False)
          .head(5)
          .to_dict(orient="records")
    )

    top_margin_products = (
        df.groupby("product")[["revenue", "profit"]]
          .sum()
          .reset_index()
    )

    top_margin_products["profit_margin"] = top_margin_products.apply(
        lambda x: 0 if x["revenue"] == 0 else x["profit"] / x["revenue"],
        axis=1
    )

    top_margin_products = top_margin_products.sort_values("profit_margin", ascending=False).head(5).to_dict(orient="records")

    return {
        "summary": summary,
        "trend_series": trend_series,
        "category_stats": category_stats,
        "top_products": top_products,
        "top_margin_products": top_margin_products
    }
