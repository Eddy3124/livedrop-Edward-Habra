import React from 'react'
import Header from '../organisms/Header'
import Footer from '../organisms/Footer'
import CartDrawer from '../organisms/CartDrawer'
import SupportPanel from '../organisms/SupportPanel'
import { useCartStore } from '../../../lib/store'

interface CatalogTemplateProps {
  children: React.ReactNode
}

export default function CatalogTemplate({ children }: CatalogTemplateProps) {
  const isCartOpen = useCartStore((state) => state.isCartOpen)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const isSupportOpen = useCartStore((state) => state.isSupportOpen)
  const toggleSupport = useCartStore((state) => state.toggleSupport)

  return (
    <div className="min-h-screen flex flex-col">
      <Header onCartClick={toggleCart} onSupportClick={toggleSupport} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
      
      <CartDrawer isOpen={isCartOpen} onClose={toggleCart} />
      <SupportPanel isOpen={isSupportOpen} onClose={toggleSupport} />
    </div>
  )
}
