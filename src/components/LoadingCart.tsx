
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface LoadingCartProps {
  message?: string;
  showIcon?: boolean;
}

export const LoadingCart: React.FC<LoadingCartProps> = ({ 
  message = "Loading cart...", 
  showIcon = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center p-8 space-y-4"
    >
      <div className="relative">
        {showIcon && (
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.7, 1, 0.7] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="p-4 bg-teal/10 rounded-full"
          >
            <ShoppingCart className="w-8 h-8 text-teal" />
          </motion.div>
        )}
        
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full shadow-sm"
        >
          <Loader2 className="w-4 h-4 text-teal" />
        </motion.div>
      </div>
      
      <div className="text-center">
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-foreground"
        >
          {message}
        </motion.p>
        
        <motion.div 
          className="flex space-x-1 justify-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-teal rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export const LoadingCartSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="h-3 bg-muted rounded w-20"></div>
                <div className="h-3 bg-muted rounded w-24"></div>
              </div>
              <div className="h-8 bg-muted rounded w-8"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
