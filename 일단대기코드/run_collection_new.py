#!/usr/bin/env python3
"""
기상 데이터 수집 실행 스크립트 (새로운 구조)
"""

import sys
import os

# 프로젝트 루트를 Python 경로에 추가
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.scripts.run_collection import main

if __name__ == "__main__":
    main()
