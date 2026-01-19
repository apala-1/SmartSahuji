# Import or recompute metrics from basic_analytics.py or redo here
summary = f"""
Total sales last 45 days: {total_sales}
Average daily sales: {avg_sales:.2f}
Highest sale day: {highest_day['date'].date()} ({highest_day['price']})
Lowest sale day: {lowest_day['date'].date()} ({lowest_day['price']})
Trend: {trend}
"""