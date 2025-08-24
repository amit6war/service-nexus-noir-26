
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle, PlayCircle, Shield } from 'lucide-react';

interface BookingStatusBadgeProps {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'accepted' | 'in_progress' | 'disputed';
  className?: string;
}

const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: 'Confirmed',
          className: 'bg-blue-500 text-white'
        };
      case 'completed':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: 'Completed',
          className: 'bg-green-500 text-white'
        };
      case 'pending':
        return {
          variant: 'default' as const,
          icon: AlertCircle,
          label: 'Pending',
          className: 'bg-yellow-500 text-white'
        };
      case 'cancelled':
        return {
          variant: 'destructive' as const,
          icon: XCircle,
          label: 'Cancelled',
          className: 'bg-red-500 text-white'
        };
      case 'accepted':
        return {
          variant: 'default' as const,
          icon: CheckCircle,
          label: 'Accepted',
          className: 'bg-teal-500 text-white'
        };
      case 'in_progress':
        return {
          variant: 'default' as const,
          icon: PlayCircle,
          label: 'In Progress',
          className: 'bg-orange-500 text-white'
        };
      case 'disputed':
        return {
          variant: 'destructive' as const,
          icon: Shield,
          label: 'Disputed',
          className: 'bg-red-600 text-white'
        };
      default:
        return {
          variant: 'outline' as const,
          icon: Clock,
          label: status,
          className: ''
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`${config.className} ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
};

export default BookingStatusBadge;
