import type { GeoResult } from "@/lib/types"

export function GeoDropdown({
  results,
  onSelect,
}: {
  results: GeoResult[]
  onSelect: (result: GeoResult) => void
}) {
  return (
    <ul className="absolute z-10 mt-1 w-full rounded-lg border bg-popover shadow-lg">
      {results.map((r, i) => (
        <li key={`${r.city}-${r.state}-${i}`}>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors first:rounded-t-lg last:rounded-b-lg"
            onClick={() => onSelect(r)}
          >
            {r.city}, {r.state}
          </button>
        </li>
      ))}
    </ul>
  )
}
