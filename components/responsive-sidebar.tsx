"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/actions"
import { LayoutDashboard, Plus, List, BarChart3, FileText, Users, Menu, LogOut, User, HandCoins } from "lucide-react"

interface ResponsiveSidebarProps {
  children: React.ReactNode
  user: {
    name: string
    role: string
  }
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tambah Transaksi", href: "/dashboard/transactions/new", icon: Plus },
  { name: "Daftar Transaksi", href: "/dashboard/transactions", icon: List },
  { name: "Laporan", href: "/dashboard/reports", icon: BarChart3 },
  { name: "Export Data", href: "/dashboard/export", icon: FileText },
]

const adminNavigation = [{ name: "Kelola User", href: "/dashboard/users", icon: Users }]

function SidebarContent({ userRole, onItemClick }: { userRole: string; onItemClick?: () => void }) {
  const pathname = usePathname()
  const allNavigation = userRole === "ADMIN" ? [...navigation, ...adminNavigation] : navigation

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b">
        <div className="flex items-center gap-2 sm:gap-3">
          <HandCoins className="h-5 w-5 sm:h-6 sm:w-6" />
          <h2 className="text-lg font-bold text-gray-800">Zakat Management</h2>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {allNavigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export function ResponsiveSidebar({ children, user }: ResponsiveSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white shadow-lg">
        <SidebarContent userRole={user.role} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SheetHeader>
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          </SheetHeader>
          <SidebarContent userRole={user.role} onItemClick={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="lg:hidden w-10" /> {/* Spacer for mobile menu button */}
              <h1 className="text-lg font-semibold text-gray-900">Sistem Manajemen Zakat</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{user.role}</span>
              </div>

              <form action={logout}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Logout</span>
                </Button>
              </form>
            </div>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </div>
    </div>
  )
}
