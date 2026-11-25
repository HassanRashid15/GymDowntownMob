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
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          role: 'customer' | 'admin' | 'super_admin' | null
          phone: string | null
          gym_name: string | null
          age: string | null
          gender: string | null
          height: string | null
          weight: string | null
          is_approved: boolean | null
          approved_by: string | null
          approved_at: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          role?: 'customer' | 'admin' | 'super_admin' | null
          phone?: string | null
          gym_name?: string | null
          age?: string | null
          gender?: string | null
          height?: string | null
          weight?: string | null
          is_approved?: boolean | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          role?: 'customer' | 'admin' | 'super_admin' | null
          phone?: string | null
          gym_name?: string | null
          age?: string | null
          gender?: string | null
          height?: string | null
          weight?: string | null
          is_approved?: boolean | null
          approved_by?: string | null
          approved_at?: string | null
        }
        Relationships: []
      }
      bmi_records: {
        Row: {
          id: string
          user_id: string
          bmi: number
          weight: number
          height: number
          weight_unit: 'kg' | 'g' | 'lbs'
          height_unit: 'cm' | 'ft_in'
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          bmi: number
          weight: number
          height: number
          weight_unit: 'kg' | 'g' | 'lbs'
          height_unit: 'cm' | 'ft_in'
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          bmi?: number
          weight?: number
          height?: number
          weight_unit?: 'kg' | 'g' | 'lbs'
          height_unit?: 'cm' | 'ft_in'
          category?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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