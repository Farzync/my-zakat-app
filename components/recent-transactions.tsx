import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPaymentMethodLabel, getRecentTransactions, getZakatTypeLabel } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"

export async function RecentTransactions() {
  const transactions = await getRecentTransactions()

  const formatOnBehalfOf = (onBehalfOf: Array<{ type: string; name: string }>) => {
    return onBehalfOf.map((item) => item.name).join(", ")
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
                  Zakat: {getZakatTypeLabel(transaction.zakatType) } •
                  {" Tanggal: "}
                  {transaction.date.toLocaleDateString()}
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
