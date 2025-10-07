# 기상 데이터 수집 시스템

이 프로젝트는 기상청에서 기상 데이터를 수집하여 NAS 디렉토리에 저장하는 시스템입니다.

## 설정 - src 파일에서 설정할것

1. `config.json` 파일을 열어서 로그인 정보를 설정하세요:
   ```
  "login": {
    "id": "",
    "password": ""
  },
  "date_range": {
    "start_date": "2024-01-01",
    "end_date": "2024-01-31"
  },
 
   ```

2. 수집할 지역과 변수를 설정하세요 (이미 기본값이 설정되어 있습니다)

## 데이터 수집 실행

### 1. 전체 데이터 수집
```bash
uv run weather_downloader.py
```

### 2. 데이터 수집 상태 모니터링
```bash
python3 monitor_data.py
```

## 디렉토리 구조

- `nas-weather-data/`: 실제 데이터 저장 위치
- `src/`: 기존 데이터 처리 스크립트들
- `weather_downloader.py`: 기상청 데이터 다운로드 

## 데이터 저장 구조

```
nas-weather-data/
├── 단기예보/
│   └── 서울특별시/
│       └── 강남구/
│           └── 역삼동/
│               ├── 기온/
│               │   └── 역삼동_기온_20240101_20240131.csv
│               ├── 습도/
│               │   └── 역삼동_습도_20240101_20240131.csv
│               └── ...
└── 초단기실황/
    └── ...
```

## 주의사항

- `weather_downloader.py` 파일은 절대 수정하지 마세요
- 데이터는 백필(backfill) 방식으로 과거부터 현재까지 순차적으로 수집됩니다
- 수집된 데이터는 실시간으로 모니터링할 수 있습니다

---
웹페이지 기반 데이터수집 방법 구현 - 현재는 구글드라이브 기반으로 구축 -> 추후 NAS로 변경이 필요함. - FrontEnd, Backend 파일 확인
1. 웹페이지 실행방법 - docker 폴더 이동 후 웹페이지 띄우기
   ```
   docker compose up -d --build
2.  다음 이미지 페이지를 확인할 수 있고 원하는 예보, 지역, 동, 기상 데이터 타입을 선택하여 반영 할 수 있음.
<img width="1508" height="740" alt="image" src="https://github.com/user-attachments/assets/e7dd955a-535e-4209-a3c5-4ce332963f63" />


