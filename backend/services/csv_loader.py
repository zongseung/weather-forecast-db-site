from pathlib import Path
import os
import unicodedata
import io
import zipfile
from typing import List

# ✅ 데이터 경로를 환경변수로 설정하도록 수정 (유연성 및 이식성 개선)
# 환경변수 `WEATHER_DATA_PATH`가 있으면 해당 경로를 사용하고,
# 없으면 기본값으로 현재 설정된 Google Drive 경로를 사용합니다.
BASE_DIR = Path(os.getenv(
    "WEATHER_DATA_PATH",
    "/Users/ijongseung/Library/CloudStorage/GoogleDrive-solution.hkn@gmail.com/내 드라이브/단기예보"
))

def get_csv_file(city: str, district: str, town: str, variable: str, start: str, end: str) -> Path:
    """
    지정된 경로에서 CSV 파일 경로를 반환.
    경로에 한글이 포함된 경우 macOS에서 NFD/NFC 불일치를 방지하기 위해 normalize 처리.
    """

    # ✅ macOS 한글 경로 문제 방지
    city = unicodedata.normalize("NFC", city)
    district = unicodedata.normalize("NFC", district)
    town = unicodedata.normalize("NFC", town)
    variable = unicodedata.normalize("NFC", variable)

    file_name = f"{town}_{variable}_{start}_{end}.csv"
    file_path = BASE_DIR / city / district / town / variable / file_name

    # ✅ 경로 전체 normalize
    file_path = Path(unicodedata.normalize("NFC", str(file_path)))

    if not file_path.exists():
        raise FileNotFoundError(f"CSV 파일이 존재하지 않습니다: {file_path}")

    return file_path

def get_csv_files_as_zip(city: str, district: str, town: str, variables: List[str], start: str, end: str) -> io.BytesIO:
    """
    지정된 조건에 맞는 CSV 파일들을 찾아 하나의 ZIP 파일로 압축하여 반환합니다.
    """
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
        for variable in variables:
            try:
                # 기존 함수를 사용해 파일 경로를 찾음
                file_path = get_csv_file(city, district, town, variable, start, end)
                # ZIP 파일에 추가 (파일 이름만 포함)
                zip_file.write(file_path, file_path.name)
            except FileNotFoundError:
                # 파일이 없는 경우, 로그를 남기거나 조용히 무시할 수 있습니다.
                # 여기서는 일단 무시합니다.
                print(f"File not found for variable {variable}, skipping.")
                pass

    # 스트림의 시작으로 포인터를 이동
    zip_buffer.seek(0)
    return zip_buffer