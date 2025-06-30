import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getTransactionStats } from '@/lib/data'
import { formatCurrency } from '@/lib/utils'

export async function DashboardStats() {
  const stats = await getTransactionStats()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Zakat Fitrah</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-2xl font-bold">{formatCurrency(stats.fitrah)}</div>
          <p className="text-xs text-muted-foreground">{stats.fitrahCount} transaksi</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Zakat Mal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-2xl font-bold">{formatCurrency(stats.mal)}</div>
          <p className="text-xs text-muted-foreground">{stats.malCount} transaksi</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Infak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-2xl font-bold">{formatCurrency(stats.infak)}</div>
          <p className="text-xs text-muted-foreground">{stats.infakCount} transaksi</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Keseluruhan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl lg:text-2xl font-bold">{formatCurrency(stats.total)}</div>
          <p className="text-xs text-muted-foreground">{stats.totalCount} transaksi</p>
        </CardContent>
      </Card>
    </div>
  )
}
