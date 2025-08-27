import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, User, Phone, Star, AlertCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import BookingStatusBadge from './BookingStatusBadge';
import RescheduleModal from './RescheduleModal';
import type { Database } from '@/integrations/supabase/types';

type BookingStatus = Database['public']['Enums']['booking_status'];

interface Booking {
  id: string;
  booking_number: string;
  status: BookingStatus;
  service_date: string;
  final_price: number;
  special_instructions?: string;
  created_at: string;
  services: {
    title: string;
    duration_minutes: number;
  } | null;
  provider_profiles: {
    business_name: string;
    business_phone?: string;
    rating?: number;
    total_reviews?: number;
  } | null;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  // Set up real-time subscription for booking updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `customer_id=eq.${user.id}`
        },
        () => {
          console.log('Booking change detected, refreshing...');
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          status,
          service_date,
          final_price,
          special_instructions,
          created_at,
          services (
            title,
            duration_minutes
          ),
          provider_profiles (
            business_name,
            business_phone,
            rating,
            total_reviews
          )
        `)
        .eq('customer_id', user.id)
        .order('service_date', { ascending: false });

      if (error) {
        throw error;
      }

      setBookings(data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'cancelled' as BookingStatus,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Customer cancellation'
        })
        .eq('id', bookingId);

      if (error) throw error;

      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully.',
      });

      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const canReschedule = (status: BookingStatus, serviceDate: string) => {
    const bookingDate = new Date(serviceDate);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return ['confirmed', 'accepted'].includes(status) && hoursUntilBooking > 24;
  };

  const canCancel = (status: BookingStatus, serviceDate: string) => {
    const bookingDate = new Date(serviceDate);
    const now = new Date();
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return ['confirmed', 'accepted'].includes(status) && hoursUntilBooking > 2;
  };

  const filterBookings = (filterType: string) => {
    const now = new Date();
    
    switch (filterType) {
      case 'upcoming':
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.service_date);
          return bookingDate > now && !['cancelled', 'completed'].includes(booking.status);
        });
      case 'past':
        return bookings.filter(booking => {
          const bookingDate = new Date(booking.service_date);
          return bookingDate < now || ['completed', 'cancelled'].includes(booking.status);
        });
      case 'cancelled':
        return bookings.filter(booking => booking.status === 'cancelled');
      default:
        return bookings;
    }
  };

  const renderBookingCard = (booking: Booking) => (
    <motion.div
      key={booking.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                {booking.services?.title || 'Service'}
                <BookingStatusBadge status={booking.status} />
              </CardTitle>
              <CardDescription className="mt-1">
                Booking #{booking.booking_number}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-teal">
                ${booking.final_price?.toFixed(2)}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{format(new Date(booking.service_date), 'MMM dd, yyyy')}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{format(new Date(booking.service_date), 'h:mm a')}</span>
                  <span className="text-muted-foreground">
                    ({booking.services?.duration_minutes} min)
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{booking.provider_profiles?.business_name || 'Provider'}</span>
                </div>
                
                {booking.provider_profiles?.rating && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{booking.provider_profiles.rating}</span>
                    <span className="text-muted-foreground">
                      ({booking.provider_profiles.total_reviews || 0}+ reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {booking.special_instructions && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-1">Special Instructions:</p>
                <p className="text-sm text-muted-foreground">{booking.special_instructions}</p>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              {canReschedule(booking.status, booking.service_date) && (
                <RescheduleModal
                  bookingId={booking.id}
                  currentDate={booking.service_date}
                  currentTime={format(new Date(booking.service_date), 'HH:mm')}
                  onRescheduleSuccess={loadBookings}
                >
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                </RescheduleModal>
              )}
              
              {canCancel(booking.status, booking.service_date) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelBooking(booking.id)}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
              
              {booking.provider_profiles?.business_phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`tel:${booking.provider_profiles?.business_phone}`, '_self')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Provider
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
        <p className="text-muted-foreground">Track and manage your service bookings</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Bookings</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground">Your bookings will appear here once you book a service.</p>
            </div>
          ) : (
            bookings.map(renderBookingCard)
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {filterBookings('upcoming').length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No upcoming bookings</h3>
              <p className="text-muted-foreground">Book a service to see your upcoming appointments here.</p>
            </div>
          ) : (
            filterBookings('upcoming').map(renderBookingCard)
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {filterBookings('past').length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No past bookings</h3>
              <p className="text-muted-foreground">Your completed bookings will appear here.</p>
            </div>
          ) : (
            filterBookings('past').map(renderBookingCard)
          )}
        </TabsContent>
        
        <TabsContent value="cancelled" className="space-y-4">
          {filterBookings('cancelled').length === 0 ? (
            <div className="text-center py-12">
              <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No cancelled bookings</h3>
              <p className="text-muted-foreground">Cancelled bookings will appear here.</p>
            </div>
          ) : (
            filterBookings('cancelled').map(renderBookingCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyBookings;
