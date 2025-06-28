import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TransactionForm } from "@/components/transaction-form"
import { getTransactionById } from "@/lib/data"

interface EditTransactionPageProps {
  params: {
    id: string
  }
}

export default async function EditTransactionPage({ params }: EditTransactionPageProps) {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  const transaction = await getTransactionById(params.id)

  if (!transaction) {
    redirect("/dashboard/transactions")
  }

  return (
    <div className="space-y-6">
      <TransactionForm transaction={transaction} isEdit={true} />
    </div>
  )
}
