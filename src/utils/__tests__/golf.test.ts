import {
  calculatePar,
  calculateRelativeToPar,
  formatRelativeToPar,
  isValidScore,
  calculateCompletionPercentage,
  calculateAverageScore,
  getScoreQuality,
  calculateTotalScore,
  generateCompletionMessage,
} from '../golf'

describe('Golf Utilities', () => {
  describe('calculatePar', () => {
    it('should calculate par for 9 holes', () => {
      expect(calculatePar(9)).toBe(36)
    })

    it('should calculate par for 18 holes', () => {
      expect(calculatePar(18)).toBe(72)
    })
  })

  describe('calculateRelativeToPar', () => {
    it('should calculate under par correctly', () => {
      expect(calculateRelativeToPar(32, 36)).toBe(-4)
    })

    it('should calculate over par correctly', () => {
      expect(calculateRelativeToPar(40, 36)).toBe(4)
    })

    it('should calculate even par correctly', () => {
      expect(calculateRelativeToPar(36, 36)).toBe(0)
    })
  })

  describe('formatRelativeToPar', () => {
    it('should format zero score as --', () => {
      expect(formatRelativeToPar(0, 36)).toBe('--')
    })

    it('should format even par as E', () => {
      expect(formatRelativeToPar(36, 36)).toBe('E')
    })

    it('should format under par with negative sign', () => {
      expect(formatRelativeToPar(32, 36)).toBe('-4')
    })

    it('should format over par with plus sign', () => {
      expect(formatRelativeToPar(40, 36)).toBe('+4')
    })
  })

  describe('isValidScore', () => {
    it('should accept valid scores', () => {
      expect(isValidScore(1)).toBe(true)
      expect(isValidScore(4)).toBe(true)
      expect(isValidScore(15)).toBe(true)
    })

    it('should reject invalid scores', () => {
      expect(isValidScore(0)).toBe(false)
      expect(isValidScore(16)).toBe(false)
      expect(isValidScore(-1)).toBe(false)
    })
  })

  describe('calculateCompletionPercentage', () => {
    it('should calculate completion percentage correctly', () => {
      expect(calculateCompletionPercentage(5, 9)).toBe(56)
      expect(calculateCompletionPercentage(9, 18)).toBe(50)
      expect(calculateCompletionPercentage(18, 18)).toBe(100)
    })

    it('should handle edge cases', () => {
      expect(calculateCompletionPercentage(0, 9)).toBe(0)
      expect(calculateCompletionPercentage(0, 0)).toBe(0)
    })
  })

  describe('calculateAverageScore', () => {
    it('should calculate average for complete scores', () => {
      expect(calculateAverageScore([4, 5, 3, 4])).toBe(4)
    })

    it('should ignore null values', () => {
      expect(calculateAverageScore([4, 5, null, 3, null])).toBe(4)
    })

    it('should handle all null values', () => {
      expect(calculateAverageScore([null, null, null])).toBe(0)
    })

    it('should handle empty array', () => {
      expect(calculateAverageScore([])).toBe(0)
    })

    it('should round to 2 decimal places', () => {
      expect(calculateAverageScore([4, 5, 4])).toBe(4.33)
    })
  })

  describe('getScoreQuality', () => {
    const par = 4

    it('should identify albatross', () => {
      expect(getScoreQuality(1, par)).toBe('albatross') // -3 or better
    })

    it('should identify eagle', () => {
      expect(getScoreQuality(2, par)).toBe('eagle') // -2
    })

    it('should identify birdie', () => {
      expect(getScoreQuality(3, par)).toBe('birdie') // -1
    })

    it('should identify par', () => {
      expect(getScoreQuality(4, par)).toBe('par') // 0
    })

    it('should identify bogey', () => {
      expect(getScoreQuality(5, par)).toBe('bogey') // +1
    })

    it('should identify double bogey', () => {
      expect(getScoreQuality(6, par)).toBe('double-bogey') // +2
    })

    it('should identify triple bogey or worse', () => {
      expect(getScoreQuality(7, par)).toBe('triple-bogey-or-worse') // +3
      expect(getScoreQuality(10, par)).toBe('triple-bogey-or-worse') // +6
    })

    it('should use default par of 4', () => {
      expect(getScoreQuality(4)).toBe('par')
      expect(getScoreQuality(3)).toBe('birdie')
    })
  })

  describe('calculateTotalScore', () => {
    it('should calculate total with all valid scores', () => {
      expect(calculateTotalScore([4, 5, 3, 4, 6])).toBe(22)
    })

    it('should treat null as 0', () => {
      expect(calculateTotalScore([4, null, 3, null, 6])).toBe(13)
    })

    it('should handle all null values', () => {
      expect(calculateTotalScore([null, null, null])).toBe(0)
    })

    it('should handle empty array', () => {
      expect(calculateTotalScore([])).toBe(0)
    })

    it('should handle mixed null and number values', () => {
      expect(calculateTotalScore([4, 5, null, 3, null, 4, 5])).toBe(21)
    })
  })

  describe('generateCompletionMessage', () => {
    it('should generate message for even par', () => {
      const message = generateCompletionMessage(72, 72)
      expect(message).toBe('Round complete! Final score: 72 (Even par)')
    })

    it('should generate message for under par', () => {
      const message = generateCompletionMessage(68, 72)
      expect(message).toBe('Round complete! Final score: 68 (-4 under par)')
    })

    it('should generate message for over par', () => {
      const message = generateCompletionMessage(76, 72)
      expect(message).toBe('Round complete! Final score: 76 (+4 over par)')
    })

    it('should work with different par values', () => {
      const message = generateCompletionMessage(35, 36)
      expect(message).toBe('Round complete! Final score: 35 (-1 under par)')
    })
  })

  describe('Integration Tests', () => {
    it('should work together for a complete 9-hole round', () => {
      const scores = [4, 5, 3, 4, 6, 4, 3, 5, 4]
      const holes = 9
      const par = calculatePar(holes)

      const total = calculateTotalScore(scores)
      const average = calculateAverageScore(scores)
      const completion = calculateCompletionPercentage(scores.length, holes)
      const message = generateCompletionMessage(total, par)

      expect(total).toBe(38)
      expect(average).toBe(4.22)
      expect(completion).toBe(100)
      expect(message).toBe('Round complete! Final score: 38 (+2 over par)')
    })

    it('should work for partial round', () => {
      const scores = [4, 5, 3, null, null, null, null, null, null]
      const completedHoles = scores.filter(s => s !== null).length
      const holes = 9

      const total = calculateTotalScore(scores)
      const average = calculateAverageScore(scores)
      const completion = calculateCompletionPercentage(completedHoles, holes)

      expect(total).toBe(12)
      expect(average).toBe(4)
      expect(completion).toBe(33)
    })

    it('should handle edge case scoring', () => {
      const scores = [1, 15, 1, 15, 1, 15, 1, 15, 1] // Extreme scores
      const total = calculateTotalScore(scores)

      scores.forEach(score => {
        if (score !== null) {
          expect(isValidScore(score)).toBe(true)
        }
      })

      expect(total).toBe(65) // 1+15+1+15+1+15+1+15+1 = 65

      // Check score qualities
      expect(getScoreQuality(1)).toBe('albatross')
      expect(getScoreQuality(15)).toBe('triple-bogey-or-worse')
    })
  })
})