import os
import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import matplotlib.pyplot as plt
import seaborn as sns

# Load env variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# Load data
data = list(collection.find())
df = pd.DataFrame(data)

# Convert date fields
df["date"] = pd.to_datetime(df["date"])
df["price"] = pd.to_numeric(df["price"], errors="coerce")
df["cost"] = pd.to_numeric(df["cost"], errors="coerce")
df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce")

# Calculate profit
df["revenue"] = df["price"] * df["quantity"]
df["total_cost"] = df["cost"] * df["quantity"]
df["profit"] = df["revenue"] - df["total_cost"]

# Basic analysis
print("Total Records:", len(df))
print("Total Revenue:", df["revenue"].sum())
print("Total Profit:", df["profit"].sum())

# Visualization 1: Revenue by Category
plt.figure(figsize=(10, 6))
sns.barplot(data=df, x="category", y="revenue", estimator=sum)
plt.title("Revenue by Category")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Visualization 2: Profit by Category
plt.figure(figsize=(10, 6))
sns.barplot(data=df, x="category", y="profit", estimator=sum)
plt.title("Profit by Category")
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()

# Insights: Top 5 Products by Profit
top_profit_products = df.groupby("product")["profit"].sum().sort_values(ascending=False).head(5)
print("\nTop 5 Products by Profit:")
print(top_profit_products)

# Insights: Worst 5 Products by Profit (Loss)
worst_profit_products = df.groupby("product")["profit"].sum().sort_values(ascending=True).head(5)
print("\nWorst 5 Products by Profit (Loss):")
print(worst_profit_products)
