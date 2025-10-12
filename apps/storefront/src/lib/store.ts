import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, CartItem } from './types'

interface CartStore {
  items: CartItem[]
  isCartOpen: boolean
  isSupportOpen: boolean
  
  // Actions
  addItem: (product: Product & { quantity: number }) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  toggleSupport: () => void
  
  // Computed
  total: number
  itemCount: number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      isSupportOpen: false,
      
      addItem: (product) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + product.quantity }
                : item
            )
          })
        } else {
          set({
            items: [...items, {
              id: product.id,
              title: product.title,
              price: product.price,
              quantity: product.quantity,
              image: product.image
            }]
          })
        }
      },
      
      removeItem: (id) => {
        set({ items: get().items.filter(item => item.id !== id) })
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        })
      },
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set(state => ({ isCartOpen: !state.isCartOpen })),
      
      toggleSupport: () => set(state => ({ isSupportOpen: !state.isSupportOpen })),
      
      get total() {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      },
      
      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items })
    }
  )
)
