"""
Script to start the FastAPI backend with ngrok tunnel.
This exposes your local backend to the internet.

Requirements:
1. Install ngrok: https://ngrok.com/download
2. Get your ngrok auth token from https://dashboard.ngrok.com/get-started/your-authtoken
3. Run: ngrok config add-authtoken YOUR_TOKEN
4. Install pyngrok: pip install pyngrok

Usage:
    python start_with_ngrok.py
"""

import os
import uvicorn
from pyngrok import ngrok
import threading
import time

# Start ngrok tunnel on port 8000
print("Starting ngrok tunnel...")
public_url = ngrok.connect(8000)
print(f"✓ Backend is now accessible at: {public_url}")
print(f"✓ Update your frontend NEXT_PUBLIC_BACKEND_URL to: {public_url}")

# Start the FastAPI server
if __name__ == "__main__":
    print("Starting backend server on http://localhost:8000")
    print(f"Public URL: {public_url}")
    uvicorn.run("main:app", host="0.0.0.0", port=8000)

