'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
} from '@/components/ui/alert-dialog'
import { formatCurrency } from '@/lib/utils'
import { deleteTransaction, fetchPaginatedTransactions } from '@/lib/actions'
import {
  getPaymentMethodLabel,
  getZakatTypeLabel,
  getOnBehalfOfTypeLabel,
  ZakatType,
  type Transaction,
} from '@/lib/data'

import { Edit, Trash2, Eye, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { useSearchParams, useRouter } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

export function TransactionList() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // State
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Parse page & limit dari query
  const pageParam = parseInt(searchParams.get('page') ?? '1', 10)
  const limitParam = parseInt(searchParams.get('limit') ?? '10', 10)

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
      const data = await fetchPaginatedTransactions(currentPage, entriesPerPage)
      if (
        data &&
        typeof data === 'object' &&
        'success' in data &&
        data.success &&
        'transactions' in data
      ) {
        setTransactions(data.transactions)
        setFilteredTransactions(data.transactions)
        setTotalPages(data.totalPages)
        setTotalEntries(data.totalItems)
      } else {
        setTransactions([])
        setFilteredTransactions([])
        setTotalPages(1)
        setTotalEntries(0)
        // Optionally, show an error message to the user
        // e.g. toast.error(data && typeof data === 'object' && 'error' in data ? data.error : 'Gagal mengambil data')
      }
      setLoading(false)
    }
    fetchData()
  }, [currentPage, entriesPerPage])

  // Update search/filter
  useEffect(() => {
    let filtered = transactions
    if (searchTerm) {
      filtered = filtered.filter(
        t =>
          t.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.onBehalfOf.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.zakatType === filterType)
    }
    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, filterType])

  // Push perubahan page & limit ke URL
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('page', String(currentPage))
    params.set('limit', String(entriesPerPage))
    router.replace(`?${params.toString()}`)
  }, [currentPage, entriesPerPage, router])

  const handleDelete = async (id: string) => {
    const result = await deleteTransaction(id)
    if (result.success) {
      setTransactions(transactions.filter(t => t.id !== id))
    }
  }

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

  const formatOnBehalfOf = (onBehalfOf: Transaction['onBehalfOf']) => {
    return onBehalfOf.map(item => `${getOnBehalfOfTypeLabel(item.type)}: ${item.name}`).join(', ')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight">Daftar Transaksi</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Lihat dan kelola semua transaksi zakat di sini
              </p>
            </div>

            <Link href="/dashboard/transactions/new">
              <Button className="bg-primary text-white hover:bg-primary/90 shadow-md">
                <Plus className="h-4 w-4 mr-2" />
                Buat Transaksi Baru
              </Button>
            </Link>
          </div>
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">Daftar Transaksi</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Lihat dan kelola semua transaksi zakat di sini
            </p>
          </div>

          <Link href="/dashboard/transactions/new">
            <Button className="bg-primary text-white hover:bg-primary/90 shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Buat Transaksi Baru
            </Button>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Cari nama pemberi, penerima, atau atas nama..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
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
          {filteredTransactions.map(transaction => (
            <div
              key={transaction.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
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
                    <p>Tanggal: {transaction.date.toLocaleDateString()}</p>
                    <p>Nominal Zakat: {formatCurrency(transaction.amount)}</p>
                    <p>Metode Pembayaran: {getPaymentMethodLabel(transaction.paymentMethod)}</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2">
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader className="pb-4 border-b">
                          <DialogTitle className="text-xl font-bold">Detail Transaksi</DialogTitle>
                        </DialogHeader>
                        {selectedTransaction && (
                          <div className="space-y-6 py-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Nama Pemberi Zakat
                                </Label>
                                <p className="text-lg font-medium">
                                  {selectedTransaction.donorName}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Nama Penerima
                                </Label>
                                <p className="text-lg font-medium">
                                  {selectedTransaction.recipientName}
                                </p>
                              </div>
                              <div className="lg:col-span-2 space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Atas Nama
                                </Label>
                                <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                                  {selectedTransaction.onBehalfOf.map((item, index) => (
                                    <p key={index} className="text-sm flex items-center gap-2">
                                      <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                      <span className="font-medium">
                                        {getOnBehalfOfTypeLabel(item.type)}:
                                      </span>{' '}
                                      {item.name}
                                    </p>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Nominal
                                </Label>
                                <p className="text-2xl font-bold text-green-600">
                                  {formatCurrency(selectedTransaction.amount)}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Tanggal
                                </Label>
                                <p className="text-lg font-medium">
                                  {selectedTransaction.date.toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Metode Pembayaran
                                </Label>
                                <p className="text-lg font-medium">
                                  {getPaymentMethodLabel(selectedTransaction.paymentMethod)}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Tipe Zakat
                                </Label>
                                <Badge className={getZakatTypeColor(selectedTransaction.zakatType)}>
                                  {getZakatTypeLabel(selectedTransaction.zakatType)}
                                </Badge>
                              </div>
                            </div>

                            {selectedTransaction.notes && (
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Catatan
                                </Label>
                                <div className="bg-gray-50 rounded-lg p-4 border-l-4">
                                  <p className="text-gray-700">{selectedTransaction.notes}</p>
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t">
                              <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Tanda Tangan Pemberi
                                </Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                                  {selectedTransaction.donorSignature ? (
                                    <img
                                      src={selectedTransaction.donorSignature}
                                      alt="Tanda tangan pemberi"
                                      className="max-w-full max-h-[180px] object-contain"
                                    />
                                  ) : (
                                    <p className="text-gray-400 text-sm">Tidak ada tanda tangan</p>
                                  )}
                                </div>
                              </div>
                              <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">
                                  Tanda Tangan Penerima
                                </Label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                                  {selectedTransaction.recipientSignature ? (
                                    <img
                                      src={selectedTransaction.recipientSignature}
                                      alt="Tanda tangan penerima"
                                      className="max-w-full max-h-[180px] object-contain"
                                    />
                                  ) : (
                                    <p className="text-gray-400 text-sm">Tidak ada tanda tangan</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Link href={`/dashboard/transactions/edit/${transaction.id}`}>
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
                            Apakah Anda yakin ingin menghapus transaksi dari {transaction.donorName}
                            ? Tindakan ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(transaction.id)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada transaksi yang ditemukan
            </div>
          )}
        </div>

        {/* Kontrol Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Kontrol jumlah entri */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Tampilkan</span>
            <select
              value={entriesPerPage}
              onChange={e => {
                setEntriesPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="border rounded p-1 text-sm"
            >
              {[5, 10, 15, 25, 50, 100].map(val => (
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  <span key={index} className="px-2 text-gray-500">
                    …
                  </span>
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
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              variant="outline"
              size="sm"
            >
              Berikutnya
            </Button>
          </div>

          {/* Status Jumlah Entri */}
          <div className="text-sm text-gray-500">
            Menampilkan {filteredTransactions.length} entri dari total {totalEntries} entri —
            Halaman {currentPage} dari {totalPages}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
