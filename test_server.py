from main import app
from starlette.middleware.base import BaseHTTPMiddleware
import traceback

class ErrorLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            print("MIDDLEWARE CAUGHT EXCEPTION:")
            traceback.print_exc()
            raise

app.add_middleware(ErrorLoggingMiddleware)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)
