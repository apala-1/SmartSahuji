import pymongo
import pandas as pd
import plotly.express as px

# 1️⃣ Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client['smartSahuji']
collection = db['products']  # Use 'products' collection for now

# 2️⃣ Fetch data
data = list(collection.find())
if not data:
    print("No product data found in MongoDB.")
    exit()

df = pd.DataFrame(data)
df['date'] = pd.to_datetime(df['date'])

# 3️⃣ Metrics
daily_sales = df.groupby('date')['price'].sum().reset_index()
total_sales = daily_sales['price'].sum()
avg_sales = daily_sales['price'].mean()
highest_day = daily_sales.loc[daily_sales['price'].idxmax()]
lowest_day = daily_sales.loc[daily_sales['price'].idxmin()]

last_7 = daily_sales.tail(7)['price'].mean()
prev_7 = daily_sales.tail(14).head(7)['price'].mean()
trend = "increasing" if last_7 > prev_7 else "decreasing" if last_7 < prev_7 else "stable"

print(f"Total Sales: {total_sales}")
print(f"Average Daily Sales: {avg_sales:.2f}")
print(f"Highest Sale Day: {highest_day['date'].date()} ({highest_day['price']})")
print(f"Lowest Sale Day: {lowest_day['date'].date()} ({lowest_day['price']})")
print(f"Trend: {trend}")

# 4️⃣ Graphs
fig1 = px.line(daily_sales, x='date', y='price', title='Daily Sales Trend')
fig1.show()

product_sales = df.groupby('product')['price'].sum().reset_index()
fig2 = px.bar(product_sales, x='product', y='price', title='Sales per Product')
fig2.show()

# 5️⃣ Simple forecast: next 7 days (last 7-day average)
daily_sales['7day_avg'] = daily_sales['price'].rolling(7).mean()
forecast = [daily_sales['7day_avg'].iloc[-1]] * 7
forecast_dates = pd.date_range(start=daily_sales['date'].max() + pd.Timedelta(days=1), periods=7)

print("Simple forecast for next 7 days:", forecast)

# Optional: overlay forecast on daily sales chart
fig3 = px.line(daily_sales, x='date', y='price', title='Sales + 7-day Forecast')
fig3.add_scatter(x=forecast_dates, y=forecast, mode='lines', name='Forecast')
fig3.show()