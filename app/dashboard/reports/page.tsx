import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReportsView } from "@/components/reports-view"

export default async function ReportsPage() {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Laporan</h1>
      <ReportsView />
    </div>
  )
}
