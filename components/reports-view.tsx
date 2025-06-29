"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"
import { BarChart3, TrendingUp, Calendar, Users, PieChart, Filter, FileDown, FileText } from "lucide-react"
import { ReportData } from "@/lib/data"
import { generateReportAction } from "@/lib/actions"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

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
      const data = await generateReportAction({ period, startDate, endDate })
      const sorted = [...data].sort((a, b) => a.period.localeCompare(b.period))
      setReportData(sorted)
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalAll = reportData.reduce((sum, item) => sum + item.total, 0)
  const totalTransactions = reportData.reduce((sum, item) => sum + item.transactionCount, 0)
  const averagePerTransaction = totalTransactions > 0 ? totalAll / totalTransactions : 0

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
    { name: "Fitrah", value: chartData.fitrah, color: "#3b82f6" },
    { name: "Mal", value: chartData.mal, color: "#10b981" },
    { name: "Infak", value: chartData.infak, color: "#f59e0b" },
    { name: "Lainnya", value: chartData.other, color: "#ef4444" },
  ]
    .map(item => ({
      ...item,
      percentage: totalAll > 0 ? (item.value / totalAll) * 100 : 0,
    }))
    .filter(item => item.value > 0)

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text("Laporan Zakat", 14, 10)
    autoTable(doc, {
      startY: 20,
      head: [["Periode", "Fitrah", "Mal", "Infak", "Lainnya", "Total", "Transaksi"]],
      body: reportData.map(item => [
        item.period,
        item.fitrah,
        item.mal,
        item.infak,
        item.other,
        item.total,
        item.transactionCount
      ])
    })
    doc.save("laporan-zakat.pdf")
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan")
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    })
    saveAs(fileData, "laporan-zakat.xlsx")
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="lg:hidden">
        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="w-full">
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}
        </Button>
      </div>

      <Card className={`${showFilters ? '' : 'hidden'} lg:block`}>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Filter Laporan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="period">Periode</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="weekly">Mingguan</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                  <SelectItem value="yearly">Tahunan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-10" />
            </div>
            <div>
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-10" />
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full h-10">
                <BarChart3 className="h-4 w-4 mr-2" />
                {loading ? "Memuat..." : "Generate"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Pemasukan", icon: <TrendingUp />, value: formatCurrency(totalAll) },
          { title: "Total Transaksi", icon: <Users />, value: totalTransactions },
          { title: "Rata-rata per Transaksi", icon: <Calendar />, value: formatCurrency(averagePerTransaction) },
          { title: "Periode Aktif", icon: <BarChart3 />, value: reportData.length },
        ].map((item, i) => (
          <Card key={i} className="hover:shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">{item.title}</CardTitle>
              <div className="text-muted-foreground">{item.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Section - You can add styled pie and bar chart here */}

      <Card>
        <CardHeader>
          <CardTitle className="mb-2 text-center" >Laporan Detail</CardTitle>
          <Button variant="outline" onClick={exportToPDF}><FileDown className="w-4 h-4 mr-2" />PDF</Button>
            <Button variant="outline" onClick={exportToExcel}><FileText className="w-4 h-4 mr-2" />Excel</Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left">Periode</th>
                <th className="p-2 text-right">Fitrah</th>
                <th className="p-2 text-right">Mal</th>
                <th className="p-2 text-right">Infak</th>
                <th className="p-2 text-right">Lainnya</th>
                <th className="p-2 text-right">Total</th>
                <th className="p-2 text-right">Transaksi</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((item, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2">{item.period}</td>
                  <td className="p-2 text-right">{formatCurrency(item.fitrah)}</td>
                  <td className="p-2 text-right">{formatCurrency(item.mal)}</td>
                  <td className="p-2 text-right">{formatCurrency(item.infak)}</td>
                  <td className="p-2 text-right">{formatCurrency(item.other)}</td>
                  <td className="p-2 text-right font-bold text-green-600">{formatCurrency(item.total)}</td>
                  <td className="p-2 text-right">{item.transactionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}