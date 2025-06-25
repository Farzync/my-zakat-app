"use server"

import { authenticateUser, createSession, deleteSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

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

  const onBehalfOfData = formData.get("onBehalfOf") as string
  let onBehalfOf
  try {
    onBehalfOf = JSON.parse(onBehalfOfData)
  } catch {
    return { success: false, error: "Data atas nama tidak valid" }
  }

  const transactionData = {
    id: Date.now().toString(), // Simple ID generation
    donorName: formData.get("donorName"),
    recipientName: formData.get("recipientName"),
    onBehalfOf: onBehalfOf,
    amount: Number.parseInt(formData.get("amount") as string),
    date: currentDate,
    paymentMethod: formData.get("paymentMethod"),
    zakatType: formData.get("zakatType"),
    notes: formData.get("notes"),
    donorSignature: formData.get("donorSignature"),
    recipientSignature: formData.get("recipientSignature"),
  }

  // Validate required fields
  if (
    !transactionData.donorName ||
    !transactionData.recipientName ||
    !transactionData.onBehalfOf ||
    !transactionData.amount ||
    !transactionData.donorSignature ||
    !transactionData.recipientSignature
  ) {
    return { success: false, error: "Semua field wajib harus diisi termasuk kedua tanda tangan" }
  }

  // Here you would save to database
  console.log("Creating transaction:", transactionData)

  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard")
  return { success: true }
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
    donorName: formData.get("donorName"),
    recipientName: formData.get("recipientName"),
    onBehalfOf: onBehalfOf,
    amount: Number.parseInt(formData.get("amount") as string),
    paymentMethod: formData.get("paymentMethod"),
    zakatType: formData.get("zakatType"),
    notes: formData.get("notes"),
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

  // Here you would update in database
  console.log("Updating transaction:", id, transactionData)

  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteTransaction(id: string) {
  // Here you would delete from database
  console.log("Deleting transaction:", id)

  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard")
  return { success: true }
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
