import { useState } from 'react'
import { askQuestion } from '../assistant/engine'

export default function SupportAssistant() {
  const [q, setQ] = useState('')
  const [conversation, setConversation] = useState<Array<{q:string,a:string}>>([])

  const handleAsk = async (e:any) => {
    e.preventDefault()
    if (!q) return
    const ans = await askQuestion(q)
    setConversation(prev => [...prev, { q, a: ans }])
    setQ('')
  }

  return (
    <div>
      <h3>Support Assistant</h3>
      <form onSubmit={handleAsk} className="flex space-x-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Ask a question" className="border px-2 py-1 flex-1" />
        <button className="px-3 py-1 bg-blue-600 text-white">Ask</button>
      </form>
      <div className="mt-4 space-y-3">
        {conversation.map((c, i) => (
          <div key={i} className="p-3 border rounded">
            <div className="text-sm text-gray-600">You: {c.q}</div>
            <div className="text-sm text-blue-800">Sam: {c.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
