import { ApiError, ZipResponseSchema, CityStateResponseSchema } from "@/lib/types"
import type { GeoResult } from "@/lib/types"

const BASE_URL = "https://api.zippopotam.us/us"

/**
 * Geocode a 5-digit zip code to lat/lng using the Zippopotam.us API.
 */
export async function geocodeByZip(zip: string): Promise<GeoResult[]> {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(zip)}`)

  if (res.status === 404) return []
  if (!res.ok) {
    throw new ApiError(`Zippopotam API returned ${res.status}`, 502)
  }

  const json = await res.json()
  const parsed = ZipResponseSchema.safeParse(json)

  if (!parsed.success) {
    throw new ApiError("Unexpected response from Zippopotam API", 502)
  }

  return parsed.data.places.map((place) => ({
    city: place["place name"],
    state: place["state abbreviation"],
    lat: parseFloat(place.latitude),
    lng: parseFloat(place.longitude),
  }))
}

/**
 * Geocode a city + state to lat/lng using the Zippopotam.us API.
 */
export async function geocodeByCityState(
  city: string,
  state: string
): Promise<GeoResult[]> {
  const res = await fetch(
    `${BASE_URL}/${encodeURIComponent(state.toLowerCase())}/${encodeURIComponent(city.toLowerCase())}`
  )

  if (res.status === 404) return []
  if (!res.ok) {
    throw new ApiError(`Zippopotam API returned ${res.status}`, 502)
  }

  const json = await res.json()
  const parsed = CityStateResponseSchema.safeParse(json)

  if (!parsed.success) {
    throw new ApiError("Unexpected response from Zippopotam API", 502)
  }

  // Deduplicate — city/state returns one entry per zip code, just take the first
  const first = parsed.data.places[0]
  if (!first) return []

  return [
    {
      city: parsed.data["place name"],
      state: parsed.data["state abbreviation"],
      lat: parseFloat(first.latitude),
      lng: parseFloat(first.longitude),
    },
  ]
}
