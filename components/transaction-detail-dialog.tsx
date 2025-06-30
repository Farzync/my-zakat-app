'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import Image from 'next/image'
import {
  getZakatTypeLabel,
  getPaymentMethodLabel,
  getOnBehalfOfTypeLabel,
  type Transaction,
  ZakatType,
} from '@/lib/data'
import { formatCurrency } from '@/lib/utils'
import { Eye } from 'lucide-react'

type Props = {
  transaction: Transaction
  onOpen: () => void
}

export function TransactionDetailDialog({ transaction, onOpen }: Props) {
  const getZakatTypeColor = (type: ZakatType) => {
    const baseClasses =
      'ml-2 rounded-full px-2.5 py-0.5 text-sm font-medium transition-colors duration-150'
    const colors: Record<ZakatType, string> = {
      [ZakatType.FITRAH]: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      [ZakatType.MAL]: 'bg-green-100 text-green-800 hover:bg-green-200',
      [ZakatType.INFAK]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      [ZakatType.OTHER]: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    }
    return `${baseClasses} ${colors[type] || colors[ZakatType.OTHER]}`
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" onClick={onOpen}>
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold">Detail Transaksi</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Nama Pemberi Zakat</Label>
              <p className="text-lg font-medium">{transaction.donorName}</p>
            </div>
            <div className="space-y-2">
              <Label>Nama Penerima</Label>
              <p className="text-lg font-medium">{transaction.recipientName}</p>
            </div>
            <div className="lg:col-span-2 space-y-2">
              <Label>Atas Nama</Label>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                {transaction.onBehalfOf.map((item, idx) => (
                  <p key={idx} className="text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full" />
                    <span className="font-medium">{getOnBehalfOfTypeLabel(item.type)}:</span>{' '}
                    {item.name}
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nominal</Label>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <p className="text-lg font-medium">
                {transaction.date.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Metode Pembayaran</Label>
              <p className="text-lg font-medium">
                {getPaymentMethodLabel(transaction.paymentMethod)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Tipe Zakat</Label>
              <Badge className={getZakatTypeColor(transaction.zakatType)}>
                {getZakatTypeLabel(transaction.zakatType)}
              </Badge>
            </div>
          </div>

          {transaction.notes && (
            <div className="space-y-2">
              <Label>Catatan</Label>
              <div className="bg-gray-50 rounded-lg p-4 border-l-4">
                <p className="text-gray-700">{transaction.notes}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t">
            <div className="space-y-3">
              <Label>Tanda Tangan Pemberi</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                {transaction.donorSignature ? (
                  <Image
                    src={transaction.donorSignature}
                    alt="Tanda tangan pemberi zakat"
                    width={200}
                    height={80}
                    className="mx-auto h-auto max-h-20 w-auto object-contain"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">Tidak ada tanda tangan</p>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Tanda Tangan Penerima</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                {transaction.recipientSignature ? (
                  <Image
                    src={transaction.recipientSignature}
                    alt="Tanda tangan penerima zakat"
                    width={200}
                    height={80}
                    className="mx-auto h-auto max-h-20 w-auto object-contain"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">Tidak ada tanda tangan</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
