'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, TrendingUp, Calendar, Users, Filter, FileDown, FileText } from 'lucide-react'
import { ReportData } from '@/lib/data'
import { generateReportAction } from '@/lib/actions'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { Skeleton } from '@/components/ui/skeleton'

export function ReportsView() {
  const [reportData, setReportData] = useState<ReportData[]>([])
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [sortKey, setSortKey] = useState<keyof ReportData>('period')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 12

  const paginatedData = reportData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const totalPages = Math.ceil(reportData.length / rowsPerPage)

  const totalAll = reportData.reduce((sum, item) => sum + item.total, 0)
  const totalTransactions = reportData.reduce((sum, item) => sum + item.transactionCount, 0)
  const averagePerTransaction = totalTransactions > 0 ? totalAll / totalTransactions : 0

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(14)
    doc.text('Laporan Zakat', 14, 15)

    const rows = reportData.map(item => [
      item.period,
      formatCurrency(item.fitrah),
      formatCurrency(item.mal),
      formatCurrency(item.infak),
      formatCurrency(item.other),
      formatCurrency(item.total),
      item.transactionCount.toLocaleString('id-ID'),
    ])

    autoTable(doc, {
      startY: 25,
      head: [['Periode', 'Fitrah', 'Mal', 'Infak', 'Lainnya', 'Total', 'Transaksi']],
      body: rows,
      styles: { fontSize: 10 },
      headStyles: {
        fillColor: [55, 65, 81],
        textColor: 255,
        halign: 'left',
      },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left' },
        2: { halign: 'left' },
        3: { halign: 'left' },
        4: { halign: 'left' },
        5: { halign: 'left' },
        6: { halign: 'left' },
      },
    })

    // @ts-expect-error: lastAutoTable is attached by autoTable
    const finalY: number = doc.lastAutoTable.finalY + 10

    const totalFitrah = reportData.reduce((sum, item) => sum + item.fitrah, 0)
    const totalMal = reportData.reduce((sum, item) => sum + item.mal, 0)
    const totalInfak = reportData.reduce((sum, item) => sum + item.infak, 0)
    const totalOther = reportData.reduce((sum, item) => sum + item.other, 0)
    const totalAll = reportData.reduce((sum, item) => sum + item.total, 0)
    const totalTx = reportData.reduce((sum, item) => sum + item.transactionCount, 0)

    // Total box
    const boxX = 14
    const boxY = finalY
    const boxW = 180
    const boxH = 50

    doc.setFillColor(245, 245, 245) // light grey
    doc.setDrawColor(200, 200, 200) // border
    doc.rect(boxX, boxY, boxW, boxH, 'FD')

    // Title
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(33, 33, 33)
    doc.text('Total Keseluruhan', boxX + 3, boxY + 7)

    // Left block
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(60, 60, 60)
    const left = [
      `Fitrah     : ${formatCurrency(totalFitrah)}`,
      `Mal        : ${formatCurrency(totalMal)}`,
      `Infak      : ${formatCurrency(totalInfak)}`,
      `Lainnya    : ${formatCurrency(totalOther)}`,
    ]
    left.forEach((text, i) => {
      doc.text(text, boxX + 5, boxY + 15 + i * 7)
    })

    // Right block (bold)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20, 20, 20)
    doc.text(`Total       : ${formatCurrency(totalAll)}`, boxX + 100, boxY + 20)
    doc.text(`Transaksi   : ${totalTx.toLocaleString('id-ID')}`, boxX + 100, boxY + 27)

    doc.save('laporan-zakat.pdf')
  }

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Laporan Zakat')

    // Definisikan kolom utama
    worksheet.columns = [
      { header: 'Periode', key: 'period', width: 18 },
      { header: 'Fitrah', key: 'fitrah', width: 15 },
      { header: 'Mal', key: 'mal', width: 15 },
      { header: 'Infak', key: 'infak', width: 15 },
      { header: 'Lainnya', key: 'other', width: 15 },
      { header: 'Total', key: 'total', width: 18 },
      { header: 'Transaksi', key: 'transactionCount', width: 15 },
    ]

    // Tambahkan data transaksi
    reportData.forEach(item => {
      worksheet.addRow({
        period: item.period,
        fitrah: item.fitrah,
        mal: item.mal,
        infak: item.infak,
        other: item.other,
        total: item.total,
        transactionCount: item.transactionCount,
      })
    })

    // Style header
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF374151' },
      }
      cell.alignment = { horizontal: 'center' }
    })

    // Format angka & Transaksi
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return
      ;[2, 3, 4, 5, 6].forEach(col => {
        const cell = row.getCell(col)
        cell.value = `Rp ${Number(cell.value).toLocaleString('id-ID')}`
        cell.alignment = { horizontal: 'left' }
      })
      const txCell = row.getCell(7)
      txCell.value = Number(txCell.value).toLocaleString('id-ID')
      txCell.alignment = { horizontal: 'left' }
    })

    // Buat kolom total summary (di sebelah kanan)
    const summaryLabels = ['Fitrah', 'Mal', 'Infak', 'Lainnya', 'Total', 'Transaksi']
    const summaryValues = [
      reportData.reduce((s, i) => s + i.fitrah, 0),
      reportData.reduce((s, i) => s + i.mal, 0),
      reportData.reduce((s, i) => s + i.infak, 0),
      reportData.reduce((s, i) => s + i.other, 0),
      reportData.reduce((s, i) => s + i.total, 0),
      reportData.reduce((s, i) => s + i.transactionCount, 0),
    ]

    worksheet.getCell('I1').value = 'TOTAL'
    worksheet.getCell('I1').font = { bold: true }
    worksheet.getCell('I1').alignment = { horizontal: 'center' }

    summaryLabels.forEach((label, i) => {
      const labelCell = worksheet.getCell(`I${i + 2}`)
      const valueCell = worksheet.getCell(`J${i + 2}`)

      labelCell.value = label
      labelCell.font = { bold: true }
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: i === 4 ? 'FFDCFCE7' : 'FFF3F4F6' },
      }

      const value =
        label === 'Transaksi'
          ? summaryValues[i].toLocaleString('id-ID')
          : `Rp ${summaryValues[i].toLocaleString('id-ID')}`

      valueCell.value = value
      valueCell.font = { bold: true }
      valueCell.alignment = { horizontal: 'left' }
    })

    // Simpan
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, 'laporan-zakat.xlsx')
  }

  const parsePeriodToDate = (period: string): Date => {
    const [bulan, tahun] = period.split(' ')
    const bulanMap: Record<string, number> = {
      Januari: 0,
      Februari: 1,
      Maret: 2,
      April: 3,
      Mei: 4,
      Juni: 5,
      Juli: 6,
      Agustus: 7,
      September: 8,
      Oktober: 9,
      November: 10,
      Desember: 11,
    }
    return new Date(Number(tahun), bulanMap[bulan])
  }

  const sortData = useCallback(
    (data: ReportData[]) => {
      return [...data].sort((a, b) => {
        const valA: number | string = a[sortKey]
        const valB: number | string = b[sortKey]

        if (sortKey === 'period') {
          const dateA = parsePeriodToDate(a.period).getTime()
          const dateB = parsePeriodToDate(b.period).getTime()
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
        }

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA
        }

        return sortOrder === 'asc'
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA))
      })
    },
    [sortKey, sortOrder]
  )

  const generateReport = useCallback(async () => {
    setLoading(true)
    try {
      const data = await generateReportAction({ period, startDate, endDate })
      setReportData(sortData(data))
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }, [period, startDate, endDate, sortData])

  useEffect(() => {
    generateReport()
  }, [generateReport])

  const handleSort = (key: keyof ReportData) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
    setReportData(prev => sortData(prev))
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
              <Select
                value={period}
                onValueChange={(v: 'daily' | 'weekly' | 'monthly' | 'yearly') => setPeriod(v)}
                disabled={loading}
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
            <div>
              <Label htmlFor="startDate">Tanggal Mulai</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="h-10"
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Tanggal Akhir</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="h-10"
                disabled={loading}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full h-10">
                <BarChart3 className="h-4 w-4 mr-2" />
                {loading ? 'Memuat...' : 'Generate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <Card key={i} className="hover:shadow-sm">
                <CardHeader className="pb-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-6 w-20" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))
          : [
              { title: 'Total Pemasukan', icon: <TrendingUp />, value: formatCurrency(totalAll) },
              { title: 'Total Transaksi', icon: <Users />, value: totalTransactions },
              {
                title: 'Rata-rata per Transaksi',
                icon: <Calendar />,
                value: formatCurrency(averagePerTransaction),
              },
              { title: 'Periode Aktif', icon: <BarChart3 />, value: reportData.length },
            ].map((item, i) => (
              <Card key={i} className="hover:shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-1">
                  <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">
                    {item.title}
                  </CardTitle>
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
          <CardTitle className="mb-2 text-center">Laporan Detail</CardTitle>
          <Button variant="outline" onClick={exportToPDF} disabled={loading}>
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel} disabled={loading}>
            <FileText className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('period')}>
                  Periode {sortKey === 'period' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('fitrah')}>
                  Fitrah {sortKey === 'fitrah' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('mal')}>
                  Mal {sortKey === 'mal' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('infak')}>
                  Infak {sortKey === 'infak' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('other')}>
                  Lainnya {sortKey === 'other' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="p-2 text-left cursor-pointer" onClick={() => handleSort('total')}>
                  Total {sortKey === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="p-2 text-left cursor-pointer"
                  onClick={() => handleSort('transactionCount')}
                >
                  Jumlah Transaksi{' '}
                  {sortKey === 'transactionCount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7}>
                    <Skeleton className="h-4 w-full" />
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-left">{item.period}</td>
                    <td className="p-2 text-left">{formatCurrency(item.fitrah)}</td>
                    <td className="p-2 text-left">{formatCurrency(item.mal)}</td>
                    <td className="p-2 text-left">{formatCurrency(item.infak)}</td>
                    <td className="p-2 text-left">{formatCurrency(item.other)}</td>
                    <td className="p-2 text-left font-bold text-green-600">
                      {formatCurrency(item.total)}
                    </td>
                    <td className="p-2 text-left">{item.transactionCount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                &larr; Prev
              </Button>
              <span className="text-sm px-2">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next &rarr;
              </Button>
            </div>
          )}

          {/* Total Box */}
          {!loading && reportData.length > 0 && (
            <div className="mt-6 border rounded-lg p-4 bg-gray-50 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  label: 'Total Fitrah',
                  value: reportData.reduce((s, i) => s + i.fitrah, 0),
                  color: 'text-blue-700',
                },
                {
                  label: 'Total Mal',
                  value: reportData.reduce((s, i) => s + i.mal, 0),
                  color: 'text-green-700',
                },
                {
                  label: 'Total Infak',
                  value: reportData.reduce((s, i) => s + i.infak, 0),
                  color: 'text-yellow-700',
                },
                {
                  label: 'Total Lainnya',
                  value: reportData.reduce((s, i) => s + i.other, 0),
                  color: 'text-gray-700',
                },
                {
                  label: 'Total Keseluruhan',
                  value: totalAll,
                  color: 'text-green-800 text-xl font-extrabold',
                },
                {
                  label: 'Jumlah Transaksi',
                  value: totalTransactions,
                  color: 'text-indigo-700 text-xl font-extrabold',
                },
              ].map((item, i) => (
                <div key={i}>
                  <h4 className="text-sm font-medium text-gray-600">{item.label}</h4>
                  <p className={`font-bold ${item.color}`}>
                    {typeof item.value === 'number'
                      ? item.label === 'Jumlah Transaksi'
                        ? item.value.toLocaleString('id-ID')
                        : formatCurrency(item.value)
                      : item.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
