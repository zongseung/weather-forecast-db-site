from fastapi import FastAPI
from routers import weather

app = FastAPI(
    title="Weather Data API",
    description="NAS에 저장된 기상 CSV 파일을 제공하는 API",
    version="0.1.0"
)

# Weather 라우터 등록
app.include_router(weather.router)
