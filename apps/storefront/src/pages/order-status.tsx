import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrderStatus } from '../lib/api'
import { OrderStatus as OrderStatusType } from '../lib/types'
import { formatCurrency, formatDate } from '../lib/format'
import Button from '../components/atoms/Button'
import Breadcrumb from '../components/molecules/Breadcrumb'
import StatusBadge from '../components/atoms/StatusBadge'
import { createOrderEventSource } from '../lib/sse-client'

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderStatusType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const esRef = useRef<any | null>(null)
  
  useEffect(() => {
    let closed = false
    const init = async () => {
      if (!id) return
      try {
        const orderData = await getOrderStatus(id)
        if (!closed) setOrder(orderData)
      } catch (err) {
        if (!closed) setError('Failed to fetch order status. Please check the order ID and try again.')
      } finally {
        if (!closed) setLoading(false)
      }
      // Connect SSE
      esRef.current = createOrderEventSource(id, (data: any) => {
        setOrder(prev => ({ ...(prev as any), status: data.status }))
        if (data.status === 'DELIVERED') {
          esRef.current?.close()
        }
      }, (err:any) => {
        console.warn('SSE error', err)
      })
    }

    init()

    return () => {
      closed = true
      esRef.current?.close()
    }
  }, [id])
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The order you\'re looking for doesn\'t exist.'}</p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    )
  }
  
  const statusSteps = [
    { id: 'placed', label: 'Order Placed' },
    { id: 'packed', label: 'Packed' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' }
  ]
  
  const currentStepIndex = statusSteps.findIndex(step => step.id === order.status)
  
  return (
    <div>
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Order Status' }
      ]} />
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order #{order.id}</h1>
            <p className="text-gray-600">Placed on {formatDate(order.orderDate)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Progress</h2>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-blue-600" 
              style={{ width: `${(currentStepIndex + 1) * 25}%` }}
            ></div>
            
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index <= currentStepIndex 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <span className={`text-sm ${
                    index <= currentStepIndex ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {order.status === 'shipped' || order.status === 'delivered' ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-800 mb-2">Shipping Information</h3>
            <p className="text-blue-700">
              Carrier: <span className="font-medium">{order.carrier}</span>
            </p>
            <p className="text-blue-700">
              Estimated Delivery: <span className="font-medium">{formatDate(order.estimatedDelivery!)}</span>
            </p>
            {order.trackingNumber && (
              <p className="text-blue-700">
                Tracking Number: <span className="font-medium">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        ) : null}
        
        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold mb-4">Order Details</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-md object-cover" src={item.image} alt={item.title} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.title}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(item.price)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                    Subtotal
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(order.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                    Shipping
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(order.shipping)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                    Tax
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(order.tax)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-4 py-4 text-sm font-bold text-gray-900 text-right">
                    Total
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Link to="/" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
