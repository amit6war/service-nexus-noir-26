import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, User, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useBookingsActions } from '@/hooks/useBookingsActions';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useShoppingCart();
  const { createBookingsFromCart } = useBookingsActions();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [bookingsCreated, setBookingsCreated] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [createdBookings, setCreatedBookings] = useState<any[]>([]);

  const processPaymentSuccess = async (isRetry = false) => {
    // Get stored checkout data
    const pendingItems = sessionStorage.getItem('pendingCheckoutItems');
    const pendingAddress = sessionStorage.getItem('pendingCheckoutAddress');
    
    if (!pendingItems || !pendingAddress) {
      setError('No payment data found. Please contact support if you were charged.');
      return;
    }

    if (bookingsCreated && !isRetry) {
      return; // Already processed successfully
    }

    try {
      setCreating(true);
      setError(null);
      console.log('Processing successful payment and creating bookings...');
      
      const items = JSON.parse(pendingItems);
      const address = JSON.parse(pendingAddress);
      
      // Mark payment as processed
      setPaymentProcessed(true);
      
      // Create bookings from the cart data
      const success = await createBookingsFromCart(items, address);
      
      if (success) {
        // Clear stored data and cart
        clearCart();
        sessionStorage.removeItem('pendingCheckoutItems');
        sessionStorage.removeItem('pendingCheckoutAddress');
        sessionStorage.removeItem('checkoutTimestamp');
        
        setBookingsCreated(true);
        setCreatedBookings(items);
        
        toast({
          title: 'Payment & Booking Successful!',
          description: `${items.length} booking${items.length !== 1 ? 's' : ''} created successfully. You will receive confirmation emails shortly.`,
        });
        
        console.log('Bookings created successfully from payment');
      } else {
        throw new Error('Failed to create bookings after payment');
      }
      
    } catch (error) {
      console.error('Error creating bookings after payment:', error);
      setError(`Booking creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Show error with refund information
      toast({
        title: 'Booking Creation Failed',
        description: 'Your payment was processed successfully, but we encountered an issue creating your bookings. Our team has been notified and will process a refund within 3-5 business days if needed.',
        variant: 'destructive',
        duration: 10000
      });
    } finally {
      setCreating(false);
    }
  };

  const handleRetry = async () => {
    if (retryAttempts >= 3) {
      toast({
        title: 'Maximum Retries Reached',
        description: 'Please contact support for assistance. We will ensure your payment is properly handled.',
        variant: 'destructive'
      });
      return;
    }
    
    setRetryAttempts(prev => prev + 1);
    await processPaymentSuccess(true);
  };

  const handleViewBookings = () => {
    navigate('/customer-dashboard?tab=bookings');
  };

  const handleViewDashboard = () => {
    navigate('/customer-dashboard');
  };

  useEffect(() => {
    processPaymentSuccess();
  }, []);

  // If there's an error and payment was processed, show error state with refund info
  if (error && paymentProcessed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto border-destructive">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-destructive">
                Booking Creation Failed
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your payment was processed successfully, but we encountered an issue creating your bookings.
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-semibold">What happens next:</p>
                <ul className="text-left space-y-1">
                  <li>• Our team has been automatically notified</li>
                  <li>• We will attempt to create your bookings manually</li>
                  <li>• If unsuccessful, a full refund will be processed within 3-5 business days</li>
                  <li>• You will receive email updates on the status</li>
                </ul>
              </div>

              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Error Details:</p>
                <p className="bg-muted p-2 rounded text-xs font-mono">{error}</p>
              </div>
              
              <div className="flex gap-4 justify-center pt-4">
                {retryAttempts < 3 && (
                  <Button 
                    onClick={handleRetry} 
                    variant="outline"
                    disabled={creating}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${creating ? 'animate-spin' : ''}`} />
                    Retry ({retryAttempts + 1}/3)
                  </Button>
                )}
                <Button 
                  onClick={handleViewDashboard} 
                  className="bg-teal hover:bg-teal/90"
                >
                  Go to Dashboard
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Need immediate help? Contact our support team with your payment confirmation.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              {creating ? 'Processing...' : 'Payment Successful!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {creating ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
                </div>
                <p className="text-muted-foreground">
                  Creating your bookings and sending confirmations...
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">
                  Thank you for your payment. Your booking{createdBookings.length !== 1 ? 's have' : ' has'} been confirmed and you will receive confirmation emails shortly.
                </p>

                {createdBookings.length > 0 && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Bookings Created:</h4>
                    <div className="space-y-2 text-sm">
                      {createdBookings.map((booking, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{booking.service_title}</span>
                          <span className="text-teal font-medium">${booking.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Your bookings are now available in "My Bookings"</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Service providers have been notified</span>
                </div>
              </>
            )}
            
            <div className="flex gap-4 justify-center pt-4">
              <Button 
                onClick={handleViewDashboard} 
                className="bg-teal hover:bg-teal/90"
                disabled={creating}
              >
                View Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={handleViewBookings}
                disabled={creating}
              >
                View My Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
