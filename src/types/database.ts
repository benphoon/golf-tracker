export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          updated_at?: string
        }
      }
      saved_rounds: {
        Row: {
          id: string
          user_id: string
          title: string
          holes: number
          course_par: number | null
          played_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          holes: number
          course_par?: number | null
          played_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          holes?: number
          course_par?: number | null
          played_at?: string
        }
      }
      round_players: {
        Row: {
          id: string
          round_id: string
          name: string
          total_score: number
          scores: number[]
          player_order: number
          created_at: string
        }
        Insert: {
          id?: string
          round_id: string
          name: string
          total_score: number
          scores: number[]
          player_order: number
          created_at?: string
        }
        Update: {
          id?: string
          round_id?: string
          name?: string
          total_score?: number
          scores?: number[]
          player_order?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}