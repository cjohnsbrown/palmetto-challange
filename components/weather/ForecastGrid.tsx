import Image from "next/image"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import type { ForecastPeriod } from "@/lib/types"

export function ForecastGrid({ periods }: { periods: ForecastPeriod[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      {periods.map((period) => (
        <Card key={period.name} size="sm" className={period.isDaytime ? "bg-white" : "bg-white/80"}>
          <CardHeader>
            <CardTitle className="text-xs">{period.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-1.5">
            <Image
              src={period.icon}
              alt={period.shortForecast}
              width={48}
              height={48}
              className="rounded"
              unoptimized
            />
            <p className="text-lg font-bold">
              {period.temperature}°{period.temperatureUnit}
            </p>
            <p className="text-xs text-muted-foreground text-center leading-tight">
              {period.shortForecast}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
