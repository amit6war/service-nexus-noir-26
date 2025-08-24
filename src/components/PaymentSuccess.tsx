
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, User } from 'lucide-react';
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

  useEffect(() => {
    const processPaymentSuccess = async () => {
      // Get stored checkout data
      const pendingItems = sessionStorage.getItem('pendingCheckoutItems');
      const pendingAddress = sessionStorage.getItem('pendingCheckoutAddress');
      
      if (pendingItems && pendingAddress && !bookingsCreated) {
        try {
          setCreating(true);
          console.log('Processing successful payment and creating bookings...');
          
          const items = JSON.parse(pendingItems);
          const address = JSON.parse(pendingAddress);
          
          // Create bookings from the cart data
          const success = await createBookingsFromCart(items, address);
          
          if (success) {
            // Clear stored data and cart
            clearCart();
            sessionStorage.removeItem('pendingCheckoutItems');
            sessionStorage.removeItem('pendingCheckoutAddress');
            sessionStorage.removeItem('checkoutTimestamp');
            
            setBookingsCreated(true);
            
            toast({
              title: 'Payment Successful!',
              description: `${items.length} booking${items.length !== 1 ? 's' : ''} created successfully. You will receive confirmation emails shortly.`,
            });
            
            console.log('Bookings created successfully from payment');
          } else {
            throw new Error('Failed to create bookings');
          }
          
        } catch (error) {
          console.error('Error creating bookings after payment:', error);
          toast({
            title: 'Payment Successful',
            description: 'Your payment was processed, but there was an issue creating the bookings. Please contact support.',
            variant: 'destructive'
          });
        } finally {
          setCreating(false);
        }
      }
    };

    processPaymentSuccess();
  }, [clearCart, createBookingsFromCart, toast, bookingsCreated]);

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
                  Thank you for your payment. Your booking{bookingsCreated ? 's have' : ' has'} been confirmed and you will receive confirmation emails shortly.
                </p>
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
                onClick={() => navigate('/customer-dashboard')} 
                className="bg-teal hover:bg-teal/90"
                disabled={creating}
              >
                View Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/customer-dashboard?tab=bookings')}
                disabled={creating}
              >
                View Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
