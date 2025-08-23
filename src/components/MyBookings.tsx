import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Download, Star, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
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
  // Mock service and provider data - in real app these would be joined
  service_title: string;
  provider_name: string;
  provider_rating: number;
}

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Load bookings data
  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return;

      try {
        // In a real app, this would join with services and provider_profiles tables
        // For now, we'll create mock data to demonstrate the functionality
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', user.id)
          .order('service_date', { ascending: false });

        if (error) {
          console.error('Error loading bookings:', error);
          // Create mock bookings for demo
          createMockBookings();
          return;
        }

        if (data && data.length > 0) {
          // Transform real data with mock service/provider info
          const transformedBookings = data.map(booking => ({
            ...booking,
            service_title: 'Home Cleaning Service',
            provider_name: 'Elite Professional Services',
            provider_rating: 4.8
          }));
          setBookings(transformedBookings);
        } else {
          // Create mock bookings for demo
          createMockBookings();
        }
      } catch (error) {
        console.error('Error loading bookings:', error);
        createMockBookings();
      } finally {
        setLoading(false);
      }
    };

    const createMockBookings = () => {
      const mockBookings: Booking[] = [
        {
          id: '1',
          booking_number: 'BK-2024-001',
          service_date: '2024-01-15T10:00:00Z',
          status: 'completed',
          final_price: 120,
          duration_minutes: 120,
          service_address: '123 Main St, Anytown, AN 12345',
          special_instructions: 'Please focus on the kitchen and bathrooms',
          created_at: '2024-01-10T09:00:00Z',
          service_title: 'Home Cleaning Service',
          provider_name: 'Elite Professional Services',
          provider_rating: 4.9
        },
        {
          id: '2',
          booking_number: 'BK-2024-002',
          service_date: '2024-01-22T14:00:00Z',
          status: 'pending',
          final_price: 85,
          duration_minutes: 90,
          service_address: '123 Main St, Anytown, AN 12345',
          created_at: '2024-01-18T11:30:00Z',
          service_title: 'Plumbing Repair',
          provider_name: 'Quick Fix Professionals',
          provider_rating: 4.7
        },
        {
          id: '3',
          booking_number: 'BK-2024-003',
          service_date: '2024-01-08T16:00:00Z',
          status: 'cancelled',
          final_price: 200,
          duration_minutes: 180,
          service_address: '123 Main St, Anytown, AN 12345',
          cancellation_reason: 'Customer requested cancellation',
          created_at: '2024-01-05T14:20:00Z',
          service_title: 'Electrical Installation',
          provider_name: 'Expert Care Team',
          provider_rating: 4.6
        }
      ];
      setBookings(mockBookings);
    };

    loadBookings();
  }, [user?.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
                      <span>{booking.service_title}</span>
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
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{booking.provider_name}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-xs">{booking.provider_rating}</span>
                        </div>
                      </div>
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
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-border">
                    <div className="text-sm text-muted-foreground">
                      Service ID: {booking.id}
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