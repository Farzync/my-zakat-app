"use server"

import { authenticateUser, createSession, deleteSession, verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import {
  createTransaction as createTransactionDb,
  updateTransaction as updateTransactionDb,
  deleteTransaction as deleteTransactionDb,
  PaymentMethod,
  ZakatType,
  OnBehalfOfType,
  getPaginatedTransactions
} from "@/lib/data"

export async function login(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { success: false, error: "Username dan password harus diisi" }
  }

  const user = await authenticateUser(username, password)

  if (!user) {
    return { success: false, error: "Username atau password salah" }
  }

  await createSession(user)
  return { success: true }
}

export async function logout() {
  await deleteSession()
  redirect("/login")
}

export async function createTransaction(formData: FormData) {
  // Get current timestamp for transaction date
  const currentDate = new Date().toISOString()

  // Verify session to get user ID
  const session = await verifySession()

  const onBehalfOfData = formData.get("onBehalfOf") as string
  let onBehalfOf
  try {
    onBehalfOf = JSON.parse(onBehalfOfData)
  } catch {
    return { success: false, error: "Data atas nama tidak valid" }
  }

  const transactionData = {
    donorName: formData.get("donorName") as string,
    recipientName: formData.get("recipientName") as string,
    onBehalfOf: onBehalfOf as Array<{ type: OnBehalfOfType; name: string }>,
    amount: Number.parseInt(formData.get("amount") as string),
    date: new Date(currentDate),
    paymentMethod: formData.get("paymentMethod") as PaymentMethod,
    zakatType: formData.get("zakatType") as ZakatType,
    notes: formData.get("notes") as string,
    donorSignature: formData.get("donorSignature") as string,
    recipientSignature: formData.get("recipientSignature") as string,
    userId: session?.id as string, // Use session user ID or fallback to form data
  }

  if (!transactionData.donorName) {
    return { success: false, error: "Nama muzakki (donor) wajib diisi." }
  }

  if (!transactionData.recipientName) {
    return { success: false, error: "Nama penerima (amil/panitia zakat) wajib diisi." }
  }

  if (!transactionData.onBehalfOf || transactionData.onBehalfOf.length === 0) {
    return { success: false, error: "Data atas nama (onBehalfOf) minimal 1 orang harus diisi." }
  }

  if (!transactionData.amount || transactionData.amount <= 0) {
    return { success: false, error: "Nominal zakat tidak boleh kosong atau nol." }
  }

  if (!transactionData.donorSignature) {
    return { success: false, error: "Tanda tangan muzakki (donor) wajib diisi." }
  }

  if (!transactionData.recipientSignature) {
    return { success: false, error: "Tanda tangan penerima (amil) wajib diisi." }
  }

  if (!transactionData.userId) {
    return { success: false, error: "User ID tidak ditemukan. Silakan login ulang." }
  }

  try {
    await createTransactionDb(transactionData)
    revalidatePath("/dashboard/transactions")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { success: false, error: "Gagal membuat transaksi" }
  }
}

export async function updateTransaction(id: string, formData: FormData) {
  const onBehalfOfData = formData.get("onBehalfOf") as string
  let onBehalfOf
  try {
    onBehalfOf = JSON.parse(onBehalfOfData)
  } catch {
    return { success: false, error: "Data atas nama tidak valid" }
  }

  const transactionData = {
    donorName: formData.get("donorName") as string,
    recipientName: formData.get("recipientName") as string,
    onBehalfOf: onBehalfOf as Array<{ type: OnBehalfOfType; name: string }>,
    amount: Number.parseInt(formData.get("amount") as string),
    paymentMethod: formData.get("paymentMethod") as PaymentMethod,
    zakatType: formData.get("zakatType") as ZakatType,
    notes: formData.get("notes") as string,
    donorSignature: formData.get("donorSignature") as string,
    recipientSignature: formData.get("recipientSignature") as string,
  }

  // Validate required fields
  if (
    !transactionData.donorName ||
    !transactionData.recipientName ||
    !transactionData.onBehalfOf ||
    !transactionData.amount
  ) {
    return { success: false, error: "Semua field wajib harus diisi" }
  }

  try {
    await updateTransactionDb(id, transactionData)
    revalidatePath("/dashboard/transactions")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { success: false, error: "Gagal mengupdate transaksi" }
  }
}

export async function deleteTransaction(id: string) {
  try {
    const result = await deleteTransactionDb(id)
    if (!result) {
      return { success: false, error: "Gagal menghapus transaksi" }
    }
    revalidatePath("/dashboard/transactions")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (err) {
    return { success: false, error: "Gagal menghapus transaksi" }
  }
}

export async function exportData(formData: FormData) {
  const exportConfig = {
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    zakatTypes: formData.getAll("zakatTypes"),
    paymentMethod: formData.get("paymentMethod"),
    formats: formData.getAll("formats"),
    includes: formData.getAll("includes"),
  }

  // Validate at least one format is selected
  if (!exportConfig.formats || exportConfig.formats.length === 0) {
    return { success: false, error: "Pilih minimal satu format export" }
  }

  // Here you would generate the export files
  console.log("Exporting data with config:", exportConfig)

  // Simulate file generation
  const filename = `zakat_export_${new Date().toISOString().split("T")[0]}`

  return {
    success: true,
    filename: `${filename}.${exportConfig.formats.includes("excel") ? "xlsx" : "pdf"}`,
  }
}

export async function fetchPaginatedTransactions(page: number = 1, limit: number = 10) {
  "use server"
  try {
    const result = await getPaginatedTransactions(page, limit)
    return { success: true, ...result }
  } catch (error) {
    return { success: false, error: "Gagal mengambil data transaksi" }
  }
}
