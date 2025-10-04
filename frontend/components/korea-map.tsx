"use client"

import { useState } from "react"

interface KoreaMapProps {
  onRegionClick: (regionId: string, regionName: string) => void
  selectedRegion?: string
}

const regions = [
  { id: "seoul", name: "서울", path: "M280,180 L320,180 L320,220 L280,220 Z", cx: 300, cy: 200 },
  { id: "busan", name: "부산", path: "M420,380 L460,380 L460,420 L420,420 Z", cx: 440, cy: 400 },
  { id: "incheon", name: "인천", path: "M220,180 L260,180 L260,220 L220,220 Z", cx: 240, cy: 200 },
  { id: "daegu", name: "대구", path: "M380,320 L420,320 L420,360 L380,360 Z", cx: 400, cy: 340 },
  { id: "gwangju", name: "광주", path: "M240,360 L280,360 L280,400 L240,400 Z", cx: 260, cy: 380 },
  { id: "daejeon", name: "대전", path: "M280,280 L320,280 L320,320 L280,320 Z", cx: 300, cy: 300 },
  { id: "ulsan", name: "울산", path: "M440,340 L480,340 L480,380 L440,380 Z", cx: 460, cy: 360 },
  { id: "sejong", name: "세종", path: "M260,260 L300,260 L300,300 L260,300 Z", cx: 280, cy: 280 },
  { id: "gyeonggi", name: "경기", path: "M240,140 L360,140 L360,240 L240,240 Z", cx: 300, cy: 190 },
  { id: "gangwon", name: "강원", path: "M340,100 L480,100 L480,240 L340,240 Z", cx: 410, cy: 170 },
  { id: "chungbuk", name: "충북", path: "M300,240 L400,240 L400,300 L300,300 Z", cx: 350, cy: 270 },
  { id: "chungnam", name: "충남", path: "M200,240 L300,240 L300,320 L200,320 Z", cx: 250, cy: 280 },
  { id: "jeonbuk", name: "전북", path: "M220,320 L320,320 L320,380 L220,380 Z", cx: 270, cy: 350 },
  { id: "jeonnam", name: "전남", path: "M180,380 L300,380 L300,460 L180,460 Z", cx: 240, cy: 420 },
  { id: "gyeongbuk", name: "경북", path: "M360,200 L480,200 L480,340 L360,340 Z", cx: 420, cy: 270 },
  { id: "gyeongnam", name: "경남", path: "M340,360 L460,360 L460,440 L340,440 Z", cx: 400, cy: 400 },
  { id: "jeju", name: "제주", path: "M180,480 L280,480 L280,540 L180,540 Z", cx: 230, cy: 510 },
]

export default function KoreaMap({ onRegionClick, selectedRegion }: KoreaMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  return (
    <div className="w-full flex justify-center">
      <svg viewBox="0 0 600 600" className="w-full max-w-2xl h-auto">
        {/* Background */}
        <rect width="600" height="600" fill="transparent" />

        {/* Regions */}
        {regions.map((region) => {
          const isSelected = selectedRegion === region.id
          const isHovered = hoveredRegion === region.id

          return (
            <g key={region.id}>
              {/* Region path */}
              <path
                d={region.path}
                fill={isSelected ? "hsl(var(--primary))" : isHovered ? "hsl(var(--primary) / 0.3)" : "hsl(var(--card))"}
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredRegion(region.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                onClick={() => onRegionClick(region.id, region.name)}
              />
              {/* Region label */}
              <text
                x={region.cx}
                y={region.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-medium pointer-events-none select-none"
                fill={isSelected ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))"}
              >
                {region.name}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
