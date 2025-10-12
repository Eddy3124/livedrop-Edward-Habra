import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Catalog from './pages/catalog'
import Product from './pages/product'
import Cart from './pages/cart'
import Checkout from './pages/checkout'
import OrderStatus from './pages/order-status'
import Header from './components/organisms/Header'
import Footer from './components/organisms/Footer'
import CartDrawer from './components/organisms/CartDrawer'
import SupportPanel from './components/organisms/SupportPanel'
import { useCartStore } from './lib/store'

function App() {
  const isCartOpen = useCartStore((state) => state.isCartOpen)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const isSupportOpen = useCartStore((state) => state.isSupportOpen)
  const toggleSupport = useCartStore((state) => state.toggleSupport)

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header onCartClick={toggleCart} onSupportClick={toggleSupport} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/p/:id" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderStatus />} />
          </Routes>
        </main>
        <Footer />
      </div>
      
      <CartDrawer isOpen={isCartOpen} onClose={toggleCart} />
      <SupportPanel isOpen={isSupportOpen} onClose={toggleSupport} />
    </Router>
  )
}

export default App
