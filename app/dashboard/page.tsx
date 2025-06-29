import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentTransactions } from "@/components/recent-transactions"
import ZakatChart from "@/components/zakat-chart"

export default async function DashboardPage() {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {session.name} ({session.role})
        </p>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ZakatChart />
        <RecentTransactions />
      </div>
    </div>
  )
}
