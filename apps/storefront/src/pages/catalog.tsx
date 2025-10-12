import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listProducts } from '../lib/api'
import { Product as ProductType } from '../lib/types'
import ProductCard from '../components/molecules/ProductCard'
import SearchBar from '../components/molecules/SearchBar'
import SortSelect from '../components/molecules/SortSelect'
import TagFilter from '../components/molecules/TagFilter'

export default function Catalog() {
  const [products, setProducts] = useState<ProductType[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOption, setSortOption] = useState('default')
  const [selectedTag, setSelectedTag] = useState('all')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await listProducts()
      setProducts(data)
      setFilteredProducts(data)
      
      // Extract unique tags
      const allTags = data.flatMap(product => product.tags)
      const uniqueTags = Array.from(new Set(allTags))
      setTags(uniqueTags)
    }

    fetchProducts()
  }, [])

  useEffect(() => {
    let result = [...products]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(product => 
        product.title.toLowerCase().includes(term) || 
        product.tags.some(tag => tag.toLowerCase().includes(term))
      )
    }
    
    // Apply tag filter
    if (selectedTag !== 'all') {
      result = result.filter(product => product.tags.includes(selectedTag))
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      default:
        // Keep original order
        break
    }
    
    setFilteredProducts(result)
  }, [products, searchTerm, sortOption, selectedTag])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Product Catalog</h1>
      
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
        <div className="flex gap-4">
          <SortSelect value={sortOption} onChange={setSortOption} />
          <TagFilter tags={tags} value={selectedTag} onChange={setSelectedTag} />
        </div>
      </div>
      
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <Link key={product.id} to={`/p/${product.id}`}>
              <ProductCard product={product} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
