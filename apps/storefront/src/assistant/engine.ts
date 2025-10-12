import { GroundTruthQA } from '../lib/types'
import groundTruth from './ground-truth.json'
import { getOrderStatus } from '../lib/api'

const qaData = groundTruth as GroundTruthQA[]

// Function to calculate keyword overlap score
function calculateScore(question: string, qa: GroundTruthQA): number {
  const questionWords = question.toLowerCase().split(/\W+/).filter(word => word.length > 2)
  const qaQuestionWords = qa.question.toLowerCase().split(/\W+/).filter(word => word.length > 2)
  
  if (questionWords.length === 0 || qaQuestionWords.length === 0) return 0
  
  const intersection = questionWords.filter(word => qaQuestionWords.includes(word))
  return intersection.length / Math.max(questionWords.length, qaQuestionWords.length)
}

// Function to detect order ID in text
function detectOrderId(text: string): string | null {
  const orderIdMatch = text.match(/[A-Z0-9]{10,}/)
  return orderIdMatch ? orderIdMatch[0] : null
}

// Function to mask PII (show last 4 characters)
function maskPII(id: string): string {
  if (id.length <= 4) return id
  return `****${id.slice(-4)}`
}

export async function askQuestion(question: string): Promise<string> {
  // Check for order ID
  const orderId = detectOrderId(question)
  let orderStatusInfo = ''
  
  if (orderId) {
    try {
      const orderStatus = await getOrderStatus(orderId)
      orderStatusInfo = `\n\nOrder Status for ${maskPII(orderId)}: ${orderStatus.status.charAt(0).toUpperCase() + orderStatus.status.slice(1)}`
      if (orderStatus.carrier && orderStatus.estimatedDelivery) {
        orderStatusInfo += `\nCarrier: ${orderStatus.carrier}\nEstimated Delivery: ${new Date(orderStatus.estimatedDelivery).toLocaleDateString()}`
      }
    } catch (error) {
      orderStatusInfo = `\n\nUnable to retrieve status for order ${maskPII(orderId)}. Please verify the order ID.`
    }
  }
  
  // Score all Q&A pairs
  const scores = qaData.map(qa => ({
    qa,
    score: calculateScore(question, qa)
  }))
  
  // Sort by score (highest first)
  scores.sort((a, b) => b.score - a.score)
  
  // Get the best match
  const bestMatch = scores[0]
  
  // Confidence threshold
  const confidenceThreshold = 0.3
  
  if (bestMatch.score >= confidenceThreshold) {
    return `${bestMatch.qa.answer} [${bestMatch.qa.qid}]${orderStatusInfo}`
  }
  
  // If no good match, check if it's about order status and we found an order
  if (orderId && orderStatusInfo) {
    return `I found information about your order.${orderStatusInfo}`
  }
  
  // Otherwise, politely decline
  return "I'm sorry, I don't have information to answer that question. Please contact our support team for assistance with this specific inquiry."
}
