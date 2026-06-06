import pandas as pd
import glob

files = glob.glob('*.csv') + glob.glob('*.xlsx')
for f in files:
    print('\n===', f, '===')
    try:
        if f.endswith('.csv'):
            df = pd.read_csv(f, encoding='cp949')
        else:
            df = pd.read_excel(f)
        print("Columns:", df.columns.tolist())
        print("Shape:", df.shape)
        print(df.head(2))
    except Exception as e:
        print("Error:", e)
