import sqlite3
import pandas as pd
from datetime import datetime, timedelta

class SalesDatabase:
    def __init__(self, db_path="data/sales.db"):
        self.db_path = db_path
        self.conn = None
    
    def connect(self):
        """Connect to SQLite database"""
        self.conn = sqlite3.connect(self.db_path)
        return self.conn
    
    def create_sample_table(self):
        """Create sample sales table if it doesn't exist"""
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                product TEXT,
                sales_amount REAL NOT NULL,
                region TEXT
            )
        ''')
        self.conn.commit()
    
    def insert_sample_data(self):
        """Insert sample sales data for demo"""
        cursor = self.conn.cursor()
        
        # Generate sample data for last 45 days
        sample_data = []
        for i in range(45):
            date = (datetime.now() - timedelta(days=45-i)).strftime('%Y-%m-%d')
            sales = 20000 + (i * 500) + (1000 if i % 3 == 0 else 0)
            sample_data.append((date, 'Product A', sales, 'North'))
        
        cursor.executemany(
            'INSERT OR IGNORE INTO sales (date, product, sales_amount, region) VALUES (?, ?, ?, ?)',
            sample_data
        )
        self.conn.commit()
    
    def fetch_last_n_days(self, days=45):
        """Fetch sales data for last N days"""
        query = '''
            SELECT date, product, sales_amount, region 
            FROM sales 
            WHERE date >= date('now', '-' || ? || ' days')
            ORDER BY date ASC
        '''
        df = pd.read_sql_query(query, self.conn, params=(days,))
        return df
    
    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()