import asyncio
import io
from fastapi import UploadFile
from main import analyze_data
import json

async def run_test():
    files = []
    filenames = [
        "(결측치 포함)전북특별자치도 고창군_석면조사건축물현황_20260602.csv",
        "(결측치 포함)인천광역시 연수구_석면조사대상 건축물 현황.xlsx"
    ]
    
    for fname in filenames:
        with open(fname, "rb") as f:
            content = f.read()
            try:
                file = UploadFile(filename=fname, file=io.BytesIO(content))
            except TypeError:
                file = UploadFile(fname)
                file.file = io.BytesIO(content)
            files.append(file)
            
    print("Files prepared. Calling analyze_data...")
    result = await analyze_data(goal="테스트", purpose="기본 탐색 및 시각화", files=files)
    
    print("analyze_data returned.")
    if "error" in result:
        print("ERROR RETURNED:", result["error"])
        return
        
    print("Testing JSON serialization using fastapi's exact method...")
    from fastapi.encoders import jsonable_encoder
    try:
        encoded = jsonable_encoder(result)
        json_str = json.dumps(encoded, allow_nan=False)
        print("JSON Serialization SUCCESS.")
        # print(json_str[:500])
    except Exception as e:
        print("JSON Serialization FAILED:", str(e))

if __name__ == "__main__":
    asyncio.run(run_test())
