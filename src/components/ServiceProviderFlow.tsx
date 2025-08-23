import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Clock, User, Calendar, Heart, ShoppingCart, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  base_price: number;
  duration_minutes: number;
  price_type: string;
  images?: string[];
  is_active: boolean;
  is_featured: boolean;
  emergency_available: boolean;
  provider_id?: string;
  provider_profile?: {
    business_name: string;
    rating: number;
    total_reviews: number;
    user_id: string;
    verification_status: string;
    description?: string;
    years_experience?: number;
    portfolio_images?: string[];
  };
}

interface ServiceProviderFlowProps {
  selectedService: Service;
  onBack: () => void;
  onBookService: () => void;
  onCartUpdate?: () => void;
}

const ServiceProviderFlow: React.FC<ServiceProviderFlowProps> = ({
  selectedService,
  onBack,
  onBookService,
  onCartUpdate
}) => {
  const [currentStep, setCurrentStep] = useState<'providers' | 'booking'>('providers');
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { addItem } = useShoppingCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { toast } = useToast();

  // Mock providers data - in real app this would come from API
  useEffect(() => {
    const loadProviders = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockProviders = [
        {
          id: '1',
          user_id: 'provider-1',
          business_name: 'Elite Professional Services',
          rating: 4.9,
          total_reviews: 127,
          years_experience: 8,
          hourly_rate: selectedService.base_price * 0.8,
          description: 'Experienced professional with excellent track record.',
          verification_status: 'approved',
          portfolio_images: ['/placeholder.svg'],
          availability_schedule: { monday: '9:00-17:00', tuesday: '9:00-17:00' }
        },
        {
          id: '2',
          user_id: 'provider-2',
          business_name: 'Quick Fix Professionals',
          rating: 4.7,
          total_reviews: 89,
          years_experience: 5,
          hourly_rate: selectedService.base_price * 0.9,
          description: 'Fast and reliable service provider.',
          verification_status: 'approved',
          portfolio_images: ['/placeholder.svg'],
          availability_schedule: { monday: '8:00-18:00', tuesday: '8:00-18:00' }
        },
        {
          id: '3',
          user_id: 'provider-3',
          business_name: 'Expert Care Team',
          rating: 4.6,
          total_reviews: 156,
          years_experience: 12,
          hourly_rate: selectedService.base_price * 1.1,
          description: 'Premium service with extensive experience.',
          verification_status: 'approved',
          portfolio_images: ['/placeholder.svg'],
          availability_schedule: { monday: '10:00-16:00', tuesday: '10:00-16:00' }
        }
      ];
      
      setProviders(mockProviders);
      setLoading(false);
    };

    loadProviders();
  }, [selectedService]);

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
    setCurrentStep('booking');
  };

  const handleFavoriteToggle = async (provider: any) => {
    const isCurrentlyFavorite = isFavorite(provider.user_id);
    
    if (isCurrentlyFavorite) {
      await removeFromFavorites(provider.user_id);
    } else {
      await addToFavorites(provider.user_id);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedProvider || !scheduledDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a date and time for your service.',
        variant: 'destructive'
      });
      return;
    }

    const cartItem = {
      service_id: selectedService.id,
      provider_id: selectedProvider.user_id,
      service_title: selectedService.title,
      provider_name: selectedProvider.business_name,
      price: selectedProvider.hourly_rate,
      duration_minutes: selectedService.duration_minutes,
      scheduled_date: scheduledDate,
      special_instructions: specialInstructions
    };

    const success = await addItem(cartItem, () => {
      if (onCartUpdate) {
        onCartUpdate();
      }
      onBack();
    });

    if (success) {
      console.log('✅ Item successfully added to cart');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Loading Providers...</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
        </div>
      </div>
    );
  }

  if (currentStep === 'providers') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedService.title}</h1>
            <p className="text-muted-foreground">Choose your preferred service provider</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full relative">
                <Button
                  onClick={() => handleFavoriteToggle(provider)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4 z-10 hover:bg-red-50"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      isFavorite(provider.user_id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-muted-foreground hover:text-red-500'
                    }`} 
                  />
                </Button>
                
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-8 h-8 text-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate pr-8">{provider.business_name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{provider.rating}</span>
                        </div>
                        <span className="text-muted-foreground">({provider.total_reviews} reviews)</span>
                      </div>
                      <Badge className="mt-2 bg-green-100 text-green-800">
                        {provider.verification_status === 'approved' ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{provider.years_experience} years experience</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>Available in your area</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div>
                        <span className="text-2xl font-bold text-teal">${provider.hourly_rate}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          {selectedService.price_type === 'hourly' ? '/hr' : ''}
                        </span>
                      </div>
                      <Button 
                        onClick={() => handleProviderSelect(provider)}
                        className="bg-teal hover:bg-teal/90"
                      >
                        Select Provider
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Booking step
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => setCurrentStep('providers')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Providers
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Book Your Service</h1>
          <p className="text-muted-foreground">Complete your booking details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Service Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedService.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedService.description}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedService.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedProvider?.business_name}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Price:</span>
                  <span className="text-2xl font-bold text-teal">${selectedProvider?.hourly_rate}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule Your Service</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Select Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-teal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Special Instructions (Optional)
                </label>
                <Textarea
                  placeholder="Any special requirements or instructions for the service provider..."
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleAddToCart}
                className="w-full bg-teal hover:bg-teal/90 h-12"
                disabled={!scheduledDate}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ${selectedProvider?.hourly_rate}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServiceProviderFlow;
