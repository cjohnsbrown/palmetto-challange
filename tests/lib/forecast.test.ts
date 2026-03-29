import { describe, it, expect, vi, beforeEach } from "vitest"
import { getForecast } from "@/lib/forecast"

const mockFetch = vi.fn()
vi.stubGlobal("fetch", mockFetch)

beforeEach(() => {
  vi.clearAllMocks()
})

function makeResponse(body: object, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  }
}

const pointsResponse = {
  properties: { gridId: "TOP", gridX: 31, gridY: 80 },
}

const forecastResponse = {
  properties: {
    periods: [
      {
        name: "Monday",
        isDaytime: true,
        temperature: 75,
        temperatureUnit: "F",
        windSpeed: "10 mph",
        windDirection: "S",
        shortForecast: "Sunny",
        icon: "https://api.weather.gov/icons/land/day/few?size=medium",
      },
    ],
  },
}

describe("getForecast", () => {
  it("returns forecast periods for valid coordinates", async () => {
    mockFetch
      .mockResolvedValueOnce(makeResponse(pointsResponse))
      .mockResolvedValueOnce(makeResponse(forecastResponse))

    const periods = await getForecast(39.0224, -95.7691)
    expect(periods).toHaveLength(1)
    expect(periods[0]).toEqual(
      expect.objectContaining({
        name: "Monday",
        temperature: 75,
        shortForecast: "Sunny",
      })
    )
  })

  it("throws when points API fails", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({}, false, 404))
    await expect(getForecast(0, 0)).rejects.toThrow(
      "NWS points API returned 404"
    )
  })

  it("throws when forecast API fails", async () => {
    mockFetch
      .mockResolvedValueOnce(makeResponse(pointsResponse))
      .mockResolvedValueOnce(makeResponse({}, false, 500))

    await expect(getForecast(39.0224, -95.7691)).rejects.toThrow(
      "NWS forecast API returned 500"
    )
  })

  it("throws on malformed points response", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ bad: true }))
    await expect(getForecast(39.0224, -95.7691)).rejects.toThrow(
      "Unexpected response from NWS points API"
    )
  })

  it("throws on malformed forecast response", async () => {
    mockFetch
      .mockResolvedValueOnce(makeResponse(pointsResponse))
      .mockResolvedValueOnce(makeResponse({ bad: true }))

    await expect(getForecast(39.0224, -95.7691)).rejects.toThrow(
      "Unexpected response from NWS forecast API"
    )
  })
})
