// app/(dashboard)/transactions/loading.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

export default function TransactionListLoading() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Skeleton className="h-10 w-full sm:w-2/3" />
          <Skeleton className="h-10 w-full sm:w-48" />
        </div>
      </CardHeader>

      <CardContent>
        {/* Skeleton List */}
        <div className="space-y-4 mt-4">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3 animate-pulse">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        {/* Pagination Placeholder */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-24" />
          </div>

          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-8 rounded" />
            ))}
          </div>

          <Skeleton className="h-5 w-64" />
        </div>
      </CardContent>
    </Card>
  )
}
