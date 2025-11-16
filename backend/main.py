import os
import uvicorn
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from supabase import create_client, Client
from typing import Optional

load_dotenv()

# --- Import your "AI Brain" ---
import services 

# --- 1. INITIALIZATION ---

# Load all environment variables from .env file

# Initialize FastAPI app
app = FastAPI()

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")

# Verify service key is set
if not supabase_key:
    raise ValueError("SUPABASE_SERVICE_KEY must be set in environment variables")

supabase: Client = create_client(supabase_url, supabase_key)
print(f"Supabase client initialized with service key (first 20 chars: {supabase_key[:20]}...)")

# --- 2. CORS (Cross-Origin Resource Sharing) ---
# This is CRITICAL. It allows your React app (running on localhost:3000
# or Vercel) to talk to this backend (running on localhost:8000).
origins = [
    "http://localhost:3000",  # Your React dev server
    "http://localhost:5173",  # Another common React dev server
    # Add your production frontend URLs here (without trailing slashes)
    "https://ai-detector-h1zf.vercel.app",  # Vercel deployment
    # Add more frontend URLs as needed
    # Ngrok URLs will be added dynamically - you can also add them here manually
    # Example: "https://abc123.ngrok.io"
]

# Also allow frontend URL from environment variable
frontend_url = os.environ.get("FRONTEND_URL")
if frontend_url:
    # Remove trailing slash and add to origins
    frontend_url = frontend_url.rstrip('/')
    if frontend_url not in origins:
        origins.append(frontend_url)
        print(f"Added frontend URL to CORS: {frontend_url}")

# Allow ngrok URLs dynamically (for testing)
# You can also set ALLOW_ALL_ORIGINS=true in .env for testing
allow_all_origins = os.environ.get("ALLOW_ALL_ORIGINS", "false").lower() == "true"

# Print allowed origins for debugging
print(f"Allowed CORS origins: {origins}")

if allow_all_origins:
    print("⚠️  WARNING: CORS is set to allow all origins (for testing only!)")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        expose_headers=["*"],
        max_age=3600,
    )

# Add exception handler to ensure CORS headers on all errors
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Ensure CORS headers are included in error responses"""
    headers = dict(exc.headers) if exc.headers else {}
    # Get origin from request
    origin = request.headers.get("origin")
    
    # Determine allowed origin
    if allow_all_origins:
        cors_origin = "*"
    elif origin and origin in origins:
        cors_origin = origin
    elif origins:
        cors_origin = origins[0]  # Fallback to first allowed origin
    else:
        cors_origin = "*"
    
    headers["Access-Control-Allow-Origin"] = cors_origin
    headers["Access-Control-Allow-Credentials"] = "true"
    headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
    
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers
    )

# --- 3. AUTHENTICATION HELPER ---
async def verify_token(authorization: Optional[str] = Header(None)):
    """
    Verify Supabase JWT token from Authorization header.
    Uses Supabase admin client to verify the token.
    Returns user info if valid.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # Return error with CORS headers
        raise HTTPException(
            status_code=401, 
            detail="Missing or invalid authorization header",
            headers={"Access-Control-Allow-Origin": "*"}
        )
    
    token = authorization.replace("Bearer ", "")
    
    try:
        # Use Supabase admin client to verify the JWT token
        # The admin client can verify user tokens
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=401, 
                detail="Invalid token",
                headers={"Access-Control-Allow-Origin": "*"}
            )
        return user_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=401, 
            detail=f"Token verification failed: {str(e)}",
            headers={"Access-Control-Allow-Origin": "*"}
        )

# --- 4. PYDANTIC MODELS (Data Validation) ---
# This defines what your frontend must send in its "package"
class AnalysisRequest(BaseModel):
    text: str

# --- 5. HANDLE OPTIONS REQUESTS (CORS Preflight) ---
@app.options("/analyze-document")
async def options_analyze_document(request: Request):
    """Handle CORS preflight requests"""
    origin = request.headers.get("origin")
    
    # Determine allowed origin
    if allow_all_origins:
        cors_origin = "*"
    elif origin and origin in origins:
        cors_origin = origin
    elif origins:
        cors_origin = origins[0]
    else:
        cors_origin = "*"
    
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
    )

