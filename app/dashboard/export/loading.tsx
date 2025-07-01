// app/export/loading.tsx atau app/data/export/loading.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-10 space-y-8">
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-7 w-56 rounded-md animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded animate-pulse" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded animate-pulse" />
                <Skeleton className="h-10 w-full rounded-md animate-pulse" />
              </div>
            </div>
          ))}

          {/* Simulasi Checkbox grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pt-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5 rounded-md animate-pulse" />
                <Skeleton className="h-4 w-20 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Tombol submit */}
          <div className="pt-4">
            <Skeleton className="h-11 w-full rounded-lg animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
