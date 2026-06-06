import io
import json
import pandas as pd
import traceback

def test():
    try:
        contents = b'\xec\xa3\xbc\xec\x86\x8c,\xeb\xa9\xb4\xec\xa0\x81\n\xec\x84\x9c\xec\x9a\xb8,100\n\xeb\xb6\x80\xec\x82\xb0,NaN\n\xec\x9d\xb8\xec\xb2\x9c,50'
        df = pd.read_csv(io.BytesIO(contents), encoding="utf-8")
        
        filename = "test.csv"
        dataframes = {filename: df}
        missing_data_info = {}
        
        missing_counts = df.isnull().sum()
        total_missing = missing_counts.sum()
        if total_missing > 0:
            missing_cols = {str(k): int(v) for k, v in missing_counts[missing_counts > 0].items()}
            missing_rows = df[df.isnull().any(axis=1)].head(5)
            missing_rows_dict = json.loads(missing_rows.fillna("공란").to_json(orient="records", force_ascii=False))
            missing_data_info[filename] = {
                "columns": missing_cols,
                "sample_rows": missing_rows_dict,
                "total_missing": int(total_missing)
            }
            
        merged_data = []
        stats = []
        
        for filename, df in dataframes.items():
            city_name = "test"
            addr_col = "주소"
            area_col = "면적"
            
            valid_count = 0
            total_count = len(df)
            areas = []
            
            for idx, row in df.iterrows():
                addr = row[addr_col] if addr_col else "정보없음"
                area_val = row[area_col] if area_col else None
                try:
                    area = float(area_val)
                    if pd.isna(area):
                        raise ValueError
                    areas.append(area)
                    valid_count += 1
                    status = "정상"
                except:
                    area = "정보없음"
                    status = "결측치 보존"
                    
                if len(merged_data) < 10:
                    merged_data.append({
                        "city": city_name,
                        "address": str(addr),
                        "area": str(area),
                        "status": status,
                        "original_cols": f"{addr_col} / {area_col}"
                    })
                    
            if areas:
                s_series = pd.Series(areas)
                stats.append({
                    "city": city_name,
                    "total": int(total_count),
                    "valid": int(valid_count),
                    "avg": float(round(s_series.mean(), 1)),
                    "max": float(round(s_series.max(), 1)),
                    "min": float(round(s_series.min(), 1)),
                    "missing_pct": float(round((total_count - valid_count) / total_count * 100, 1))
                })
        
        result = {
            "success": True,
            "stats": stats,
            "merged_preview": merged_data,
            "missing_info": missing_data_info,
            "insight": "test insight",
            "citations": ["test"]
        }
        
        # Test JSON serialization exactly as FastAPI would
        print("JSON Serialization test:")
        print(json.dumps(result))
        print("SUCCESS!")
    except Exception as e:
        traceback.print_exc()

test()
