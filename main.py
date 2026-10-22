"""
DemandIQ — Main Application Entry Point
Intelligent Local Business Demand Forecasting & Inventory Optimization Platform
"""
import sys
import os
import subprocess

def main():
    print("=" * 60)
    print("  DemandIQ — Intelligent Local Business Demand Forecaster")
    print("  Know What Sells. Stock What Matters. Grow with Confidence.")
    print("=" * 60)
    
    # Set Python path to backend
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
    sys.path.insert(0, backend_dir)
    sys.path.insert(0, os.path.join(backend_dir, 'apps'))
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    try:
        import django
        django.setup()
        from django.core.management import execute_from_command_line
        
        # If arguments passed, delegate to Django management command
        if len(sys.argv) > 1:
            execute_from_command_line(sys.argv)
        else:
            # Default: run local development server
            print("\nStarting DemandIQ server on http://127.0.0.1:8000 ...")
            execute_from_command_line(['manage.py', 'runserver', '127.0.0.1:8000'])
    except Exception as e:
        print(f"Error starting DemandIQ: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
