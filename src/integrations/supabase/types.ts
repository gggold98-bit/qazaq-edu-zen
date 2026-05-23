export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      asked_questions: {
        Row: {
          created_at: string
          grade: number
          id: string
          question: string
          subject: string
          topic: string | null
          user_id: string
          was_correct: boolean | null
        }
        Insert: {
          created_at?: string
          grade: number
          id?: string
          question: string
          subject: string
          topic?: string | null
          user_id: string
          was_correct?: boolean | null
        }
        Update: {
          created_at?: string
          grade?: number
          id?: string
          question?: string
          subject?: string
          topic?: string | null
          user_id?: string
          was_correct?: boolean | null
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          added_by: string | null
          category: string | null
          content: string
          created_at: string
          doc_number: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          category?: string | null
          content: string
          created_at?: string
          doc_number?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          category?: string | null
          content?: string
          created_at?: string
          doc_number?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          certificates: number
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          points: number
          unlocked_items: string[]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          certificates?: number
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          points?: number
          unlocked_items?: string[]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          certificates?: number
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          points?: number
          unlocked_items?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      qq_questions: {
        Row: {
          correct_index: number
          created_at: string
          id: string
          idx: number
          image_url: string | null
          options: Json
          points: number
          qtype: string
          quiz_id: string
          text: string
          time_limit_sec: number
        }
        Insert: {
          correct_index?: number
          created_at?: string
          id?: string
          idx?: number
          image_url?: string | null
          options?: Json
          points?: number
          qtype?: string
          quiz_id: string
          text: string
          time_limit_sec?: number
        }
        Update: {
          correct_index?: number
          created_at?: string
          id?: string
          idx?: number
          image_url?: string | null
          options?: Json
          points?: number
          qtype?: string
          quiz_id?: string
          text?: string
          time_limit_sec?: number
        }
        Relationships: [
          {
            foreignKeyName: "qq_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "qq_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      qq_quizzes: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          lang: string
          owner_id: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lang?: string
          owner_id: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lang?: string
          owner_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      qq_sessions: {
        Row: {
          created_at: string
          current_index: number
          host_id: string
          id: string
          pin: string
          quiz_id: string
          status: string
          summary: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_index?: number
          host_id: string
          id?: string
          pin: string
          quiz_id: string
          status?: string
          summary?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_index?: number
          host_id?: string
          id?: string
          pin?: string
          quiz_id?: string
          status?: string
          summary?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "qq_sessions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "qq_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      test_attempts: {
        Row: {
          created_at: string
          grade: number
          id: string
          percent: number
          score: number
          subject: string
          total: number
          user_id: string
          weak_topics: Json
        }
        Insert: {
          created_at?: string
          grade: number
          id?: string
          percent: number
          score: number
          subject: string
          total: number
          user_id: string
          weak_topics?: Json
        }
        Update: {
          created_at?: string
          grade?: number
          id?: string
          percent?: number
          score?: number
          subject?: string
          total?: number
          user_id?: string
          weak_topics?: Json
        }
        Relationships: []
      }
      textbook_content: {
        Row: {
          content: string
          created_at: string
          grade: number
          id: string
          subject: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          grade: number
          id?: string
          subject: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          grade?: number
          id?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
