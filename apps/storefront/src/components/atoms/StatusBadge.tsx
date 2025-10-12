interface StatusBadgeProps {
  status: 'placed' | 'packed' | 'shipped' | 'delivered'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    placed: { label: 'Placed', className: 'bg-blue-100 text-blue-800' },
    packed: { label: 'Packed', className: 'bg-yellow-100 text-yellow-800' },
    shipped: { label: 'Shipped', className: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800' }
  }
  
  const config = statusConfig[status]
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
