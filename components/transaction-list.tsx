"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  formatCurrency,
  formatDate,
} from "@/lib/utils"
import {
  deleteTransaction,
} from "@/lib/actions"
import {
  getPaginatedTransactions,
  getPaymentMethodLabel,
  getZakatTypeLabel,
  getOnBehalfOfTypeLabel,
  ZakatType,
  type Transaction,
} from "@/lib/data"

import {
  Edit,
  Trash2,
  Eye,
  Search,
} from "lucide-react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { useSearchParams, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export function TransactionList() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  // Parse page & limit dari query
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10)
  const limitParam = parseInt(searchParams.get("limit") ?? "10", 10)

  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam
  const limit = isNaN(limitParam) || limitParam <= 0 || limitParam > 100 ? 10 : limitParam
  const [currentPage, setCurrentPage] = useState(page)
  const [entriesPerPage, setEntriesPerPage] = useState(limit)

  const [totalPages, setTotalPages] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0)

  // Ambil data
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getPaginatedTransactions(currentPage, entriesPerPage)
      setTransactions(data.transactions)
      setFilteredTransactions(data.transactions)
      setTotalPages(data.totalPages)
      setTotalEntries(data.totalItems)
      setLoading(false)
    }
    fetchData()
  }, [currentPage, entriesPerPage])

  // Update search/filter
  useEffect(() => {
    let filtered = transactions
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.onBehalfOf.some((item) =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
      )
    }
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.zakatType === filterType)
    }
    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filterType])

  // Push perubahan page & limit ke URL
  useEffect(() => {
    const params = new URLSearchParams()
    params.set("page", String(currentPage))
    params.set("limit", String(entriesPerPage))
    router.replace(`?${params.toString()}`)
  }, [currentPage, entriesPerPage, router])

  const handleDelete = async (id: string) => {
    const result = await deleteTransaction(id)
    if (result.success) {
      setTransactions(transactions.filter((t) => t.id !== id))
    }
  }

  const getZakatTypeColor = (type: ZakatType) => {
    const colors: Record<ZakatType, string> = {
      [ZakatType.FITRAH]: "bg-blue-100 text-blue-800",
      [ZakatType.MAL]: "bg-green-100 text-green-800",
      [ZakatType.INFAK]: "bg-yellow-100 text-yellow-800",
      [ZakatType.OTHER]: "bg-gray-100 text-gray-800",
    }
    return colors[type] || colors[ZakatType.OTHER]
  }

  const formatOnBehalfOf = (onBehalfOf: Transaction["onBehalfOf"]) => {
    return onBehalfOf
      .map((item) => `${getOnBehalfOfTypeLabel(item.type)}: ${item.name}`)
      .join(", ")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="border rounded p-4 space-y-2">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daftar Transaksi</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari nama pemberi, penerima, atau atas nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter tipe zakat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value={ZakatType.FITRAH}>Fitrah</SelectItem>
              <SelectItem value={ZakatType.MAL}>Mal</SelectItem>
              <SelectItem value={ZakatType.INFAK}>Infak</SelectItem>
              <SelectItem value={ZakatType.OTHER}>Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-lg">{transaction.donorName}</h3>
                    <Badge className={getZakatTypeColor(transaction.zakatType)}>
                      {getZakatTypeLabel(transaction.zakatType)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <p>Penerima: {transaction.recipientName}</p>
                    <p>Tanggal: {formatDate(transaction.date)}</p>
                    <p className="sm:col-span-2">Atas nama: {formatOnBehalfOf(transaction.onBehalfOf)}</p>
                    <p>Metode: {getPaymentMethodLabel(transaction.paymentMethod)}</p>
                  </div>
                  {transaction.notes && (
                    <p className="text-sm text-muted-foreground italic">"{transaction.notes}"</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2">
                  <p className="text-xl font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedTransaction(transaction)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Detail Transaksi</DialogTitle>
                        </DialogHeader>
                        {selectedTransaction && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Nama Pemberi Zakat</Label>
                                <p>{selectedTransaction.donorName}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Nama Penerima</Label>
                                <p>{selectedTransaction.recipientName}</p>
                              </div>
                              <div className="sm:col-span-2">
                                <Label className="font-semibold">Atas Nama</Label>
                                <div className="space-y-1">
                                  {selectedTransaction.onBehalfOf.map((item, index) => (
                                    <p key={index} className="text-sm">
                                      • {getOnBehalfOfTypeLabel(item.type)}: {item.name}
                                    </p>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <Label className="font-semibold">Nominal</Label>
                                <p className="text-lg font-bold text-green-600">
                                  {formatCurrency(selectedTransaction.amount)}
                                </p>
                              </div>
                              <div>
                                <Label className="font-semibold">Tanggal</Label>
                                <p>{formatDate(selectedTransaction.date)}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Metode Pembayaran</Label>
                                <p>{getPaymentMethodLabel(selectedTransaction.paymentMethod)}</p>
                              </div>
                              <div>
                                <Label className="font-semibold">Tipe Zakat</Label>
                                <Badge className={getZakatTypeColor(selectedTransaction.zakatType)}>
                                  {getZakatTypeLabel(selectedTransaction.zakatType)}
                                </Badge>
                              </div>
                            </div>
                            {selectedTransaction.notes && (
                              <div>
                                <Label className="font-semibold">Catatan</Label>
                                <p>{selectedTransaction.notes}</p>
                              </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Tanda Tangan Pemberi</Label>
                                <div className="mt-2 border rounded p-2 bg-gray-50">
                                  <p className="text-sm text-muted-foreground">
                                    File: {selectedTransaction.donorSignature}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <Label className="font-semibold">Tanda Tangan Penerima</Label>
                                <div className="mt-2 border rounded p-2 bg-gray-50">
                                  <p className="text-sm text-muted-foreground">
                                    File: {selectedTransaction.recipientSignature}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Link href={`/dashboard/transactions/edit/${transaction.id}`} >
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                          <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus transaksi dari {transaction.donorName}? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(transaction.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Tidak ada transaksi yang ditemukan</div>
          )}
        </div>

        {/* Kontrol Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Kontrol jumlah entri */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tampilkan</span>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="border rounded p-1 text-sm"
            >
              {[5, 10, 15, 25, 50, 100].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-600">entri per halaman</span>
          </div>

          {/* Kontrol Pagination Angka */}
          <div className="flex items-center gap-1 flex-wrap justify-center">
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
            >
              Sebelumnya
            </Button>

            {(() => {
              const pages: (number | '...')[] = []
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i)
              } else {
                pages.push(1)

                const left = Math.max(2, currentPage - 2)
                const right = Math.min(totalPages - 1, currentPage + 2)

                if (left > 2) pages.push('...')
                for (let i = left; i <= right; i++) pages.push(i)
                if (right < totalPages - 1) pages.push('...')
                pages.push(totalPages)
              }

              return pages.map((page, index) =>
                page === '...' ? (
                  <span key={index} className="px-2 text-gray-500">…</span>
                ) : (
                  <Button
                    key={index}
                    onClick={() => setCurrentPage(page)}
                    variant={page === currentPage ? 'default' : 'outline'}
                    size="sm"
                    disabled={page === currentPage}
                    className={page === currentPage ? 'font-bold' : ''}
                  >
                    {page}
                  </Button>
                )
              )
            })()}

            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Berikutnya
            </Button>
          </div>

          {/* Status Jumlah Entri */}
          <div className="text-sm text-gray-500">
            Menampilkan {filteredTransactions.length} entri dari total {totalEntries} entri — Halaman {currentPage} dari {totalPages}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
