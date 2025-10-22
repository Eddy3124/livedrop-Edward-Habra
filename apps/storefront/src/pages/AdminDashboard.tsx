import { useEffect, useState } from 'react'
import Breadcrumb from '../components/molecules/Breadcrumb'

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api/dashboard/business-metrics')
      .then(r => r.json()).then(setMetrics).catch(() => setMetrics(null))
  }, [])

  return (
    <div>
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Admin' }]} />
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Business Metrics</h2>
        {metrics ? (
          <div>
            <div>Total Revenue: {metrics.revenue}</div>
            <div>Orders Count: {metrics.ordersCount}</div>
            <div>Average Order Value: {metrics.averageOrderValue}</div>
          </div>
        ) : <div>Loading metrics...</div>}
      </div>
    </div>
  )
}
