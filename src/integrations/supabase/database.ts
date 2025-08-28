
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      bookings: {
        Row: {
          id: string;
          customer_id: string | null;
          provider_user_id: string | null;
          service_id: string | null;
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
          service_date: string;
          duration_minutes: number;
          final_price: number;
          platform_fee: number | null;
          provider_earnings: number;
          special_instructions: string | null;
          service_address: string;
          service_city: string;
          service_state: string;
          service_zip: string | null;
          booking_number: string;
          created_at: string | null;
          updated_at: string | null;
          completed_at: string | null;
          confirmed_at: string | null;
          cancelled_at: string | null;
          cancellation_fee: number | null;
          refund_amount: number | null;
          cancellation_reason: string | null;
        };
        Insert: {
          customer_id?: string | null;
          provider_user_id?: string | null;
          service_id?: string | null;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
          service_date: string;
          duration_minutes: number;
          final_price: number;
          platform_fee?: number | null;
          provider_earnings: number;
          special_instructions?: string | null;
          service_address: string;
          service_city: string;
          service_state: string;
          service_zip?: string | null;
          booking_number?: string;
          [key: string]: unknown;
        };
        Update: Partial<{
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
          confirmed_at: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          cancellation_fee: number | null;
          refund_amount: number | null;
          updated_at: string;
          cancellation_reason: string | null;
          [key: string]: unknown;
        }>;
      };
      payments: {
        Row: {
          id: string;
          customer_id: string | null;
          booking_id: string | null;
          amount: number;
          currency: string | null;
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
          stripe_charge_id: string | null;
          stripe_session_id: string | null;
          payment_method: string | null;
          processed_at: string | null;
          payment_intent_id: string | null;
          refund_amount: number | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { [key: string]: unknown };
        Update: { [key: string]: unknown };
      };
      services: {
        Row: {
          id: string;
          provider_id: string | null;
          title: string;
          description: string | null;
          base_price: number;
          duration_minutes: number;
          category_id: string | null;
          is_active: boolean | null;
        };
        Insert: { [key: string]: unknown };
        Update: { [key: string]: unknown };
      };
      provider_profiles: {
        Row: {
          id: string;
          user_id: string | null;
          business_name: string;
          business_address: string | null;
          business_phone: string | null;
          business_email: string | null;
          description: string | null;
          years_experience: number | null;
          verification_status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'expired';
          rating: number | null;
          total_reviews: number | null;
          emergency_passes: number | null;
          is_active: boolean | null;
          portfolio_images: string[] | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { [key: string]: unknown };
        Update: { [key: string]: unknown };
      };
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          avatar_url: string | null;
          role: 'customer' | 'provider' | 'admin' | 'superadmin';
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { [key: string]: unknown };
        Update: { [key: string]: unknown };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string | null;
          service_id: string | null;
          provider_id: string | null;
          service_name: string;
          provider_name: string;
          base_price: number;
          final_price: number;
          duration_minutes: number;
          slot_start_time: string | null;
          slot_end_time: string | null;
          service_description: string | null;
          location_address: string | null;
          notes: string | null;
          category: string | null;
          subcategory: string | null;
          provider_avatar_url: string | null;
          created_at: string | null;
        };
        Insert: { [key: string]: unknown };
        Update: { [key: string]: unknown };
      };
      service_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon_url: string | null;
          is_active: boolean | null;
          created_at: string | null;
        };
        Insert: { [key: string]: unknown };
        Update: { [key: string]: unknown };
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string | null;
          customer_id: string | null;
          provider_id: string | null;
          rating: number | null;
          comment: string | null;
          created_at: string | null;
        };
        Insert: { [key: string]: unknown };
        Update: { [key: string]: unknown };
      };
      verification_documents: {
        Row: {
          id: string;
          provider_id: string | null;
          document_type: 'business_license' | 'insurance_certificate' | 'id_proof' | 'professional_certification' | 'background_check' | 'other';
          file_name: string;
          file_path: string;
          file_size: number | null;
          mime_type: string | null;
          verification_status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'expired';
          admin_notes: string | null;
          created_at: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: { [key: string]: unknown };
        Update: { [key: string]: unknown };
      };
    };
    Views: {
      [key: string]: unknown;
    };
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>;
        Returns: 'customer' | 'provider' | 'admin' | 'superadmin';
      };
      [key: string]: unknown;
    };
    Enums: {
      booking_status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
      app_role: 'customer' | 'provider' | 'admin' | 'superadmin';
      verification_status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'expired';
      payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
      document_type: 'business_license' | 'insurance_certificate' | 'id_proof' | 'professional_certification' | 'background_check' | 'other';
    };
  };
}
