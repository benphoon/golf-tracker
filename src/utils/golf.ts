import { RoundType } from '@/types'

/**
 * Calculate par for a round based on the number of holes
 * Assumes par 4 for each hole for simplicity
 */
export const calculatePar = (holes: RoundType): number => {
  return holes * 4
}

/**
 * Calculate score relative to par
 */
export const calculateRelativeToPar = (score: number, par: number): number => {
  return score - par
}

/**
 * Format score relative to par for display
 */
export const formatRelativeToPar = (score: number, par: number): string => {
  const relative = calculateRelativeToPar(score, par)

  if (score === 0) return '--'
  if (relative === 0) return 'E'
  if (relative < 0) return relative.toString()
  return `+${relative}`
}

/**
 * Validate if a score is within acceptable range
 */
export const isValidScore = (score: number): boolean => {
  return score >= 1 && score <= 15
}

/**
 * Calculate completion percentage
 */
export const calculateCompletionPercentage = (completedHoles: number, totalHoles: number): number => {
  if (totalHoles === 0) return 0
  return Math.round((completedHoles / totalHoles) * 100)
}

/**
 * Calculate average score per hole
 */
export const calculateAverageScore = (scores: (number | null)[]): number => {
  const validScores = scores.filter((score): score is number => score !== null)
  if (validScores.length === 0) return 0

  const total = validScores.reduce((sum, score) => sum + score, 0)
  return Math.round((total / validScores.length) * 100) / 100 // Round to 2 decimal places
}

/**
 * Determine score quality based on par
 */
export const getScoreQuality = (score: number, par: number = 4): string => {
  const relative = score - par

  if (relative <= -3) return 'albatross'
  if (relative === -2) return 'eagle'
  if (relative === -1) return 'birdie'
  if (relative === 0) return 'par'
  if (relative === 1) return 'bogey'
  if (relative === 2) return 'double-bogey'
  return 'triple-bogey-or-worse'
}

/**
 * Calculate total from an array of scores, treating null as 0
 */
export const calculateTotalScore = (scores: (number | null)[]): number => {
  return scores.reduce((sum, score) => sum + (score || 0), 0)
}

/**
 * Generate completion message for finished round
 */
export const generateCompletionMessage = (totalScore: number, par: number): string => {
  const relative = calculateRelativeToPar(totalScore, par)

  let parMessage: string
  if (relative === 0) {
    parMessage = 'Even par'
  } else if (relative < 0) {
    parMessage = `${relative} under par`
  } else {
    parMessage = `+${relative} over par`
  }

  return `Round complete! Final score: ${totalScore} (${parMessage})`
}