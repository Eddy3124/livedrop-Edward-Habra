import { useState, useEffect, useRef } from 'react'
import { useChatSupport } from '../../lib/store'
import { askQuestion } from '../../assistant/engine'
import Button from '../atoms/Button'

interface SupportPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SupportPanel({ isOpen, onClose }: SupportPanelProps) {
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState<Array<{question: string, answer: string}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Close panel when pressing Escape key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [onClose])
  
  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  // Scroll to bottom of conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim()) return
    
    setIsLoading(true)
    
    try {
      const answer = await askQuestion(question)
      setConversation(prev => [...prev, { question, answer }])
      setQuestion('')
    } catch (error) {
      console.error('Error asking question:', error)
      setConversation(prev => [...prev, { 
        question, 
        answer: "Sorry, I'm having trouble answering your question right now. Please try again later." 
      }])
    } finally {
      setIsLoading(false)
    }
  }
  
  if (!isOpen) return null
  
  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="fixed inset-y-0 right-0 max-w-full flex z-50">
        <div className="relative w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Customer Support</h2>
              <button
                type="button"
                className="ml-3 h-7 flex items-center justify-center rounded-md focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto py-6 px-4 sm:px-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500">
                  Ask our support assistant any questions about our products, services, or policies.
                </p>
              </div>
              
              <div className="space-y-6">
                {conversation.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">How can we help?</h3>
                    <p className="text-gray-500">
                      Ask a question about our products, services, or policies.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.map((exchange, index) => (
                      <div key={index} className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4">
                          <p className="font-medium text-gray-900">You:</p>
                          <p className="text-gray-700">{exchange.question}</p>
                        </div>
                        
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="font-medium text-blue-900">Support Assistant:</p>
                          <p className="text-blue-700 whitespace-pre-line">{exchange.answer}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="flex space-x-3">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !question.trim()}
                >
                  {isLoading ? 'Sending...' : 'Ask'}
                </Button>
              </form>
              
              <div className="mt-3 text-xs text-gray-500 text-center">
                <p>Our support assistant can answer questions about products, orders, and policies.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
