#!/usr/bin/env python3
"""
기상 데이터 다운로드 테스트 스크립트
"""

import asyncio
import logging
import json
from datetime import datetime, timedelta
from weather_downloader import WeatherDownloader, DownloadConfig

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def progress_callback(current: int, total: int, message: str):
    """진행률 콜백"""
    percentage = (current / total) * 100
    logger.info(f"[{current}/{total}] {percentage:.1f}% - {message}")

def file_callback(file_path: str):
    """파일 저장 콜백"""
    logger.info(f"파일 저장됨: {file_path}")

def load_config(config_file="config.json"):
    """설정 파일 로드"""
    try:
        with open(config_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        logger.error(f"설정 파일을 찾을 수 없습니다: {config_file}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"설정 파일 JSON 파싱 오류: {e}")
        return None

async def main():
    """메인 실행 함수"""
    
    # 설정 파일 로드
    config_data = load_config()
    if not config_data:
        return
    
    login_id = config_data["login"]["id"]
    password = config_data["login"]["password"]
    
    if not login_id or not password:
        logger.error("설정 파일에서 로그인 정보를 설정해주세요!")
        return
    
    # 테스트용 설정 (1일만)
    start_date = datetime.strptime(config_data["date_range"]["start_date"], "%Y-%m-%d")
    end_date = start_date + timedelta(days=1)  # 테스트용으로 1일만
    
    config = DownloadConfig(
        login_id=login_id,
        password=password,
        config_name="단기예보",
        start_date=start_date,
        end_date=end_date
    )
    
    # 다운로더 실행
    downloader = WeatherDownloader()
    
    try:
        logger.info("기상 데이터 다운로드 시작...")
        await downloader.download(config, progress_callback, file_callback)
        logger.info("다운로드 완료!")
        
    except Exception as e:
        logger.error(f"다운로드 실패: {e}")

if __name__ == "__main__":
    print("기상 데이터 다운로드 테스트")
    asyncio.run(main())
