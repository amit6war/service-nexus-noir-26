
// Data validation using Zod schemas for production-grade type safety
import { z } from 'zod';

export const AddressSchema = z.object({
  address_line_1: z.string().min(1, 'Address line 1 is required'),
  address_line_2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(5, 'Valid postal code is required'),
  country: z.string().min(1, 'Country is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

export const CartItemSchema = z.object({
  service_id: z.string().uuid('Invalid service ID'),
  provider_id: z.string().uuid('Invalid provider ID'),
  service_title: z.string().min(1, 'Service title is required'),
  provider_name: z.string().min(1, 'Provider name is required'),
  price: z.number().positive('Price must be positive'),
  duration_minutes: z.number().positive('Duration must be positive'),
  scheduled_date: z.string().datetime('Invalid scheduled date'),
  special_instructions: z.string().optional()
});

export const BookingSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  provider_user_id: z.string().uuid('Invalid provider ID'),
  service_id: z.string().uuid('Invalid service ID'),
  service_date: z.string().datetime('Invalid service date'),
  duration_minutes: z.number().positive('Duration must be positive'),
  final_price: z.number().positive('Price must be positive'),
  platform_fee: z.number().min(0, 'Platform fee must be non-negative'),
  provider_earnings: z.number().positive('Provider earnings must be positive'),
  special_instructions: z.string().optional(),
  service_address: z.string().min(1, 'Service address is required'),
  service_city: z.string().min(1, 'Service city is required'),
  service_state: z.string().min(1, 'Service state is required'),
  service_zip: z.string().min(5, 'Valid ZIP code is required'),
  booking_number: z.string().min(1, 'Booking number is required')
});

export const CheckoutDataSchema = z.object({
  items: z.array(CartItemSchema).min(1, 'At least one item is required'),
  address: AddressSchema
});

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errorMessage = result.error.errors
      .map(err => `${err.path.join('.')}: ${err.message}`)
      .join(', ');
    throw new Error(`Validation failed: ${errorMessage}`);
  }
  
  return result.data;
}
