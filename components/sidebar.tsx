"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Plus, List, BarChart3, FileText, Users } from "lucide-react"

interface SidebarProps {
  userRole: string
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tambah Transaksi", href: "/dashboard/transactions/new", icon: Plus },
  { name: "Daftar Transaksi", href: "/dashboard/transactions", icon: List },
  { name: "Laporan", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Export Data", href: "/dashboard/export", icon: FileText },
]

const adminNavigation = [{ name: "Kelola User", href: "/dashboard/users", icon: Users }]

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname()

  const allNavigation = userRole === "admin" ? [...navigation, ...adminNavigation] : navigation

  return (
    <div className="bg-white w-64 shadow-lg">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Zakat Management</h2>
      </div>
      <nav className="mt-6">
        {allNavigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
