import { GroundTruthQA } from '../lib/types'
import groundTruth from './ground-truth.json'
import { getOrderStatus } from '../lib/api'

const qaData = groundTruth as GroundTruthQA[]

// Function to calculate keyword overlap score
function calculateScore(question: string, qa: GroundTruthQA): number {
  const questionWords = question.toLowerCase().split(/\W+/).filter(word => word.length > 2)
  const qaQuestionWords = qa.question.toLowerCase
