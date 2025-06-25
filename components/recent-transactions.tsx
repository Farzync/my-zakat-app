import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getRecentTransactions } from "@/lib/data"
import { formatCurrency, formatDate } from "@/lib/utils"

export async function RecentTransactions() {
  const transactions = await getRecentTransactions()

  const formatOnBehalfOf = (onBehalfOf: Array<{ type: string; name: string }>) => {
    return onBehalfOf.map((item) => item.name).join(", ")
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Cash",
      bank_transfer: "Bank Transfer",
      e_wallet: "E-Wallet",
      other: "Lainnya",
    }
    return labels[method] || method
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaksi Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium">{transaction.donorName}</p>
                <p className="text-sm text-muted-foreground">
                  {transaction.zakatType.charAt(0).toUpperCase() + transaction.zakatType.slice(1)} •{" "}
                  {formatDate(transaction.date)}
                </p>
                <p className="text-xs text-muted-foreground">Atas nama: {formatOnBehalfOf(transaction.onBehalfOf)}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                <p className="text-sm text-muted-foreground">{getPaymentMethodLabel(transaction.paymentMethod)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
