
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Heart, User, Clock, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFavorites } from '@/hooks/useFavorites';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProviderWithDetails {
  user_id: string;
  business_name: string;
  rating: number;
  total_reviews: number;
  years_experience: number;
  hourly_rate: number;
  description: string;
  verification_status: string;
  business_phone?: string;
  business_email?: string;
  service_areas?: string[];
  portfolio_images?: string[];
}

const FavoritesSection = () => {
  const { favorites, removeFromFavorites, loading: favoritesLoading } = useFavorites();
  const [providers, setProviders] = useState<ProviderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load provider details for favorited providers
  useEffect(() => {
    const loadProviderDetails = async () => {
      if (!favorites.length) {
        setProviders([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const providerIds = favorites.map(fav => fav.provider_user_id);

        const { data, error } = await supabase
          .from('provider_profiles')
          .select(`
            user_id,
            business_name,
            rating,
            total_reviews,
            years_experience,
            hourly_rate,
            description,
            verification_status,
            business_phone,
            business_email,
            service_areas,
            portfolio_images
          `)
          .in('user_id', providerIds)
          .eq('verification_status', 'approved');

        if (error) {
          console.error('Error loading provider details:', error);
          toast({
            title: 'Error',
            description: 'Failed to load favorite providers. Please try again.',
            variant: 'destructive'
          });
          return;
        }

        setProviders(data || []);
      } catch (error) {
        console.error('Error loading provider details:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred while loading favorites.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadProviderDetails();
  }, [favorites, toast]);

  const handleRemoveFavorite = async (providerUserId: string) => {
    const success = await removeFromFavorites(providerUserId);
    if (success) {
      // Remove from local state immediately for better UX
      setProviders(prev => prev.filter(p => p.user_id !== providerUserId));
    }
  };

  if (favoritesLoading || loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">My Favorites</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
          <span className="ml-2 text-muted-foreground">Loading favorites...</span>
        </div>
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">My Favorites</h2>
        <div className="text-center py-12">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No favorite providers yet.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Browse services and add providers to your favorites by clicking the heart icon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">My Favorites</h2>
        <Badge variant="secondary">{providers.length} Provider{providers.length !== 1 ? 's' : ''}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {providers.map((provider, index) => (
          <motion.div
            key={provider.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow h-full relative">
              <Button
                onClick={() => handleRemoveFavorite(provider.user_id)}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10 hover:bg-red-50"
              >
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </Button>

              <CardHeader>
                <div className="flex items-start gap-4 pr-8">
                  <div className="w-16 h-16 bg-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
                    {provider.portfolio_images && provider.portfolio_images.length > 0 ? (
                      <img 
                        src={provider.portfolio_images[0]} 
                        alt={provider.business_name}
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.removeAttribute('style');
                        }}
                      />
                    ) : null}
                    <User className="w-8 h-8 text-teal" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{provider.business_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{provider.rating || 0}</span>
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
                  <p className="text-sm text-muted-foreground line-clamp-2">{provider.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{provider.years_experience || 0} years experience</span>
                    </div>
                    
                    {provider.business_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{provider.business_phone}</span>
                      </div>
                    )}
                    
                    {provider.service_areas && provider.service_areas.length > 0 && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{provider.service_areas[0]}</span>
                        {provider.service_areas.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            +{provider.service_areas.length - 1} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <span className="text-2xl font-bold text-teal">${provider.hourly_rate || 0}</span>
                      <span className="text-muted-foreground text-sm ml-1">/hr</span>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="hover:bg-teal/10"
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
    </div>
  );
};

export default FavoritesSection;
