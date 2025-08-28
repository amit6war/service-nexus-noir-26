
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Calendar, Clock, User, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProductionCart } from '@/hooks/useProductionCart';
import { useBookingsActionsV3 } from '@/hooks/useBookingsActionsV3';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

const PaymentSuccessHandlerV2 = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, clearCart } = useProductionCart();
  const { createBookingsFromCart, isCreatingBookings } = useBookingsActionsV3();
  
  const [processingStatus, setProcessingStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [bookings, setBookings] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId || !user?.id || items.length === 0) {
        setProcessingStatus('error');
        setErrorMessage('Missing required data for processing payment');
        return;
      }

      try {
        console.log('🔄 Processing payment success with session:', sessionId);
        
        // Get user's address from profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('address_line_1, city, state, postal_code')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('❌ Error fetching user profile:', profileError);
          setProcessingStatus('error');
          setErrorMessage('Failed to fetch user address information');
          return;
        }

        if (!profile?.address_line_1 || !profile?.city || !profile?.state || !profile?.postal_code) {
          setProcessingStatus('error');
          setErrorMessage('Please complete your address information in profile settings');
          return;
        }

        const address = {
          address_line_1: profile.address_line_1,
          city: profile.city,
          state: profile.state,
          postal_code: profile.postal_code,
        };

        // Create bookings from cart items
        const createdBookings = await createBookingsFromCart({
          items,
          address,
          sessionId
        });

        setBookings(createdBookings);
        setProcessingStatus('success');
        
        // Clear the cart
        await clearCart();
        
        console.log('✅ Payment processing completed successfully');
        
      } catch (error) {
        console.error('❌ Error processing payment:', error);
        setProcessingStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
      }
    };

    processPayment();
  }, [sessionId, user?.id, items, createBookingsFromCart, clearCart]);

  const handleContinue = () => {
    navigate('/dashboard?tab=bookings');
  };

  if (processingStatus === 'processing' || isCreatingBookings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal/5 to-blue/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
              <p className="text-muted-foreground">
                Please wait while we process your payment and create your bookings...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (processingStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red/5 to-orange/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Processing Failed</h2>
              <p className="text-muted-foreground mb-6">
                {errorMessage}
              </p>
              <Button 
                onClick={() => navigate('/dashboard')} 
                variant="outline"
                className="w-full"
              >
                Return to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gradient-to-br from-green/5 to-teal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-xl text-muted-foreground">
            Your {bookings.length} booking{bookings.length > 1 ? 's have' : ' has'} been confirmed
          </p>
        </motion.div>

        {/* Booking Details */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Booking #{booking.booking_number}</CardTitle>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Confirmed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Service Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.service_date), 'PPP p')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.duration_minutes} minutes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.service_address}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Paid</span>
                      <span className="text-xl font-bold text-teal">
                        ${booking.final_price}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
        >
          <Button
            onClick={handleContinue}
            className="bg-teal hover:bg-teal/90 px-8 py-3 text-lg"
            size="lg"
          >
            View My Bookings
          </Button>
          
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="px-8 py-3 text-lg"
            size="lg"
          >
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentSuccessHandlerV2;
