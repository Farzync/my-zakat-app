// app/reports/loading.tsx
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Loading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-center">Memuat Laporan...</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="bg-gray-100 border-b">
                {['Periode', 'Fitrah', 'Mal', 'Infak', 'Lainnya', 'Total', 'Transaksi'].map(
                  (header, idx) => (
                    <th key={idx} className="p-2 text-left">
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="p-2">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
