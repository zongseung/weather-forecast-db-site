"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, ArrowLeft, CheckCircle2, Cloud, CloudRain, CloudSun } from "lucide-react"

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8081" // 필요시 .env로 변경 가능

const forecastTypes = [
  { id: "short", name: "단기예보", description: "3일간의 기상 예보 데이터" },
  { id: "ultra-short", name: "초단기예보", description: "6시간 이내의 상세 예보" },
  { id: "ultra-short-actual", name: "초단기실황", description: "현재 기상 관측 데이터" },
]

const variablesByType: Record<string, string[]> = {
  단기예보: [
    "1시간기온",
    "풍속",
    "하늘상태",
    "습도",
    "일최고기온",
    "일최저기온",
    "강수형태",
    "강수확률",
    "동서바람성분",
    "남북바람성분",
    "1시간강수량",
    "1시간적설",
  ],
  초단기실황: ["1시간기온", "풍속", "풍향", "하늘상태", "습도", "강수형태", "1시간강수량", "낙뢰"],
  초단기예보: [
    "1시간기온",
    "풍속",
    "풍향",
    "하늘상태",
    "습도",
    "강수형태",
    "1시간강수량",
    "낙뢰",
    "동서바람성분",
    "남북바람성분",
  ],
}

interface RegionData {
  Level1: string
  Level2: string
  Level3: string
  ReqList_Last: string
}

type Step = "forecast" | "level1" | "level2" | "level3" | "variables"

