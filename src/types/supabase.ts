export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          google_id: string
          email: string
          name: string
          image: string | null
          locale: string | null
          email_verified: boolean
          birthdate: string | null
          country: string | null
          profession: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          google_id: string
          email: string
          name: string
          image?: string | null
          locale?: string | null
          email_verified?: boolean
          birthdate?: string | null
          country?: string | null
          profession?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          google_id?: string
          email?: string
          name?: string
          image?: string | null
          locale?: string | null
          email_verified?: boolean
          birthdate?: string | null
          country?: string | null
          profession?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      personas: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          system_prompt: string
          emoji: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description: string
          system_prompt: string
          emoji?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          system_prompt?: string
          emoji?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          persona_id: string
          messages: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          persona_id: string
          messages?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          persona_id?: string
          messages?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
