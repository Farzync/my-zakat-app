"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { exportData } from "@/lib/actions"
import { Download, FileSpreadsheet, FileText } from "lucide-react"

export function ExportForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleExport(formData: FormData) {
    setLoading(true)
    setError("")
    setSuccess("")

    const result = await exportData(formData)

    if (result.success) {
      setSuccess(`Data berhasil diexport! File: ${result.filename}`)
      // In a real app, you would trigger the download here
    } else {
      setError(result.error || "Gagal mengexport data")
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filter Export Data</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleExport} className="space-y-6">
            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input id="startDate" name="startDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Akhir</Label>
                <Input id="endDate" name="endDate" type="date" />
              </div>
            </div>

            {/* Zakat Type Filter */}
            <div className="space-y-2">
              <Label>Tipe Zakat</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="fitrah" name="zakatTypes" value="fitrah" defaultChecked />
                  <Label htmlFor="fitrah">Fitrah</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="mal" name="zakatTypes" value="mal" defaultChecked />
                  <Label htmlFor="mal">Mal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="infak" name="zakatTypes" value="infak" defaultChecked />
                  <Label htmlFor="infak">Infak</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="other" name="zakatTypes" value="other" defaultChecked />
                  <Label htmlFor="other">Lainnya</Label>
                </div>
              </div>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
              <Select name="paymentMethod">
                <SelectTrigger>
                  <SelectValue placeholder="Semua metode pembayaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Metode</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="e_wallet">E-Wallet</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Export Format */}
            <div className="space-y-2">
              <Label>Format Export</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="excel" name="formats" value="excel" defaultChecked />
                  <Label htmlFor="excel" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel (.xlsx)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="pdf" name="formats" value="pdf" defaultChecked />
                  <Label htmlFor="pdf" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </Label>
                </div>
              </div>
            </div>

            {/* Include Options */}
            <div className="space-y-2">
              <Label>Data yang Disertakan</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="summary" name="includes" value="summary" defaultChecked />
                  <Label htmlFor="summary">Ringkasan Total</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="signatures" name="includes" value="signatures" />
                  <Label htmlFor="signatures">Tanda Tangan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="notes" name="includes" value="notes" defaultChecked />
                  <Label htmlFor="notes">Catatan</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="charts" name="includes" value="charts" />
                  <Label htmlFor="charts">Grafik (PDF only)</Label>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              {loading ? "Mengexport..." : "Export Data"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
