import google.genai as genai
import os
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class GeminiAnalytics:
    def __init__(self, api_key=None):
        if api_key is None:
            api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key:
            raise ValueError("GEMINI_API_KEY not found. Set it in .env file.")
        
        # Configure API with new google.genai
        self.client = genai.Client(api_key=api_key)
    
    def generate_insights(self, sales_summary):
        """Generate business insights from sales data"""
        prompt = f"""You are a business analyst AI expert.
Analyze the following sales data and provide:

1. **Key Insights** (3-4 bullet points)
2. **Trend Analysis** (why sales are moving this way)
3. **Next 7-Day Forecast** (predicted trend)
4. **Actionable Recommendations** (3-4 specific actions)

Sales Summary:
{sales_summary}

Format response with clear sections and bullet points."""
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            return response.text
        except Exception as e:
            return f"Error generating insights: {str(e)}"
    
    def get_forecast_numbers(self, sales_summary, last_avg_daily):
        """Get 7-day sales forecast as JSON"""
        prompt = f"""Based on this sales data, provide ONLY a JSON forecast for next 7 days.

Sales Summary:
{sales_summary}

Return ONLY valid JSON (no other text):
{{
    "day_1": 25000,
    "day_2": 26000,
    "day_3": 27000,
    "day_4": 26500,
    "day_5": 28000,
    "day_6": 29000,
    "day_7": 30000
}}

Base numbers on average daily sales of ${last_avg_daily:,.2f} and the trend."""
        
        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            json_str = response.text.strip()
            
            # Clean up response if it has extra text
            if json_str.startswith('{'):
                json_str = json_str[:json_str.rfind('}')+1]
            
            forecast = json.loads(json_str)
            return forecast
        except json.JSONDecodeError as e:
            print(f"⚠️ JSON Parse Error: {e}")
            return None
        except Exception as e:
            print(f"⚠️ Error: {e}")
            return None