interface TagFilterProps {
  tags: string[]
  value: string
  onChange: (value: string) => void
}

export default function TagFilter({ tags, value, onChange }: TagFilterProps) {
  return (
    <select
      className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="all">All Tags</option>
      {tags.map(tag => (
        <option key={tag} value={tag}>
          {tag}
        </option>
      ))}
    </select>
  )
}
