// app/(dashboard)/dashboard/loading.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header tetap tampil */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang, ...</p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-24" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart & Transactions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zakat Chart */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/2" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/6" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/3" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="space-y-1 w-full sm:w-2/3">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2 w-1/3" />
                </div>
                <div className="text-left sm:text-right space-y-1 w-full sm:w-1/3">
                  <Skeleton className="h-4 w-1/2 sm:ml-auto" />
                  <Skeleton className="h-3 w-1/3 sm:ml-auto" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
