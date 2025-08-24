
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Heart, 
  ShoppingCart, 
  User, 
  Clock, 
  DollarSign,
  Star,
  MapPin,
  Phone,
  Settings,
  Bell,
  CreditCard,
  Shield,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useToast } from '@/hooks/use-toast';
import MyBookings from '@/components/MyBookings';
import FavoritesSection from '@/components/FavoritesSection';
import ProfileSettings from '@/components/ProfileSettings';
import { supabase } from '@/integrations/supabase/client';

const CustomerDashboard = () => {
  const { user, signOut } = useAuth();
  const { items } = useShoppingCart();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get the active tab from URL parameters or default to 'overview'
  const activeTab = searchParams.get('tab') || 'overview';

  // Set active tab and update URL
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    favoriteProviders: 0,
    cartItems: 0
  });

  const [loading, setLoading] = useState(true);

  // Load dashboard statistics
  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user?.id) return;

      try {
        setLoading(true);

        // Get booking statistics
        const { data: bookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('status, service_date')
          .eq('customer_id', user.id);

        if (bookingsError) {
          console.error('Error loading booking stats:', bookingsError);
        }

        // Get favorites count
        const { data: favorites, error: favoritesError } = await supabase
          .from('favorites')
          .select('id')
          .eq('customer_id', user.id);

        if (favoritesError) {
          console.error('Error loading favorites stats:', favoritesError);
        }

        // Calculate statistics
        const now = new Date();
        const totalBookings = bookings?.length || 0;
        const upcomingBookings = bookings?.filter(b => 
          new Date(b.service_date) > now && 
          (b.status === 'pending' || b.status === 'confirmed')
        ).length || 0;
        const completedBookings = bookings?.filter(b => 
          b.status === 'completed' || b.status === 'confirmed'
        ).length || 0;
        const favoriteProviders = favorites?.length || 0;

        setStats({
          totalBookings,
          upcomingBookings,
          completedBookings,
          favoriteProviders,
          cartItems: items.length
        });

      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard statistics.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [user?.id, items.length, toast]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.'
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const renderOverviewCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.totalBookings}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">{stats.upcomingBookings}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Favorites</p>
              <p className="text-2xl font-bold">{stats.favoriteProviders}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cart Items</p>
              <p className="text-2xl font-bold">{stats.cartItems}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
          <span className="ml-2 text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.user_metadata?.first_name || 'Customer'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your bookings, favorites, and account settings
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {stats.cartItems > 0 && (
            <Button variant="outline" className="relative">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              <Badge className="absolute -top-2 -right-2 bg-teal text-white">
                {stats.cartItems}
              </Badge>
            </Button>
          )}
          
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 gap-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Bookings</span>
          </TabsTrigger>
          <TabsTrigger value="favorites" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Favorites</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
            {renderOverviewCards()}
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('bookings')}
                  >
                    <Calendar className="w-6 h-6" />
                    <span>View Bookings</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setActiveTab('favorites')}
                  >
                    <Heart className="w-6 h-6" />
                    <span>Browse Favorites</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => window.location.href = '/'}
                  >
                    <Star className="w-6 h-6" />
                    <span>Find Services</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bookings">
          <MyBookings />
        </TabsContent>

        <TabsContent value="favorites">
          <FavoritesSection />
        </TabsContent>

        <TabsContent value="settings">
          <ProfileSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDashboard;
