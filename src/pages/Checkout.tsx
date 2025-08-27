import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, CreditCard, MapPin, Calendar, Clock, User } from 'lucide-react';
import { formatError } from '@/lib/errorFormatter';

// Get Stripe publishable key from environment
const stripePromise = loadStripe('pk_test_51QP7v3JGHirLNzkjvNi9jxNbBkFwJeGnwL6Ui9CU5wOXdexY8d5Re4LFNU9dnzmQ0RDSvb3sNJC0mzLcc9Bol4SW00z5X37P2l');

const Checkout = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { items, getTotalPrice, clearCart } = useShoppingCart();
  const { toast } = useToast();

  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!address.address_line_1.trim()) {
      newErrors.address_line_1 = 'Street address is required';
    }
    if (!address.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!address.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const generateIdempotencyKey = () => {
    return `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to proceed with checkout.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: 'Form Validation Failed',
        description: 'Please check the form for errors.',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to your cart before checkout.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      console.log('🛒 Starting checkout process with items:', items.length);

      // Store checkout data in session storage
      sessionStorage.setItem('pendingCheckoutItems', JSON.stringify(items));
      sessionStorage.setItem('pendingCheckoutAddress', JSON.stringify(address));
      sessionStorage.setItem('checkoutTimestamp', Date.now().toString());

      // Create payment intent using our edge function
      const idempotencyKey = generateIdempotencyKey();
      console.log('🔑 Generated idempotency key:', idempotencyKey);

      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          items,
          address,
          idempotency_key: idempotencyKey
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      console.log('✅ Payment intent created:', data.payment_intent.id);

      // Get Stripe and redirect to checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Store the payment intent data
      sessionStorage.setItem('paymentIntentData', JSON.stringify(data));

      // Redirect to Stripe Checkout using the client secret
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.payment_intent.id // This should be a session ID, not payment intent ID
      });

      // If redirectToCheckout fails, try using confirmPayment
      if (stripeError) {
        console.log('Checkout redirect failed, trying payment confirmation:', stripeError);
        
        // Use Elements for payment confirmation
        const { error: confirmError } = await stripe.confirmPayment({
          clientSecret: data.payment_intent.client_secret,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
        });

        if (confirmError) {
          throw new Error(confirmError.message);
        }
      }

    } catch (error) {
      const errorMessage = formatError(error);
      console.error('❌ Checkout failed:', error);
      
      toast({
        title: 'Checkout Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      // Clear session storage on error
      sessionStorage.removeItem('pendingCheckoutItems');
      sessionStorage.removeItem('pendingCheckoutAddress');
      sessionStorage.removeItem('checkoutTimestamp');
      sessionStorage.removeItem('paymentIntentData');
    } finally {
      setProcessing(false);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !authLoading) {
      navigate('/services');
    }
  }, [items.length, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">Review your order and complete your booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </CardTitle>
                <CardDescription>
                  {items.length} item{items.length !== 1 ? 's' : ''} in your cart
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{item.service_title}</h3>
                      <span className="font-bold">${item.price}</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{item.provider_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.scheduled_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.duration_minutes} minutes</span>
                      </div>
                      {item.special_instructions && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <strong>Instructions:</strong> {item.special_instructions}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span>${(totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(totalPrice * 0.08).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${(totalPrice * 1.18).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Service Address
                </CardTitle>
                <CardDescription>
                  Where should the service be provided?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address_line_1">Street Address *</Label>
                  <Input
                    id="address_line_1"
                    value={address.address_line_1}
                    onChange={(e) => setAddress(prev => ({ ...prev, address_line_1: e.target.value }))}
                    placeholder="123 Main Street"
                    className={errors.address_line_1 ? 'border-red-500' : ''}
                  />
                  {errors.address_line_1 && (
                    <p className="text-sm text-red-500">{errors.address_line_1}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address_line_2">Apartment, Suite, etc.</Label>
                  <Input
                    id="address_line_2"
                    value={address.address_line_2}
                    onChange={(e) => setAddress(prev => ({ ...prev, address_line_2: e.target.value }))}
                    placeholder="Apt 4B (optional)"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={address.city}
                      onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="New York"
                      className={errors.city ? 'border-red-500' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      value={address.state}
                      onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="NY"
                      className={errors.state ? 'border-red-500' : ''}
                    />
                    {errors.state && (
                      <p className="text-sm text-red-500">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={address.postal_code}
                    onChange={(e) => setAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="10001"
                  />
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={processing || items.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay ${(totalPrice * 1.18).toFixed(2)}
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  By clicking "Pay", you agree to our Terms of Service and Privacy Policy.
                  Your payment is secured with 256-bit SSL encryption.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
