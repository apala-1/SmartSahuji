# analytics.py
"""
📊 Sales & Inventory Analytics Module
Implements KPI, trend, profit/loss, and decision support analysis
for Inventory & Sales Management Systems.
"""

import pandas as pd
from datetime import datetime

class SalesAnalytics:
    def __init__(self, sales_df: pd.DataFrame, inventory_df: pd.DataFrame = None):
        """
        :param sales_df: DataFrame of sales & purchase transactions
            Required columns: ['_id', 'product_name', 'barcode', 'category', 
                               'item_type', 'price', 'cost', 'quantity', 'date']
        :param inventory_df: DataFrame of inventory items
            Required columns: ['_id', 'name', 'barcode', 'buyingPrice', 'sellingPrice', 'currentStock']
        """
        self.sales = sales_df.copy()
        self.inventory = inventory_df.copy() if inventory_df is not None else pd.DataFrame()
        self.preprocess_data()

    # ----------------------------
    # 1️⃣ Data Cleaning & Validation
    # ----------------------------
    def preprocess_data(self):
        # Fill missing values
        self.sales['price'] = self.sales['price'].fillna(0)
        self.sales['cost'] = self.sales['cost'].fillna(0)
        self.sales['quantity'] = self.sales['quantity'].fillna(0)
        self.sales['date'] = pd.to_datetime(self.sales['date'], errors='coerce')

        # If inventory exists, override cost with buyingPrice
        if not self.inventory.empty:
            inventory_map = {row['barcode']: row['buyingPrice'] for _, row in self.inventory.iterrows()}
            self.sales['cost'] = self.sales.apply(
                lambda x: inventory_map.get(x['barcode'], x['cost']), axis=1
            )

        # Calculate revenue, total cost, profit, margin
        self.sales['revenue'] = self.sales['price'] * self.sales['quantity']
        self.sales['total_cost'] = self.sales['cost'] * self.sales['quantity']
        self.sales['profit'] = self.sales['revenue'] - self.sales['total_cost']
        self.sales['margin'] = self.sales.apply(
            lambda x: (x['profit'] / x['revenue'] * 100) if x['revenue'] > 0 else 0, axis=1
        )

    # ----------------------------
    # 2️⃣ KPI Calculation
    # ----------------------------
    def compute_kpis(self):
        total_revenue = self.sales['revenue'].sum()
        total_profit = self.sales['profit'].sum()
        gross_margin = (total_profit / total_revenue * 100) if total_revenue else 0
        avg_order_value = self.sales['revenue'].mean()
        sales_growth = self.compute_sales_growth()
        category_contrib = self.sales.groupby('category')['revenue'].sum().to_dict()

        return {
            'total_revenue': total_revenue,
            'total_profit': total_profit,
            'gross_margin': gross_margin,
            'average_order_value': avg_order_value,
            'sales_growth': sales_growth,
            'category_contribution': category_contrib
        }

    # ----------------------------
    # 3️⃣ Trend & Time-Series Analysis
    # ----------------------------
    def aggregate_by_period(self, period: str = 'M'):
        """
        Aggregates revenue, profit by period.
        :param period: 'D' (day), 'W' (week), 'M' (month), 'Y' (year)
        """
        df = self.sales.copy()
        df.set_index('date', inplace=True)
        grouped = df.resample(period).agg({
            'revenue': 'sum',
            'profit': 'sum'
        }).reset_index()
        return grouped

    # ----------------------------
    # 4️⃣ Sales Growth
    # ----------------------------
    def compute_sales_growth(self):
        """
        Calculates percentage growth between last two months.
        """
        df = self.aggregate_by_period('M')
        if len(df) < 2:
            return 0
        prev, curr = df['revenue'].iloc[-2], df['revenue'].iloc[-1]
        growth = ((curr - prev) / prev * 100) if prev != 0 else 0
        return growth

    # ----------------------------
    # 5️⃣ Decision Support / Insights
    # ----------------------------
    def top_profitable_products(self, top_n=5):
        return self.sales.groupby('product_name')['profit'].sum().sort_values(ascending=False).head(top_n).to_dict()

    def low_stock_items(self, threshold=5):
        if self.inventory.empty:
            return {}
        return self.inventory[self.inventory['currentStock'] <= threshold][['name', 'currentStock']].set_index('name')['currentStock'].to_dict()

    def loss_making_products(self):
        loss_df = self.sales[self.sales['profit'] < 0]
        return loss_df.groupby('product_name')['profit'].sum().to_dict()

    # ----------------------------
    # 6️⃣ Custom Filters
    # ----------------------------
    def filter_sales(self, start_date=None, end_date=None, category=None, item_type=None):
        df = self.sales.copy()
        if start_date:
            df = df[df['date'] >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df['date'] <= pd.to_datetime(end_date)]
        if category:
            df = df[df['category'] == category]
        if item_type:
            df = df[df['item_type'] == item_type]
        return df

# ----------------------------
# Example Usage
# ----------------------------
if __name__ == "__main__":
    # Load CSV / JSON exports from your frontend
    sales_df = pd.read_csv("sales_export.csv")
    inventory_df = pd.read_csv("inventory_export.csv")

    analytics = SalesAnalytics(sales_df, inventory_df)

    print("KPI Summary:", analytics.compute_kpis())
    print("Monthly Trends:", analytics.aggregate_by_period('M'))
    print("Top Products:", analytics.top_profitable_products())
    print("Loss Making Products:", analytics.loss_making_products())
    print("Low Stock Alerts:", analytics.low_stock_items())
