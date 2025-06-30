import { LoginForm } from '@/components/login-form'
import { verifySession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await verifySession()
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Sistem Manajemen Zakat
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">Silakan login untuk melanjutkan</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
