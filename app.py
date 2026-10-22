"""
DemandIQ — Application Web Entry Point
"""
import os
import sys
from main import main

# Expose WSGI application for production servers
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_dir)
sys.path.insert(0, os.path.join(backend_dir, 'apps'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

import django
django.setup()
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

if __name__ == '__main__':
    main()
