import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ExportForm } from "@/components/export-form"

export default async function ExportPage() {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Export Data</h1>
      <ExportForm />
    </div>
  )
}
