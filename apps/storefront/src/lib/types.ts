export interface Product {
  id: string
  title: string
  price: number
  image: string
  tags: string[]
  stockQty: number
}

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  image: string
}

export interface OrderStatus {
  id: string
  status: 'placed' | 'packed' | 'shipped' | 'delivered'
  orderDate: string
  estimatedDelivery?: string
  carrier?: string
  trackingNumber?: string
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface GroundTruthQA {
  qid: string
  category: string
  question: string
  answer: string
}
