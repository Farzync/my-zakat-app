"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createTransaction, updateTransaction } from "@/lib/actions"
import { Plus, Minus } from "lucide-react"
import { 
  OnBehalfOfType,
  type Transaction 
} from "@/lib/data"
import toast from "react-hot-toast"

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
  const [error, setError] = useState("")
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "")
  const [onBehalfOfList, setOnBehalfOfList] = useState<OnBehalfOfItem[]>(
    transaction?.onBehalfOf || [{ type: OnBehalfOfType.SELF, name: "" }],
  )
  const router = useRouter()

  const formatCurrency = (value: string) => {
    const number = value.replace(/\D/g, "")
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value)
    setAmount(formatted)
  }

  const addOnBehalfOfField = () => {
    setOnBehalfOfList([...onBehalfOfList, { type: OnBehalfOfType.SELF, name: "" }])
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

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    // Add processed data to formData
    formData.set("amount", amount.replace(/\./g, ""))
    formData.set("onBehalfOf", JSON.stringify(onBehalfOfList.filter((item) => item.name.trim())))

    const result = isEdit ? await updateTransaction(transaction!.id, formData) : await createTransaction(formData)

    if (result.success) {
      toast.success("Transaksi berhasil!")
      router.push("/dashboard/transactions")
    } else {
      setError(result.error || `Gagal ${isEdit ? "memperbarui" : "menyimpan"} transaksi`)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">{isEdit ? "Edit Transaksi Zakat Lama" : "Buat Transaksi Zakat Baru"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
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
                    <Select value={item.type} onValueChange={(value) => updateOnBehalfOfField(index, "type", value)}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Pilih atas Nama" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Diri Sendiri</SelectItem>
                        <SelectItem value="family">Keluarga</SelectItem>
                        <SelectItem value="badal">Badal</SelectItem>
                        <SelectItem value="other">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Nama/keterangan"
                      value={item.name}
                      onChange={(e) => updateOnBehalfOfField(index, "name", e.target.value)}
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
                <Label htmlFor="amount">Nominal (Rp) *</Label>
                <Input
                  id="amount"
                  type="text"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full"
                />
                {amount && <p className="text-xs text-muted-foreground">Rp {amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Metode Pembayaran *</Label>
                <Select name="paymentMethod" required defaultValue={transaction?.paymentMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih metode pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="e_wallet">E-Wallet</SelectItem>
                    <SelectItem value="other">Lainnya</SelectItem>
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
                  <SelectItem value="fitrah">Fitrah</SelectItem>
                  <SelectItem value="mal">Mal</SelectItem>
                  <SelectItem value="infak">Infak</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Signature Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="donorSignature">Tanda Tangan Pemberi Zakat *</Label>
                <Input
                  id="donorSignature"
                  name="donorSignature"
                  type="file"
                  accept="image/*"
                  required={!isEdit}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Format: JPG, PNG, maksimal 2MB</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipientSignature">Tanda Tangan Penerima (Panitia) *</Label>
                <Input
                  id="recipientSignature"
                  name="recipientSignature"
                  type="file"
                  accept="image/*"
                  required={!isEdit}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">Format: JPG, PNG, maksimal 2MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Catatan tambahan (opsional)"
                rows={3}
                defaultValue={transaction?.notes}
                className="w-full"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                {loading ? "Memproses..." : isEdit ? "Update Transaksi" : "Simpan Transaksi"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
