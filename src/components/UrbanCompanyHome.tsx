
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Search, Clock, Shield, Award, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
}

interface FeaturedService {
  id: string;
  title: string;
  description: string;
  base_price: number;
  duration_minutes: number;
  provider: {
    business_name: string;
    rating: number;
    total_reviews: number;
  };
  category: {
    name: string;
  };
}

const UrbanCompanyHome = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [featuredServices, setFeaturedServices] = useState<FeaturedService[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Load service categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Load featured services with provider and category info
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select(`
          id,
          title,
          description,
          base_price,
          duration_minutes,
          provider_profiles!inner (
            business_name,
            rating,
            total_reviews
          ),
          service_categories!inner (
            name
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(6);

      if (servicesError) {
        console.error('Error loading featured services:', servicesError);
      } else {
        const formattedServices = servicesData?.map(service => ({
          id: service.id,
          title: service.title,
          description: service.description || '',
          base_price: service.base_price,
          duration_minutes: service.duration_minutes,
          provider: {
            business_name: (service.provider_profiles as any)?.business_name || '',
            rating: (service.provider_profiles as any)?.rating || 0,
            total_reviews: (service.provider_profiles as any)?.total_reviews || 0,
          },
          category: {
            name: (service.service_categories as any)?.name || '',
          },
        })) || [];
        
        setFeaturedServices(formattedServices);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigate(`/services?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/services?category=${encodeURIComponent(categoryName)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Home services, on-demand
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Trusted professionals for all your home needs. Book instantly, get quality service.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto flex gap-2 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} size="lg" className="h-12 px-8">
              Search
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10M+</div>
              <div className="text-sm text-muted-foreground">Services delivered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-sm text-muted-foreground">Trusted professionals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">4.8</div>
              <div className="text-sm text-muted-foreground">Average rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">15min</div>
              <div className="text-sm text-muted-foreground">Avg response time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Popular Categories
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose from our wide range of home services
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary/20"
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <div className="text-2xl">{category.name.charAt(0)}</div>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground mb-1">
                    {category.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Featured Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Top-rated services from our trusted professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="text-xs">
                      {service.category.name}
                    </Badge>
                    <div className="text-right">
                      <div className="font-bold text-lg text-foreground">
                        ${service.base_price}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(service.duration_minutes / 60)}h {service.duration_minutes % 60}m
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm text-foreground">
                        {service.provider.business_name}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {service.provider.rating.toFixed(1)} ({service.provider.total_reviews})
                      </div>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/service/${service.id}`)}>
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Us?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make home services simple, reliable, and affordable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Verified Professionals</h3>
              <p className="text-sm text-muted-foreground">
                All service providers are background-checked and verified
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">On-Time Service</h3>
              <p className="text-sm text-muted-foreground">
                Guaranteed on-time arrival and completion
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Quality Assured</h3>
              <p className="text-sm text-muted-foreground">
                30-day service guarantee on all bookings
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Trusted by Millions</h3>
              <p className="text-sm text-muted-foreground">
                Over 10 million satisfied customers nationwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to book your service?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join millions of satisfied customers. Book your first service today.
          </p>
          
          {user ? (
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/services')}
            >
              Browse Services
            </Button>
          ) : (
            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="text-lg px-8 py-3"
                onClick={() => navigate('/auth')}
              >
                Sign Up
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-3 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                onClick={() => navigate('/services')}
              >
                Browse Services
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UrbanCompanyHome;
