import { GameState, RoundType } from '../index'

describe('Types', () => {
  describe('GameState Interface', () => {
    it('should allow valid GameState objects', () => {
      const validGameState: GameState = {
        holes: 18,
        scores: [4, 5, 3, 4, 6, 4, 3, 5, 4, 4, 5, 3, 4, 6, 4, 3, 5, 4],
        currentHole: 18,
        totalScore: 76,
      }

      expect(validGameState.holes).toBe(18)
      expect(validGameState.scores).toHaveLength(18)
      expect(validGameState.currentHole).toBe(18)
      expect(validGameState.totalScore).toBe(76)
    })

    it('should allow empty scores array', () => {
      const gameState: GameState = {
        holes: 9,
        scores: [],
        currentHole: 0,
        totalScore: 0,
      }

      expect(gameState.scores).toHaveLength(0)
    })

    it('should allow partial scores', () => {
      const gameState: GameState = {
        holes: 9,
        scores: [4, 5, 3],
        currentHole: 3,
        totalScore: 12,
      }

      expect(gameState.scores).toHaveLength(3)
      expect(gameState.currentHole).toBe(3)
    })

    it('should enforce number types for all properties', () => {
      const gameState: GameState = {
        holes: 18,
        scores: [1, 2, 3, 4, 5],
        currentHole: 5,
        totalScore: 15,
      }

      expect(typeof gameState.holes).toBe('number')
      expect(typeof gameState.currentHole).toBe('number')
      expect(typeof gameState.totalScore).toBe('number')
      expect(Array.isArray(gameState.scores)).toBe(true)
      gameState.scores.forEach(score => {
        expect(typeof score).toBe('number')
      })
    })
  })

  describe('RoundType', () => {
    it('should accept 9 as valid RoundType', () => {
      const nineHoleRound: RoundType = 9
      expect(nineHoleRound).toBe(9)
    })

    it('should accept 18 as valid RoundType', () => {
      const eighteenHoleRound: RoundType = 18
      expect(eighteenHoleRound).toBe(18)
    })

    it('should be used in function signatures', () => {
      const calculatePar = (roundType: RoundType): number => {
        return roundType * 4 // Assuming par 4 for each hole
      }

      expect(calculatePar(9)).toBe(36)
      expect(calculatePar(18)).toBe(72)
    })

    it('should work with arrays and objects', () => {
      const rounds: RoundType[] = [9, 18]
      expect(rounds).toHaveLength(2)
      expect(rounds[0]).toBe(9)
      expect(rounds[1]).toBe(18)

      const roundConfig: { [key in RoundType]: string } = {
        9: 'Nine Hole Round',
        18: 'Eighteen Hole Round',
      }

      expect(roundConfig[9]).toBe('Nine Hole Round')
      expect(roundConfig[18]).toBe('Eighteen Hole Round')
    })
  })

  describe('Type Combinations', () => {
    it('should work together in realistic scenarios', () => {
      const createGameState = (roundType: RoundType): GameState => {
        return {
          holes: roundType,
          scores: Array(roundType).fill(0),
          currentHole: 0,
          totalScore: 0,
        }
      }

      const nineHoleGame = createGameState(9)
      expect(nineHoleGame.holes).toBe(9)
      expect(nineHoleGame.scores).toHaveLength(9)

      const eighteenHoleGame = createGameState(18)
      expect(eighteenHoleGame.holes).toBe(18)
      expect(eighteenHoleGame.scores).toHaveLength(18)
    })

    it('should support game progression', () => {
      const updateGameState = (
        currentState: GameState,
        holeIndex: number,
        score: number
      ): GameState => {
        const newScores = [...currentState.scores]
        newScores[holeIndex] = score

        return {
          ...currentState,
          scores: newScores,
          currentHole: Math.max(currentState.currentHole, holeIndex + 1),
          totalScore: newScores.reduce((sum, s) => sum + s, 0),
        }
      }

      let gameState: GameState = {
        holes: 9,
        scores: Array(9).fill(0),
        currentHole: 0,
        totalScore: 0,
      }

      // Play first hole
      gameState = updateGameState(gameState, 0, 4)
      expect(gameState.currentHole).toBe(1)
      expect(gameState.totalScore).toBe(4)

      // Play second hole
      gameState = updateGameState(gameState, 1, 5)
      expect(gameState.currentHole).toBe(2)
      expect(gameState.totalScore).toBe(9)
    })
  })
})