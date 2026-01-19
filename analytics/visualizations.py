import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from datetime import timedelta
import pandas as pd

class SalesVisualizer:
    def __init__(self, dataframe, forecast, metrics):
        self.df = dataframe
        self.forecast = forecast
        self.metrics = metrics
    
    def plot_historical_sales(self):
        """Plot historical sales trend"""
        fig = px.line(
            self.df, 
            x='date', 
            y='sales_amount',
            title='📈 Historical Daily Sales Trend',
            labels={'sales_amount': 'Sales ($)', 'date': 'Date'},
            markers=True
        )
        
        fig.add_hline(
            y=self.metrics['avg_daily_sales'], 
            line_dash="dash", 
            line_color="red",
            annotation_text="Average"
        )
        
        fig.update_layout(hovermode='x unified', height=500)
        return fig
    
    def plot_forecast(self):
        """Plot sales forecast for next 7 days"""
        if not self.forecast:
            return None
        
        forecast_dates = pd.date_range(
            start=self.df['date'].max() + timedelta(days=1), 
            periods=7
        )
        
        forecast_values = [self.forecast.get(f'day_{i+1}', 0) for i in range(7)]
        
        forecast_df = pd.DataFrame({
            'date': forecast_dates,
            'forecast_sales': forecast_values
        })
        
        fig = px.bar(
            forecast_df,
            x='date',
            y='forecast_sales',
            title='📅 7-Day Sales Forecast (AI Generated)',
            labels={'forecast_sales': 'Predicted Sales ($)', 'date': 'Date'},
            color_discrete_sequence=['#1f77b4']
        )
        
        fig.update_layout(hovermode='x', height=400)
        return fig
    
    def plot_combined(self):
        """Plot historical sales + forecast combined"""
        if not self.forecast:
            return self.plot_historical_sales()
        
        forecast_dates = pd.date_range(
            start=self.df['date'].max() + timedelta(days=1), 
            periods=7
        )
        
        forecast_values = [self.forecast.get(f'day_{i+1}', 0) for i in range(7)]
        
        fig = make_subplots(specs=[[{"secondary_y": False}]])
        
        # Historical data
        fig.add_trace(
            go.Scatter(
                x=self.df['date'],
                y=self.df['sales_amount'],
                mode='lines+markers',
                name='Historical Sales',
                line=dict(color='blue', width=2)
            )
        )
        
        # Forecast
        fig.add_trace(
            go.Bar(
                x=forecast_dates,
                y=forecast_values,
                name='AI Forecast',
                marker=dict(color='orange', opacity=0.7)
            )
        )
        
        fig.update_layout(
            title='📊 Historical Sales + AI Forecast',
            xaxis_title='Date',
            yaxis_title='Sales ($)',
            hovermode='x unified',
            height=600
        )
        
        return fig
    
    def plot_high_low_days(self):
        """Highlight highest and lowest sales days"""
        df_highlight = self.df.copy()
        df_highlight['label'] = 'Normal'
        df_highlight.loc[df_highlight['sales_amount'].idxmax(), 'label'] = 'Highest'
        df_highlight.loc[df_highlight['sales_amount'].idxmin(), 'label'] = 'Lowest'
        
        fig = px.bar(
            df_highlight,
            x='date',
            y='sales_amount',
            color='label',
            title='🎯 Highest & Lowest Performing Days',
            color_discrete_map={
                'Normal': '#d3d3d3',
                'Highest': '#2ecc71',
                'Lowest': '#e74c3c'
            }
        )
        
        fig.update_layout(height=400)
        return fig
    
    def show_all(self):
        """Display all visualizations"""
        fig1 = self.plot_historical_sales()
        fig2 = self.plot_combined()
        fig3 = self.plot_high_low_days()
        
        fig1.show()
        fig2.show()
        fig3.show()