export default function WeatherDataPlatform() {
  const [currentStep, setCurrentStep] = useState<Step>("forecast")
  const [selectedForecast, setSelectedForecast] = useState<string>("")
  const [selectedLevel1, setSelectedLevel1] = useState<string>("")
  const [selectedLevel2, setSelectedLevel2] = useState<string>("")
  const [selectedLevel3, setSelectedLevel3] = useState<string>("")
  const [selectedVariables, setSelectedVariables] = useState<string[]>([])

  const [regionData, setRegionData] = useState<RegionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegionData = async () => {
      try {
        const response = await fetch(
          "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E1%84%8C%E1%85%B5%E1%84%8B%E1%85%A7%E1%86%A8%E1%84%8F%E1%85%A9%E1%84%83%E1%85%B3-xrsyvxgfV3iHpORYkKc288guJ3R5m6.csv",
        )
        const text = await response.text()
        const lines = text.split("\n")

        const data: RegionData[] = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",")
            return {
              Level1: values[0]?.trim() || "",
              Level2: values[1]?.trim() || "",
              Level3: (values[2]?.trim() || "").replace(/·/g, "."),
              ReqList_Last: values[3]?.trim() || "",
            }
          })
          .filter((item) => item.Level1)

        setRegionData(data)
        setLoading(false)
      } catch (error) {
        console.error("[v0] Error fetching region data:", error)
        setLoading(false)
      }
    }

    fetchRegionData()
  }, [])

  const getLevel1Options = () =>
    Array.from(new Set(regionData.map((item) => item.Level1))).filter(Boolean).sort()

  const getLevel2Options = () =>
    Array.from(new Set(regionData.filter((item) => item.Level1 === selectedLevel1).map((item) => item.Level2)))
      .filter(Boolean)
      .sort()

  const getLevel3Options = () =>
    Array.from(
      new Set(
        regionData
          .filter((item) => item.Level1 === selectedLevel1 && item.Level2 === selectedLevel2)
          .map((item) => item.Level3),
      ),
    )
      .filter(Boolean)
      .sort()

  const handleForecastSelect = (_forecastId: string, forecastName: string) => {
    setSelectedForecast(forecastName)
    setCurrentStep("level1")
  }

  const handleLevel1Select = (level1: string) => {
    setSelectedLevel1(level1)
    setCurrentStep("level2")
  }

  const handleLevel2Select = (level2: string) => {
    setSelectedLevel2(level2)
    setCurrentStep("level3")
  }

  const handleLevel3Select = (level3: string) => {
    setSelectedLevel3(level3)
    setCurrentStep("variables")
  }

  const handleVariableToggle = (variable: string) => {
    setSelectedVariables((prev) =>
      prev.includes(variable) ? prev.filter((v) => v !== variable) : [...prev, variable],
    )
  }

  const handleBack = () => {
    if (currentStep === "variables") {
      setCurrentStep("level3")
      setSelectedLevel3("")
      setSelectedVariables([])
    } else if (currentStep === "level3") {
      setCurrentStep("level2")
      setSelectedLevel2("")
    } else if (currentStep === "level2") {
      setCurrentStep("level1")
      setSelectedLevel1("")
    } else if (currentStep === "level1") {
      setCurrentStep("forecast")
      setSelectedForecast("")
    }
  }

  // ✅ CSV 다운로드 (FastAPI 연동)
  const handleDownload = async () => {
    if (!selectedLevel1 || !selectedLevel2 || !selectedLevel3 || selectedVariables.length === 0) {
      alert("지역과 변수를 모두 선택하세요.")
      return
    }

    const url = new URL(`${BACKEND_URL}/weather/csv`)
    url.searchParams.append("city", selectedLevel1)
    url.searchParams.append("district", selectedLevel2)
    url.searchParams.append("town", selectedLevel3)
    selectedVariables.forEach(variable => {
      url.searchParams.append("variable", variable)
    })
    url.searchParams.append("start", "20240101")
    url.searchParams.append("end", "20240131")

    try {
      const response = await fetch(url.toString())
      if (!response.ok) {
        throw new Error(`다운로드 실패: ${response.statusText}`)
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      const zipFilename = `${selectedLevel3}_${'20240101'}_${'20240131'}.zip`
      link.download = zipFilename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(downloadUrl)

    } catch (error) {
      console.error("다운로드 중 오류 발생:", error)
      alert("다운로드 중 오류가 발생했습니다.")
    }
  }

  const currentVariables = variablesByType[selectedForecast] || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="space-y-3 text-center md:text-left">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
            기상 데이터 다운로드 플랫폼
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            예보 유형과 지역을 선택하여 원하는 기상 데이터를 다운로드하세요
          </p>
        </div>

        {currentStep !== "forecast" && (
          <Card className="border-2 bg-card/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm flex-wrap">
                <span className="text-primary font-semibold text-base">{selectedForecast}</span>
                {selectedLevel1 && (
                  <>
                    <span className="text-muted-foreground">›</span>
                    <span className="text-primary font-semibold text-base">{selectedLevel1}</span>
                  </>
                )}
                {selectedLevel2 && (
                  <>
                    <span className="text-muted-foreground">›</span>
                    <span className="text-primary font-semibold text-base">{selectedLevel2}</span>
                  </>
                )}
                {selectedLevel3 && (
                  <>
                    <span className="text-muted-foreground">›</span>
                    <span className="text-primary font-semibold text-base">{selectedLevel3}</span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep !== "forecast" && (
          <Button
            onClick={handleBack}
            variant="outline"
            size="lg"
            className="gap-2 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300 bg-transparent"
          >
            <ArrowLeft className="h-5 w-5" />
            이전으로
          </Button>
        )}

        {/* Step 1: Forecast Type Selection */}
        {currentStep === "forecast" && (
          <div className="space-y-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    1
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-primary">예보 유형 선택</CardTitle>
                    <CardDescription className="text-base mt-1">
                      다운로드할 데이터의 예보 유형을 선택하세요
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
              {forecastTypes.map((type, index) => {
                const icons = [Cloud, CloudRain, CloudSun]
                const Icon = icons[index]
                return (
                  <Card
                    key={type.id}
                    className="border-2 hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 group bg-card"
                    onClick={() => handleForecastSelect(type.id, type.name)}
                  >
                    <CardHeader className="space-y-4">
                      <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-primary text-2xl mb-2">{type.name}</CardTitle>
                        <CardDescription className="text-base leading-relaxed">{type.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <p>{variablesByType[type.name]?.length || 0}개 변수 제공</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <p>CSV file 형식 제공</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <p>지역별 데이터 제공</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 2: Level1 Selection */}
        {currentStep === "level1" && (
          <div className="space-y-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    2
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-primary">시/도 선택</CardTitle>
                    <CardDescription className="text-base mt-1">데이터를 다운로드할 시/도를 선택하세요</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
              {getLevel1Options().map((level1) => (
                <Card
                  key={level1}
                  className="border-2 hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 group bg-card"
                  onClick={() => handleLevel1Select(level1)}
                >
                  <CardContent className="p-6 flex items-center justify-center min-h-[100px]">
                    <p className="text-center font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                      {level1}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Level2 Selection */}
        {currentStep === "level2" && (
          <div className="space-y-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    3
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-primary">구/군 선택</CardTitle>
                    <CardDescription className="text-base mt-1">{selectedLevel1}의 구/군을 선택하세요</CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
              {getLevel2Options().map((level2) => (
                <Card
                  key={level2}
                  className="border-2 hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 group bg-card"
                  onClick={() => handleLevel2Select(level2)}
                >
                  <CardContent className="p-6 flex items-center justify-center min-h-[100px]">
                    <p className="text-center font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                      {level2}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Level3 Selection */}
        {currentStep === "level3" && (
          <div className="space-y-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    4
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-primary">동/읍/면 선택</CardTitle>
                    <CardDescription className="text-base mt-1">
                      {selectedLevel1} {selectedLevel2}의 동/읍/면을 선택하세요
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-5">
              {getLevel3Options().map((level3) => (
                <Card
                  key={level3}
                  className="border-2 hover:border-primary transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 group bg-card"
                  onClick={() => handleLevel3Select(level3)}
                >
                  <CardContent className="p-6 flex items-center justify-center min-h-[100px]">
                    <p className="text-center font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                      {level3}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Variable Selection */}
        {currentStep === "variables" && (
          <div className="space-y-8">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                    5
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-primary">예보 변수 선택</CardTitle>
                    <CardDescription className="text-base mt-1">
                      다운로드할 예보 변수를 선택하세요
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{selectedVariables.length}</p>
                    <p className="text-sm text-muted-foreground">/ {currentVariables.length}개</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {currentVariables.map((variable) => {
                const isSelected = selectedVariables.includes(variable)
                return (
                  <Card
                    key={variable}
                    className={`border-2 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-105 ${
                      isSelected ? "border-primary bg-primary/10 shadow-md" : "hover:border-primary bg-card"
                    }`}
                    onClick={() => handleVariableToggle(variable)}
                  >
                    <CardContent className="p-6 flex items-center justify-between gap-3 min-h-[80px]">
                      <p className={`font-semibold text-lg ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {variable}
                      </p>
                      {isSelected && (
                        <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 animate-in zoom-in duration-200" />
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {selectedVariables.length > 0 && (
              <Card className="border-2 border-primary shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                        <p className="font-bold text-foreground text-xl">선택 완료</p>
                      </div>
                      <div className="space-y-1 text-muted-foreground">
                        <p className="text-base">
                          <span className="font-medium text-foreground">지역:</span> {selectedLevel1} › {selectedLevel2} › {selectedLevel3}
                        </p>
                        <p className="text-base">
                          <span className="font-medium text-foreground">예보:</span> {selectedForecast}
                        </p>
                        <p className="text-base">
                          <span className="font-medium text-foreground">변수:</span> {selectedVariables.length}개 선택됨
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleDownload}
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8 py-6 text-lg"
                    >
                      <Download className="h-6 w-6 mr-2" />
                      데이터 다운로드
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
