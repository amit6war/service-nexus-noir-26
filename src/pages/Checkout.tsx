import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import AddressManager, { Address } from '@/components/AddressManager';
import { supabase } from '@/integrations/supabase/client';
import EnhancedCheckoutItem from '@/components/EnhancedCheckoutItem';

const Checkout = () => {
  const { items, getTotalPrice } = useShoppingCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handlePayment = async () => {
    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add services to your cart before checkout.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a service address.',
        variant: 'destructive'
      });
      return;
    }

    const itemsWithoutDate = items.filter(item => !item.scheduled_date);
    if (itemsWithoutDate.length > 0) {
      toast({
        title: 'Missing Schedule',
        description: 'All services must have a scheduled date before checkout.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Creating enhanced Stripe checkout session with complete cart data...');

      // Get the current session to ensure we have a valid token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Authentication error:', sessionError);
        toast({
          title: 'Authentication Required',
          description: 'Please log in to continue with checkout.',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      console.log('User authenticated, proceeding with checkout...');

      const addressForCheckout = {
        address_line_1: selectedAddress.address_line_1,
        address_line_2: selectedAddress.address_line_2 || '',
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip_code: selectedAddress.postal_code,
        country: selectedAddress.country
      };

      // Store complete cart data in sessionStorage before payment
      const checkoutData = {
        items: items,
        address: addressForCheckout,
        timestamp: Date.now()
      };
      
      sessionStorage.setItem('pendingCheckoutItems', JSON.stringify(checkoutData.items));
      sessionStorage.setItem('pendingCheckoutAddress', JSON.stringify(checkoutData.address));
      sessionStorage.setItem('checkoutTimestamp', checkoutData.timestamp.toString());

      console.log('Calling create-checkout function...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          items: items,
          address: addressForCheckout
        }
      });

      if (error) {
        console.error('Checkout error:', error);
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        throw new Error('No checkout URL received from server');
      }

      console.log('Redirecting to enhanced Stripe checkout...');
      window.location.href = data.url;

    } catch (error) {
      console.error('Payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: 'Payment Failed',
        description: `There was an error processing your payment: ${errorMessage}. Please try again.`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add some services to get started</p>
            <Button onClick={() => navigate('/customer-dashboard')} className="bg-teal hover:bg-teal/90">
              Browse Services
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/customer-dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Enhanced Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Order Summary ({items.length} service{items.length !== 1 ? 's' : ''})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <EnhancedCheckoutItem key={item.id} item={item} />
                  ))}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total:</span>
                    <span className="text-teal">${totalPrice}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Address & Payment */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Select Service Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AddressManager
                    onAddressSelect={handleAddressSelect}
                    selectedAddressId={selectedAddress?.id}
                    showSelection={true}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border border-border rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-teal" />
                      <div>
                        <div className="font-medium">Credit/Debit Card</div>
                        <div className="text-sm text-muted-foreground">Secure payment via Stripe</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Test Payment Information</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Test Card:</strong> 4242 4242 4242 4242</p>
                      <p><strong>Expiry:</strong> Any future date (e.g., 12/25)</p>
                      <p><strong>CVV:</strong> Any 3 digits (e.g., 123)</p>
                      <p><strong>ZIP:</strong> Any 5 digits (e.g., 12345)</p>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Secure Payment:</strong> You'll be redirected to Stripe's secure checkout page to complete your payment.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handlePayment}
                disabled={loading || !selectedAddress}
                className="w-full h-14 text-lg bg-teal hover:bg-teal/90"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Processing Payment...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Complete Payment - ${totalPrice}
                  </div>
                )}
              </Button>
              
              {!selectedAddress && (
                <p className="text-sm text-muted-foreground text-center">
                  Please select a service address to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
