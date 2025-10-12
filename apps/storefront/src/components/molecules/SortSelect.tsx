interface SortSelectProps {
  value: string
  onChange: (value: string) => void
}

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <select
      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="default">Default Sorting</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </select>
  )
}
