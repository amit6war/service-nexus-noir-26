
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Star } from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  base_price: number;
  duration_minutes: number;
  category?: string;
  is_featured: boolean;
  emergency_available: boolean;
}

interface ProviderServicesCardProps {
  services: Service[];
}

const ProviderServicesCard = ({ services }: ProviderServicesCardProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <Card key={service.id} className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{service.title}</CardTitle>
              {service.is_featured && (
                <Badge variant="secondary">
                  <Star className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {service.description}
            </p>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">${service.base_price}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{service.duration_minutes}min</span>
              </div>
            </div>

            {service.category && (
              <Badge variant="outline" className="text-xs">
                {service.category}
              </Badge>
            )}

            {service.emergency_available && (
              <Badge variant="destructive" className="text-xs">
                Emergency Available
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProviderServicesCard;
