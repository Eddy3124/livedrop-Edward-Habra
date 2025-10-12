import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../lib/store'
import { formatCurrency } from '../lib/format'
import Button from '../components/atoms/Button'
import CartItem from '../components/molecules/CartItem'

export default function Cart() {
  const { items, total, clearCart } = useCartStore()
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-600 mb-8">Your cart is empty</p>
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-200">
              {items.map(item => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <Button 
                  variant="ghost" 
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear Cart
                </Button>
                <Link to="/" className="btn btn-secondary">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(total * 0.08)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>{formatCurrency(total * 1.08)}</span>
              </div>
            </div>
            
            <Link to="/checkout" className="btn btn-primary w-full">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
