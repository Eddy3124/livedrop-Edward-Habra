import { Product } from '../../lib/types'
import { formatCurrency } from '../../lib/format'
import { useCartStore } from '../../lib/store'
import Button from '../atoms/Button'
import StockIndicator from '../atoms/StockIndicator'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  
  const handleAddToCart = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.image
    })
  }
  
  return (
    <div className="card h-full flex flex-col">
      <div className="aspect-square bg-gray-100 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
        <p className="text-blue-600 font-semibold mb-3">{formatCurrency(product.price)}</p>
        
        <div className="mb-4">
          <StockIndicator stockQty={product.stockQty} />
        </div>
        
        <div className="mt-auto">
          <Button 
            onClick={handleAddToCart}
            disabled={product.stockQty === 0}
            className="w-full"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  )
}
