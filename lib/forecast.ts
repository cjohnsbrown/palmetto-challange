import {
  ApiError,
  ForecastResponseSchema,
  PointsResponseSchema,
} from "@/lib/types"
import type { ForecastPeriod } from "@/lib/types"

const NWS_BASE = "https://api.weather.gov"
const NWS_HEADERS = { "User-Agent": "(palmetto-weather-app)" }

/**
 * Fetch a 7-day forecast from the National Weather Service for the given coordinates.
 * Two-step: resolve grid point, then fetch forecast.
 */
export async function getForecast(
  lat: number,
  lng: number
): Promise<ForecastPeriod[]> {
  // Step 1: resolve gridpoint
  const pointsRes = await fetch(
    `${NWS_BASE}/points/${lat},${lng}`,
    { headers: NWS_HEADERS }
  )

  if (!pointsRes.ok) {
    throw new ApiError(
      `NWS points API returned ${pointsRes.status}`,
      502
    )
  }

  const pointsJson = await pointsRes.json()
  const points = PointsResponseSchema.safeParse(pointsJson)

  if (!points.success) {
    throw new ApiError("Unexpected response from NWS points API", 502)
  }

  const { gridId, gridX, gridY } = points.data.properties

  // Step 2: fetch forecast
  const forecastRes = await fetch(
    `${NWS_BASE}/gridpoints/${gridId}/${gridX},${gridY}/forecast`,
    { headers: NWS_HEADERS }
  )

  if (!forecastRes.ok) {
    throw new ApiError(
      `NWS forecast API returned ${forecastRes.status}`,
      502
    )
  }

  const forecastJson = await forecastRes.json()
  const forecast = ForecastResponseSchema.safeParse(forecastJson)

  if (!forecast.success) {
    throw new ApiError("Unexpected response from NWS forecast API", 502)
  }

  return forecast.data.properties.periods
}
