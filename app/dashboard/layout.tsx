import type React from "react"
import { verifySession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ResponsiveSidebar } from "@/components/responsive-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveSidebar user={session.user}>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </ResponsiveSidebar>
    </div>
  )
}
