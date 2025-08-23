
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, Phone, Mail, Globe, Calendar, Award, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ProviderDetail {
  user_id: string;
  business_name: string;
  description: string;
  rating: number;
  total_reviews: number;
  years_experience: number;
  portfolio_images: string[];
  business_phone: string;
  business_email: string;
  business_website: string;
  service_areas: string[];
  certifications: string[];
  verification_status: string;
  services: Array<{
    id: string;
    title: string;
    description: string;
    base_price: number;
    duration_minutes: number;
    category: string;
    is_featured: boolean;
    emergency_available: boolean;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    reviewer_name: string;
    created_at: string;
  }>;
}

const ProviderDetail = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [provider, setProvider] = useState<ProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (providerId) {
      fetchProviderDetail();
    }
  }, [providerId]);

  const fetchProviderDetail = async () => {
    try {
      setLoading(true);
      
      // Fetch provider profile
      const { data: providerData, error: providerError } = await supabase
        .from('provider_profiles')
        .select('*')
        .eq('user_id', providerId)
        .single();

      if (providerError) {
        throw providerError;
      }

      // Fetch provider services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('provider_id', providerId)
        .eq('is_active', true);

      if (servicesError) {
        console.error('Error fetching services:', servicesError);
      }

      // Fetch reviews (mock data for now since reviews table structure needs customer names)
      const mockReviews = [
        {
          id: '1',
          rating: 5,
          comment: 'Excellent service! Very professional and completed the job perfectly.',
          reviewer_name: 'John D.',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          rating: 4,
          comment: 'Good work, arrived on time and cleaned up after themselves.',
          reviewer_name: 'Sarah M.',
          created_at: '2024-01-10T14:00:00Z'
        }
      ];

      setProvider({
        ...providerData,
        services: servicesData || [],
        reviews: mockReviews
      });
    } catch (error) {
      console.error('Error fetching provider detail:', error);
      toast({
        title: "Error",
        description: "Failed to load provider information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-navy p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Provider not found</h2>
              <p className="text-muted-foreground">The provider you're looking for doesn't exist or is no longer available.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy p-6">
      <div className="max-w-6xl mx-auto">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Provider Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="bg-teal text-white text-2xl">
                  {provider.business_name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{provider.business_name}</h1>
                  {provider.verification_status === 'approved' && (
                    <CheckCircle className="w-6 h-6 text-teal" />
                  )}
                </div>
                
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold">{provider.rating}</span>
                    <span className="text-muted-foreground">({provider.total_reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Award className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{provider.years_experience} years experience</span>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{provider.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {provider.service_areas?.map((area, index) => (
                    <Badge key={index} variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                {provider.business_phone && (
                  <Button variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                )}
                {provider.business_email && (
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}
                {provider.business_website && (
                  <Button variant="outline" size="sm">
                    <Globe className="w-4 h-4 mr-2" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {provider.services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      {service.is_featured && (
                        <Badge className="bg-yellow-500 text-white">Featured</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{service.duration_minutes}min</span>
                      </div>
                      <Badge variant="outline">{service.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-teal">
                        ${service.base_price}
                      </span>
                      <Button size="sm" className="bg-teal hover:bg-teal/90">
                        Book Now
                      </Button>
                    </div>
                    {service.emergency_available && (
                      <Badge variant="outline" className="text-red-500 border-red-500 mt-2">
                        Emergency Available
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-4">
            {provider.portfolio_images && provider.portfolio_images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image */}
                <Card>
                  <CardContent className="p-0">
                    <img
                      src={provider.portfolio_images[selectedImage]}
                      alt="Portfolio"
                      className="w-full h-96 object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
                
                {/* Thumbnail Grid */}
                <div className="grid grid-cols-6 gap-2">
                  {provider.portfolio_images.map((image, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative overflow-hidden rounded-lg border-2 ${
                        selectedImage === index ? 'border-teal' : 'border-transparent'
                      }`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <img
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-16 object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No portfolio images</h3>
                  <p className="text-muted-foreground">This provider hasn't uploaded any portfolio images yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div className="space-y-4">
              {provider.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{review.reviewer_name}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating 
                                    ? 'text-yellow-400 fill-current' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground">{review.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider.business_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{provider.business_phone}</span>
                    </div>
                  )}
                  {provider.business_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{provider.business_email}</span>
                    </div>
                  )}
                  {provider.business_website && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span>{provider.business_website}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {provider.certifications && provider.certifications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {provider.certifications.map((cert, index) => (
                        <Badge key={index} variant="outline">
                          <Award className="w-3 h-3 mr-1" />
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProviderDetail;
