from google.generativeai import Client
from structured_summary import summary

client = Client()  # Make sure you have API credentials set in env

prompt = f"""
You are a business analyst AI.
Analyze the following sales data and generate:
1. Key insights
2. Possible reasons for trends
3. Forecast for next 7 days
4. Recommendations in bullet points

Sales Summary:
{summary}
"""

response = client.generate_text(prompt)
ai_text = response.text
print("AI Insights + Forecast:\n", ai_text)
