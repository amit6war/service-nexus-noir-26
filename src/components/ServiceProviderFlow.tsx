import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, MessageSquare, CheckCircle, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useServicesProviders } from '@/hooks/useServicesProviders';
import { useProductionCart } from '@/hooks/useProductionCart';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface ServiceProviderFlowProps {
  selectedService: any;
  onBack: () => void;
  onBookService: () => void;
}

const ServiceProviderFlow: React.FC<ServiceProviderFlowProps> = ({ selectedService, onBack, onBookService }) => {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [notes, setNotes] = useState('');
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const navigate = useNavigate();
  const { providers, loading, error } = useServicesProviders(selectedService?.id);
  const { addItem } = useProductionCart();

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
  };

  const handleAddToCart = async (provider: any) => {
    console.log('🛒 ServiceProviderFlow: Adding to cart:', provider.business_name);
    
    const cartItem = {
      service_id: selectedService.id,
      provider_id: provider.user_id,
      service_name: selectedService.title,
      provider_name: provider.business_name || 'Provider',
      base_price: selectedService.base_price,
      final_price: selectedService.base_price,
      duration_minutes: selectedService.duration_minutes,
      service_description: selectedService.description,
      category: selectedService.category,
      subcategory: selectedService.subcategory,
      notes: '',
    };

    console.log('🛒 Cart item data:', cartItem);
    
    const success = await addItem(cartItem);
    console.log('🛒 Add to cart result:', success);
    
    if (success) {
      console.log('✅ Item added successfully, showing success message');
      // Additional success handling can be added here
    }
  };

  const handleBookNow = () => {
    if (selectedProvider) {
      // Navigate to checkout or booking confirmation page
      onBookService();
      navigate('/checkout');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-5 h-5" />
        Back to Services
      </Button>

      {/* Service Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{selectedService?.title}</CardTitle>
          <CardDescription>{selectedService?.description}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{selectedService?.duration_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{selectedService?.location || 'Anywhere'}</span>
            </div>
          </div>
          <div className="text-xl font-bold text-teal">
            Starting from ${selectedService?.base_price}
          </div>
        </CardContent>
      </Card>

      {/* Provider Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Select a Provider</h2>
        {loading && <p>Loading providers...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers?.map((provider) => (
            <motion.div
              key={provider.user_id}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`hover:shadow-lg transition-shadow cursor-pointer ${selectedProvider?.user_id === provider.user_id ? 'border-2 border-primary' : ''}`}
                onClick={() => handleProviderSelect(provider)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={provider.avatar_url} />
                        <AvatarFallback>{provider.business_name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{provider.business_name}</CardTitle>
                        <CardDescription className="text-muted-foreground">
                          {provider.title || 'Service Provider'}
                        </CardDescription>
                      </div>
                    </div>
                    {selectedProvider?.user_id === provider.user_id && (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{provider.address || 'No address'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{provider.availability || 'Available Now'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Notes and Booking */}
      {selectedProvider && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Additional Information</h2>
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                Please provide any additional notes or special requests for the
                provider.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests or notes for the provider?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Select Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => handleAddToCart(selectedProvider)}>
                  Add to Cart
                </Button>
                <Button onClick={handleBookNow} className="bg-teal hover:bg-teal/90">
                  Book Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ServiceProviderFlow;
