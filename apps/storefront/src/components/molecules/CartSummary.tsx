import { formatCurrency } from '../../lib/format'
import { CartItem } from '../../lib/types'

interface CartSummaryProps {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export default function CartSummary({ 
  items, 
  subtotal, 
  shipping, 
  tax, 
  total 
}: CartSummaryProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      
      <div className="mb-6">
        <h3 className="font-medium mb-3">
          {items.length} {items.length === 1 ? 'Item' : 'Items'}
        </h3>
        
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="truncate mr-2">{item.title} × {item.quantity}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3 mb-6">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}
