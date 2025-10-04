import Papa from "papaparse"

export function parseCsv(csvText: string) {
  const parsed = Papa.parse(csvText, { header: true })
  return parsed.data
}
