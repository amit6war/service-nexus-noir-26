
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star, MapPin, Clock, User, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Provider {
  id: string;
  user_id: string;
  business_name: string;
  description: string;
  hourly_rate: number;
  rating: number;
  total_reviews: number;
  business_address: string;
  business_phone: string;
  business_email: string;
  verification_status: string;
}

const FavoritesSection = () => {
  const [favoriteProviders, setFavoriteProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, removeFromFavorites } = useFavorites();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadFavoriteProviders();
  }, [favorites]);

  const loadFavoriteProviders = async () => {
    if (!user || favorites.length === 0) {
      setFavoriteProviders([]);
      setLoading(false);
      return;
    }

    try {
      const providerUserIds = favorites.map(fav => fav.provider_user_id);
      
      const { data: providers, error } = await supabase
        .from('provider_profiles')
        .select('*')
        .in('user_id', providerUserIds);

      if (error) {
        console.error('Error loading favorite providers:', error);
        return;
      }

      setFavoriteProviders(providers || []);
    } catch (error) {
      console.error('Error loading favorite providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (providerUserId: string) => {
    const success = await removeFromFavorites(providerUserId);
    if (success) {
      setFavoriteProviders(prev => 
        prev.filter(provider => provider.user_id !== providerUserId)
      );
    }
  };

  const handleContactProvider = (provider: Provider) => {
    if (provider.business_phone) {
      window.open(`tel:${provider.business_phone}`, '_self');
    } else if (provider.business_email) {
      window.open(`mailto:${provider.business_email}`, '_self');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Favorites</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Favorites</h1>
        <p className="text-muted-foreground">Your favorite service providers</p>
      </div>

      {favoriteProviders.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No favorites yet</h3>
          <p className="text-muted-foreground">Browse services and save your preferred providers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProviders.map((provider) => (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center relative">
                        <User className="w-6 h-6 text-teal" />
                        {provider.verification_status === 'approved' && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-teal rounded-full flex items-center justify-center">
                            <Star className="w-2.5 h-2.5 text-white fill-current" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{provider.business_name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-sm text-foreground">{provider.rating}</span>
                            <span className="text-xs text-muted-foreground">({provider.total_reviews}+)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFavorite(provider.user_id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <CardDescription className="line-clamp-2">
                      {provider.description}
                    </CardDescription>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{provider.business_address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-teal">
                        ${provider.hourly_rate}/hr
                      </div>
                      {provider.verification_status === 'approved' && (
                        <Badge className="bg-teal text-white">Verified</Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleContactProvider(provider)}
                        className="flex-1 bg-teal hover:bg-teal/90"
                        size="sm"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
