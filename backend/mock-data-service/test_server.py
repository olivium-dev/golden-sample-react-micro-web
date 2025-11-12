#!/usr/bin/env python3
import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("Testing imports...")
    
    # Test basic imports
    from fastapi import FastAPI
    print("✓ FastAPI imported successfully")
    
    from routers import parcelets
    print("✓ Parcelets router imported successfully")
    
    from models.parcelet import Parcelet
    print("✓ Parcelet model imported successfully")
    
    # Test creating the app
    from main import app
    print("✓ Main app imported successfully")
    
    print("\nAll imports successful! Starting server...")
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=30001)
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()


