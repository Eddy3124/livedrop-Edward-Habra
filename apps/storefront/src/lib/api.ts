import { Product, CartItem, OrderStatus } from './types'

// Mock data
import mockCatalog from '../../public/mock-catalog.json'

const products = mockCatalog as Product[]

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function listProducts(): Promise<Product[]> {
  await delay(300) // Simulate network delay
  return products
}

export async function getProduct(id: string): Promise<Product> {
  await delay(300) // Simulate network delay
  
  const product = products.find(p => p.id === id)
  if (!product) {
    throw new Error(`Product with id ${id} not found`)
  }
  
  return product
}

export async function placeOrder(items: CartItem[]): Promise<{ orderId: string }> {
  await delay(1000) // Simulate network delay
  
  // Generate a random order ID
  const orderId = Array.from({ length: 12 }, () => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
  ).join('')
  
  // In a real app, this would send the order to a backend
  console.log('Placing order:', { orderId, items })
  
  return { orderId }
}

export async function getOrderStatus(id: string): Promise<OrderStatus> {
  await delay(500) // Simulate network delay
  
  // Mock order statuses based on ID
  const lastChar = id.charAt(id.length - 1)
  let status: 'placed' | 'packed' | 'shipped' | 'delivered'
  
  if (['0', '1', '2'].includes(lastChar)) {
    status = 'placed'
  } else if (['3', '4', '5'].includes(lastChar)) {
    status = 'packed'
  } else if (['6', '7', '8'].includes(lastChar)) {
    status = 'shipped'
  } else {
    status = 'delivered'
  }
  
  // Generate a random date within the last 7 days
  const orderDate = new Date()
  orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 7))
  
  // Generate estimated delivery date (2-5 days from order date)
  const estimatedDelivery = new Date(orderDate)
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 2 + Math.floor(Math.random() * 4))
  
  // Mock order items
  const mockItems: CartItem[] = [
    {
      id: '1',
      title: 'Premium Headphones',
      price: 129.99,
      quantity: 1,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    {
      id: '2',
      title: 'Wireless Mouse',
      price: 39.99,
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    }
  ]
  
  const subtotal = mockItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax
  
  return {
    id,
    status,
    orderDate: orderDate.toISOString(),
    estimatedDelivery: estimatedDelivery.toISOString(),
    carrier: status === 'shipped' || status === 'delivered' ? 'FastShip Express' : undefined,
    trackingNumber: status === 'shipped' || status === 'delivered' ? `FS${id.substring(0, 8)}` : undefined,
    items: mockItems,
    subtotal,
    shipping,
    tax,
    total
  }
}
