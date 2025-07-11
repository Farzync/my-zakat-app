'use client'

import type React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createTransaction, updateTransaction } from '@/lib/actions'
import { Plus, Minus, Pen } from 'lucide-react'
import { OnBehalfOfType, type Transaction } from '@/lib/data'
import toast from 'react-hot-toast'
import { SignatureDialog } from '@/components/signature-dialog'
import Image from 'next/image'

interface OnBehalfOfItem {
  type: OnBehalfOfType
  name: string
}

interface TransactionFormProps {
  transaction?: Transaction
  isEdit?: boolean
}

export function TransactionForm({ transaction, isEdit = false }: TransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [onBehalfOfList, setOnBehalfOfList] = useState<OnBehalfOfItem[]>(
    transaction?.onBehalfOf || [{ type: OnBehalfOfType.SELF, name: '' }]
  )
  const [donorSignature, setDonorSignature] = useState<string>(transaction?.donorSignature || '')
  const [recipientSignature, setRecipientSignature] = useState<string>(
    transaction?.recipientSignature || ''
  )
  const [isDonorSignatureDialogOpen, setIsDonorSignatureDialogOpen] = useState(false)
  const [isRecipientSignatureDialogOpen, setIsRecipientSignatureDialogOpen] = useState(false)
  const router = useRouter()

  const [notes, setNotes] = useState(transaction?.notes || '')
  const maxNotesLength = 25

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const initialFormattedAmount = transaction
    ? 'Rp. ' + formatCurrency(transaction.amount.toString())
    : 'Rp. 0'

  const [amount, setAmount] = useState(initialFormattedAmount)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '')
    raw = raw.replace(/^0+(?!$)/, '')
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    setAmount('Rp. ' + formatted)
  }

  const addOnBehalfOfField = () => {
    setOnBehalfOfList([...onBehalfOfList, { type: OnBehalfOfType.SELF, name: '' }])
  }

  const removeOnBehalfOfField = (index: number) => {
    if (onBehalfOfList.length > 1) {
      setOnBehalfOfList(onBehalfOfList.filter((_, i) => i !== index))
    }
  }

  const updateOnBehalfOfField = (index: number, field: keyof OnBehalfOfItem, value: string) => {
    const updated = [...onBehalfOfList]
    updated[index] = { ...updated[index], [field]: value }
    setOnBehalfOfList(updated)
  }

  const handleDonorSignatureSave = (signatureData: string) => {
    setDonorSignature(signatureData)
    setIsDonorSignatureDialogOpen(false)
  }

  const handleRecipientSignatureSave = (signatureData: string) => {
    setRecipientSignature(signatureData)
    setIsRecipientSignatureDialogOpen(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate signatures
    if (!donorSignature || !recipientSignature) {
      setError('Tanda tangan pemberi zakat dan penerima harus diisi')
      setLoading(false)
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)

    // Format ulang amount dan onBehalfOf
    formData.set('amount', amount.replace(/\./g, '').replace('Rp ', ''))
    formData.set('onBehalfOf', JSON.stringify(onBehalfOfList.filter(item => item.name.trim())))
    formData.set('donorSignature', donorSignature)
    formData.set('recipientSignature', recipientSignature)

    const result = isEdit
      ? await updateTransaction(transaction!.id, formData)
      : await createTransaction(formData)

    if (result.success) {
      toast.success('Transaksi berhasil!')
      router.push('/dashboard/transactions')
    } else {
      setError(result.error || `Gagal ${isEdit ? 'memperbarui' : 'menyimpan'} transaksi`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">
            {isEdit ? 'Edit Transaksi Zakat Lama' : 'Buat Transaksi Zakat Baru'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donorName">Nama Pemberi Zakat *</Label>
                <Input
                  id="donorName"
                  name="donorName"
                  required
                  placeholder="Masukkan nama pemberi zakat"
                  defaultValue={transaction?.donorName}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientName">Nama Penerima (Panitia) *</Label>
                <Input
                  id="recipientName"
                  name="recipientName"
                  required
                  placeholder="Masukkan nama penerima"
                  defaultValue={transaction?.recipientName}
                  className="w-full"
                />
              </div>
            </div>

            {/* Dynamic On Behalf Of Fields */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Atas Nama Siapa *</Label>
              <div className="space-y-3">
                {onBehalfOfList.map((item, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={item.type}
                      onValueChange={value => updateOnBehalfOfField(index, 'type', value)}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Pilih atas Nama" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SELF">Diri Sendiri</SelectItem>
                        <SelectItem value="FAMILY">Keluarga</SelectItem>
                        <SelectItem value="BADAL">Badal</SelectItem>
                        <SelectItem value="OTHER">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Nama/keterangan"
                      value={item.name}
                      onChange={e => updateOnBehalfOfField(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOnBehalfOfField(index)}
                      disabled={onBehalfOfList.length === 1}
                      className="w-full sm:w-auto"
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sm:hidden ml-2">Hapus</span>
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOnBehalfOfField}
                className="w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Atas Nama
              </Button>
            </div>

            {/* Amount and Payment Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="amount">Nominal (Rp) *</label>
                <Input
                  id="amount"
                  type="text"
                  required
                  placeholder="0"
                  inputMode="numeric"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
                <Select
                  name="paymentMethod"
                  required
                  defaultValue={transaction?.paymentMethod ?? undefined}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="E_WALLET">E-Wallet</SelectItem>
                    <SelectItem value="OTHER">Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="zakatType">Tipe Zakat *</Label>
              <Select name="zakatType" required defaultValue={transaction?.zakatType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih tipe Zakat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FITRAH">Fitrah</SelectItem>
                  <SelectItem value="MAL">Mal</SelectItem>
                  <SelectItem value="INFAK">Infak</SelectItem>
                  <SelectItem value="OTHER">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor="notes">Catatan</Label>
              <div className="relative">
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Catatan tambahan (opsional)"
                  rows={3}
                  value={notes}
                  onChange={e => {
                    if (e.target.value.length <= maxNotesLength) {
                      setNotes(e.target.value)
                    }
                  }}
                  className="w-full pr-16"
                />
                <span className="absolute bottom-1 right-2 text-xs text-muted-foreground">
                  {notes.length}/{maxNotesLength}
                </span>
              </div>
            </div>

            {/* Signature Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tanda Tangan Pemberi Zakat *</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDonorSignatureDialogOpen(true)}
                    className="w-full flex items-center gap-2"
                  >
                    <Pen className="h-4 w-4" />
                    {donorSignature ? 'Edit Tanda Tangan' : 'Buat Tanda Tangan'}
                  </Button>
                  {donorSignature && (
                    <div className="border rounded-lg p-2">
                      <Image
                        src={donorSignature}
                        alt="Tanda tangan pemberi zakat"
                        width={200}
                        height={80}
                        className="mx-auto h-auto max-h-20 w-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tanda Tangan Penerima (Panitia) *</Label>
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRecipientSignatureDialogOpen(true)}
                    className="w-full flex items-center gap-2"
                  >
                    <Pen className="h-4 w-4" />
                    {recipientSignature ? 'Edit Tanda Tangan' : 'Buat Tanda Tangan'}
                  </Button>
                  {recipientSignature && (
                    <div className="border rounded-lg p-2">
                      <Image
                        src={recipientSignature}
                        alt="Tanda tangan penerima zakat"
                        width={200}
                        height={80}
                        className="mx-auto h-auto max-h-20 w-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                {loading ? 'Memproses...' : isEdit ? 'Update Transaksi' : 'Simpan Transaksi'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 sm:flex-none"
              >
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Signature Dialogs */}
      <SignatureDialog
        open={isDonorSignatureDialogOpen}
        onOpenChange={setIsDonorSignatureDialogOpen}
        onSave={handleDonorSignatureSave}
        title="Tanda Tangan Pemberi Zakat"
        existingSignature={donorSignature}
      />

      <SignatureDialog
        open={isRecipientSignatureDialogOpen}
        onOpenChange={setIsRecipientSignatureDialogOpen}
        onSave={handleRecipientSignatureSave}
        title="Tanda Tangan Penerima (Panitia)"
        existingSignature={recipientSignature}
      />
    </div>
  )
}
