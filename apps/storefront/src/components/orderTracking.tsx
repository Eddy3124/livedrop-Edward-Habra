import { useState, useEffect } from 'react'
import { createOrderEventSource } from '../lib/sse-client'
import { getOrderStatus } from '../lib/api'

export default function OrderTracking({ orderId }: { orderId: string }) {
  const [status, setStatus] = useState<string | null>(null)
  useEffect(() => {
    let mounted = true
    getOrderStatus(orderId).then(o => { if (mounted) setStatus((o as any).status) }).catch(() => {})
    const es = createOrderEventSource(orderId, (data) => {
      setStatus(data.status)
    })
    return () => { es.close(); mounted = false }
  }, [orderId])

  return (
    <div>
      <h3 className="text-lg font-semibold">Order Tracking</h3>
      <p>Order ID: {orderId}</p>
      <p>Status: {status || 'loading...'}</p>
    </div>
  )
}
