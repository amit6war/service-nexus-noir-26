
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
  onCartUpdate?: () => void;
}

const ServiceProviderFlow: React.FC<ServiceProviderFlowProps> = ({
  selectedService,
  onBack,
  onBookService,
  onCartUpdate
}) => {
  const [selectedProvider, setSelectedProvider] = useState<any>(null);

  if (!selectedService) return null;

  // Generate 6 providers for each service with varied pricing
  const generateProviders = (service: Service) => {
    const basePrice = service.base_price || 100;
    const maxPrice = basePrice * 1.5;
    
    return [
      {
        id: 'provider-1',
        user_id: 'provider-1',
        business_name: 'Elite Professional Services',
        rating: 4.9,
        total_reviews: 247,
        verification_status: 'approved',
        description: 'Premium quality service with 10+ years experience.',
        years_experience: 12,
        price: Math.round(maxPrice * 1.0),
        availability: 'Available today',
        location: 'Downtown Area',
        certifications: ['Licensed', 'Insured', 'Bonded']
      },
      {
        id: 'provider-2',
        user_id: 'provider-2',
        business_name: 'Reliable Home Solutions',
        rating: 4.7,
        total_reviews: 189,
        verification_status: 'approved',
        description: 'Fast and efficient service delivery.',
        years_experience: 8,
        price: Math.round(maxPrice * 0.85),
        availability: 'Available tomorrow',
        location: 'North Side',
        certifications: ['Licensed', 'Insured']
      },
      {
        id: 'provider-3',
        user_id: 'provider-3',
        business_name: 'Expert Care Team',
        rating: 4.6,
        total_reviews: 156,
        verification_status: 'approved',
        description: 'Specialized team with focus on quality.',
        years_experience: 6,
        price: Math.round(maxPrice * 0.75),
        availability: 'Available this week',
        location: 'East District',
        certifications: ['Licensed']
      },
      {
        id: 'provider-4',
        user_id: 'provider-4',
        business_name: 'Quick Fix Professionals',
        rating: 4.8,
        total_reviews: 203,
        verification_status: 'approved',
        description: 'Emergency services available 24/7.',
        years_experience: 9,
        price: Math.round(maxPrice * 0.90),
        availability: 'Available now',
        location: 'West Side',
        certifications: ['Licensed', 'Insured', '24/7 Emergency']
      },
      {
        id: 'provider-5',
        user_id: 'provider-5',
        business_name: 'Budget Friendly Services',
        rating: 4.4,
        total_reviews: 128,
        verification_status: 'approved',
        description: 'Affordable rates without compromising quality.',
        years_experience: 5,
        price: Math.round(maxPrice * 0.60),
        availability: 'Available next week',
        location: 'South Area',
        certifications: ['Licensed']
      },
      {
        id: 'provider-6',
        user_id: 'provider-6',
        business_name: 'Premium Home Care',
        rating: 4.9,
        total_reviews: 312,
        verification_status: 'approved',
        description: 'Top-rated service provider with premium materials.',
        years_experience: 15,
        price: Math.round(maxPrice * 0.95),
        availability: 'Available today',
        location: 'Central District',
        certifications: ['Licensed', 'Insured', 'Bonded', 'Premium Certified']
      }
    ];
  };

  const providers = generateProviders(selectedService);

  const handleSelectProvider = (provider: any) => {
    console.log('Provider selected:', provider);
    setSelectedProvider(provider);
  };

  const handleBookingComplete = () => {
    console.log('Booking completed successfully');
    setSelectedProvider(null);
    onBookService(selectedProvider);
    // Trigger cart update if callback is provided
    if (onCartUpdate) {
      onCartUpdate();
    }
  };

  const handleBookingClose = () => {
    console.log('Booking flow closed');
    setSelectedProvider(null);
  };

  // Show booking flow if provider is selected
  if (selectedProvider) {
    return (
      <BookingFlow
        service={selectedService}
        provider={selectedProvider}
        onClose={handleBookingClose}
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
          <p className="text-muted-foreground">Choose from {providers.length} available providers</p>
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
                Starting from ${Math.min(...providers.map(p => p.price))}
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
        <h3 className="text-lg font-semibold">Available Providers ({providers.length})</h3>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4"
        >
          {providers.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-teal" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {provider.business_name}
                      </CardTitle>
                      <CardDescription>
                        {provider.description}
                      </CardDescription>
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <span>📍 {provider.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">{provider.rating}</span>
                      <span className="text-muted-foreground text-sm">
                        ({provider.total_reviews})
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Award className="w-3 h-3" />
                      <span>{provider.years_experience} years exp</span>
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
