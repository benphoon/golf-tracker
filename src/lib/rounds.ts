import { supabase } from './supabase'
import { Player, RoundType, SavedRound } from '@/types'
import { calculatePar } from '@/utils/golf'

export interface SaveRoundData {
  title: string
  holes: RoundType
  players: Player[]
  playedAt?: Date
}

export async function saveRound(data: SaveRoundData): Promise<{ error?: string; roundId?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'You must be logged in to save rounds' }
    }

    // Calculate course par
    const coursePar = calculatePar(data.holes)

    // Insert the round
    const { data: round, error: roundError } = await supabase
      .from('saved_rounds')
      .insert({
        user_id: user.id,
        title: data.title,
        holes: data.holes,
        course_par: coursePar,
        played_at: data.playedAt?.toISOString() || new Date().toISOString()
      })
      .select()
      .single()

    if (roundError) {
      console.error('Error saving round:', roundError)
      return { error: 'Failed to save round' }
    }

    // Insert players for this round
    const playersData = data.players.map((player, index) => ({
      round_id: round.id,
      name: player.name,
      total_score: player.totalScore,
      scores: player.scores.filter((score): score is number => score !== null),
      player_order: index
    }))

    const { error: playersError } = await supabase
      .from('round_players')
      .insert(playersData)

    if (playersError) {
      console.error('Error saving players:', playersError)
      // Try to clean up the round if players failed to save
      await supabase.from('saved_rounds').delete().eq('id', round.id)
      return { error: 'Failed to save round players' }
    }

    return { roundId: round.id }
  } catch (error) {
    console.error('Unexpected error saving round:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function getUserRounds(): Promise<{ rounds?: SavedRound[]; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'You must be logged in to view round history' }
    }

    // Get rounds with players
    const { data: rounds, error: roundsError } = await supabase
      .from('saved_rounds')
      .select(`
        id,
        title,
        holes,
        course_par,
        played_at,
        round_players (
          id,
          name,
          total_score,
          scores,
          player_order
        )
      `)
      .eq('user_id', user.id)
      .order('played_at', { ascending: false })

    if (roundsError) {
      console.error('Error fetching rounds:', roundsError)
      return { error: 'Failed to load round history' }
    }

    // Transform the data to match our SavedRound interface
    const savedRounds: SavedRound[] = rounds.map(round => ({
      id: round.id,
      title: round.title,
      holes: round.holes as RoundType,
      coursePar: round.course_par,
      playedAt: round.played_at,
      players: round.round_players
        .sort((a, b) => a.player_order - b.player_order)
        .map(player => ({
          id: player.id,
          name: player.name,
          totalScore: player.total_score,
          scores: player.scores,
          playerOrder: player.player_order
        }))
    }))

    return { rounds: savedRounds }
  } catch (error) {
    console.error('Unexpected error fetching rounds:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteRound(roundId: string): Promise<{ error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'You must be logged in to delete rounds' }
    }

    // Delete the round (players will be deleted automatically due to foreign key constraint)
    const { error } = await supabase
      .from('saved_rounds')
      .delete()
      .eq('id', roundId)
      .eq('user_id', user.id) // Ensure user can only delete their own rounds

    if (error) {
      console.error('Error deleting round:', error)
      return { error: 'Failed to delete round' }
    }

    return {}
  } catch (error) {
    console.error('Unexpected error deleting round:', error)
    return { error: 'An unexpected error occurred' }
  }
}