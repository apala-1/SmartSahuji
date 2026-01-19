import pandas as pd
import plotly.express as px
from pymongo import MongoClient
from ai_insights import ai_text  # output from Gemini API

# Fetch Mongo data
client = MongoClient("mongodb://localhost:27017/")
db = client['smartSahuji']
collection = db['products']
data = list(collection.find())

if not data:
    print("No product data found in MongoDB.")
    exit()

df = pd.DataFrame(data)
df['date'] = pd.to_datetime(df['date'])
daily_sales = df.groupby('date')['price'].sum().reset_index()

# Suppose AI returns next 7-day forecast in list form
forecast_values = []
forecast_dates = pd.date_range(start=daily_sales['date'].max() + pd.Timedelta(days=1), periods=7)

# Plot daily sales + AI forecast
fig = px.line(daily_sales, x='date', y='price', title='Daily Sales + AI Forecast')
fig.add_scatter(x=forecast_dates, y=forecast_values, mode='lines', name='AI Forecast')
fig.show()

print("AI Insights:\n", ai_text)
