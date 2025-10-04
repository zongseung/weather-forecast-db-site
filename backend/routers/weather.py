from fastapi import APIRouter, Query
from fastapi.responses import FileResponse
from services.csv_loader import get_csv_file

router = APIRouter()

@router.get("/weather/csv")
def get_weather_csv(
    city: str = Query(...),
    district: str = Query(...),
    town: str = Query(...),
    variable: str = Query(...),
    start: str = Query(...),
    end: str = Query(...)
):
    # 실제 파일 경로 가져오기
    file_path = get_csv_file(city, district, town, variable, start, end)

    # CSV 반환
    return FileResponse(
        path=file_path,
        media_type="text/csv",
        filename=file_path.name
    )
