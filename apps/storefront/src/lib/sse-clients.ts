export function createOrderEventSource(orderId: string, onMessage: (data: any) => void, onError?: (err: any) => void) {
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  const url = `${API}/orders/${orderId}/stream`
  let es: EventSource | null = null
  let reconnectTimer: any = null

  function connect() {
    es = new EventSource(url)
    es.addEventListener('status', (ev: MessageEvent) => {
      try { onMessage(JSON.parse(ev.data)) } catch (e) { onMessage(ev.data) }
    })
    es.addEventListener('error', (ev) => {
      if (onError) onError(ev)
      if (es?.readyState === EventSource.CLOSED) {
        reconnectTimer = setTimeout(connect, 3000)
      }
    })
  }

  connect()

  return {
    close() {
      if (es) {
        es.close()
        es = null
      }
      if (reconnectTimer) clearTimeout(reconnectTimer)
    }
  }
}
