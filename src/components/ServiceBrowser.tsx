
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin, Clock, Plus, ShoppingCart, Eye, SlidersHorizontal, Award, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { useServices, Service } from '@/hooks/useServices';
import { useCart } from '@/hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ServiceProviderFlow from './ServiceProviderFlow';

const ServiceBrowser = () => {
  const { services, loading, error, refetch } = useServices();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider_profile?.business_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    const matchesPrice = service.base_price >= priceRange[0] && service.base_price <= priceRange[1];
    const matchesRating = !service.provider_profile || service.provider_profile.rating >= minRating;
    const matchesEmergency = !emergencyOnly || service.emergency_available;
    const matchesFeatured = !featuredOnly || service.is_featured;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesEmergency && matchesFeatured;
  });

  const categories = [...new Set(services.map(service => service.category))];

  const handleViewProviders = (service: Service) => {
    setSelectedService(service);
  };

  const handleBookService = (provider: any) => {
    // Navigate to checkout or booking page
    navigate('/checkout');
    toast({
      title: 'Booking initiated',
      description: `Booking ${selectedService?.title} with ${provider?.business_name}`,
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange([0, 500]);
    setMinRating(0);
    setEmergencyOnly(false);
    setFeaturedOnly(false);
  };

  // Show service provider flow if a service is selected
  if (selectedService) {
    return (
      <ServiceProviderFlow
        selectedService={selectedService}
        onBack={() => setSelectedService(null)}
        onBookService={handleBookService}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-teal border-t-transparent rounded-full"
        />
        <span className="ml-3 text-muted-foreground">Loading services...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <p className="text-red-500">Error loading services: {error}</p>
        <Button onClick={refetch} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Browse Services</h2>
        <Badge className="bg-teal text-white">
          {filteredServices.length} services available
        </Badge>
      </div>

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search services, providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-background text-foreground min-w-[150px]"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Price Range */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                </div>

                {/* Minimum Rating */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Minimum Rating: {minRating} stars
                  </label>
                  <Slider
                    value={[minRating]}
                    onValueChange={(value) => setMinRating(value[0])}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>

                {/* Emergency Services */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency"
                    checked={emergencyOnly}
                    onCheckedChange={(checked) => setEmergencyOnly(checked === true)}
                  />
                  <label htmlFor="emergency" className="text-sm font-medium text-foreground">
                    Emergency Services Only
                  </label>
                </div>

                {/* Featured Services */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={featuredOnly}
                    onCheckedChange={(checked) => setFeaturedOnly(checked === true)}
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-foreground">
                    Featured Services Only
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full hover:shadow-lg transition-shadow">
              {/* Service Image */}
              {service.images && service.images.length > 0 && (
                <div className="h-48 overflow-hidden rounded-t-lg">
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="text-sm flex items-center gap-2">
                      {service.provider_profile?.portfolio_images &&
                        service.provider_profile.portfolio_images.length > 0 && (
                          <img
                            src={service.provider_profile.portfolio_images[0]}
                            alt={service.provider_profile.business_name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        )}
                      Multiple providers available
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-1">
                    {service.is_featured && (
                      <Badge className="bg-yellow-500 text-white text-xs">Featured</Badge>
                    )}
                    {service.emergency_available && (
                      <Badge variant="outline" className="text-red-500 border-red-500 text-xs">
                        Emergency
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{service.duration_minutes}min</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>6+ providers</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handleViewProviders(service)}
                      className="bg-teal hover:bg-teal/90 flex-1"
                      size="sm"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      View Providers
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No services found matching your criteria.</p>
          <Button onClick={clearFilters} className="mt-4" variant="outline">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ServiceBrowser;
