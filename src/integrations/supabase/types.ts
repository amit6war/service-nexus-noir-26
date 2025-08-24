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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      booking_status_history: {
        Row: {
          booking_id: string
          changed_at: string
          changed_by: string
          id: string
          new_status: Database["public"]["Enums"]["booking_status"]
          notes: string | null
          old_status: Database["public"]["Enums"]["booking_status"] | null
        }
        Insert: {
          booking_id: string
          changed_at?: string
          changed_by: string
          id?: string
          new_status: Database["public"]["Enums"]["booking_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["booking_status"] | null
        }
        Update: {
          booking_id?: string
          changed_at?: string
          changed_by?: string
          id?: string
          new_status?: Database["public"]["Enums"]["booking_status"]
          notes?: string | null
          old_status?: Database["public"]["Enums"]["booking_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          accepted_at: string | null
          booking_number: string
          cancellation_fee: number | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          completed_at: string | null
          confirmed_at: string | null
          coordinates: unknown | null
          created_at: string
          customer_id: string
          duration_minutes: number | null
          estimated_price: number | null
          final_price: number | null
          id: string
          is_emergency: boolean | null
          is_recurring: boolean | null
          platform_fee: number | null
          provider_earnings: number | null
          provider_user_id: string
          recurring_schedule: Json | null
          refund_amount: number | null
          refund_processed_at: string | null
          service_address: string
          service_city: string | null
          service_date: string
          service_id: string | null
          service_state: string | null
          service_zip: string | null
          special_instructions: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          booking_number: string
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          coordinates?: unknown | null
          created_at?: string
          customer_id: string
          duration_minutes?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          is_emergency?: boolean | null
          is_recurring?: boolean | null
          platform_fee?: number | null
          provider_earnings?: number | null
          provider_user_id: string
          recurring_schedule?: Json | null
          refund_amount?: number | null
          refund_processed_at?: string | null
          service_address: string
          service_city?: string | null
          service_date: string
          service_id?: string | null
          service_state?: string | null
          service_zip?: string | null
          special_instructions?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          booking_number?: string
          cancellation_fee?: number | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          coordinates?: unknown | null
          created_at?: string
          customer_id?: string
          duration_minutes?: number | null
          estimated_price?: number | null
          final_price?: number | null
          id?: string
          is_emergency?: boolean | null
          is_recurring?: boolean | null
          platform_fee?: number | null
          provider_earnings?: number | null
          provider_user_id?: string
          recurring_schedule?: Json | null
          refund_amount?: number | null
          refund_processed_at?: string | null
          service_address?: string
          service_city?: string | null
          service_date?: string
          service_id?: string | null
          service_state?: string | null
          service_zip?: string | null
          special_instructions?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_provider_user_id_fkey"
            columns: ["provider_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_id: string | null
          booking_id: string | null
          complainant_id: string | null
          created_at: string
          description: string
          evidence: string[] | null
          id: string
          resolution: string | null
          resolved_at: string | null
          respondent_id: string | null
          status: Database["public"]["Enums"]["dispute_status"]
          title: string
          type: Database["public"]["Enums"]["dispute_type"]
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          booking_id?: string | null
          complainant_id?: string | null
          created_at?: string
          description: string
          evidence?: string[] | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          respondent_id?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          title: string
          type: Database["public"]["Enums"]["dispute_type"]
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          booking_id?: string | null
          complainant_id?: string | null
          created_at?: string
          description?: string
          evidence?: string[] | null
          id?: string
          resolution?: string | null
          resolved_at?: string | null
          respondent_id?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
          title?: string
          type?: Database["public"]["Enums"]["dispute_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_complainant_id_fkey"
            columns: ["complainant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_respondent_id_fkey"
            columns: ["respondent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          provider_user_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          provider_user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          provider_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_provider_user_id_fkey"
            columns: ["provider_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          booking_id: string | null
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          is_system_message: boolean | null
          message_type: Database["public"]["Enums"]["message_type"]
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          attachments?: string[] | null
          booking_id?: string | null
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          is_system_message?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          attachments?: string[] | null
          booking_id?: string | null
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          is_system_message?: boolean | null
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string | null
          customer_id: string | null
          id: string
          payment_intent_id: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          platform_fee: number | null
          processed_at: string | null
          provider_earnings: number | null
          provider_user_id: string | null
          refund_amount: number | null
          refund_reason: string | null
          stripe_charge_id: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          platform_fee?: number | null
          processed_at?: string | null
          provider_earnings?: number | null
          provider_user_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          stripe_charge_id?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          platform_fee?: number | null
          processed_at?: string | null
          provider_earnings?: number | null
          provider_user_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          stripe_charge_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_provider_user_id_fkey"
            columns: ["provider_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          city: string | null
          country: string | null
          created_at: string
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          phone: string | null
          postal_code: string | null
          role: Database["public"]["Enums"]["app_role"]
          state: string | null
          updated_at: string
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          updated_at?: string
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          phone?: string | null
          postal_code?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      provider_profiles: {
        Row: {
          availability_schedule: Json | null
          business_address: string | null
          business_email: string | null
          business_hours: Json | null
          business_name: string | null
          business_phone: string | null
          business_type: string | null
          business_website: string | null
          certifications: string[] | null
          completion_rate: number | null
          created_at: string
          description: string | null
          emergency_services: boolean | null
          hourly_rate: number | null
          id: string
          insurance_number: string | null
          portfolio_images: string[] | null
          rating: number | null
          service_areas: string[] | null
          suspended_at: string | null
          suspension_reason: string | null
          tax_number: string | null
          total_jobs: number | null
          total_reviews: number | null
          updated_at: string
          user_id: string
          verification_status: Database["public"]["Enums"]["verification_status"]
          verified_at: string | null
          years_experience: number | null
        }
        Insert: {
          availability_schedule?: Json | null
          business_address?: string | null
          business_email?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          business_type?: string | null
          business_website?: string | null
          certifications?: string[] | null
          completion_rate?: number | null
          created_at?: string
          description?: string | null
          emergency_services?: boolean | null
          hourly_rate?: number | null
          id: string
          insurance_number?: string | null
          portfolio_images?: string[] | null
          rating?: number | null
          service_areas?: string[] | null
          suspended_at?: string | null
          suspension_reason?: string | null
          tax_number?: string | null
          total_jobs?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          years_experience?: number | null
        }
        Update: {
          availability_schedule?: Json | null
          business_address?: string | null
          business_email?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          business_type?: string | null
          business_website?: string | null
          certifications?: string[] | null
          completion_rate?: number | null
          created_at?: string
          description?: string | null
          emergency_services?: boolean | null
          hourly_rate?: number | null
          id?: string
          insurance_number?: string | null
          portfolio_images?: string[] | null
          rating?: number | null
          service_areas?: string[] | null
          suspended_at?: string | null
          suspension_reason?: string | null
          tax_number?: string | null
          total_jobs?: number | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
          verified_at?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_verified: boolean | null
          provider_user_id: string
          rating: number
          reviewer_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          provider_user_id: string
          rating: number
          reviewer_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_verified?: boolean | null
          provider_user_id?: string
          rating?: number
          reviewer_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_provider_user_id_fkey"
            columns: ["provider_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          base_price: number | null
          category: string
          category_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          emergency_available: boolean | null
          excludes: string[] | null
          id: string
          images: string[] | null
          includes: string[] | null
          is_active: boolean
          is_featured: boolean | null
          price_type: string
          provider_id: string
          requirements: string[] | null
          service_areas: string[] | null
          subcategory: string | null
          title: string
          updated_at: string
        }
        Insert: {
          base_price?: number | null
          category: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          emergency_available?: boolean | null
          excludes?: string[] | null
          id?: string
          images?: string[] | null
          includes?: string[] | null
          is_active?: boolean
          is_featured?: boolean | null
          price_type?: string
          provider_id: string
          requirements?: string[] | null
          service_areas?: string[] | null
          subcategory?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          base_price?: number | null
          category?: string
          category_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          emergency_available?: boolean | null
          excludes?: string[] | null
          id?: string
          images?: string[] | null
          includes?: string[] | null
          is_active?: boolean
          is_featured?: boolean | null
          price_type?: string
          provider_id?: string
          requirements?: string[] | null
          service_areas?: string[] | null
          subcategory?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verification_documents: {
        Row: {
          admin_notes: string | null
          created_at: string
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          provider_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          updated_at: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          document_type: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          provider_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          document_type?: Database["public"]["Enums"]["document_type"]
          expires_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          provider_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          updated_at?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      verification_notes: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          is_internal: boolean | null
          note: string
          provider_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          note: string
          provider_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          note?: string
          provider_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_cancellation_fee: {
        Args: { booking_amount: number; booking_date: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      update_booking_status: {
        Args: {
          booking_uuid: string
          new_status: Database["public"]["Enums"]["booking_status"]
          status_notes?: string
          user_uuid: string
        }
        Returns: boolean
      }
      validate_provider_exists: {
        Args: { provider_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "customer"
        | "pending_provider"
        | "verified_provider"
        | "suspended_provider"
        | "premium_provider"
        | "admin"
      booking_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "disputed"
        | "confirmed"
      dispute_status: "open" | "investigating" | "resolved" | "closed"
      dispute_type:
        | "service_quality"
        | "payment"
        | "cancellation"
        | "no_show"
        | "other"
      document_type:
        | "business_license"
        | "insurance_certificate"
        | "professional_certification"
        | "id_proof"
        | "background_check"
        | "other"
      message_type: "text" | "image" | "file" | "location" | "system"
      notification_type:
        | "booking_request"
        | "booking_accepted"
        | "booking_cancelled"
        | "booking_completed"
        | "payment_received"
        | "payment_failed"
        | "review_received"
        | "message_received"
        | "verification_approved"
        | "verification_rejected"
        | "system_announcement"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
        | "disputed"
      verification_status:
        | "pending"
        | "under_review"
        | "approved"
        | "rejected"
        | "expired"
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
      app_role: [
        "customer",
        "pending_provider",
        "verified_provider",
        "suspended_provider",
        "premium_provider",
        "admin",
      ],
      booking_status: [
        "pending",
        "accepted",
        "in_progress",
        "completed",
        "cancelled",
        "disputed",
        "confirmed",
      ],
      dispute_status: ["open", "investigating", "resolved", "closed"],
      dispute_type: [
        "service_quality",
        "payment",
        "cancellation",
        "no_show",
        "other",
      ],
      document_type: [
        "business_license",
        "insurance_certificate",
        "professional_certification",
        "id_proof",
        "background_check",
        "other",
      ],
      message_type: ["text", "image", "file", "location", "system"],
      notification_type: [
        "booking_request",
        "booking_accepted",
        "booking_cancelled",
        "booking_completed",
        "payment_received",
        "payment_failed",
        "review_received",
        "message_received",
        "verification_approved",
        "verification_rejected",
        "system_announcement",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "disputed",
      ],
      verification_status: [
        "pending",
        "under_review",
        "approved",
        "rejected",
        "expired",
      ],
    },
  },
} as const
