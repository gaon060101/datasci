import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("GEMINI_API_KEY")
print(f"API Key: {api_key}")
genai.configure(api_key=api_key)
try:
    model = genai.GenerativeModel('gemini-2.0-flash')
    response = model.generate_content("Hello, can you hear me?")
    print("Response:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
