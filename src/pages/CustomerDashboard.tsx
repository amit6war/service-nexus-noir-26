import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Search, 
  Calendar, 
  MessageSquare, 
  Heart, 
  CreditCard, 
  Bell, 
  Settings, 
  User, 
  HelpCircle, 
  Star, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Plus,
  Filter,
  Zap,
  Gift,
  Users,
  Phone,
  Shield,
  LogOut,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceBrowser from '@/components/ServiceBrowser';
import CartSidebar from '@/components/CartSidebar';
import { useCart } from '@/hooks/useCart';

interface ServiceRequest {
  id: string;
  service_name: string;
  provider_name: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string;
  price: number;
  description: string;
  provider_avatar?: string;
}

interface FavoriteProvider {
  id: string;
  name: string;
  rating: number;
  services: string[];
  avatar?: string;
  verified: boolean;
}

interface PaymentHistory {
  id: string;
  service_name: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  invoice_url?: string;
}

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { itemCount } = useCart();
  const [activeTab, setActiveTab] = useState('overview');
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [favoriteProviders, setFavoriteProviders] = useState<FavoriteProvider[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [notifications, setNotifications] = useState(3);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Mock service requests
        setServiceRequests([
          {
            id: '1',
            service_name: 'House Cleaning',
            provider_name: 'CleanPro Services',
            status: 'in_progress',
            scheduled_date: '2024-01-15T10:00:00Z',
            price: 120,
            description: 'Deep cleaning for 3-bedroom house'
          },
          {
            id: '2',
            service_name: 'Plumbing Repair',
            provider_name: 'Fix-It Fast',
            status: 'completed',
            scheduled_date: '2024-01-10T14:00:00Z',
            price: 85,
            description: 'Kitchen sink leak repair'
          }
        ]);

        // Mock favorite providers
        setFavoriteProviders([
          {
            id: '1',
            name: 'CleanPro Services',
            rating: 4.8,
            services: ['House Cleaning', 'Office Cleaning'],
            verified: true
          },
          {
            id: '2',
            name: 'GreenThumb Landscaping',
            rating: 4.9,
            services: ['Lawn Care', 'Garden Design'],
            verified: true
          }
        ]);

        // Mock payment history
        setPaymentHistory([
          {
            id: '1',
            service_name: 'House Cleaning',
            amount: 120,
            date: '2024-01-15',
            status: 'completed'
          },
          {
            id: '2',
            service_name: 'Plumbing Repair',
            amount: 85,
            date: '2024-01-10',
            status: 'completed'
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'in_progress': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Zap className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'services', label: 'Browse Services', icon: Search },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'favorites', label: 'Favorite Providers', icon: Heart },
    { id: 'payments', label: 'Payments & Billing', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

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

  return (
    <div className="min-h-screen bg-navy">
      <div className="flex">
        {/* Sidebar */}
        <motion.div 
          className="w-64 bg-card border-r border-border min-h-screen"
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* User Profile Section */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-teal text-white">
                  {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">
                  {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                </h3>
                <p className="text-sm text-muted-foreground">Customer</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <motion.button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === item.id
                          ? 'bg-teal/10 text-teal border border-teal/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                      {item.id === 'notifications' && notifications > 0 && (
                        <Badge className="ml-auto bg-red-500 text-white text-xs">
                          {notifications}
                        </Badge>
                      )}
                    </motion.button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sign Out */}
          <div className="absolute bottom-4 left-4 right-4">
            <motion.button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header with Cart */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {activeTab === 'overview' && `Welcome back, ${user?.user_metadata?.first_name || 'Customer'}!`}
                {activeTab === 'services' && 'Browse Services'}
                {activeTab === 'bookings' && 'My Bookings'}
                {activeTab === 'messages' && 'Messages'}
                {activeTab === 'favorites' && 'Favorite Providers'}
                {activeTab === 'payments' && 'Payments & Billing'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'profile' && 'Profile Settings'}
                {activeTab === 'security' && 'Security'}
                {activeTab === 'help' && 'Help & Support'}
              </h1>
              {activeTab === 'overview' && (
                <p className="text-muted-foreground">
                  Here's what's happening with your services today.
                </p>
              )}
            </div>
            
            <Button
              onClick={() => setCartOpen(true)}
              className="relative bg-teal hover:bg-teal/90"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Bookings</p>
                          <p className="text-2xl font-bold text-foreground">3</p>
                        </div>
                        <Calendar className="w-8 h-8 text-teal" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Favorite Providers</p>
                          <p className="text-2xl font-bold text-foreground">{favoriteProviders.length}</p>
                        </div>
                        <Heart className="w-8 h-8 text-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">This Month Spent</p>
                          <p className="text-2xl font-bold text-foreground">$205</p>
                        </div>
                        <CreditCard className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Items in Cart</p>
                          <p className="text-2xl font-bold text-foreground">{itemCount}</p>
                        </div>
                        <ShoppingCart className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Get started with common tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() => setActiveTab('services')}
                        className="bg-teal hover:bg-teal/90 h-auto p-4 flex-col"
                      >
                        <Search className="w-6 h-6 mb-2" />
                        <span>Browse Services</span>
                      </Button>
                      
                      <Button
                        onClick={() => setActiveTab('bookings')}
                        variant="outline"
                        className="h-auto p-4 flex-col"
                      >
                        <Calendar className="w-6 h-6 mb-2" />
                        <span>View Bookings</span>
                      </Button>
                      
                      <Button
                        onClick={() => setCartOpen(true)}
                        variant="outline"
                        className="h-auto p-4 flex-col"
                      >
                        <ShoppingCart className="w-6 h-6 mb-2" />
                        <span>View Cart ({itemCount})</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Service Requests */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Service Requests
                    </CardTitle>
                    <CardDescription>
                      Track the status of your recent bookings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {serviceRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(request.status)}`} />
                            <div>
                              <h4 className="font-medium text-foreground">{request.service_name}</h4>
                              <p className="text-sm text-muted-foreground">{request.provider_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(request.status)}
                              <Badge variant="outline" className="capitalize">
                                {request.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ${request.price}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* AI Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-500" />
                      Recommended for You
                    </CardTitle>
                    <CardDescription>
                      Based on your booking history and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🧹</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">Weekly Cleaning</h4>
                            <p className="text-sm text-muted-foreground">CleanPro Services</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">4.8</span>
                          </div>
                          <span className="text-sm font-medium text-teal">$100/week</span>
                        </div>
                      </motion.div>
                      
                      <motion.div
                        className="p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                            <span className="text-lg">🌱</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">Lawn Maintenance</h4>
                            <p className="text-sm text-muted-foreground">GreenThumb Landscaping</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm">4.9</span>
                          </div>
                          <span className="text-sm font-medium text-teal">$75/month</span>
                        </div>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <motion.div
                key="services"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ServiceBrowser />
              </motion.div>
            )}

            {activeTab === 'bookings' && (
              <motion.div
                key="bookings"  
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">My Bookings</h2>
                    <p className="text-muted-foreground">Track your service requests and appointments</p>
                  </div>
                  <Button
                    onClick={() => setActiveTab('services')}
                    className="bg-teal hover:bg-teal/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Book New Service
                  </Button>
                </div>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All Bookings</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    {serviceRequests.length === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
                          <p className="text-muted-foreground mb-4">Start by browsing our available services</p>
                          <Button
                            onClick={() => setActiveTab('services')}
                            className="bg-teal hover:bg-teal/90"
                          >
                            Browse Services
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      serviceRequests.map((request) => (
                        <Card key={request.id}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Avatar>
                                  <AvatarFallback>{request.provider_name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold text-foreground">{request.service_name}</h3>
                                  <p className="text-muted-foreground">{request.provider_name}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className={`mb-2 ${getStatusColor(request.status)} text-white`}>
                                  {request.status.replace('_', ' ')}
                                </Badge>
                                <p className="text-lg font-semibold text-foreground">${request.price}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(request.scheduled_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-bold text-foreground">Favorite Providers</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteProviders.map((provider) => (
                    <Card key={provider.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar>
                            <AvatarFallback>{provider.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-foreground flex items-center gap-2">
                              {provider.name}
                              {provider.verified && (
                                <CheckCircle className="w-4 h-4 text-teal" />
                              )}
                            </h3>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm">{provider.rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Services:</p>
                          <div className="flex flex-wrap gap-1">
                            {provider.services.map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            Book Again
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-foreground">Payments & Billing</h1>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
                
                {/* Payment Methods */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">•••• •••• •••• 4242</p>
                            <p className="text-sm text-muted-foreground">Expires 12/25</p>
                          </div>
                        </div>
                        <Badge>Default</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Payment History */}
                <Card>
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                          <div>
                            <p className="font-medium text-foreground">{payment.service_name}</p>
                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">${payment.amount}</p>
                            <div className="flex items-center gap-2">
                              <Badge className={payment.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                                {payment.status}
                              </Badge>
                              <Button size="sm" variant="ghost">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-bold text-foreground">Messages</h1>
                <Card>
                  <CardContent className="p-6 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
                    <p className="text-muted-foreground">Your conversations with service providers will appear here.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">First Name</label>
                        <input 
                          type="text" 
                          className="input-dark w-full mt-1" 
                          defaultValue={user?.user_metadata?.first_name || ''}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground">Last Name</label>
                        <input 
                          type="text" 
                          className="input-dark w-full mt-1" 
                          defaultValue={user?.user_metadata?.last_name || ''}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <input 
                        type="email" 
                        className="input-dark w-full mt-1" 
                        defaultValue={user?.email || ''}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Phone</label>
                      <input 
                        type="tel" 
                        className="input-dark w-full mt-1" 
                        defaultValue={user?.user_metadata?.phone || ''}
                      />
                    </div>
                    <Button className="bg-teal hover:bg-teal/90">
                      Save Changes
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

export default CustomerDashboard;
