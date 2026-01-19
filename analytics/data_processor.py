import pandas as pd
from datetime import datetime, timedelta

class DataProcessor:
    def __init__(self, df):
        self.df = df.copy()
        self.df['date'] = pd.to_datetime(self.df['date'])
    
    def calculate_metrics(self):
        """Calculate key sales metrics"""
        total_sales = self.df['sales_amount'].sum()
        avg_daily_sales = self.df['sales_amount'].mean()
        
        highest_day = self.df.loc[self.df['sales_amount'].idxmax()]
        lowest_day = self.df.loc[self.df['sales_amount'].idxmin()]
        
        # Calculate overall trend
        if len(self.df) > 1:
            first_half_avg = self.df['sales_amount'].iloc[:len(self.df)//2].mean()
            second_half_avg = self.df['sales_amount'].iloc[len(self.df)//2:].mean()
            
            if second_half_avg > first_half_avg * 1.05:
                overall_trend = "Increasing"
            elif second_half_avg < first_half_avg * 0.95:
                overall_trend = "Decreasing"
            else:
                overall_trend = "Stable"
        else:
            overall_trend = "Insufficient data"
        
        # Last 7 days trend
        last_7 = self.df.tail(7)
        if len(last_7) > 1:
            first_7_avg = last_7['sales_amount'].iloc[:len(last_7)//2].mean()
            second_7_avg = last_7['sales_amount'].iloc[len(last_7)//2:].mean()
            
            if second_7_avg > first_7_avg * 1.05:
                last_7_trend = "Increasing"
            elif second_7_avg < first_7_avg * 0.95:
                last_7_trend = "Decreasing"
            else:
                last_7_trend = "Stable"
        else:
            last_7_trend = "Insufficient data"
        
        metrics = {
            'total_sales': total_sales,
            'avg_daily_sales': avg_daily_sales,
            'highest_day': highest_day['date'].strftime('%Y-%m-%d'),
            'highest_amount': highest_day['sales_amount'],
            'lowest_day': lowest_day['date'].strftime('%Y-%m-%d'),
            'lowest_amount': lowest_day['sales_amount'],
            'overall_trend': overall_trend,
            'last_7_trend': last_7_trend,
            'data_points': len(self.df)
        }
        
        return metrics
    
    def get_structured_summary(self):
        """Generate structured summary for Gemini API"""
        metrics = self.calculate_metrics()
        
        summary = f"""
Sales Data Summary (Last {metrics['data_points']} days):
- Total sales: ${metrics['total_sales']:,.2f}
- Average daily sales: ${metrics['avg_daily_sales']:,.2f}
- Highest sales day: {metrics['highest_day']} (${metrics['highest_amount']:,.2f})
- Lowest sales day: {metrics['lowest_day']} (${metrics['lowest_amount']:,.2f})
- Overall trend: {metrics['overall_trend']}
- Last 7 days trend: {metrics['last_7_trend']}
        """
        
        return summary, metrics
    
    def get_dataframe(self):
        """Return processed dataframe"""
        return self.df