
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, CreditCard, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import AddressManager from '@/components/AddressManager';
import { useAuth } from '@/hooks/useAuth';

const Checkout = () => {
  const { items, clearCart, getTotalPrice } = useShoppingCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some services to your cart to proceed with checkout.</p>
          <Button onClick={() => navigate('/')} className="bg-teal hover:bg-teal/90">
            Browse Services
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast({
        title: 'Address Required',
        description: 'Please select a service address to continue.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    
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

      const addressForCheckout = {
        address_line_1: selectedAddress.address_line_1,
        address_line_2: selectedAddress.address_line_2 || '',
        city: selectedAddress.city,
        state: selectedAddress.state,
        zip_code: selectedAddress.postal_code,
        country: selectedAddress.country
      };

      const checkoutData = {
        items: items,
        address: addressForCheckout,
        timestamp: Date.now()
      };

      // Store checkout data in session storage for post-payment processing
      sessionStorage.setItem('pendingCheckoutData', JSON.stringify(checkoutData.items));
      sessionStorage.setItem('pendingCheckoutAddress', JSON.stringify(checkoutData.address));
      sessionStorage.setItem('checkoutTimestamp', checkoutData.timestamp.toString());

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
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 hover:bg-muted"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Review your order and complete your booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.duration_minutes} minutes
                          </span>
                        </div>
                        {item.provider_profile && (
                          <p className="text-sm text-muted-foreground mt-1">
                            By {item.provider_profile.business_name}
                          </p>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-lg">${item.base_price}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.price_type}</p>
                      </div>
                    </div>
                    {index < items.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Service Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Service Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AddressManager 
                  onAddressSelect={setSelectedAddress}
                  selectedAddressId={selectedAddress?.id}
                />
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
                    <span>${getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Service Fee</span>
                    <span>$0.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>${getTotalPrice()}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  disabled={isProcessing || !selectedAddress}
                  className="w-full bg-teal hover:bg-teal/90 text-white"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  By completing this purchase, you agree to our terms of service.
                  You will be redirected to Stripe for secure payment processing.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;
