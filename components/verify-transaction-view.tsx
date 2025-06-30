'use client'

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Transaction } from '@/lib/data'
import { Loader2 } from 'lucide-react'
import { getOnBehalfOfTypeLabel, getPaymentMethodLabel, getZakatTypeLabel } from '@/lib/data'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'

type Props =
  | { status: 'loading' }
  | { status: 'invalid' | 'not_found' }
  | { status: 'valid'; transaction: Transaction }

export default function VerifyTransactionClient(props: Props) {
  if (props.status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">Memverifikasi struk zakat...</p>
      </div>
    )
  }

  if (props.status === 'not_found') {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto mt-10">
        <AlertTitle>Transaksi tidak ditemukan</AlertTitle>
        <AlertDescription>
          Kami tidak menemukan transaksi dengan ID tersebut. Pastikan ID yang dimasukkan benar.
        </AlertDescription>
      </Alert>
    )
  }

  if (props.status === 'invalid') {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto mt-10">
        <AlertTitle>Struk tidak valid</AlertTitle>
        <AlertDescription>
          Tanda tangan digital tidak cocok. Struk ini kemungkinan telah dimanipulasi atau tidak sah.
        </AlertDescription>
      </Alert>
    )
  }

  if (props.status === 'valid') {
    const { transaction } = props
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-white shadow-lg rounded-lg p-8 border">
        <h1 className="text-2xl font-bold mb-2 text-center">Struk Zakat</h1>
        <p className="text-center text-gray-500 mb-6">Bukti Pembayaran Zakat</p>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <span className="font-semibold">Tanggal:</span>{' '}
            {transaction.date instanceof Date
              ? transaction.date.toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : new Date(transaction.date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
          </div>
          <div>
            <span className="font-semibold">Donatur:</span> {transaction.donorName}
          </div>
          <div>
            <span className="font-semibold">Penerima:</span> {transaction.recipientName}
          </div>
          <div>
            <span className="font-semibold">Pembayaran:</span>{' '}
            {getPaymentMethodLabel(transaction.paymentMethod)}
          </div>
          <div>
            <span className="font-semibold">Jenis Zakat:</span>{' '}
            {getZakatTypeLabel(transaction.zakatType)}
          </div>
          <div>
            <span className="font-semibold">Nominal:</span> {formatCurrency(transaction.amount)}
          </div>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Atas Nama:</span>
          <ul className="list-disc ml-6 mt-1">
            {transaction.onBehalfOf.map((item, idx) => (
              <li key={idx}>
                {getOnBehalfOfTypeLabel(item.type)}: {item.name}
              </li>
            ))}
          </ul>
        </div>
        {transaction.notes && (
          <div className="mb-4">
            <span className="font-semibold">Catatan:</span>
            <div className="bg-gray-50 rounded p-2 mt-1 border text-gray-700">
              {transaction.notes}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <span className="font-semibold block mb-1">Tanda Tangan Pemberi:</span>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[100px] flex items-center justify-center">
              {transaction.donorSignature ? (
                <Image
                  src={transaction.donorSignature}
                  alt="Tanda tangan pemberi zakat"
                  width={160}
                  height={60}
                  className="mx-auto h-auto max-h-16 w-auto object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">Tidak ada tanda tangan</span>
              )}
            </div>
          </div>
          <div>
            <span className="font-semibold block mb-1">Tanda Tangan Penerima:</span>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[100px] flex items-center justify-center">
              {transaction.recipientSignature ? (
                <Image
                  src={transaction.recipientSignature}
                  alt="Tanda tangan penerima zakat"
                  width={160}
                  height={60}
                  className="mx-auto h-auto max-h-16 w-auto object-contain"
                />
              ) : (
                <span className="text-gray-400 text-sm">Tidak ada tanda tangan</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 text-center mt-8 border-t pt-4">
          Dokumen ini adalah bukti sah pembayaran zakat.
          <br />
          Verifikasi struk digital di{' '}
          <span className="underline">
            {typeof window !== 'undefined' ? window.location.href : ''}
          </span>
        </div>
      </div>
    )
  }
}
