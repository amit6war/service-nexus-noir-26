
import React from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Calendar, User } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Home', active: true },
    { icon: Search, label: 'Services', active: false },
    { icon: Calendar, label: 'Bookings', active: false },
    { icon: User, label: 'Profile', active: false },
  ];

  return (
    <motion.div 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => (
          <motion.button
            key={index}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-300 ${
              item.active 
                ? 'text-teal bg-teal/10' 
                : 'text-muted-foreground hover:text-teal'
            }`}
            whileHover={{ 
              scale: 1.1,
              y: item.active ? -2 : -1
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 30,
              scale: { duration: 0.6, ease: "easeInOut" }
            }}
            animate={item.active ? {
              scale: [1, 1.05, 1],
            } : {}}
          >
            <motion.div
              whileHover={{ rotate: item.active ? [0, -5, 5, 0] : 0 }}
              transition={{ duration: 0.3 }}
            >
              <item.icon className="w-5 h-5" />
            </motion.div>
            <motion.span 
              className="text-xs font-medium"
              animate={item.active ? {
                fontWeight: 600,
              } : {
                fontWeight: 500,
              }}
            >
              {item.label}
            </motion.span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default MobileBottomNav;
