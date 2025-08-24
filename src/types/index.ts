
// Comprehensive TypeScript interfaces for production-grade type safety
export interface Address {
  id?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface ServiceProvider {
  id: string;
  user_id: string;
  business_name: string;
  rating: number;
  total_reviews: number;
  verification_status: 'pending' | 'approved' | 'rejected';
  description?: string;
  years_experience?: number;
  portfolio_images?: string[];
  business_hours?: Record<string, any>;
  availability_schedule?: Record<string, any>;
  hourly_rate?: number;
  emergency_services: boolean;
  service_areas?: string[];
}

export interface Service {
  id: string;
  provider_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  base_price: number;
  duration_minutes: number;
  price_type: 'fixed' | 'hourly' | 'custom';
  images?: string[];
  is_active: boolean;
  is_featured: boolean;
  emergency_available: boolean;
  provider_profile?: ServiceProvider;
}

export interface CartItem {
  id: string;
  service_id: string;
  provider_id: string;
  service_title: string;
  provider_name: string;
  price: number;
  duration_minutes: number;
  scheduled_date: string;
  special_instructions?: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  provider_user_id: string;
  service_id: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed' | 'confirmed';
  service_date: string;
  duration_minutes: number;
  final_price: number;
  platform_fee: number;
  provider_earnings: number;
  special_instructions?: string;
  service_address: string;
  service_city: string;
  service_state: string;
  service_zip: string;
  booking_number: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  confirmed_at?: string;
  cancelled_at?: string;
  cancellation_fee?: number;
  refund_amount?: number;
}

export interface Payment {
  id: string;
  customer_id: string;
  booking_id?: string;
  amount: number;
  currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  stripe_charge_id?: string;
  payment_method?: string;
  processed_at?: string;
  payment_intent_id?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  per_page: number;
  total_pages: number;
}
