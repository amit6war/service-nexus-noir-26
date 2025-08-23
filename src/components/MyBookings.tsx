
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Download, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useBookingsActions } from '@/hooks/useBookingsActions';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Booking {
  id: string;
  booking_number: string;
  service_date: string;
  status: string;
  final_price: number;
  duration_minutes: number;
  service_address: string;
  special_instructions?: string;
  cancellation_reason?: string;
  created_at: string;
  provider_user_id: string;
}

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { markCompleted, confirmBooking, cancelBooking, loading: actionLoading } = useBookingsActions();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookings data from Supabase
  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', user.id)
          .order('service_date', { ascending: false });

        if (error) {
          console.error('Error loading bookings:', error);
          toast({
            title: 'Error',
            description: 'Failed to load bookings. Please try again.',
            variant: 'destructive'
          });
          return;
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

    loadBookings();

    // Set up real-time updates for bookings
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `customer_id=eq.${user?.id}`
        },
        () => {
          loadBookings(); // Reload bookings when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleConfirmBooking = async (bookingId: string) => {
    try {
      await confirmBooking(bookingId);
      // Reload bookings to show updated status
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user?.id)
        .order('service_date', { ascending: false });
      
      if (data) setBookings(data);
    } catch (error) {
      console.error('Error confirming booking:', error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    try {
      await cancelBooking(bookingId, reason || undefined);
      // Reload bookings to show updated status
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('customer_id', user?.id)
        .order('service_date', { ascending: false });
      
      if (data) setBookings(data);
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const handleDownloadInvoice = (booking: Booking) => {
    // Mock invoice download - in real app this would generate/download actual PDF
    toast({
      title: 'Invoice Download',
      description: `Invoice for booking ${booking.booking_number} would be downloaded here. This is a demo feature.`
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Loading your booking history...</p>
        </div>
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
        <p className="text-muted-foreground">View and manage your service booking history</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No bookings found. Browse services to get started!</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span>Service Booking</span>
                      {getStatusBadge(booking.status)}
                    </CardTitle>
                    <CardDescription>
                      Booking #{booking.booking_number} • Booked on {format(new Date(booking.created_at), 'PPP')}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-teal">${booking.final_price}</div>
                    <div className="text-sm text-muted-foreground">Total Price</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Service Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(booking.service_date), 'PPP p')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{booking.duration_minutes} minutes</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <div className="font-medium text-foreground">Service Address:</div>
                        <div className="text-muted-foreground">{booking.service_address}</div>
                      </div>
                      {booking.special_instructions && (
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Special Instructions:</div>
                          <div className="text-muted-foreground">{booking.special_instructions}</div>
                        </div>
                      )}
                      {booking.cancellation_reason && (
                        <div className="text-sm">
                          <div className="font-medium text-foreground">Cancellation Reason:</div>
                          <div className="text-muted-foreground text-red-600">{booking.cancellation_reason}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <div className="flex gap-2">
                      {booking.status === 'completed' && (
                        <Button
                          onClick={() => handleConfirmBooking(booking.id)}
                          disabled={actionLoading}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Service
                        </Button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'completed') && (
                        <Button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={actionLoading}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                    <Button
                      onClick={() => handleDownloadInvoice(booking)}
                      variant="outline"
                      size="sm"
                      className="hover:bg-teal/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoice
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default MyBookings;
