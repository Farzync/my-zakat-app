import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getChartData } from "@/lib/data"

interface ChartData {
  name: string
  value: number
  color: string
}

interface RawChartData {
  fitrah: number
  mal: number
  infak: number
  other: number
}

function formatChartData(data: RawChartData): ChartData[] {
  return [
    { name: "Fitrah", value: data.fitrah, color: "#3b82f6" },
    { name: "Mal", value: data.mal, color: "#10b981" },
    { name: "Infak", value: data.infak, color: "#f59e0b" },
    { name: "Lainnya", value: data.other, color: "#ef4444" },
  ]
}

export default async function ZakatChart() {
  const raw = await getChartData()
  const data = formatChartData(raw)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Zakat Terkumpul</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0
            return (
              <div key={item.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
