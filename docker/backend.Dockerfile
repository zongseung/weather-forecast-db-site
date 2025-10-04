# 1. Base Image
FROM python:3.11-slim

# 2. Set Environment Variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV WEATHER_DATA_PATH /app/data

# 3. Install uv
RUN pip install uv

# 4. Set Working Directory
WORKDIR /app

# 5. Copy dependency files and install dependencies
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --no-cache

# 6. Copy Application Code
COPY backend/ ./

# 7. Expose Port
EXPOSE 8000

# 8. Run Application
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
