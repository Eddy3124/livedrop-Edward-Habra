interface StockIndicatorProps {
  stockQty: number
}

export default function StockIndicator({ stockQty }: StockIndicatorProps) {
  if (stockQty === 0) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
        Out of Stock
      </span>
    )
  }
  
  if (stockQty < 5) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        Only {stockQty} left in stock
      </span>
    )
  }
  
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
      In Stock
    </span>
  )
}
