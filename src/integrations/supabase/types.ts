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
      appointment_requests: {
        Row: {
          admin_notes: string | null
          appointment_date: string
          appointment_time: string
          created_at: string
          email: string
          id: string
          is_read: boolean
          name: string
          notes: string | null
          pastor_id: string
          pastor_name: string | null
          phone: string | null
          reason: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          appointment_date: string
          appointment_time: string
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          name: string
          notes?: string | null
          pastor_id: string
          pastor_name?: string | null
          phone?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          name?: string
          notes?: string | null
          pastor_id?: string
          pastor_name?: string | null
          phone?: string | null
          reason?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointment_requests_pastor_id_fkey"
            columns: ["pastor_id"]
            isOneToOne: false
            referencedRelation: "pastors"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          is_read: boolean
          last_name: string
          message: string
          status: Database["public"]["Enums"]["submission_status"]
          subject: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_read?: boolean
          last_name: string
          message: string
          status?: Database["public"]["Enums"]["submission_status"]
          subject?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_read?: boolean
          last_name?: string
          message?: string
          status?: Database["public"]["Enums"]["submission_status"]
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          end_at: string | null
          id: string
          image_url: string | null
          is_featured: boolean
          is_published: boolean
          registration_url: string | null
          sort_order: number
          start_at: string
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          registration_url?: string | null
          sort_order?: number
          start_at: string
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_at?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean
          is_published?: boolean
          registration_url?: string | null
          sort_order?: number
          start_at?: string
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          album_id: string
          alt_text: string | null
          caption: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          album_id: string
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          album_id?: string
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      giving_content: {
        Row: {
          created_at: string
          cta_href: string | null
          cta_label: string | null
          external_link: string | null
          id: string
          image_url: string | null
          instructions: string | null
          intro_text: string | null
          payment_details: string | null
          singleton_key: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          intro_text?: string | null
          payment_details?: string | null
          singleton_key?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          intro_text?: string | null
          payment_details?: string | null
          singleton_key?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          mime_type: string | null
          public_url: string
          size_bytes: number | null
          storage_path: string
          title: string | null
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          mime_type?: string | null
          public_url: string
          size_bytes?: number | null
          storage_path: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          mime_type?: string | null
          public_url?: string
          size_bytes?: number | null
          storage_path?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ministries: {
        Row: {
          created_at: string
          full_description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          leader: string | null
          link_url: string | null
          meeting_info: string | null
          name: string
          short_description: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          leader?: string | null
          link_url?: string | null
          meeting_info?: string | null
          name: string
          short_description?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          leader?: string | null
          link_url?: string | null
          meeting_info?: string | null
          name?: string
          short_description?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          body: string | null
          created_at: string
          cta_href: string | null
          cta_label: string | null
          headline: string | null
          id: string
          image_url: string | null
          is_visible: boolean
          page_slug: string
          page_title: string | null
          section_key: string
          seo_description: string | null
          seo_title: string | null
          sort_order: number
          subheading: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          page_slug: string
          page_title?: string | null
          section_key: string
          seo_description?: string | null
          seo_title?: string | null
          sort_order?: number
          subheading?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          cta_href?: string | null
          cta_label?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_visible?: boolean
          page_slug?: string
          page_title?: string | null
          section_key?: string
          seo_description?: string | null
          seo_title?: string | null
          sort_order?: number
          subheading?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pastors: {
        Row: {
          bio: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          photo_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          photo_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      prayer_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_anonymous: boolean
          is_read: boolean
          is_urgent: boolean
          phone: string | null
          request: string
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_read?: boolean
          is_urgent?: boolean
          phone?: string | null
          request: string
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_read?: boolean
          is_urgent?: boolean
          phone?: string | null
          request?: string
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          address: string | null
          church_name: string
          copyright_text: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          footer_text: string | null
          id: string
          instagram_url: string | null
          map_url: string | null
          phone: string | null
          service_times: string | null
          short_description: string | null
          singleton_key: boolean
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          address?: string | null
          church_name?: string
          copyright_text?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          footer_text?: string | null
          id?: string
          instagram_url?: string | null
          map_url?: string | null
          phone?: string | null
          service_times?: string | null
          short_description?: string | null
          singleton_key?: boolean
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          address?: string | null
          church_name?: string
          copyright_text?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          footer_text?: string | null
          id?: string
          instagram_url?: string | null
          map_url?: string | null
          phone?: string | null
          service_times?: string | null
          short_description?: string | null
          singleton_key?: boolean
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      testimony_submissions: {
        Row: {
          admin_notes: string | null
          allow_publish: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          is_published: boolean
          is_read: boolean
          review_status: Database["public"]["Enums"]["review_status"]
          testimony: string
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          allow_publish?: boolean
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_published?: boolean
          is_read?: boolean
          review_status?: Database["public"]["Enums"]["review_status"]
          testimony: string
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          allow_publish?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_published?: boolean
          is_read?: boolean
          review_status?: Database["public"]["Enums"]["review_status"]
          testimony?: string
          title?: string
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
      visit_plans: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_read: boolean
          notes: string | null
          number_of_adults: number
          number_of_children: number
          phone: string | null
          service: string | null
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
          visit_date: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_read?: boolean
          notes?: string | null
          number_of_adults?: number
          number_of_children?: number
          phone?: string | null
          service?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          visit_date?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_read?: boolean
          notes?: string | null
          number_of_adults?: number
          number_of_children?: number
          phone?: string | null
          service?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          visit_date?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      published_testimonies: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string | null
          testimony: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          testimony?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          testimony?: string | null
          title?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "super_admin" | "admin" | "editor"
      appointment_status:
        | "pending"
        | "confirmed"
        | "declined"
        | "completed"
        | "cancelled"
        | "archived"
      review_status: "pending" | "approved" | "rejected" | "archived"
      submission_status: "new" | "in_progress" | "resolved" | "archived"
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
      app_role: ["super_admin", "admin", "editor"],
      appointment_status: [
        "pending",
        "confirmed",
        "declined",
        "completed",
        "cancelled",
        "archived",
      ],
      review_status: ["pending", "approved", "rejected", "archived"],
      submission_status: ["new", "in_progress", "resolved", "archived"],
    },
  },
} as const
