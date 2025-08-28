
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const UrbanCompanyHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy/90 to-teal/20">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold text-white">
          Service N-B
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white/80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">New Brunswick</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
          {user ? (
            <Button 
              variant="outline" 
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="border-teal text-teal hover:bg-teal hover:text-white"
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Find <span className="text-teal">Trusted Services</span>
            <br />
            in New Brunswick
          </h1>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            Connect with verified local service providers for all your needs
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Button 
            size="lg" 
            className="bg-teal hover:bg-teal/90 text-white px-8 py-4 text-lg"
            onClick={() => navigate('/services')}
          >
            Find Services
            <Search className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="border-teal text-teal hover:bg-teal hover:text-white px-8 py-4 text-lg"
            onClick={() => navigate('/auth')}
          >
            Become a Provider
          </Button>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-teal">500+</div>
            <div className="text-sm text-white/60">Verified Professionals</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal">10K+</div>
            <div className="text-sm text-white/60">Services Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal">4.8</div>
            <div className="text-sm text-white/60">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-teal">24/7</div>
            <div className="text-sm text-white/60">Support Available</div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">👤</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Verified Professionals</h3>
              <p className="text-white/70">All service providers are background-checked and verified</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">⭐</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Quality Assured</h3>
              <p className="text-white/70">Rated services with customer reviews and satisfaction guarantee</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white/5 backdrop-blur-sm">
              <div className="w-16 h-16 bg-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🕐</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">On-Time Service</h3>
              <p className="text-white/70">Reliable professionals committed to punctuality</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default UrbanCompanyHome;
