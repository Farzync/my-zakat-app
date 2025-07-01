// app/export/loading.tsx atau app/data/export/loading.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}

          {/* Simulasi Checkbox grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center space-x-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>

          {/* Tombol submit */}
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
