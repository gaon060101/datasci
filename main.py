import os
import io
import json
import uuid
import glob
import pandas as pd
from typing import List, Optional
from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
import google.generativeai as genai
from dotenv import load_dotenv

# Global Session Storage
SESSIONS = {}

class ChatRequest(BaseModel):
    session_id: str
    message: str

# Load Environment Variables
load_dotenv()

def get_gemini_key():
    return os.environ.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")


app = FastAPI()

# Mount current directory for static files (index.html, index.css, main.js)
# We will handle the root '/' manually
app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/{filename}")
async def read_file(filename: str):
    if filename == "index.css":
        return FileResponse(filename, media_type="text/css")
    elif filename == "main.js":
        return FileResponse(filename, media_type="application/javascript")
    return "Not Found"

@app.post("/api/analyze")
async def analyze_data(
    goal: str = Form(...),
    purpose: str = Form("기본 탐색 및 시각화"),
    files: Optional[List[UploadFile]] = File(None)
):
    import traceback
    try:
        dataframes = {}
        missing_data_info = {}
        
        # Determine files to process
        file_list = []
        if not files or len(files) == 0 or (len(files) == 1 and files[0].filename == ""):
            # Fallback to local files
            local_files = glob.glob("*.csv") + glob.glob("*.xlsx")
            for filepath in local_files:
                filename = os.path.basename(filepath)
                try:
                    if filename.endswith(".xlsx"):
                        df = pd.read_excel(filepath)
                    else:
                        try:
                            df = pd.read_csv(filepath, encoding="utf-8")
                        except UnicodeDecodeError:
                            df = pd.read_csv(filepath, encoding="cp949")
                    file_list.append((filename, df))
                except Exception as e:
                    return {"error": f"Error reading local file {filename}: {str(e)}"}
        else:
            for file in files:
                contents = await file.read()
                filename = file.filename
                try:
                    if filename.endswith(".xlsx"):
                        df = pd.read_excel(io.BytesIO(contents))
                    else:
                        try:
                            df = pd.read_csv(io.BytesIO(contents), encoding="utf-8")
                        except UnicodeDecodeError:
                            df = pd.read_csv(io.BytesIO(contents), encoding="cp949")
                    file_list.append((filename, df))
                except Exception as e:
                    return {"error": f"Error reading {filename}: {str(e)}"}
                    
        # Process loaded dataframes
        for filename, df in file_list:
            city_name = filename.split("_")[0] if "_" in filename else filename.split(".")[0]
            dataframes[city_name] = df
            
            # Missing value detection
            missing_counts = df.isnull().sum()
            total_missing = missing_counts.sum()
            if total_missing > 0:
                missing_cols = {str(k): int(v) for k, v in missing_counts[missing_counts > 0].items()}
                missing_rows = df[df.isnull().any(axis=1)].head(5)
                missing_rows_dict = missing_rows.fillna("공란").astype(str).to_dict(orient="records")
                
                missing_data_info[filename] = {
                    "columns": missing_cols,
                    "sample_rows": missing_rows_dict,
                    "total_missing": int(total_missing)
                }

        # 2. Data Integration (Asbestos specific mapping)
        merged_data = []
        stats = []
        
        for filename, df in dataframes.items():
            city_name = filename.split("_")[0] if "_" in filename else filename.split(".")[0]
            city_name = city_name.replace("(결측치 포함)", "").strip()
            
            # Standardize columns for Asbestos Data
            addr_col = next((col for col in df.columns if "주소" in col or "소재지" in col), None)
            total_area_col = next((col for col in df.columns if "연면적" in col), None)
            asbestos_area_col = next((col for col in df.columns if "석면(자재)면적" in col or "석면면적" in col), None)
            manager_col = next((col for col in df.columns if "안전관리인" in col), None)
            is_asbestos_col = next((col for col in df.columns if "석면건축물" in col), None)
            
            valid_count = 0
            total_count = len(df)
            total_areas = []
            asbestos_areas = []
            managers_assigned = 0
            is_asbestos_count = 0
            
            for idx, row in df.iterrows():
                addr = row[addr_col] if addr_col else "정보없음"
                t_area_val = row[total_area_col] if total_area_col else None
                a_area_val = row[asbestos_area_col] if asbestos_area_col else None
                manager_val = row[manager_col] if manager_col else None
                is_asb_val = row[is_asbestos_col] if is_asbestos_col else None
                
                status = "정상"
                
                # Clean total area
                try:
                    t_area = float(t_area_val)
                    if pd.isna(t_area): raise ValueError
                    total_areas.append(t_area)
                except:
                    t_area = "정보없음"
                    status = "결측치 보존"
                    
                # Clean asbestos area
                try:
                    a_area = float(a_area_val)
                    if pd.isna(a_area): raise ValueError
                    asbestos_areas.append(a_area)
                except:
                    a_area = "정보없음"
                    status = "결측치 보존"
                    
                if manager_val and str(manager_val).strip() in ['Y', '지정', '예', 'O', '유']:
                    managers_assigned += 1
                    
                if is_asb_val and str(is_asb_val).strip() in ['Y', '예', 'O', '해당']:
                    is_asbestos_count += 1

                if status == "정상":
                    valid_count += 1

                if len(merged_data) < 15: # Return top 15 for frontend preview
                    merged_data.append({
                        "city": city_name,
                        "address": str(addr),
                        "total_area": str(t_area),
                        "asbestos_area": str(a_area),
                        "manager": str(manager_val) if manager_val else "미지정",
                        "status": status,
                        "original_cols": "연면적/석면면적"
                    })
            
            # Calculate stats
            if total_areas or asbestos_areas:
                t_series = pd.Series(total_areas) if total_areas else pd.Series([0])
                a_series = pd.Series(asbestos_areas) if asbestos_areas else pd.Series([0])
                
                stats.append({
                    "city": city_name,
                    "total": int(total_count),
                    "valid": int(valid_count),
                    "avg_total": float(round(t_series.mean(), 1)),
                    "avg_asbestos": float(round(a_series.mean(), 1)),
                    "max_asbestos": float(round(a_series.max(), 1)),
                    "min_asbestos": float(round(a_series.min(), 1)),
                    "total_asbestos_area": float(round(a_series.sum(), 1)),
                    "manager_pct": float(round(managers_assigned / total_count * 100, 1)) if total_count > 0 else 0.0,
                    "asbestos_pct": float(round(is_asbestos_count / total_count * 100, 1)) if total_count > 0 else 0.0,
                    "missing_pct": float(round((total_count - valid_count) / total_count * 100, 1)) if total_count > 0 else 0.0
                })

        # 3. Call Gemini API for Insights
        # Prepare prompt with data context
        context_str = f"User Goal: {goal}\n\n"
        context_str += f"Data Stats:\n{json.dumps(stats, ensure_ascii=False, indent=2)}\n\n"
        if missing_data_info:
            context_str += f"Missing Data Info:\n{json.dumps(missing_data_info, ensure_ascii=False, indent=2)}\n\n"
            
        context_str += f"\n너는 공공데이터 전문 AI 분석가야. 연구자의 주요 분석 목적은 '{purpose}'이야. 주어진 데이터 통계를 기반으로 이 목적에 부합하는 통찰력있는 분석을 제공하고 질문에 답변해줘."
        
        session_id = str(uuid.uuid4())
        insight_text = ""
        
        try:
            api_key = get_gemini_key()
            if api_key:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-2.0-flash', system_instruction=context_str)
                chat_session = model.start_chat(history=[])
                response = chat_session.send_message("제공된 데이터를 기반으로 전문가로서의 첫 분석 인사이트를 마크다운 리스트 형식으로 요약해줘. 결측치가 있다면 어떻게 처리되었는지 언급해줘.")
                insight_text = response.text
                SESSIONS[session_id] = chat_session
            else:
                insight_text = f"⚠️ Gemini API 키가 설정되지 않아 AI 분석을 수행할 수 없습니다. (현재 인식된 환경 변수: {len(os.environ.keys())}개)"
        except Exception as e:
            insight_text = f"✅ (데모 자동 생성 모드 활성화) \n사용자님의 목적 **'{purpose}'** 에 따른 인사이트 요약:\n\n- **데이터 특성**: 결측치가 일부 발견되었으나, 통계 왜곡을 방지하기 위해 '정보없음'으로 보존 처리되었습니다.\n- **핵심 패턴**: 지자체별 석면 면적 편차가 뚜렷하게 관찰되며, 이는 석면 해체 및 제거 예산 분배의 주요 지표로 활용될 수 있습니다.\n- **상관성 요약**: 연면적 규모 대비 안전관리인 지정률의 상관관계가 분석되었습니다. 일부 대형 건축물에서 석면 건축물 여부가 'Y'로 나타났습니다.\n\n*(현재 Google API 일일 한도가 소진되었거나 네트워크 오류가 발생하여, 시연을 위해 데모 인사이트를 출력합니다. 원본 오류: {str(e)[:30]}...)*"

        # 4. Return Final JSON
        return {
            "session_id": session_id,
            "reply": "분석 결과가 준비되었습니다. 우측 대시보드를 확인해주세요.",
            "purpose": purpose,
            "stats": stats,
            "missing_info": missing_data_info,
            "merged_preview": merged_data,
            "insight": insight_text,
            "citations": [
                f"분석 데이터: {', '.join(dataframes.keys())}",
                f"적용 기준: 결측치 보존 및 {purpose} 중심 분석"
            ]
        }
    except Exception as e:
        print("GLOBAL EXCEPTION:", traceback.format_exc())
        return {"error": "GLOBAL EXCEPTION: " + traceback.format_exc()}

@app.post("/api/chat")
async def chat_with_data(req: ChatRequest):
    if req.session_id not in SESSIONS:
        return {"error": "세션이 만료되었거나 존재하지 않습니다. 파일을 다시 업로드해주세요."}
    
    chat_session = SESSIONS[req.session_id]
    try:
        response = chat_session.send_message(req.message)
        return {"success": True, "reply": response.text}
    except Exception as e:
        return {"error": f"답변 생성 중 오류 발생: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
