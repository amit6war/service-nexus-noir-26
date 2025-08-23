
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, User, Award, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Service } from '@/hooks/useServices';
import BookingFlow from './BookingFlow';

interface ServiceProviderFlowProps {
  selectedService: Service | null;
  onBack: () => void;
  onBookService: (provider: any) => void;
}

const ServiceProviderFlow: React.FC<ServiceProviderFlowProps> = ({
  selectedService,
  onBack,
  onBookService
}) => {
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  if (!selectedService) return null;

  // Mock multiple providers for demonstration - in real app this would come from backend
  const mockProviders = [
    {
      ...selectedService.provider_profile,
      id: selectedService.provider_id,
      price: selectedService.base_price,
      availability: 'Available today'
    },
    {
      id: 'provider-2',
      business_name: 'Premium Home Services',
      rating: 4.8,
      total_reviews: 156,
      user_id: 'provider-2',
      verification_status: 'approved',
      description: 'Professional and reliable service provider',
      years_experience: 8,
      portfolio_images: [],
      price: selectedService.base_price * 1.2,
      availability: 'Available tomorrow'
    },
    {
      id: 'provider-3', 
      business_name: 'Expert Care Solutions',
      rating: 4.6,
      total_reviews: 89,
      user_id: 'provider-3',
      verification_status: 'approved',
      description: 'Specialized in quality service delivery',
      years_experience: 5,
      portfolio_images: [],
      price: selectedService.base_price * 0.9,
      availability: 'Available this week'
    }
  ].filter(Boolean);

  const handleSelectProvider = (provider: any) => {
    setSelectedProvider(provider);
  };

  const handleBookingComplete = () => {
    setSelectedProvider(null);
    onBookService(selectedProvider);
  };

  // Show booking flow if provider is selected
  if (selectedProvider) {
    return (
      <BookingFlow
        service={selectedService}
        provider={selectedProvider}
        onClose={() => setSelectedProvider(null)}
        onComplete={handleBookingComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Services
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{selectedService.title}</h2>
          <p className="text-muted-foreground">Choose from available providers</p>
        </div>
      </div>

      {/* Service Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>{selectedService.title}</span>
            {selectedService.is_featured && (
              <Badge className="bg-yellow-500 text-white">Featured</Badge>
            )}
            {selectedService.emergency_available && (
              <Badge variant="outline" className="text-red-500 border-red-500">Emergency</Badge>
            )}
          </CardTitle>
          <CardDescription>{selectedService.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{selectedService.duration_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-semibold text-teal">
                Starting from ${Math.min(...mockProviders.map(p => p.price))}
              </span>
              <span className="text-muted-foreground">
                {selectedService.price_type === 'hourly' ? '/hr' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Providers List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Providers ({mockProviders.length})</h3>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4"
        >
          {mockProviders.map((provider, index) => (
            <Card key={provider.id || index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {provider.portfolio_images?.[0] ? (
                      <img
                        src={provider.portfolio_images[0]}
                        alt={provider.business_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-teal" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">
                        {provider.business_name}
                      </CardTitle>
                      <CardDescription>
                        {provider.description || 'Professional service provider'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{provider.rating || 0}</span>
                      <span className="text-muted-foreground text-sm">
                        ({provider.total_reviews || 0})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Award className="w-3 h-3" />
                      <span>{provider.years_experience || 0} years exp</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-teal" />
                      <span className="text-xl font-bold text-teal">
                        ${provider.price}
                        {selectedService.price_type === 'hourly' ? '/hr' : ''}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {provider.availability}
                    </Badge>
                    {selectedService.emergency_available && (
                      <Badge variant="outline" className="text-red-500 border-red-500">
                        Emergency Service
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => handleSelectProvider(provider)}
                    className="bg-teal hover:bg-teal/90"
                    size="sm"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Select Provider
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceProviderFlow;
