import os
import json
import google.generativeai as genai

# --- 1. CONFIGURE THE GEMINI CLIENT ---
try:
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_key:
        raise ValueError("GEMINI_API_KEY must be set in .env")
    genai.configure(api_key=gemini_key)
except Exception as e:
    print(f"ERROR: Failed to configure Gemini. {e}")
    raise

# --- 2. THE "WEB RESEARCHER" (V2 - Unchanged) ---
web_researcher_prompt = """
You are a simple and direct plagiarism detection service.

Your *only* job is to do the following:
1.  You will be given a text (in Norwegian or English).
2.  You will use your `Google Search` tool to find pages on the web that contain 
    exact or near-exact matches to sentences or paragraphs from this text.
3.  You will *only* report sources that your `Google Search` tool *actually finds*. 
    Do not use your internal knowledge.

Return your findings as a JSON object with one key: "sources".
"sources" must be an array of objects. Each object must have:
1. "url": The source URL.
2. "title": The page title.
3. "snippet": A small quote of the matching text from the *user's input*.

If your `Google Search` tool finds no relevant matches, you MUST return 
an empty "sources" array: { "sources": [] }
"""

# --- 3. MODEL & CONFIGURATION SETUP ---

ai_analyst_config = genai.GenerationConfig(
    response_mime_type="application/json",
    temperature=0.0 # <-- CRITICAL: Set to 0.0 for max stability
)

web_researcher_config = genai.GenerationConfig(
    response_mime_type="application/json"
)

# The AI Analyst model no longer has a system_instruction.
ai_analyst_model = genai.GenerativeModel(
    'gemini-2.5-flash-preview-09-2025'
)

web_researcher_model = genai.GenerativeModel(
    'gemini-2.5-flash-preview-09-2025',
    system_instruction=web_researcher_prompt,
    tools=["google_search"]
)


# --- 4. ASYNC FUNCTIONS (THE "AI ANALYST" IS NOW V10.1) ---

async def analyze_ai_likelihood(text: str) -> dict:
    """
    Calls the AI Analyst model.
    This version uses the v10 Veto-Rule logic but *only* returns the likelihood.
    """
    
    # This is the V10 "Error-Hunter Veto" prompt.
    v10_prompt_simplified_output = f"""
You are an expert Norwegian linguistic error-checker.
Your default assumption is that all text is *human-written*.
Your *only* job is to find *any* "perfect imperfection" that confirms this.

**THE TEXT TO ANALYZE:**
---
{text}
---

**ANALYSIS INSTRUCTIONS:**

**Part 1: The "Human Imperfection" Test**
Scan the text *only* for "perfect imperfections" that signal a human 
author. List *all* that you find.
These include:
- Specific Norwegian grammatical errors (e.g., 'og' vs. 'å' misuse like 
  'fra og se', or verb forms like 'har betyd' instead of 'har betydd').
- Clunky, awkward, or slightly unnatural sentence constructions.
- A unique, non-obvious insight or a clear personal voice.
- Minor typos or spacing errors.

**Part 2: The "Veto Rule" (The Final Decision)**
- **IF** you found *any* imperfections in Part 1 (even one):
  You **MUST** set "likelihood" to "Very Low".
- **ONLY IF** you found **no** imperfections (the text is 100% flawless):
  You may then classify it as 'Medium' or 'High'.

**RETURN A JSON OBJECT** with this exact schema:

{{
  "likelihood": "Your final verdict, following the Veto Rule ('Very Low', 'Low', 'Medium', 'High', 'Very High')"
}}
"""
    
    try:
        response = await ai_analyst_model.generate_content_async(
            v10_prompt_simplified_output, # We send the new, simplified-output prompt
            generation_config=ai_analyst_config # Use the locked-down config
        )
        return json.loads(response.text) 
    except Exception as e:
        print(f"Error in V10.1 AI analysis: {e}")
        return {
            "likelihood": "Error" # Simplified error response
        }

async def find_online_plagiarism(text: str) -> dict:
    """
    Calls the Web Researcher model (Unchanged).
    """
    try:
        response = await web_researcher_model.generate_content_async(
            text, 
            generation_config=web_researcher_config
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error in web search: {e}")
        return {
            "sources": [],
            "error": f"Web plagiarism search failed: {str(e)}"
        }