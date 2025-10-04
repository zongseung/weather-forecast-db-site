from pathlib import Path
import os
import unicodedata

BASE_DIR = Path(os.getenv("NAS_PATH", "/Volumes/nas-weather-data/단기예보"))

def get_csv_file(city: str, district: str, town: str, variable: str, start: str, end: str) -> Path:
    town = unicodedata.normalize("NFC", town)
    variable = unicodedata.normalize("NFC", variable)

    file_name = f"{town}_{variable}_{start}_{end}.csv"
    file_path = BASE_DIR / city / district / town / variable / file_name

    if not file_path.exists():
        raise FileNotFoundError(f"CSV 파일이 존재하지 않습니다: {file_path}")

    return file_path
