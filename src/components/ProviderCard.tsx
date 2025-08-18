
import React from 'react';
import { Star, CheckCircle, MapPin } from 'lucide-react';

interface ProviderCardProps {
  name: string;
  service: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  location: string;
  avatar?: string;
  verified?: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  name,
  service,
  rating,
  reviews,
  hourlyRate,
  location,
  avatar,
  verified = false
}) => {
  return (
    <div className="card-provider">
      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-teal/20 to-teal/10 rounded-full flex items-center justify-center">
            {avatar ? (
              <img 
                src={avatar} 
                alt={name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </div>
          {verified && (
            <CheckCircle className="absolute -bottom-1 -right-1 w-6 h-6 text-teal bg-navy rounded-full" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <p className="text-muted-foreground text-sm">{service}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-teal">${hourlyRate}/hr</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-foreground font-medium">{rating}</span>
              <span className="text-muted-foreground">({reviews}+)</span>
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          
          <button className="w-full btn-secondary text-sm py-2">
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
