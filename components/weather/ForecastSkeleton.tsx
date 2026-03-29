import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export function ForecastSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {Array.from({ length: 14 }).map((_, i) => (
        <Card key={i} size="sm" className="bg-white">
          <CardHeader>
            <Skeleton className="h-3 w-16" />
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-12 w-12 rounded" />
            <Skeleton className="h-5 w-12" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
