'use server'

import { authenticateUser, createSession, deleteSession, verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import {
  createTransaction as createTransactionDb,
  updateTransaction as updateTransactionDb,
  deleteTransaction as deleteTransactionDb,
  PaymentMethod,
  ZakatType,
  OnBehalfOfType,
  getPaginatedTransactions,
  getFilteredReportData,
  Transaction,
} from '@/lib/data'
import ExcelJS from 'exceljs'
import { prisma } from './prisma'

export async function login(formData: FormData) {
  const username = formData.get('username') as string
  const password = formData.get('password') as string

  if (!username || !password) {
    return { success: false, error: 'Username dan password harus diisi' }
  }

  const user = await authenticateUser(username, password)

  if (!user) {
    return { success: false, error: 'Username atau password salah' }
  }

  await createSession(user)
  return { success: true }
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function createTransaction(formData: FormData) {
  // Get current timestamp for transaction date
  const currentDate = new Date().toISOString()

  // Verify session to get user ID
  const session = await verifySession()

  const onBehalfOfData = formData.get('onBehalfOf') as string
  let onBehalfOf
  try {
    onBehalfOf = JSON.parse(onBehalfOfData)
  } catch {
    return { success: false, error: 'Data atas nama tidak valid' }
  }

  const transactionData = {
    donorName: formData.get('donorName') as string,
    recipientName: formData.get('recipientName') as string,
    onBehalfOf: onBehalfOf as Array<{ type: OnBehalfOfType; name: string }>,
    amount: Number.parseInt(formData.get('amount') as string),
    date: new Date(currentDate),
    paymentMethod: formData.get('paymentMethod') as PaymentMethod,
    zakatType: formData.get('zakatType') as ZakatType,
    notes: formData.get('notes') as string,
    donorSignature: formData.get('donorSignature') as string,
    recipientSignature: formData.get('recipientSignature') as string,
    userId: session?.id as string, // Use session user ID or fallback to form data
  }

  if (!transactionData.donorName) {
    return { success: false, error: 'Nama muzakki (donor) wajib diisi.' }
  }

  if (!transactionData.recipientName) {
    return { success: false, error: 'Nama penerima (amil/panitia zakat) wajib diisi.' }
  }

  if (!transactionData.onBehalfOf || transactionData.onBehalfOf.length === 0) {
    return { success: false, error: 'Data atas nama (onBehalfOf) minimal 1 orang harus diisi.' }
  }

  if (!transactionData.amount || transactionData.amount <= 0) {
    return { success: false, error: 'Nominal zakat tidak boleh kosong atau nol.' }
  }

  if (!transactionData.donorSignature) {
    return { success: false, error: 'Tanda tangan muzakki (donor) wajib diisi.' }
  }

  if (!transactionData.recipientSignature) {
    return { success: false, error: 'Tanda tangan penerima (amil) wajib diisi.' }
  }

  if (!transactionData.userId) {
    return { success: false, error: 'User ID tidak ditemukan. Silakan login ulang.' }
  }

  try {
    await createTransactionDb(transactionData)
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal membuat transaksi' }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  const onBehalfOfData = formData.get('onBehalfOf') as string
  let onBehalfOf
  try {
    onBehalfOf = JSON.parse(onBehalfOfData)
  } catch {
    return { success: false, error: 'Data atas nama tidak valid' }
  }

  const transactionData = {
    donorName: formData.get('donorName') as string,
    recipientName: formData.get('recipientName') as string,
    onBehalfOf: onBehalfOf as Array<{ type: OnBehalfOfType; name: string }>,
    amount: Number.parseInt(formData.get('amount') as string),
    paymentMethod: formData.get('paymentMethod') as PaymentMethod,
    zakatType: formData.get('zakatType') as ZakatType,
    notes: formData.get('notes') as string,
    donorSignature: formData.get('donorSignature') as string,
    recipientSignature: formData.get('recipientSignature') as string,
  }

  // Validate required fields
  if (
    !transactionData.donorName ||
    !transactionData.recipientName ||
    !transactionData.onBehalfOf ||
    !transactionData.amount
  ) {
    return { success: false, error: 'Semua field wajib harus diisi' }
  }

  try {
    await updateTransactionDb(id, transactionData)
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal mengupdate transaksi' }
  }
}

export async function deleteTransaction(id: string) {
  try {
    const result = await deleteTransactionDb(id)
    if (!result) {
      return { success: false, error: 'Gagal menghapus transaksi' }
    }
    revalidatePath('/dashboard/transactions')
    revalidatePath('/dashboard')
    return { success: true }
  } catch {
    return { success: false, error: 'Gagal menghapus transaksi' }
  }
}

export async function exportData(formData: FormData) {
  const exportConfig: ExportConfig = {
    startDate: formData.get('startDate') as string,
    endDate: formData.get('endDate') as string,
    zakatTypes: formData.getAll('zakatTypes') as string[],
    paymentMethod: formData.get('paymentMethod') as string,
    formats: ['excel'], // Pakai excel saja
    includes: formData.getAll('includes') as string[],
  }

  // Validasi minimal satu tipe zakat
  if (!exportConfig.zakatTypes || exportConfig.zakatTypes.length === 0) {
    return { success: false, error: 'Pilih minimal satu tipe zakat.' }
  }

  try {
    // Fetch filtered transactions
    const transactions = await getFilteredTransactions(exportConfig)

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Zakat Management System'
    workbook.created = new Date()
    workbook.modified = new Date()

    // Transaction sheet
    const transactionSheet = workbook.addWorksheet('Transactions')

    // Define columns
    const columns = [
      { header: 'ID', key: 'id', width: 30 },
      { header: 'Tanggal', key: 'date', width: 15 },
      { header: 'Nama Muzakki', key: 'donorName', width: 20 },
      { header: 'Nama Penerima', key: 'recipientName', width: 20 },
      { header: 'Atas Nama', key: 'onBehalfOf', width: 30 },
      { header: 'Jumlah', key: 'amount', width: 15 },
      { header: 'Tipe Zakat', key: 'zakatType', width: 15 },
      { header: 'Metode Pembayaran', key: 'paymentMethod', width: 20 },
    ]

    if (exportConfig.includes.includes('notes')) {
      columns.push({ header: 'Catatan', key: 'notes', width: 30 })
    }

    if (exportConfig.includes.includes('signatures')) {
      columns.push({ header: 'Tanda Tangan Muzakki', key: 'donorSignature', width: 20 })
      columns.push({ header: 'Tanda Tangan Penerima', key: 'recipientSignature', width: 20 })
    }

    transactionSheet.columns = columns

    // Add transaction rows
    transactions.forEach(transaction => {
      const onBehalfOfNames = transaction.onBehalfOf
        .map(behalf => `${behalf.name} (${behalf.type})`)
        .join(', ')

      const row: any = {
        id: transaction.id,
        date: transaction.date.toLocaleDateString('id-ID'),
        donorName: transaction.donorName,
        recipientName: transaction.recipientName,
        onBehalfOf: onBehalfOfNames,
        amount: transaction.amount,
        zakatType: transaction.zakatType,
        paymentMethod: transaction.paymentMethod,
      }

      if (exportConfig.includes.includes('notes')) {
        row.notes = transaction.notes || ''
      }

      if (exportConfig.includes.includes('signatures')) {
        row.donorSignature = transaction.donorSignature || ''
        row.recipientSignature = transaction.recipientSignature || ''
      }

      transactionSheet.addRow(row)
    })

    // Style transaction sheet
    transactionSheet.getRow(1).font = { bold: true }
    transactionSheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }

    // Add summary sheet if included
    if (exportConfig.includes.includes('summary')) {
      const summarySheet = workbook.addWorksheet('Ringkasan')

      // Calculate summary data
      const summary = {
        fitrah: 0,
        mal: 0,
        infak: 0,
        other: 0,
        total: 0,
        transactionCount: transactions.length,
      }

      transactions.forEach(t => {
        switch (t.zakatType) {
          case ZakatType.FITRAH:
            summary.fitrah += t.amount
            break
          case ZakatType.MAL:
            summary.mal += t.amount
            break
          case ZakatType.INFAK:
            summary.infak += t.amount
            break
          default:
            summary.other += t.amount
        }
        summary.total += t.amount
      })

      summarySheet.columns = [
        { header: 'Kategori', key: 'category', width: 20 },
        { header: 'Jumlah', key: 'amount', width: 15 },
      ]

      summarySheet.addRows([
        { category: 'Zakat Fitrah', amount: summary.fitrah },
        { category: 'Zakat Mal', amount: summary.mal },
        { category: 'Infak', amount: summary.infak },
        { category: 'Lainnya', amount: summary.other },
        { category: 'Total', amount: summary.total },
        { category: 'Jumlah Transaksi', amount: summary.transactionCount },
      ])

      // Style summary sheet
      summarySheet.getRow(1).font = { bold: true }
      summarySheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
    }

    // Generate file
    const filename = `zakat_export_${new Date().toISOString().split('T')[0]}.xlsx`
    const buffer = await workbook.xlsx.writeBuffer()

    // Return base64 encoded buffer for client-side download
    const nodeBuffer = Buffer.from(buffer)
    const base64 = nodeBuffer.toString('base64')

    return {
      success: true,
      filename,
      data: base64,
    }
  } catch (error) {
    console.error('Error exporting data:', error)
    return { success: false, error: 'Gagal mengekspor data ke Excel. Silakan coba lagi.' }
  }
}

export async function fetchPaginatedTransactions(page: number = 1, limit: number = 10) {
  'use server'
  try {
    const result = await getPaginatedTransactions(page, limit)
    return { success: true, ...result }
  } catch {
    return { success: false, error: 'Gagal mengambil data transaksi' }
  }
}

export async function generateReportAction({
  period,
  startDate,
  endDate,
}: {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate?: string
  endDate?: string
}) {
  const data = await getFilteredReportData(period, startDate, endDate)
  return data
}

interface ExportConfig {
  startDate?: string
  endDate?: string
  zakatTypes: string[]
  paymentMethod?: string
  formats: string[]
  includes: string[]
}

async function getFilteredTransactions(config: ExportConfig): Promise<Transaction[]> {
  const whereClause: any = {}

  // Date range filter
  if (config.startDate || config.endDate) {
    whereClause.date = {}
    if (config.startDate) whereClause.date.gte = new Date(config.startDate)
    if (config.endDate) whereClause.date.lte = new Date(config.endDate)
  }

  // Zakat type filter
  if (config.zakatTypes && config.zakatTypes.length > 0 && !config.zakatTypes.includes('all')) {
    whereClause.zakatType = {
      in: config.zakatTypes.map(type => type.toUpperCase()),
    }
  }

  // Payment method filter
  if (config.paymentMethod && config.paymentMethod !== 'all') {
    whereClause.paymentMethod = config.paymentMethod.toUpperCase()
  }

  const transactions = await prisma.transaction.findMany({
    where: whereClause,
    include: {
      onBehalfOf: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: {
      date: 'desc',
    },
  })

  return transactions.map(transaction => ({
    ...transaction,
    amount: Number(transaction.amount),
    paymentMethod: transaction.paymentMethod as PaymentMethod,
    zakatType: transaction.zakatType as ZakatType,
    onBehalfOf: transaction.onBehalfOf.map(behalf => ({
      id: behalf.id,
      type: behalf.type as any,
      name: behalf.name,
    })),
    user: transaction.user
      ? {
          ...transaction.user,
          role: transaction.user.role as any,
        }
      : undefined,
  }))
}
