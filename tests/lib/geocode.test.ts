import { describe, it, expect, vi, beforeEach } from "vitest"
import { geocodeByZip, geocodeByCityState } from "@/lib/geocode"

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

const validZipResponse = {
  "post code": "66614",
  places: [
    {
      "place name": "Topeka",
      longitude: "-95.7691",
      latitude: "39.0224",
      state: "Kansas",
      "state abbreviation": "KS",
    },
  ],
}

const validCityStateResponse = {
  "place name": "Topeka",
  state: "Kansas",
  "state abbreviation": "KS",
  places: [
    {
      "place name": "Topeka",
      longitude: "-95.7697",
      latitude: "39.0429",
      "post code": "66601",
    },
  ],
}

describe("geocodeByZip", () => {
  it("returns parsed results for a valid response", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(validZipResponse))

    const results = await geocodeByZip("66614")
    expect(results).toEqual([
      { city: "Topeka", state: "KS", lat: 39.0224, lng: -95.7691 },
    ])
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/us/66614")
    )
  })

  it("returns empty array when zip not found (404)", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({}, false, 404))
    const results = await geocodeByZip("00000")
    expect(results).toEqual([])
  })

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({}, false, 500))
    await expect(geocodeByZip("66614")).rejects.toThrow(
      "Zippopotam API returned 500"
    )
  })

  it("throws on malformed response", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({ unexpected: true }))
    await expect(geocodeByZip("66614")).rejects.toThrow(
      "Unexpected response from Zippopotam API"
    )
  })
})

describe("geocodeByCityState", () => {
  it("returns parsed results for a valid response", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse(validCityStateResponse))

    const results = await geocodeByCityState("Topeka", "KS")
    expect(results).toEqual([
      { city: "Topeka", state: "KS", lat: 39.0429, lng: -95.7697 },
    ])
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/us/ks/topeka")
    )
  })

  it("returns empty array when city not found (404)", async () => {
    mockFetch.mockResolvedValueOnce(makeResponse({}, false, 404))
    const results = await geocodeByCityState("Faketown", "ZZ")
    expect(results).toEqual([])
  })
})
