import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, listProducts } from '../lib/api'
import { Product as ProductType } from '../lib/types'
import { useCartStore } from '../lib/store'
import { formatCurrency } from '../lib/format'
import Button from '../components/atoms/Button'
import Breadcrumb from '../components/molecules/Breadcrumb'
import StockIndicator from '../components/atoms/StockIndicator'
import ProductCard from '../components/molecules/ProductCard'

export default function Product() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<ProductType | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  
  const addItem = useCartStore((state) => state.addItem)
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return
      
      try {
        const productData = await getProduct(id)
        setProduct(productData)
        
        // Fetch related products by shared tag
        const allProducts = await listProducts()
        if (productData.tags.length > 0) {
          const related = allProducts
            .filter(p => p.id !== id && p.tags.some(tag => productData.tags.includes(tag)))
            .slice(0, 3)
          setRelatedProducts(related)
        }
      } catch (error) {
        console.error('Failed to fetch product:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProduct()
  }, [id])
  
  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity,
        image: product.image
      })
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <p className="mb-6">The product you're looking for doesn't exist.</p>
        <Link to="/" className="btn btn-primary">
          Back to Catalog
        </Link>
      </div>
    )
  }
  
  return (
    <div>
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Catalog', href: '/' },
        { label: product.title }
      ]} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
          <p className="text-2xl font-semibold text-blue-600 mb-4">{formatCurrency(product.price)}</p>
          
          <div className="mb-6">
            <StockIndicator stockQty={product.stockQty} />
          </div>
          
          <p className="text-gray-700 mb-6">
            This is a detailed description of the {product.title}. It's a high-quality product with excellent features and durability. 
            Perfect for everyday use, this product combines functionality with style to meet all your needs.
          </p>
          
          <div className="flex items-center mb-6">
            <span className="mr-4">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded">
              <button 
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 py-1">{quantity}</span>
              <button 
                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                disabled={quantity >= product.stockQty}
              >
                +
              </button>
            </div>
          </div>
          
          <Button 
            onClick={handleAddToCart}
            disabled={product.stockQty === 0}
            className="w-full mb-4"
          >
            Add to Cart
          </Button>
          
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map(product => (
              <Link key={product.id} to={`/p/${product.id}`}>
                <ProductCard product={product} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
