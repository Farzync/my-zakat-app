import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TransactionList } from "@/components/transaction-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function TransactionsPage() {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Daftar Transaksi</h1>
        <Link href="/dashboard/transactions/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Transaksi
          </Button>
        </Link>
      </div>

      <TransactionList />
    </div>
  )
}
