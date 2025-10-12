import { useEffect } from 'react'
import { useCartStore } from '../../lib/store'
import { formatCurrency } from '../../lib/format'
import { Link } from 'react-router-dom'
import Button from '../atoms/Button'
import CartItem from '../molecules/CartItem'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { items, total, clearCart } = useCartStore()
  
  // Close drawer when pressing Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])
  
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                <button
                  type="button"
                  className="ml-3 h-7 flex items-center justify-center rounded-md focus:outline-none"
                  onClick={onClose}
                >
                  <span className="sr-only">Close panel</span>
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              
              <div className="mt-8">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-6">Your cart is empty</p>
                    <Button onClick={onClose}>
                      Continue Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {items.map(item => (
                        <li key={item.id} className="py-6">
                          <CartItem item={item} />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            
            {items.length > 0 && (
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Subtotal</p>
                  <p>{formatCurrency(total)}</p>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="secondary" 
                    onClick={clearCart}
                    className="flex-1"
                  >
                    Clear Cart
                  </Button>
                  <Link
                    to="/cart"
                    className="btn btn-primary flex-1 text-center"
                    onClick={onClose}
                  >
                    View Cart
                  </Link>
                </div>
                
                <Link
                  to="/checkout"
                  className="btn btn-primary w-full mt-3 text-center"
                  onClick={onClose}
                >
                  Checkout
                </Link>
                
                <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                  <p>
                    or{' '}
                    <button
                      type="button"
                      className="font-medium text-blue-600 hover:text-blue-500"
                      onClick={onClose}
                    >
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
