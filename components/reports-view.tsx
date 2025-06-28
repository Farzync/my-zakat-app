"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { getFilteredReportData, type ReportData } from "@/lib/data"
import { BarChart3, TrendingUp, Calendar, Users, PieChart, Filter } from "lucide-react"

export function ReportsView() {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    generateReport()
  }, [])

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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Mobile Filter Toggle */}
      <div className="block lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="w-full mb-4"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
        </Button>
      </div>

      {/* Filter Controls */}
      <Card className={`${showFilters || 'hidden lg:block'}`}>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mobile: Stack vertically, Desktop: Grid layout */}
          <div className="flex flex-col space-y-4 lg:grid lg:grid-cols-4 lg:gap-4 lg:space-y-0">
            <div className="space-y-2">
              <Label htmlFor="period" className="text-sm font-medium">Periode</Label>
              <Select
                value={period}
                onValueChange={(value: "daily" | "weekly" | "monthly" | "yearly") => setPeriod(value)}
              >
                <SelectTrigger className="h-10">
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
              <Label htmlFor="startDate" className="text-sm font-medium">Tanggal Mulai</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium">Tanggal Akhir</Label>
              <Input 
                id="endDate" 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                disabled={loading} 
                className="w-full h-10"
                size="default"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{loading ? "Loading..." : "Generate"}</span>
                <span className="sm:hidden">{loading ? "..." : "Go"}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards - Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
              {formatCurrency(totalAll)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Semua periode</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Transaksi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">Transaksi</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Rata-rata per Transaksi</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
              {formatCurrency(averagePerTransaction)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per transaksi</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Periode Aktif</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-lg sm:text-2xl font-bold text-gray-900">{reportData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Periode</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row - Stack on mobile, side by side on desktop */}
      <div className="flex flex-col xl:grid xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Pie Chart */}
        <Card className="order-2 xl:order-1">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <PieChart className="h-4 w-4 sm:h-5 sm:w-5" />
              Distribusi Zakat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Responsive Pie Chart */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 flex-shrink-0">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {pieChartData.map((item, index) => {
                      const startAngle = pieChartData.slice(0, index).reduce((sum, d) => sum + d.percentage * 3.6, 0)
                      const endAngle = startAngle + item.percentage * 3.6
                      const largeArcFlag = item.percentage > 50 ? 1 : 0

                      const x1 = 100 + 80 * Math.cos(((startAngle - 90) * Math.PI) / 180)
                      const y1 = 100 + 80 * Math.sin(((startAngle - 90) * Math.PI) / 180)
                      const x2 = 100 + 80 * Math.cos(((endAngle - 90) * Math.PI) / 180)
                      const y2 = 100 + 80 * Math.sin(((endAngle - 90) * Math.PI) / 180)

                      const pathData = ["M", 100, 100, "L", x1, y1, "A", 80, 80, 0, largeArcFlag, 1, x2, y2, "Z"].join(" ")

                      return <path key={item.name} d={pathData} fill={item.color} stroke="white" strokeWidth="2" />
                    })}
                  </svg>
                </div>

                {/* Legend - Responsive layout */}
                <div className="flex-1 w-full">
                  <div className="space-y-2 sm:space-y-3">
                    {pieChartData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-xs sm:text-sm truncate">{item.name}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs sm:text-sm font-medium">{formatCurrency(item.value)}</div>
                          <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card className="order-1 xl:order-2">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Trend Pemasukan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Responsive Bar Chart */}
              <div className="h-32 sm:h-40 lg:h-48 flex items-end justify-between gap-1 sm:gap-2 overflow-x-auto">
                {reportData.slice(-6).map((item, index) => {
                  const maxValue = Math.max(...reportData.map((d) => d.total))
                  const height = maxValue > 0 ? (item.total / maxValue) * (window.innerWidth < 640 ? 100 : window.innerWidth < 1024 ? 120 : 160) : 0

                  return (
                    <div key={index} className="flex flex-col items-center gap-1 sm:gap-2 flex-1 min-w-0">
                      <div className="text-xs font-medium text-green-600 text-center break-all px-1">
                        <span className="hidden sm:inline">{formatCurrency(item.total)}</span>
                        <span className="sm:hidden">{formatCurrency(item.total).replace(/\.\d{3}$/, 'K')}</span>
                      </div>
                      <div
                        className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300"
                        style={{ height: `${height}px` }}
                      />
                      <div className="text-xs text-center text-muted-foreground w-full">
                        <div className="truncate px-1">{item.period}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Report Table - Responsive */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Laporan Detail per Periode</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Mobile: Card Layout */}
          <div className="block sm:hidden space-y-3 p-4">
            {reportData.map((item, index) => (
              <Card key={index} className="p-4 bg-gray-50">
                <div className="space-y-2">
                  <div className="font-semibold text-sm">{item.period}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Fitrah: <span className="font-medium">{formatCurrency(item.fitrah)}</span></div>
                    <div>Mal: <span className="font-medium">{formatCurrency(item.mal)}</span></div>
                    <div>Infak: <span className="font-medium">{formatCurrency(item.infak)}</span></div>
                    <div>Lainnya: <span className="font-medium">{formatCurrency(item.other)}</span></div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm font-semibold text-green-600">
                      Total: {formatCurrency(item.total)}
                    </span>
                    <span className="text-xs text-gray-600">
                      {item.transactionCount} transaksi
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 text-sm font-semibold">Periode</th>
                  <th className="text-right p-3 text-sm font-semibold">Fitrah</th>
                  <th className="text-right p-3 text-sm font-semibold">Mal</th>
                  <th className="text-right p-3 text-sm font-semibold">Infak</th>
                  <th className="text-right p-3 text-sm font-semibold">Lainnya</th>
                  <th className="text-right p-3 text-sm font-semibold">Total</th>
                  <th className="text-right p-3 text-sm font-semibold">Transaksi</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium text-sm">{item.period}</td>
                    <td className="p-3 text-right text-sm">{formatCurrency(item.fitrah)}</td>
                    <td className="p-3 text-right text-sm">{formatCurrency(item.mal)}</td>
                    <td className="p-3 text-right text-sm">{formatCurrency(item.infak)}</td>
                    <td className="p-3 text-right text-sm">{formatCurrency(item.other)}</td>
                    <td className="p-3 text-right font-bold text-green-600 text-sm">{formatCurrency(item.total)}</td>
                    <td className="p-3 text-right text-sm">{item.transactionCount}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-bold bg-gray-50">
                  <td className="p-3 text-sm">TOTAL</td>
                  <td className="p-3 text-right text-sm">
                    {formatCurrency(reportData.reduce((sum, item) => sum + item.fitrah, 0))}
                  </td>
                  <td className="p-3 text-right text-sm">
                    {formatCurrency(reportData.reduce((sum, item) => sum + item.mal, 0))}
                  </td>
                  <td className="p-3 text-right text-sm">
                    {formatCurrency(reportData.reduce((sum, item) => sum + item.infak, 0))}
                  </td>
                  <td className="p-3 text-right text-sm">
                    {formatCurrency(reportData.reduce((sum, item) => sum + item.other, 0))}
                  </td>
                  <td className="p-3 text-right text-green-600 text-sm">{formatCurrency(totalAll)}</td>
                  <td className="p-3 text-right text-sm">{totalTransactions}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}