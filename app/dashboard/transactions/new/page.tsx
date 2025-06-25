import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TransactionForm } from "@/components/transaction-form"

export default async function NewTransactionPage() {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Tambah Transaksi Baru</h1>
      <TransactionForm />
    </div>
  )
}
