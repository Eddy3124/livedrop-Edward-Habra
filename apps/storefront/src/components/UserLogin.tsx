import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function UserLogin() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: any) => {
    e.preventDefault()
    // store email in localStorage for simplicity
    localStorage.setItem('livedrop_email', email)
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="px-3 py-2 border rounded" />
      <button className="px-3 py-2 bg-blue-600 text-white rounded">Sign in</button>
    </form>
  )
}
