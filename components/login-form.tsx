'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { login } from '@/lib/actions'
import { Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')

    const result = await login(formData)

    if (result.success) {
      toast.success('Login berhasil!')
      router.push('/dashboard')
    } else {
      setError(result.error || 'Login gagal')
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={async e => {
            e.preventDefault()
            const formData = new FormData(e.currentTarget)
            await handleSubmit(formData)
          }}
          className={`space-y-4 ${loading ? 'pointer-events-none opacity-60' : ''}`}
        >
          {error && (
            <div className="rounded-md bg-red-600 text-white p-4 text-sm font-medium">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Masukkan username"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Masukkan password"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            className="w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
            {loading ? 'Memproses...' : 'Login'}
          </Button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>Demo Accounts:</strong>
          </p>
          <p>Admin: admin / admin123</p>
          <p>Staff: staff / staff123</p>
        </div>
      </CardContent>
    </Card>
  )
}
