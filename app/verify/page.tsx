'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function QRVerifyPage() {
  const router = useRouter()

  const [manualId, setManualId] = useState('')
  const [scanError, setScanError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(true)
  const [redirecting, setRedirecting] = useState(false)

  const handleScan = (detectedCodes: unknown[]) => {
    if (!detectedCodes || detectedCodes.length === 0) return

    const result = (detectedCodes as { rawValue?: string }[])[0]?.rawValue
    if (!result) return

    try {
      const url = new URL(result)
      const id = url.searchParams.get('id')

      if (id) {
        setManualId(id)
        setScanning(false)
        setScanError(null)
        setRedirecting(true)

        setTimeout(() => {
          router.push(`/verify/tx?id=${id}`)
        }, 1500)
      } else {
        setScanError('QR tidak valid: tidak ditemukan ID transaksi.')
      }
    } catch {
      setScanError('Format QR tidak valid atau bukan dari struk resmi.')
    }
  }

  const handleCameraError = (error: unknown) => {
    console.error('📛 QR Scanner error:', error)
    if (error instanceof Error && error.name === 'NotAllowedError') {
      setScanError('Akses kamera ditolak. Mohon izinkan kamera untuk memindai QR.')
    } else {
      setScanError('Gagal membuka kamera atau memindai QR.')
    }
  }

  const handleManualSubmit = () => {
    if (manualId) {
      router.push(`/verify/tx?id=${manualId}`)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Verifikasi Struk Zakat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Scan QR Code pada struk elektronik untuk validasi keaslian transaksi.
            </p>

            <div className="relative" style={{ borderRadius: 12, overflow: 'hidden' }}>
              {scanning ? (
                <Scanner onScan={handleScan} onError={handleCameraError} />
              ) : (
                <div className="flex items-center justify-center h-[200px] bg-gray-100 rounded-lg">
                  <Loader2 className="animate-spin h-6 w-6 mr-2 text-gray-600" />
                  <span className="text-gray-600">Redirecting...</span>
                </div>
              )}
            </div>

            {scanError && <p className="text-sm text-red-600 mt-2">{scanError}</p>}
          </div>

          <div className="border-t pt-4">
            <Label className="block mb-2">Atau masukkan secara manual</Label>
            <div className="space-y-2">
              <Input
                placeholder="ID Transaksi"
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                disabled={!scanning || redirecting}
              />
              <Button
                onClick={handleManualSubmit}
                className="w-full"
                disabled={!manualId || !scanning || redirecting}
              >
                Verifikasi Manual
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
