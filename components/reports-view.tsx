"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { getFilteredReportData, type ReportData } from "@/lib/data"
import { BarChart3, TrendingUp, Calendar, Users, PieChart } from "lucide-react"

export function ReportsView() {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    generateReport()
  }, [period])

  const generateReport = async () => {
    setLoading(true)
    try {
      const data = await getFilteredReportData(period, startDate, endDate)
      setReportData(data)
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalAll = reportData.reduce((sum, item) => sum + item.total, 0)
  const totalTransactions = reportData.reduce((sum, item) => sum + item.transactionCount, 0)
  const averagePerTransaction = totalTransactions > 0 ? totalAll / totalTransactions : 0

  // Chart data for pie chart
  const chartData = reportData.reduce(
    (acc, item) => ({
      fitrah: acc.fitrah + item.fitrah,
      mal: acc.mal + item.mal,
      infak: acc.infak + item.infak,
      other: acc.other + item.other,
    }),
    { fitrah: 0, mal: 0, infak: 0, other: 0 },
  )

  const pieChartData = [
    {
      name: "Fitrah",
      value: chartData.fitrah,
      color: "#3b82f6",
      percentage: totalAll > 0 ? (chartData.fitrah / totalAll) * 100 : 0,
    },
    {
      name: "Mal",
      value: chartData.mal,
      color: "#10b981",
      percentage: totalAll > 0 ? (chartData.mal / totalAll) * 100 : 0,
    },
    {
      name: "Infak",
      value: chartData.infak,
      color: "#f59e0b",
      percentage: totalAll > 0 ? (chartData.infak / totalAll) * 100 : 0,
    },
    {
      name: "Lainnya",
      value: chartData.other,
      color: "#ef4444",
      percentage: totalAll > 0 ? (chartData.other / totalAll) * 100 : 0,
    },
  ].filter((item) => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">Periode</Label>
              <Select
                value={period}
                onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") => setPeriod(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                {loading ? "Loading..." : "Generate"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAll)}</div>
            <p className="text-xs text-muted-foreground">Semua periode</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata per Transaksi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averagePerTransaction)}</div>
            <p className="text-xs text-muted-foreground">Per transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Periode Aktif</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.length}</div>
            <p className="text-xs text-muted-foreground">Periode</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribusi Zakat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple Pie Chart Visualization */}
              <div className="relative w-48 h-48 mx-auto">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {pieChartData.map((item, index) => {
                    const startAngle = pieChartData.slice(0, index).reduce((sum, d) => sum + d.percentage * 3.6, 0)
                    const endAngle = startAngle + item.percentage * 3.6
                    const largeArcFlag = item.percentage > 50 ? 1 : 0

                    const x1 = 100 + 80 * Math.cos(((startAngle - 90) * Math.PI) / 180)
                    const y1 = 100 + 80 * Math.sin(((startAngle - 90) * Math.PI) / 180)
                    const x2 = 100 + 80 * Math.cos(((endAngle - 90) * Math.PI) / 180)
                    const y2 = 100 + 80 * Math.sin(((endAngle - 90) * Math.PI) / 180)

                    const pathData = ["M", 100, 100, "L", x1, y1, "A", 80, 80, 0, largeArcFlag, 1, x2, y2, "Z"].join(
                      " ",
                    )

                    return <path key={item.name} d={pathData} fill={item.color} stroke="white" strokeWidth="2" />
                  })}
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-2">
                {pieChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatCurrency(item.value)}</div>
                      <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Trend Pemasukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple Bar Chart */}
              <div className="h-48 flex items-end justify-between gap-2">
                {reportData.slice(-6).map((item, index) => {
                  const maxValue = Math.max(...reportData.map((d) => d.total))
                  const height = maxValue > 0 ? (item.total / maxValue) * 160 : 0

                  return (
                    <div key={index} className="flex flex-col items-center gap-2 flex-1">
                      <div className="text-xs text-center font-medium text-green-600">{formatCurrency(item.total)}</div>
                      <div
                        className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300"
                        style={{ height: `${height}px` }}
                      />
                      <div className="text-xs text-center text-muted-foreground max-w-full">
                        <div className="truncate">{item.period}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table */}
      <Card>
        <CardHeader>
          <CardTitle>Laporan Detail per Periode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Periode</th>
                  <th className="text-right p-2">Fitrah</th>
                  <th className="text-right p-2">Mal</th>
                  <th className="text-right p-2">Infak</th>
                  <th className="text-right p-2">Lainnya</th>
                  <th className="text-right p-2">Total</th>
                  <th className="text-right p-2">Transaksi</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.period}</td>
                    <td className="p-2 text-right">{formatCurrency(item.fitrah)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.mal)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.infak)}</td>
                    <td className="p-2 text-right">{formatCurrency(item.other)}</td>
                    <td className="p-2 text-right font-bold text-green-600">{formatCurrency(item.total)}</td>
                    <td className="p-2 text-right">{item.transactionCount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold">
                  <td className="p-2">TOTAL</td>
                  <td className="p-2 text-right">
                    {formatCurrency(reportData.reduce((sum, item) => sum + item.fitrah, 0))}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(reportData.reduce((sum, item) => sum + item.mal, 0))}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(reportData.reduce((sum, item) => sum + item.infak, 0))}
                  </td>
                  <td className="p-2 text-right">
                    {formatCurrency(reportData.reduce((sum, item) => sum + item.other, 0))}
                  </td>
                  <td className="p-2 text-right text-green-600">{formatCurrency(totalAll)}</td>
                  <td className="p-2 text-right">{totalTransactions}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
