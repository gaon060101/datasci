import requests

files = [
    ('files', ('test.csv', '주소,면적\n서울,100\n부산,NaN\n인천,50', 'text/csv'))
]
data = {'goal': '테스트'}

try:
    res = requests.post("http://localhost:8000/api/analyze", data=data, files=files)
    print(res.status_code)
    print(res.text)
except Exception as e:
    print("Error:", e)
