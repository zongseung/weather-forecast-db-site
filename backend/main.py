from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import weather

app = FastAPI(
    title="Weather Data API",
    description="NAS 또는 Google Drive의 기상 CSV 파일 제공 API",
    version="0.1.0"
)

# ✅ CORS 설정
origins = [
    "http://localhost:3000",   # Next.js dev 환경
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ API 라우터 추가
app.include_router(weather.router)