# --- 6. THE API ENDPOINT ---
@app.post("/analyze-document")
async def analyze_document(
    request: AnalysisRequest,
    user = Depends(verify_token)
):
    """
    This is the main "manager" endpoint.
    It coordinates the specialists and logs to the database.
    """
    user_id = user.user.id
    user_email = user.user.email or ""
    
    # Extract user name from email (same logic as frontend)
    import re
    user_name_parts = re.split(r'[._-]', user_email.split("@")[0])
    user_name = " ".join([part.capitalize() for part in user_name_parts]) if user_name_parts else "User"
    
    # --- Step 1: Call the "AI Brain" (Specialists) ---
    # Run both AI analysis and web search at the same time (concurrently)
    # This is much faster than running them one by one.
    print(f"Starting analysis for user: {user_name} ({user_id})")
    try:
        [ai_report, online_report] = await asyncio.gather(
            services.analyze_ai_likelihood(request.text),
            services.find_online_plagiarism(request.text)
        )
    except Exception as e:
        # This catches errors from the Gemini calls
        print(f"Error during Gemini analysis: {e}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {e}")

    # --- Step 2: Transform AI likelihood to match frontend expectations ---
    # Backend returns: "Very Low", "Low", "Medium", "High", "Very High"
    # Frontend expects: "Low", "Medium", "High"
    likelihood_mapping = {
        "Very Low": "Low",
        "Low": "Low",
        "Medium": "Medium",
        "High": "High",
        "Very High": "High"
    }
    
    ai_likelihood = ai_report.get("likelihood", "Low")
    normalized_likelihood = likelihood_mapping.get(ai_likelihood, "Low")
    
    # --- Step 3: Combine the report (matching frontend structure) ---
    final_report = {
        "ai_likelihood": normalized_likelihood,
        "ai_reasoning": ai_report.get("reasoning", ""),
        "online_sources": online_report.get("sources", []),
        "online_sources_count": len(online_report.get("sources", []))
    }

    # --- Step 4: Save to Supabase Database (matching frontend schema) ---
    print(f"Saving report to Supabase for user: {user_id}")
    try:
        insert_data = {
            "user_id": user_id,
            "user_name": user_name,
            "content": {"text": request.text},  # Store as JSONB matching frontend
            "report": final_report  # Save the complete JSON report
        }
        
        # Use the service key (admin client) to insert into the 'submissions' table
        # The service key should bypass RLS policies
        print(f"Inserting data: {insert_data}")
        response = supabase.table("submissions").insert(insert_data).execute()
        
        print(f"Supabase response: {response}")
        
        if not response.data or len(response.data) == 0:
             # This handles Supabase RLS errors or other insert issues
             print(f"Supabase insert error - no data returned: {response}")
             # Check if there's an error in the response
             if hasattr(response, 'error') and response.error:
                 print(f"Supabase error details: {response.error}")
             raise Exception("Database save failed. Check RLS or table policies.")

    except Exception as e:
        # This catches errors from the database insert
        error_msg = str(e)
        print(f"Error saving to database: {error_msg}")
        # Provide more helpful error message
        if "row-level security" in error_msg.lower() or "42501" in error_msg:
            raise HTTPException(
                status_code=500, 
                detail="Database save failed due to RLS policy. Ensure SUPABASE_SERVICE_KEY is the service_role key (not anon key)."
            )
        raise HTTPException(status_code=500, detail=f"Database save failed: {error_msg}")

    # --- Step 5: Send the Result to the Frontend ---
    print("Analysis complete. Sending report to frontend.")
    return {
        "status": "success",
        "report": final_report,
        "submission_id": response.data[0]["id"] if response.data else None
    }

# --- 5. RUN THE SERVER ---
if __name__ == "__main__":
    print("Starting backend server on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)