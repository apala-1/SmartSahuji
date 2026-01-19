import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

try:
    from analytics.analytics_engine import AnalyticsEngine
    from analytics.visualizations import SalesVisualizer
except ImportError as e:
    print(f"Import error: {e}")
    print(f"Current directory: {current_dir}")
    print(f"Python path: {sys.path}")
    sys.exit(1)

def main():
    """Main entry point for analytics system"""
    
    print("=" * 60)
    print("🚀 AI-AUTOMATED BUSINESS ANALYTICS SYSTEM")
    print("=" * 60 + "\n")
    
    # Ensure data directory exists
    os.makedirs("data", exist_ok=True)
    
    try:
        # Initialize engine
        engine = AnalyticsEngine(db_path="data/sales.db")
        
        # Run complete analysis
        print("📊 Running analysis...\n")
        results = engine.run_analysis(days=45)
        
        if results:
            # Print formatted report
            print("\n" + engine.get_report())
            
            # Create visualizations
            print("\n🎨 Generating visualizations...\n")
            visualizer = SalesVisualizer(
                results['dataframe'],
                results['forecast'],
                results['metrics']
            )
            visualizer.show_all()
        else:
            print("❌ Analysis failed")
    
    except (ValueError, KeyError, FileNotFoundError) as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()