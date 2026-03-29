import { z } from "zod"

// App types

export type GeoResult = {
  city: string
  state: string
  lat: number
  lng: number
}

export type ForecastPeriod = {
  name: string
  isDaytime: boolean
  temperature: number
  temperatureUnit: string
  windSpeed: string
  windDirection: string
  shortForecast: string
  icon: string
}

// Errors

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Geocode schemas (Zippopotam.us)

const PlaceSchema = z.object({
  "place name": z.string(),
  longitude: z.string(),
  latitude: z.string(),
  state: z.string(),
  "state abbreviation": z.string(),
})

export const ZipResponseSchema = z.object({
  "post code": z.string(),
  places: z.array(PlaceSchema),
})

export const CityStateResponseSchema = z.object({
  "place name": z.string(),
  state: z.string(),
  "state abbreviation": z.string(),
  places: z.array(
    z.object({
      "place name": z.string(),
      longitude: z.string(),
      latitude: z.string(),
      "post code": z.string(),
    })
  ),
})

// Forecast schemas (NWS)

export const PointsResponseSchema = z.object({
  properties: z.object({
    gridId: z.string(),
    gridX: z.number(),
    gridY: z.number(),
  }),
})

export const ForecastResponseSchema = z.object({
  properties: z.object({
    periods: z.array(
      z.object({
        name: z.string(),
        isDaytime: z.boolean(),
        temperature: z.number(),
        temperatureUnit: z.string(),
        windSpeed: z.string(),
        windDirection: z.string(),
        shortForecast: z.string(),
        icon: z.string(),
      })
    ),
  }),
})
