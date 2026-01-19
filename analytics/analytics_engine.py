import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from .database import SalesDatabase
from .data_processor import DataProcessor
from .gemini_api import GeminiAnalytics
import json

class AnalyticsEngine:
    def __init__(self, db_path="data/sales.db", gemini_api_key=None):
        self.db = SalesDatabase(db_path)
        self.gemini = GeminiAnalytics(gemini_api_key)
        self.metrics = None
        self.insights = None
        self.forecast = None
        self.dataframe = None
    
    def run_analysis(self, days=45):
        """Run complete analysis pipeline"""
        print("🔄 Starting analytics pipeline...\n")
        
        # Step 1: Connect to database
        print("📊 Fetching sales data...")
        self.db.connect()
        self.db.create_sample_table()
        self.db.insert_sample_data()
        df = self.db.fetch_last_n_days(days)
        self.db.close()
        
        if df.empty:
            print("❌ No data found in database")
            return None
        
        # Step 2: Process data
        print("✅ Data fetched successfully\n")
        print("📈 Processing data...")
        processor = DataProcessor(df)
        summary, metrics = processor.get_structured_summary()
        self.metrics = metrics
        self.dataframe = processor.get_dataframe()
        
        print(summary)
        
        # Step 3: Generate AI insights
        print("\n🤖 Generating AI insights from Gemini API...")
        self.insights = self.gemini.generate_insights(summary)
        print("✅ Insights generated\n")
        print(self.insights)
        
        # Step 4: Get forecast
        print("\n📅 Generating sales forecast...")
        self.forecast = self.gemini.get_forecast_numbers(summary, metrics['avg_daily_sales'])
        print("✅ Forecast generated\n")
        
        if self.forecast:
            print("📊 7-Day Sales Forecast:")
            for day, value in self.forecast.items():
                print(f"  {day}: ${value:,.2f}")
        
        return {
            'metrics': self.metrics,
            'insights': self.insights,
            'forecast': self.forecast,
            'dataframe': self.dataframe
        }
    
    def get_report(self):
        """Return formatted report"""
        if not self.metrics or not self.insights:
            return "⚠️ Run analysis first using run_analysis()"
        
        report = f"""
╔════════════════════════════════════════╗
║  AI BUSINESS ANALYTICS REPORT          ║
╚════════════════════════════════════════╝

📊 KEY METRICS:
- Total Sales: ${self.metrics['total_sales']:,.2f}
- Average Daily Sales: ${self.metrics['avg_daily_sales']:,.2f}
- Highest Day: {self.metrics['highest_day']} (${self.metrics['highest_amount']:,.2f})
- Lowest Day: {self.metrics['lowest_day']} (${self.metrics['lowest_amount']:,.2f})

🎯 INSIGHTS:
{self.insights}

📅 FORECAST (Next 7 Days):
{json.dumps(self.forecast, indent=2) if self.forecast else "Forecast unavailable"}
        """
        return report