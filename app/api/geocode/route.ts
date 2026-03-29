import { NextRequest, NextResponse } from "next/server"
import { geocodeByZip, geocodeByCityState } from "@/lib/geocode"
import { ApiError } from "@/lib/types"

/**
 * GET /api/geocode
 * Query params: ?zip=66614 OR ?city=Topeka&state=KS
 * Returns GeoResult[] or { error: string }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const zip = searchParams.get("zip")
  const city = searchParams.get("city")
  const state = searchParams.get("state")

  try {
    if (zip) {
      if (!/^\d{5}$/.test(zip)) {
        return NextResponse.json(
          { error: "Invalid zip code — must be 5 digits" },
          { status: 400 }
        )
      }
      const results = await geocodeByZip(zip)
      return NextResponse.json(results)
    }

    if (city && state) {
      const results = await geocodeByCityState(city, state)
      return NextResponse.json(results)
    }

    return NextResponse.json(
      { error: "Provide ?zip= or ?city=&state=" },
      { status: 400 }
    )
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    return NextResponse.json(
      { error: "Failed to geocode location" },
      { status: 500 }
    )
  }
}
