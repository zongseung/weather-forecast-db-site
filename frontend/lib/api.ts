export async function fetchWeatherCsv(params: {
    city: string
    district: string
    town: string
    variable: string
    start: string
    end: string
  }) {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/weather/csv?${query}`)
  
    if (!res.ok) {
      throw new Error("CSV 다운로드 실패")
    }
  
    return await res.text()
  }
  