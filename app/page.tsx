"use client"

import { useState, useRef, useCallback } from "react"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GeoDropdown } from "@/components/weather/GeoDropdown"
import { ForecastGrid } from "@/components/weather/ForecastGrid"
import { ForecastSkeleton } from "@/components/weather/ForecastSkeleton"
import { fetcher } from "@/lib/fetcher"
import type { GeoResult, ForecastPeriod } from "@/lib/types"

const ZIP_RE = /^\d{5}$/
const CITY_STATE_RE = /^([a-zA-Z\s]+),\s*([a-zA-Z]{2})$/

function buildKey(query: string): string | null {
  const trimmed = query.trim()
  if (ZIP_RE.test(trimmed)) return `/api/geocode?zip=${trimmed}`
  const match = trimmed.match(CITY_STATE_RE)
  if (match) {
    return `/api/geocode?city=${encodeURIComponent(match[1].trim())}&state=${encodeURIComponent(match[2].trim())}`
  }
  return null
}

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<GeoResult | null>(null)
  const [activeLocation, setActiveLocation] = useState<GeoResult | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    setSelected(null)
    const trimmed = value.trim()

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (ZIP_RE.test(trimmed)) {
      setDebouncedQuery(value)
      return
    }

    if (CITY_STATE_RE.test(trimmed)) {
      debounceRef.current = setTimeout(() => setDebouncedQuery(value), 400)
    } else {
      setDebouncedQuery("")
    }
  }, [])

  const handleSelect = useCallback((result: GeoResult) => {
    setQuery(`${result.city}, ${result.state}`)
    setSelected(result)
    setOpen(false)
  }, [])

  const handleSearch = useCallback(() => {
    if (!selected) return
    setActiveLocation(selected)
  }, [selected])

  const handleBack = useCallback(() => {
    setActiveLocation(null)
  }, [])

  const geoKey = buildKey(debouncedQuery)
  const { data: geoData, error: geoError, isLoading: geoLoading } = useSWR<GeoResult[]>(
    geoKey, fetcher, {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
      onSuccess: (results) => {
        if (results.length > 0) setOpen(true)
      },
    }
  )

  const forecastKey = activeLocation
    ? `/api/forecast?lat=${activeLocation.lat}&lng=${activeLocation.lng}`
    : null
  const { data: forecastData, error: forecastError, isLoading: forecastLoading } = useSWR<{
    periods: ForecastPeriod[]
  }>(forecastKey, fetcher, { revalidateOnFocus: false })

  const noResults = geoKey && !geoLoading && !geoError && geoData?.length === 0

  if (activeLocation) {
    return (
      <div className="w-full max-w-6xl pt-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="rounded-md bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
          >
            &larr; Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {activeLocation.city}, {activeLocation.state}
          </h2>
        </div>
        {forecastLoading && <ForecastSkeleton />}
        {forecastError && (
          <p className="text-destructive text-center py-12">{forecastError.message}</p>
        )}
        {forecastData && <ForecastGrid periods={forecastData.periods} />}
      </div>
    )
  }

  return (
    <div className="mt-[30vh] bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg flex flex-col items-center gap-6 w-full max-w-md">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Weather Forecast
        </h1>
        <p className="mt-2 text-gray-600">
          Search by zip code or city, state to see the 7-day forecast
        </p>
      </div>
      <div className="relative w-full">
        <div className="flex gap-2">
          <Input
            type="text"
            aria-label="Search by zip code or city, state"
            placeholder="Enter zip code or city, state (e.g. Topeka, KS)"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => geoData && geoData.length > 0 && !selected && setOpen(true)}
            className="text-base"
          />
          <Button
            onClick={handleSearch}
            disabled={!selected}
            className="bg-sky-500 text-white hover:bg-sky-600 disabled:bg-gray-300 disabled:text-gray-500"
          >
            Search
          </Button>
        </div>
        {geoLoading && (
          <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
        )}
        {geoError && (
          <p className="mt-2 text-sm text-destructive">{geoError.message}</p>
        )}
        {noResults && (
          <p className="mt-2 text-sm text-muted-foreground">No results found</p>
        )}
        {open && geoData && geoData.length > 0 && (
          <GeoDropdown results={geoData} onSelect={handleSelect} />
        )}
      </div>
    </div>
  )
}
