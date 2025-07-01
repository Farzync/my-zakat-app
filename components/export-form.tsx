'use client'

import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { exportData } from '@/lib/actions'
import { Download, Loader2 } from 'lucide-react'
import { saveAs } from 'file-saver'
import toast from 'react-hot-toast'

export function ExportForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleExport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    const startDate = formData.get('startDate')?.toString()
    const endDate = formData.get('endDate')?.toString()

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('Tanggal mulai tidak boleh setelah tanggal akhir.')
      setLoading(false)
      return
    }

    const today = new Date()
    if (endDate && new Date(endDate) > today) {
      setError('Tanggal akhir tidak boleh lebih dari hari ini.')
      setLoading(false)
      return
    }

    // Pastikan zakatTypes terisi minimal satu
    const zakatTypes = formData.getAll('zakatTypes')
    if (!zakatTypes || zakatTypes.length === 0) {
      setError('Pilih minimal satu tipe zakat.')
      setLoading(false)
      return
    }

    // Tambahkan format excel secara otomatis
    formData.append('formats', 'excel')

    const result = await exportData(formData)

    if (result.success && result.data) {
      const byteCharacters = atob(result.data)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      saveAs(blob, result.filename)
      toast.success('Berhasil mengekspor data! File Excel telah diunduh.')
    } else {
      setError(result.error || 'Gagal mengekspor data')
    }

    setLoading(false)
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-10 space-y-8">
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">Export Data Transaksi</CardTitle>
        </CardHeader>
        <CardContent className="pt-8 space-y-8">
          <form onSubmit={handleExport} className="space-y-8">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Akhir</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Zakat Types */}
            <div className="space-y-2">
              <Label className="font-medium">Tipe Zakat</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {['fitrah', 'mal', 'infak', 'other'].map(type => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={type} name="zakatTypes" value={type} defaultChecked />
                    <Label htmlFor={type} className="capitalize">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="font-medium">
                Metode Pembayaran
              </Label>
              <Select name="paymentMethod">
                <SelectTrigger className="w-full">
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

            {/* Data Includes */}
            <div className="space-y-2">
              <Label className="font-medium">Data yang Disertakan</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: 'summary', label: 'Ringkasan Total', defaultChecked: true },
                  { id: 'signatures', label: 'Tanda Tangan' },
                  { id: 'notes', label: 'Catatan', defaultChecked: true },
                ].map(({ id, label, defaultChecked }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox id={id} name="includes" value={id} defaultChecked={defaultChecked} />
                    <Label htmlFor={id}>{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="rounded-md bg-red-600 text-white p-4 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base gap-2 font-semibold flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Mengexport...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Export Data (Excel)
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
