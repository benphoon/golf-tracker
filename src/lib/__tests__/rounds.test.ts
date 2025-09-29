import { saveRound, getUserRounds, deleteRound } from '../rounds'
import { RoundType, Player } from '@/types'

// Mock Supabase
jest.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}))

import { supabase } from '../supabase'
const mockSupabase = supabase as jest.Mocked<typeof supabase>

describe('Rounds API', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  }

  const mockPlayers: Player[] = [
    {
      id: 'player-1',
      name: 'Player 1',
      scores: [4, 3, 5, 4, 4, 3, 5, 4, 4],
      totalScore: 36
    },
    {
      id: 'player-2',
      name: 'Player 2',
      scores: [5, 4, 4, 5, 3, 4, 4, 5, 3],
      totalScore: 37
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()

    // Default successful auth response
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser }
    })
  })

  describe('saveRound', () => {
    it('saves a round successfully', async () => {
      const mockRound = { id: 'round-123' }
      const mockFromRounds = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockRound, error: null })
      }
      const mockFromPlayers = {
        insert: jest.fn().mockResolvedValue({ error: null })
      }

      mockSupabase.from
        .mockReturnValueOnce(mockFromRounds) // saved_rounds
        .mockReturnValueOnce(mockFromPlayers) // round_players

      const result = await saveRound({
        title: '9 Hole Round',
        holes: 9 as RoundType,
        players: mockPlayers
      })

      expect(result).toEqual({ roundId: 'round-123' })
      expect(mockFromRounds.insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        title: '9 Hole Round',
        holes: 9,
        course_par: 36,
        played_at: expect.any(String)
      })
      expect(mockFromPlayers.insert).toHaveBeenCalledWith([
        {
          round_id: 'round-123',
          name: 'Player 1',
          total_score: 36,
          scores: [4, 3, 5, 4, 4, 3, 5, 4, 4],
          player_order: 0
        },
        {
          round_id: 'round-123',
          name: 'Player 2',
          total_score: 37,
          scores: [5, 4, 4, 5, 3, 4, 4, 5, 3],
          player_order: 1
        }
      ])
    })

    it('returns error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null }
      })

      const result = await saveRound({
        title: '9 Hole Round',
        holes: 9 as RoundType,
        players: mockPlayers
      })

      expect(result).toEqual({ error: 'You must be logged in to save rounds' })
    })

    it('returns error when round insert fails', async () => {
      const mockFromRounds = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Insert failed' } })
      }

      mockSupabase.from.mockReturnValue(mockFromRounds)

      const result = await saveRound({
        title: '9 Hole Round',
        holes: 9 as RoundType,
        players: mockPlayers
      })

      expect(result).toEqual({ error: 'Failed to save round' })
    })

    it('cleans up round when players insert fails', async () => {
      const mockRound = { id: 'round-123' }
      const mockFromRounds = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockRound, error: null }),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null })
      }
      const mockFromPlayers = {
        insert: jest.fn().mockResolvedValue({ error: { message: 'Player insert failed' } })
      }

      mockSupabase.from
        .mockReturnValueOnce(mockFromRounds) // saved_rounds (insert)
        .mockReturnValueOnce(mockFromPlayers) // round_players (insert)
        .mockReturnValueOnce(mockFromRounds) // saved_rounds (delete)

      const result = await saveRound({
        title: '9 Hole Round',
        holes: 9 as RoundType,
        players: mockPlayers
      })

      expect(result).toEqual({ error: 'Failed to save round players' })
      expect(mockFromRounds.delete).toHaveBeenCalled()
      expect(mockFromRounds.eq).toHaveBeenCalledWith('id', 'round-123')
    })

    it('filters out null scores when saving players', async () => {
      const playersWithNulls: Player[] = [
        {
          id: 'player-1',
          name: 'Player 1',
          scores: [4, null, 5, null, 4, 3, 5, 4, 4] as (number | null)[],
          totalScore: 29
        }
      ]

      const mockRound = { id: 'round-123' }
      const mockFromRounds = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockRound, error: null })
      }
      const mockFromPlayers = {
        insert: jest.fn().mockResolvedValue({ error: null })
      }

      mockSupabase.from
        .mockReturnValueOnce(mockFromRounds)
        .mockReturnValueOnce(mockFromPlayers)

      await saveRound({
        title: '9 Hole Round',
        holes: 9 as RoundType,
        players: playersWithNulls
      })

      expect(mockFromPlayers.insert).toHaveBeenCalledWith([
        {
          round_id: 'round-123',
          name: 'Player 1',
          total_score: 29,
          scores: [4, 5, 4, 3, 5, 4, 4], // nulls filtered out
          player_order: 0
        }
      ])
    })
  })

  describe('getUserRounds', () => {
    it('retrieves user rounds successfully', async () => {
      const mockRoundsData = [
        {
          id: 'round-1',
          title: '9 Hole Round',
          holes: 9,
          course_par: 36,
          played_at: '2024-01-01T12:00:00Z',
          round_players: [
            {
              id: 'player-1',
              name: 'Player 1',
              total_score: 36,
              scores: [4, 3, 5, 4, 4, 3, 5, 4, 4],
              player_order: 0
            }
          ]
        }
      ]

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockRoundsData, error: null })
      }

      mockSupabase.from.mockReturnValue(mockFrom)

      const result = await getUserRounds()

      expect(result).toEqual({
        rounds: [
          {
            id: 'round-1',
            title: '9 Hole Round',
            holes: 9,
            coursePar: 36,
            playedAt: '2024-01-01T12:00:00Z',
            players: [
              {
                id: 'player-1',
                name: 'Player 1',
                totalScore: 36,
                scores: [4, 3, 5, 4, 4, 3, 5, 4, 4],
                playerOrder: 0
              }
            ]
          }
        ]
      })

      expect(mockFrom.select).toHaveBeenCalledWith(expect.stringContaining('round_players'))
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
      expect(mockFrom.order).toHaveBeenCalledWith('played_at', { ascending: false })
    })

    it('returns error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null }
      })

      const result = await getUserRounds()

      expect(result).toEqual({ error: 'You must be logged in to view round history' })
    })

    it('returns error when database query fails', async () => {
      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
      }

      mockSupabase.from.mockReturnValue(mockFrom)

      const result = await getUserRounds()

      expect(result).toEqual({ error: 'Failed to load round history' })
    })

    it('sorts players by player_order', async () => {
      const mockRoundsData = [
        {
          id: 'round-1',
          title: '9 Hole Round',
          holes: 9,
          course_par: 36,
          played_at: '2024-01-01T12:00:00Z',
          round_players: [
            { id: 'p2', name: 'Player 2', total_score: 37, scores: [5], player_order: 1 },
            { id: 'p1', name: 'Player 1', total_score: 36, scores: [4], player_order: 0 }
          ]
        }
      ]

      const mockFrom = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockRoundsData, error: null })
      }

      mockSupabase.from.mockReturnValue(mockFrom)

      const result = await getUserRounds()

      expect(result.rounds?.[0].players[0].name).toBe('Player 1')
      expect(result.rounds?.[0].players[1].name).toBe('Player 2')
    })
  })

  describe('deleteRound', () => {
    it('deletes a round successfully', async () => {
      const mockFrom = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn((field: string, value: string) => {
          if (field === 'id') return mockFrom
          if (field === 'user_id') return Promise.resolve({ error: null })
          return mockFrom
        })
      }

      mockSupabase.from.mockReturnValue(mockFrom)

      const result = await deleteRound('round-123')

      expect(result).toEqual({})
      expect(mockFrom.delete).toHaveBeenCalled()
      expect(mockFrom.eq).toHaveBeenCalledWith('id', 'round-123')
      expect(mockFrom.eq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    it('returns error when user is not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null }
      })

      const result = await deleteRound('round-123')

      expect(result).toEqual({ error: 'You must be logged in to delete rounds' })
    })

    it('returns error when delete fails', async () => {
      const mockFrom = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn((field: string, value: string) => {
          if (field === 'id') return mockFrom
          if (field === 'user_id') return Promise.resolve({ error: { message: 'Delete failed' } })
          return mockFrom
        })
      }

      mockSupabase.from.mockReturnValue(mockFrom)

      const result = await deleteRound('round-123')

      expect(result).toEqual({ error: 'Failed to delete round' })
    })
  })

  describe('error handling', () => {
    it('handles unexpected errors in saveRound', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await saveRound({
        title: '9 Hole Round',
        holes: 9 as RoundType,
        players: mockPlayers
      })

      expect(result).toEqual({ error: 'An unexpected error occurred' })
    })

    it('handles unexpected errors in getUserRounds', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await getUserRounds()

      expect(result).toEqual({ error: 'An unexpected error occurred' })
    })

    it('handles unexpected errors in deleteRound', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const result = await deleteRound('round-123')

      expect(result).toEqual({ error: 'An unexpected error occurred' })
    })
  })
})