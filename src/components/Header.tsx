
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bell, MapPin, Menu, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationCount] = useState(3);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[Header] Logout button clicked');
    
    try {
      const { error } = await signOut();
      if (!error) {
        console.log('[Header] Logout successful, redirecting to home');
        // The signOut function now handles navigation
      } else {
        console.error('[Header] Logout failed:', error);
      }
    } catch (error) {
      console.error('[Header] Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-navy/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="md:hidden">
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-1 rounded-lg hover:bg-secondary transition-colors"
              >
                <Menu className="w-6 h-6 text-foreground" />
              </motion.button>
            </div>
            <motion.h1 
              className="text-xl font-bold text-gradient cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
              onClick={() => navigate('/')}
            >
              ServiceLink NB
            </motion.h1>
          </motion.div>

          {/* Desktop Search */}
          <motion.div 
            className="hidden md:flex flex-1 max-w-md mx-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <motion.div 
              className="relative w-full"
              animate={{
                scale: searchFocused ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <motion.input
                type="text"
                placeholder="Search services..."
                className="input-dark w-full pl-11 pr-4"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                whileFocus={{
                  borderColor: "hsl(var(--teal))",
                  boxShadow: "0 0 0 2px rgba(78, 205, 196, 0.2)",
                }}
                transition={{ duration: 0.2 }}
                aria-label="Search services"
              />
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-px bg-teal transform-gpu"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: searchFocused ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{ originX: 0 }}
              />
            </motion.div>
          </motion.div>

          {/* Right Section */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Location */}
            <motion.div 
              className="hidden sm:flex items-center gap-2 text-muted-foreground"
              whileHover={{ scale: 1.05, color: "hsl(var(--teal))" }}
              transition={{ duration: 0.2 }}
            >
              <MapPin className="w-4 h-4" />
              <span className="text-sm">New Brunswick</span>
            </motion.div>

            {/* Mobile Search */}
            <motion.button 
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Search className="w-5 h-5 text-foreground" />
            </motion.button>

            {/* Notifications - only show for authenticated users */}
            {user && (
              <motion.button 
                type="button"
                className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={notificationCount > 0 ? {
                    rotate: [0, -10, 10, -10, 0],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                >
                  <Bell className="w-5 h-5 text-foreground" />
                </motion.div>
                {notificationCount > 0 && (
                  <motion.span 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-teal text-white text-xs rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 500, 
                      damping: 30,
                      delay: 0.3 
                    }}
                  >
                    {notificationCount}
                  </motion.span>
                )}
              </motion.button>
            )}

            {/* Profile / Auth Section */}
            {user ? (
              <motion.div className="flex items-center gap-2">
                <motion.button 
                  type="button"
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="w-8 h-8 bg-gradient-to-br from-teal/20 to-teal/10 rounded-full flex items-center justify-center"
                    whileHover={{ 
                      background: "linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(78, 205, 196, 0.15))" 
                    }}
                  >
                    <User className="w-4 h-4 text-teal" />
                  </motion.div>
                  <span className="hidden md:block text-sm text-foreground">Profile</span>
                </motion.button>
                <motion.button
                  onClick={handleSignOut}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ) : (
              <motion.button
                onClick={() => navigate('/auth')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary px-4 py-2 text-sm"
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
