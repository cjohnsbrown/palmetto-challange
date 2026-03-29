import { NextRequest, NextResponse } from "next/server"
import { getForecast } from "@/lib/forecast"
import { ApiError } from "@/lib/types"

/**
 * GET /api/forecast
 * Query params: ?lat=39.0224&lng=-95.7691
 * Returns { periods: ForecastPeriod[] } or { error: string }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = parseFloat(searchParams.get("lat") ?? "")
  const lng = parseFloat(searchParams.get("lng") ?? "")

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "Provide valid ?lat= and ?lng= query params" },
      { status: 400 }
    )
  }

  try {
    const periods = await getForecast(lat, lng)
    return NextResponse.json({ periods })
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json(
      { error: "Failed to fetch forecast" },
      { status: 500 }
    )
  }
}
