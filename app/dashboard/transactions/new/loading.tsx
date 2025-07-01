// app/(dashboard)/transactions/[id]/edit/loading.tsx
// atau jika create: app/(dashboard)/transactions/new/loading.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function TransactionFormLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">
            <Skeleton className="h-6 w-1/2" />
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 animate-pulse">
          {/* Nama pemberi & penerima */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>

          {/* Atas nama */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2">
                <Skeleton className="h-10 w-full sm:w-40" />
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-full sm:w-24" />
              </div>
            ))}
            <Skeleton className="h-9 w-48" />
          </div>

          {/* Amount & payment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Zakat type */}
          <Skeleton className="h-10 w-full" />

          {/* Notes */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-[72px] w-full" />
          </div>

          {/* Signature Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-[200px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-20 w-[200px]" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 w-full sm:w-40" />
            <Skeleton className="h-10 w-full sm:w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
