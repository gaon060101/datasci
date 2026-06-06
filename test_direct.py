import asyncio
import io
import json
from fastapi import UploadFile
from main import analyze_data

async def main():
    content = b'\xec\xa3\xbc\xec\x86\x8c,\xeb\xa9\xb4\xec\xa0\x81\n\xec\x84\x9c\xec\x9a\xb8,100\n\xeb\xb6\x80\xec\x82\xb0,NaN\n\xec\x9d\xb8\xec\xb2\x9c,50'
    
    try:
        file = UploadFile(filename="test.csv", file=io.BytesIO(content))
    except TypeError:
        file = UploadFile("test.csv")
        file.file = io.BytesIO(content)
        
    result = await analyze_data(goal='테스트', files=[file])
    try:
        json.dumps(result)
        print("JSON DUMPS SUCCESS")
    except Exception as e:
        print("JSON DUMPS FAILED:", str(e))

if __name__ == "__main__":
    asyncio.run(main())
