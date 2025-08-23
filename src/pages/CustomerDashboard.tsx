import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Heart, ShoppingCart, Star, Clock, MapPin, Bell, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useServices } from '@/hooks/useServices';
import { useCart } from '@/hooks/useCart';
import ServiceProviderFlow from '@/components/ServiceProviderFlow';
import CartSidebar from '@/components/CartSidebar';
import BookingFlow from '@/components/BookingFlow';

const CustomerDashboard = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedService, setSelectedService] = useState(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showCart, setShowCart] = useState(false);
  
  const { user, signOut } = useAuth();
  const { services, loading, error } = useServices();
  const { cartItems, itemCount } = useCart();

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setActiveTab('providers');
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setShowBookingFlow(true);
  };

  const handleBookingComplete = () => {
    setShowBookingFlow(false);
    setSelectedService(null);
    setSelectedProvider(null);
    setActiveTab('browse');
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const category = service.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col fixed left-0 top-0 h-full z-10">
        {/* User Profile Section */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-teal" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Welcome back!</h2>
              <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'browse' 
                ? 'bg-teal/10 text-teal border border-teal/20' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Star className="w-5 h-5" />
            Browse Services
          </button>
          
          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'bookings' 
                ? 'bg-teal/10 text-teal border border-teal/20' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Calendar className="w-5 h-5" />
            My Bookings
          </button>
          
          <button
            onClick={() => setActiveTab('favorites')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'favorites' 
                ? 'bg-teal/10 text-teal border border-teal/20' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Heart className="w-5 h-5" />
            Favorites
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'notifications' 
                ? 'bg-teal/10 text-teal border border-teal/20' 
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Bell className="w-5 h-5" />
            Notifications
          </button>
        </nav>

        {/* Cart and Sign Out */}
        <div className="p-4 border-t border-border space-y-2">
          <button
            onClick={() => setShowCart(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-muted-foreground hover:bg-muted hover:text-foreground relative"
          >
            <ShoppingCart className="w-5 h-5" />
            Cart
            {itemCount > 0 && (
              <Badge className="ml-auto bg-teal text-white">{itemCount}</Badge>
            )}
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area - with left margin to account for fixed sidebar */}
      <div className="flex-1 ml-64">
        <div className="h-screen overflow-y-auto">
          <div className="p-6">
            {/* Browse Services Tab */}
            {activeTab === 'browse' && !selectedService && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">Browse Services</h1>
                  <p className="text-muted-foreground">Find the perfect service for your needs</p>
                </div>

                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading services...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center py-12">
                    <p className="text-red-500 mb-4">Error loading services: {error}</p>
                    <Button onClick={() => window.location.reload()} variant="outline">
                      Retry
                    </Button>
                  </div>
                )}

                {!loading && !error && Object.keys(servicesByCategory).length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No services available at the moment.</p>
                  </div>
                )}

                {!loading && !error && Object.keys(servicesByCategory).map((category) => (
                  <div key={category} className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {servicesByCategory[category].map((service) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="group"
                        >
                          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                            <CardHeader>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <CardTitle className="flex items-center gap-2">
                                    {service.title}
                                    {service.is_featured && (
                                      <Badge className="bg-yellow-500 text-white">Featured</Badge>
                                    )}
                                    {service.emergency_available && (
                                      <Badge variant="outline" className="text-red-500 border-red-500">Emergency</Badge>
                                    )}
                                  </CardTitle>
                                  <CardDescription className="mt-2">
                                    {service.description}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                   <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-1">
                                       <Clock className="w-4 h-4 text-muted-foreground" />
                                       <span>{service.duration_minutes} min</span>
                                     </div>
                                     <div className="flex items-center gap-1">
                                       <User className="w-4 h-4 text-muted-foreground" />
                                       <span>6+ providers</span>
                                     </div>
                                   </div>
                                 </div>
                                 
                                 <div className="flex items-center justify-between">
                                   <div className="text-right">
                                     <span className="text-lg font-bold text-teal">
                                       Starting from ${Math.round(service.base_price * 0.6)}
                                     </span>
                                     <span className="text-muted-foreground">
                                       {service.price_type === 'hourly' ? '/hr' : ''}
                                     </span>
                                   </div>
                                </div>
                                
                                <Button 
                                  onClick={() => handleServiceSelect(service)}
                                  className="w-full bg-teal hover:bg-teal/90"
                                >
                                  View Providers
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Service Provider Selection */}
            {activeTab === 'providers' && selectedService && (
              <ServiceProviderFlow
                selectedService={selectedService}
                onBack={() => {
                  setSelectedService(null);
                  setActiveTab('browse');
                }}
                onBookService={handleProviderSelect}
              />
            )}

            {/* Other Tabs */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">My Bookings</h1>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No bookings yet. Browse services to get started!</p>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Favorites</h1>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No favorites yet. Browse services and save your preferred providers!</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No notifications at the moment.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking Flow Modal */}
      {showBookingFlow && selectedService && selectedProvider && (
        <BookingFlow
          service={selectedService}
          provider={selectedProvider}
          onClose={() => setShowBookingFlow(false)}
          onComplete={handleBookingComplete}
        />
      )}

      {/* Cart Sidebar */}
      <CartSidebar isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
};

export default CustomerDashboard;
