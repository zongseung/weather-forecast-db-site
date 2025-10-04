from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
from services.csv_loader import get_csv_files_as_zip
from typing import List
import io
from urllib.parse import quote

router = APIRouter()

@router.get("/weather/csv")
def get_weather_csv(
    city: str = Query(..., description="시/도 이름 (예: 서울특별시)"),
    district: str = Query(..., description="구/군 이름 (예: 광진구)"),
    town: str = Query(..., description="동/읍/면 이름 (예: 광장동)"),
    variable: List[str] = Query(..., description="변수명 목록 (예: 1시간기온)"),
    start: str = Query(..., description="조회 시작일 (YYYYMMDD)"),
    end: str = Query(..., description="조회 종료일 (YYYYMMDD)")
):
    """
    요청된 지역/변수/기간에 해당하는 CSV 파일들을 ZIP으로 압축하여 반환합니다.
    """
    try:
        # ✅ 여러 변수에 대한 파일들을 ZIP으로 압축
        zip_buffer = get_csv_files_as_zip(city, district, town, variable, start, end)

        # ✅ 데이터가 없는 경우 사용자에게 경고
        if zip_buffer.getbuffer().nbytes == 0:
            raise HTTPException(status_code=404, detail="요청하신 조건에 맞는 데이터가 없습니다.")

        # ZIP 파일 이름 생성
        zip_filename = f"{town}_{start}_{end}.zip"
        encoded_filename = quote(zip_filename)
        
        # ✅ Non-ASCII 파일명을 위한 헤더 설정
        headers = {
            "Content-Disposition": f"attachment; filename*=UTF-8''{encoded_filename}"
        }
        
        # ✅ ZIP 파일 스트리밍 응답
        return StreamingResponse(
            content=zip_buffer,
            media_type="application/zip",
            headers=headers
        )

    except Exception as e:
        # 예상치 못한 서버 에러
        raise HTTPException(status_code=500, detail=f"서버 오류: {e}")