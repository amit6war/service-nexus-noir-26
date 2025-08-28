
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Phone, Mail, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import ProviderServicesCard from '@/components/ProviderServicesCard';

const ProviderDetail = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [provider, setProvider] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviderDetails = async () => {
      if (!providerId) return;

      try {
        // Fetch provider profile
        const { data: providerData, error: providerError } = await supabase
          .from('provider_profiles')
          .select(`
            *,
            profiles:user_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('id', providerId)
          .single();

        if (providerError) throw providerError;

        // Fetch provider services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('provider_id', providerId)
          .eq('is_active', true);

        if (servicesError) throw servicesError;

        setProvider(providerData);
        // Map the services to include category field from category_id if needed
        const mappedServices = servicesData?.map(service => ({
          ...service,
          category: service.category || 'General Services'
        })) || [];
        setServices(mappedServices);
        
      } catch (error) {
        console.error('Error fetching provider details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load provider details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProviderDetails();
  }, [providerId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-32"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Provider Not Found</h2>
          <p className="text-muted-foreground mb-4">The provider you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/providers')}>
            Back to Providers
          </Button>
        </div>
      </div>
    );
  }

  const fullName = provider.profiles 
    ? `${provider.profiles.first_name || ''} ${provider.profiles.last_name || ''}`.trim()
    : provider.business_name;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/providers')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Providers
          </Button>
        </div>

        {/* Provider Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={provider.profiles?.avatar_url} />
                  <AvatarFallback>
                    {fullName.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{provider.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-muted-foreground">
                    ({provider.total_reviews || 0} reviews)
                  </span>
                </div>

                <Badge 
                  variant={provider.verification_status === 'approved' ? 'default' : 'secondary'}
                  className="mb-4"
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {provider.verification_status === 'approved' ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{provider.business_name}</h1>
                  {fullName !== provider.business_name && (
                    <p className="text-lg text-muted-foreground mb-2">{fullName}</p>
                  )}
                </div>

                {provider.description && (
                  <p className="text-muted-foreground">{provider.description}</p>
                )}

                <div className="grid gap-3 md:grid-cols-2">
                  {provider.business_address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{provider.business_address}</span>
                    </div>
                  )}

                  {provider.business_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{provider.business_phone}</span>
                    </div>
                  )}

                  {provider.business_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{provider.business_email}</span>
                    </div>
                  )}

                  {provider.years_experience && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{provider.years_experience} years experience</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length > 0 ? (
              <ProviderServicesCard services={services} />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No services available at the moment.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProviderDetail;
