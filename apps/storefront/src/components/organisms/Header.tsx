import { Link } from 'react-router-dom'
import { useCartStore } from '../../lib/store'
import Button from '../atoms/Button'
import CartIcon from '../atoms/CartIcon'
import SupportIcon from '../atoms/SupportIcon'

interface HeaderProps {
  onCartClick: () => void
  onSupportClick: () => void
}

export default function Header({ onCartClick, onSupportClick }: HeaderProps) {
  const items = useCartStore((state) => state.items)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-md mr-2"></div>
            <span className="font-bold text-xl">Storefront</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Products
            </Link>
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
            <Link to="/" className="text-gray-700 hover:text-blue-600">
              Contact
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onSupportClick}
              className="p-2 text-gray-600 hover:text-blue-600 relative"
              aria-label="Support"
            >
              <SupportIcon />
            </button>
            
            <button
              onClick={onCartClick}
              className="p-2 text-gray-600 hover:text-blue-600 relative"
              aria-label="Cart"
            >
              <CartIcon />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
