export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audio_poems: {
        Row: {
          audio_url: string
          content_type: Database["public"]["Enums"]["content_type"] | null
          created_at: string | null
          description: string | null
          duration: number | null
          id: string
          impression_count: number | null
          is_admin_content: boolean | null
          rental_price: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audio_url: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          impression_count?: number | null
          is_admin_content?: boolean | null
          rental_price?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audio_url?: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          id?: string
          impression_count?: number | null
          is_admin_content?: boolean | null
          rental_price?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_poems_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_responses: {
        Row: {
          challenge_id: string | null
          content: string
          created_at: string | null
          id: string
          judge_feedback: string | null
          payment_screenshot_url: string | null
          points: number | null
          submission_status:
            | Database["public"]["Enums"]["challenge_submission_status"]
            | null
          submission_type: string | null
          submission_url: string | null
          user_id: string | null
        }
        Insert: {
          challenge_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          judge_feedback?: string | null
          payment_screenshot_url?: string | null
          points?: number | null
          submission_status?:
            | Database["public"]["Enums"]["challenge_submission_status"]
            | null
          submission_type?: string | null
          submission_url?: string | null
          user_id?: string | null
        }
        Update: {
          challenge_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          judge_feedback?: string | null
          payment_screenshot_url?: string | null
          points?: number | null
          submission_status?:
            | Database["public"]["Enums"]["challenge_submission_status"]
            | null
          submission_type?: string | null
          submission_url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_responses_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_votes: {
        Row: {
          challenge_response_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          challenge_response_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          challenge_response_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_votes_challenge_response_id_fkey"
            columns: ["challenge_response_id"]
            isOneToOne: false
            referencedRelation: "challenge_responses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          created_at: string | null
          creator_id: string | null
          deadline: string | null
          description: string | null
          entry_fee: number | null
          id: string
          is_paid: boolean | null
          judging_criteria: string | null
          max_participants: number | null
          meeting_link: string | null
          payment_qr_code_url: string | null
          rewards: string | null
          status: Database["public"]["Enums"]["challenge_status"] | null
          style: string | null
          submission_type: string | null
          theme: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          deadline?: string | null
          description?: string | null
          entry_fee?: number | null
          id?: string
          is_paid?: boolean | null
          judging_criteria?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          payment_qr_code_url?: string | null
          rewards?: string | null
          status?: Database["public"]["Enums"]["challenge_status"] | null
          style?: string | null
          submission_type?: string | null
          theme?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          deadline?: string | null
          description?: string | null
          entry_fee?: number | null
          id?: string
          is_paid?: boolean | null
          judging_criteria?: string | null
          max_participants?: number | null
          meeting_link?: string | null
          payment_qr_code_url?: string | null
          rewards?: string | null
          status?: Database["public"]["Enums"]["challenge_status"] | null
          style?: string | null
          submission_type?: string | null
          theme?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          comment_text: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_entries: {
        Row: {
          competition_id: string | null
          content: string
          created_at: string | null
          id: string
          user_id: string | null
          votes_count: number | null
        }
        Insert: {
          competition_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          user_id?: string | null
          votes_count?: number | null
        }
        Update: {
          competition_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          user_id?: string | null
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_entries_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_votes: {
        Row: {
          competition_entry_id: string | null
          created_at: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          competition_entry_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          competition_entry_id?: string | null
          created_at?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_votes_competition_entry_id_fkey"
            columns: ["competition_entry_id"]
            isOneToOne: false
            referencedRelation: "competition_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competition_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          prize_description: string | null
          start_date: string
          status: Database["public"]["Enums"]["competition_status"] | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          prize_description?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["competition_status"] | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          prize_description?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["competition_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "competitions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      followers: {
        Row: {
          created_at: string
          followed_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followed_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followed_id?: string
          follower_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "followers_followed_id_fkey"
            columns: ["followed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "followers_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          content_id: string
          content_type: string
          created_at: string | null
          id: string
          owner_id: string | null
          price: number | null
          purpose: string
          requester_id: string | null
          status: Database["public"]["Enums"]["license_status"] | null
          updated_at: string | null
        }
        Insert: {
          content_id: string
          content_type: string
          created_at?: string | null
          id?: string
          owner_id?: string | null
          price?: number | null
          purpose: string
          requester_id?: string | null
          status?: Database["public"]["Enums"]["license_status"] | null
          updated_at?: string | null
        }
        Update: {
          content_id?: string
          content_type?: string
          created_at?: string | null
          id?: string
          owner_id?: string | null
          price?: number | null
          purpose?: string
          requester_id?: string | null
          status?: Database["public"]["Enums"]["license_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "licenses_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      poetry_books: {
        Row: {
          content: string
          content_type: Database["public"]["Enums"]["content_type"] | null
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          genre: string | null
          id: string
          is_admin_content: boolean | null
          is_public: boolean | null
          payment_status: string | null
          pdf_url: string | null
          price: number | null
          publication_date: string | null
          rental_count: number | null
          rental_price: number | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_admin_content?: boolean | null
          is_public?: boolean | null
          payment_status?: string | null
          pdf_url?: string | null
          price?: number | null
          publication_date?: string | null
          rental_count?: number | null
          rental_price?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          content_type?: Database["public"]["Enums"]["content_type"] | null
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          genre?: string | null
          id?: string
          is_admin_content?: boolean | null
          is_public?: boolean | null
          payment_status?: string | null
          pdf_url?: string | null
          price?: number | null
          publication_date?: string | null
          rental_count?: number | null
          rental_price?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "poetry_books_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          content_text: string | null
          content_type: string
          created_at: string
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          content_text?: string | null
          content_type: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          content_text?: string | null
          content_type?: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string | null
          id: string
          profile_pic_url: string | null
          username: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          profile_pic_url?: string | null
          username: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          profile_pic_url?: string | null
          username?: string
        }
        Relationships: []
      }
      shared_posts: {
        Row: {
          id: string
          original_post_id: string
          share_caption: string | null
          shared_at: string
          shared_by_user_id: string
        }
        Insert: {
          id?: string
          original_post_id: string
          share_caption?: string | null
          shared_at?: string
          shared_by_user_id: string
        }
        Update: {
          id?: string
          original_post_id?: string
          share_caption?: string | null
          shared_at?: string
          shared_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shared_posts_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_posts_shared_by_user_id_fkey"
            columns: ["shared_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      temporary_posts: {
        Row: {
          caption: string | null
          content_text: string | null
          content_type: string
          created_at: string
          expires_at: string
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          caption?: string | null
          content_text?: string | null
          content_type: string
          created_at?: string
          expires_at: string
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          caption?: string | null
          content_text?: string | null
          content_type?: string
          created_at?: string
          expires_at?: string
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "temporary_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workshop_registrations: {
        Row: {
          created_at: string | null
          id: string
          payment_screenshot_url: string | null
          payment_status: string | null
          status: string | null
          user_id: string | null
          workshop_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          payment_screenshot_url?: string | null
          payment_status?: string | null
          status?: string | null
          user_id?: string | null
          workshop_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          payment_screenshot_url?: string | null
          payment_status?: string | null
          status?: string | null
          user_id?: string | null
          workshop_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshop_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workshop_registrations_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number | null
          host_id: string | null
          id: string
          is_paid: boolean | null
          max_participants: number | null
          meeting_link: string | null
          payment_qr_code_url: string | null
          price: number | null
          recording_url: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["workshop_status"] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          host_id?: string | null
          id?: string
          is_paid?: boolean | null
          max_participants?: number | null
          meeting_link?: string | null
          payment_qr_code_url?: string | null
          price?: number | null
          recording_url?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["workshop_status"] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number | null
          host_id?: string | null
          id?: string
          is_paid?: boolean | null
          max_participants?: number | null
          meeting_link?: string | null
          payment_qr_code_url?: string | null
          price?: number | null
          recording_url?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["workshop_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "workshops_host_id_fkey"
            columns: ["host_id"]
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
      cleanup_expired_content: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_expired_temporary_posts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_auth_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      challenge_status: "active" | "completed"
      challenge_submission_status: "pending" | "approved" | "rejected"
      competition_status: "draft" | "active" | "voting" | "completed"
      content_type: "free" | "paid" | "rental"
      license_status: "pending" | "approved" | "rejected"
      workshop_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "pending"
        | "approved"
        | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      challenge_status: ["active", "completed"],
      challenge_submission_status: ["pending", "approved", "rejected"],
      competition_status: ["draft", "active", "voting", "completed"],
      content_type: ["free", "paid", "rental"],
      license_status: ["pending", "approved", "rejected"],
      workshop_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "pending",
        "approved",
        "rejected",
      ],
    },
  },
} as const
