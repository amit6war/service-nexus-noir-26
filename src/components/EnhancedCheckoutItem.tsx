
import React from 'react';
import { Calendar, Clock, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface EnhancedCheckoutItemProps {
  item: {
    id: string;
    service_id: string;
    provider_id: string;
    service_title: string;
    provider_name: string;
    price: number;
    duration_minutes: number;
    scheduled_date: string;
    special_instructions?: string;
  };
}

const EnhancedCheckoutItem: React.FC<EnhancedCheckoutItemProps> = ({ item }) => {
  // Helper function to safely format dates
  const formatDate = (dateString: string, formatString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, formatString);
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="border border-border">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground mb-1">{item.service_title}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <User className="w-4 h-4" />
              <span className="font-medium">Provider: {item.provider_name}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-teal">${item.price}</div>
            <Badge variant="secondary" className="mt-1">Service Fee</Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(item.scheduled_date, 'PPP')}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatDate(item.scheduled_date, 'p')} ({item.duration_minutes} min)</span>
          </div>
        </div>
        
        {item.special_instructions && (
          <div className="mt-3 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-foreground mb-1">Special Instructions:</div>
            <div className="text-sm text-muted-foreground">{item.special_instructions}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedCheckoutItem;
