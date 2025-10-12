import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Catalog from './pages/catalog'
import Product from './pages/product'
import Cart from './pages/cart'
import Checkout from './pages/checkout'
import OrderStatus from './pages/order-status'
import CatalogTemplate from './components/templates/CatalogTemplate'
import ProductTemplate from './components/templates/ProductTemplate'
import CartTemplate from './components/templates/CartTemplate'
import CheckoutTemplate from './components/templates/CheckoutTemplate'
import OrderStatusTemplate from './components/templates/OrderStatusTemplate'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <CatalogTemplate>
            <Catalog />
          </CatalogTemplate>
        } />
        <Route path="/p/:id" element={
          <ProductTemplate>
            <Product />
          </ProductTemplate>
        } />
        <Route path="/cart" element={
          <CartTemplate>
            <Cart />
          </CartTemplate>
        } />
        <Route path="/checkout" element={
          <CheckoutTemplate>
            <Checkout />
          </CheckoutTemplate>
        } />
        <Route path="/order/:id" element={
          <OrderStatusTemplate>
            <OrderStatus />
          </OrderStatusTemplate>
        } />
      </Routes>
    </Router>
  )
}

export default App
