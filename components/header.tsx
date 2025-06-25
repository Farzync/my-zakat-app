"use client"

import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions"
import { LogOut, User } from "lucide-react"

interface HeaderProps {
  user: {
    name: string
    role: string
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900">Sistem Manajemen Zakat</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="h-4 w-4" />
            <span>{user.name}</span>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{user.role}</span>
          </div>

          <form action={logout}>
            <Button variant="outline" size="sm" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
