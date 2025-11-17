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

# --- 2. THE "WEB RESEARCHER" (OLD, WORKING PROMPT) ---
# This is the prompt that *was* working on Render because it
# does NOT use the 'tools' parameter. It will search the model's
# internal memory, not the live web, but it will not crash.
web_researcher_prompt = """
You are an expert plagiarism detection specialist. Your task is to identify if the provided text has been copied or heavily paraphrased from online sources.

The text may be in Norwegian or English.

IMPORTANT: You have access to a vast knowledge base. Use your training data to identify if this text matches content from:
- Wikipedia articles
- News websites
- Educational websites
- Blogs and online articles
- Academic sources
- Any other online publications

If you recognize the text or parts of it as matching known online sources, provide those sources.

Return a JSON object with one key: "sources".
"sources" should be an array of objects. Each object must have:
1. "url": The source URL (use a placeholder like "https://wikipedia.org/" if you know the domain)
2. "title": The page/article title (if you recognize it)
3. "snippet": A quote from the text that matches the source

If the text appears to be original, return an empty "sources" array: { "sources": [] }
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

# --- THIS IS THE CRITICAL FIX ---
# We are creating the web model just like your old, working file.
# The `tools` parameter is REMOVED to prevent the crash.
web_researcher_model = genai.GenerativeModel(
    'gemini-2.5-flash-preview-09-2025',
    system_instruction=web_researcher_prompt
    # NO `tools` PARAMETER = NO CRASH
)


# --- 4. ASYNC FUNCTIONS (AI ANALYST IS V10.1) ---

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
            text, # Send just the text (the prompt is in the system_instruction)
            generation_config=web_researcher_config
        )
        return json.loads(response.text)
    except Exception as e:
        print(f"Error in web search: {e}")
        return {
            "sources": [],
            "error": f"Web plagiarism search failed: {str(e)}"
        }