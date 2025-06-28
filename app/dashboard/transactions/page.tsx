import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TransactionList } from "@/components/transaction-list"

export default async function TransactionsPage() {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <TransactionList />
    </div>
  )
}
