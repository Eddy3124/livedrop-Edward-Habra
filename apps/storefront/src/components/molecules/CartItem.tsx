import { useCartStore } from '../../lib/store'
import { formatCurrency } from '../../lib/format'
import { CartItem as CartItemType } from '../../lib/types'
import Button from '../atoms/Button'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.id)
    } else {
      updateQuantity(item.id, newQuantity)
    }
  }
  
  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 mb-4 md:mb-0">
          <img 
            src={item.image} 
            alt={item.title} 
            className="w-full h-32 object-cover rounded-md"
          />
        </div>
        
        <div className="md:w-2/4 md:px-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="text-gray-600">{formatCurrency(item.price)}</p>
          </div>
          
          <div className="flex items-center mt-4 md:mt-0">
            <span className="mr-3">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button 
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                onClick={() => handleQuantityChange(item.quantity - 1)}
              >
                -
              </button>
              <span className="px-3 py-1">{item.quantity}</span>
              <button 
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                onClick={() => handleQuantityChange(item.quantity + 1)}
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/4 flex flex-col items-end justify-between">
          <div className="text-lg font-semibold">
            {formatCurrency(item.price * item.quantity)}
          </div>
          
          <Button 
            variant="ghost" 
            onClick={() => removeItem(item.id)}
            className="text-red-600 hover:text-red-700 mt-4 md:mt-0"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}
