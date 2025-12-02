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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      being_reflections: {
        Row: {
          content: string
          created_at: string
          id: string
          reflection_type: string
          related_clusters: string[] | null
          related_nodes: string[] | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          reflection_type: string
          related_clusters?: string[] | null
          related_nodes?: string[] | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          reflection_type?: string
          related_clusters?: string[] | null
          related_nodes?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_messages: {
        Row: {
          being_state_at_message: Json | null
          content: string
          created_at: string
          id: string
          recalled_memories: string[] | null
          role: string
          user_id: string
        }
        Insert: {
          being_state_at_message?: Json | null
          content: string
          created_at?: string
          id?: string
          recalled_memories?: string[] | null
          role: string
          user_id: string
        }
        Update: {
          being_state_at_message?: Json | null
          content?: string
          created_at?: string
          id?: string
          recalled_memories?: string[] | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      journals: {
        Row: {
          created_at: string | null
          id: string
          last_mood_color: string | null
          name: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_mood_color?: string | null
          name: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_mood_color?: string | null
          name?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_cluster_nodes: {
        Row: {
          added_at: string
          cluster_id: string
          id: string
          node_id: string
          relevance_score: number | null
          removed_at: string | null
        }
        Insert: {
          added_at?: string
          cluster_id: string
          id?: string
          node_id: string
          relevance_score?: number | null
          removed_at?: string | null
        }
        Update: {
          added_at?: string
          cluster_id?: string
          id?: string
          node_id?: string
          relevance_score?: number | null
          removed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_cluster_nodes_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "memory_clusters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_cluster_nodes_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "memory_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_clusters: {
        Row: {
          centroid_embedding: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          last_reorganized_at: string | null
          name: string
          user_id: string
        }
        Insert: {
          centroid_embedding?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_reorganized_at?: string | null
          name: string
          user_id: string
        }
        Update: {
          centroid_embedding?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_reorganized_at?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      memory_edges: {
        Row: {
          being_reasoning: string | null
          created_at: string
          edge_type: string
          id: string
          source_node_id: string
          strength: number | null
          target_node_id: string
          user_id: string
        }
        Insert: {
          being_reasoning?: string | null
          created_at?: string
          edge_type: string
          id?: string
          source_node_id: string
          strength?: number | null
          target_node_id: string
          user_id: string
        }
        Update: {
          being_reasoning?: string | null
          created_at?: string
          edge_type?: string
          id?: string
          source_node_id?: string
          strength?: number | null
          target_node_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "memory_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "memory_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_nodes: {
        Row: {
          being_stage_at_creation: Json | null
          created_at: string
          curiosity_triggers: string[] | null
          embedding: string | null
          emotional_tone: string | null
          id: string
          moment_id: string | null
          people_mentioned: string[] | null
          relevance_to_self: number | null
          topics: string[] | null
          unresolved_conflict: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          being_stage_at_creation?: Json | null
          created_at?: string
          curiosity_triggers?: string[] | null
          embedding?: string | null
          emotional_tone?: string | null
          id?: string
          moment_id?: string | null
          people_mentioned?: string[] | null
          relevance_to_self?: number | null
          topics?: string[] | null
          unresolved_conflict?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          being_stage_at_creation?: Json | null
          created_at?: string
          curiosity_triggers?: string[] | null
          embedding?: string | null
          emotional_tone?: string | null
          id?: string
          moment_id?: string | null
          people_mentioned?: string[] | null
          relevance_to_self?: number | null
          topics?: string[] | null
          unresolved_conflict?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_nodes_moment_id_fkey"
            columns: ["moment_id"]
            isOneToOne: false
            referencedRelation: "moments"
            referencedColumns: ["id"]
          },
        ]
      }
      moments: {
        Row: {
          ai_reflections: Json | null
          color: string | null
          emotion: string | null
          id: string
          sub_journal_id: string
          text: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          ai_reflections?: Json | null
          color?: string | null
          emotion?: string | null
          id?: string
          sub_journal_id: string
          text: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          ai_reflections?: Json | null
          color?: string | null
          emotion?: string | null
          id?: string
          sub_journal_id?: string
          text?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "moments_sub_journal_id_fkey"
            columns: ["sub_journal_id"]
            isOneToOne: false
            referencedRelation: "sub_journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "moments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      sub_journals: {
        Row: {
          created_at: string | null
          id: string
          journal_id: string
          name: string
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          journal_id: string
          name: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          journal_id?: string
          name?: string
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_journals_journal_id_fkey"
            columns: ["journal_id"]
            isOneToOne: false
            referencedRelation: "journals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sub_journals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_memories: {
        Args: {
          match_count?: number
          match_threshold?: number
          match_user_id: string
          query_embedding: string
        }
        Returns: {
          emotional_tone: string
          id: string
          moment_id: string
          people_mentioned: string[]
          relevance_to_self: number
          similarity: number
          topics: string[]
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
