
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Clock, User, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Service } from '@/hooks/useServices';

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
  if (!selectedService) return null;

  const handleBookService = (provider: any) => {
    onBookService(provider);
  };

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
                ${selectedService.base_price}
              </span>
              <span className="text-muted-foreground">
                {selectedService.price_type === 'hourly' ? '/hr' : ''}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Card */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Available Provider</h3>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {selectedService.provider_profile?.portfolio_images?.[0] && (
                    <img
                      src={selectedService.provider_profile.portfolio_images[0]}
                      alt={selectedService.provider_profile.business_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-lg">
                      {selectedService.provider_profile?.business_name}
                    </CardTitle>
                    <CardDescription>
                      {selectedService.provider_profile?.description || 'Professional service provider'}
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{selectedService.provider_profile?.rating || 0}</span>
                    <span className="text-muted-foreground text-sm">
                      ({selectedService.provider_profile?.total_reviews || 0})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Award className="w-3 h-3" />
                    <span>{selectedService.provider_profile?.years_experience || 0} years exp</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Available
                  </Badge>
                  {selectedService.emergency_available && (
                    <Badge variant="outline" className="text-red-500 border-red-500">
                      Emergency Service
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBookService(selectedService.provider_profile)}
                    className="bg-teal hover:bg-teal/90"
                    size="sm"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Select Provider
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ServiceProviderFlow;
