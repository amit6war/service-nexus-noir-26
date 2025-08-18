
import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';

interface ServiceCardProps {
  icon: string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  price: string;
  location: string;
  image?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  provider,
  rating,
  reviews,
  price,
  location,
  image
}) => {
  return (
    <motion.div 
      className="card-service group"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div 
        className="relative overflow-hidden rounded-lg mb-4"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.3 }}
      >
        {image ? (
          <motion.img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.4 }}
          />
        ) : (
          <motion.div 
            className="w-full h-48 bg-gradient-to-br from-teal/20 to-teal/10 flex items-center justify-center"
            whileHover={{
              background: "linear-gradient(135deg, rgba(78, 205, 196, 0.3), rgba(78, 205, 196, 0.15))"
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.span 
              className="text-6xl"
              whileHover={{ 
                scale: 1.2, 
                rotate: [0, -10, 10, 0] 
              }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.span>
          </motion.div>
        )}
        <motion.div 
          className="absolute top-3 right-3 bg-navy/80 backdrop-blur-sm px-2 py-1 rounded-lg"
          initial={{ opacity: 0.8 }}
          whileHover={{ opacity: 1, scale: 1.05 }}
        >
          <span className="text-teal text-sm font-semibold">{price}</span>
        </motion.div>
      </motion.div>
      
      <div className="space-y-2">
        <motion.h3 
          className="font-semibold text-lg text-foreground group-hover:text-teal transition-colors"
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {title}
        </motion.h3>
        
        <motion.p 
          className="text-muted-foreground text-sm"
          whileHover={{ x: 2 }}
          transition={{ type: "spring", stiffness: 400, delay: 0.05 }}
        >
          {provider}
        </motion.p>
        
        <div className="flex items-center gap-4 text-sm">
          <motion.div 
            className="flex items-center gap-1"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </motion.div>
            <span className="text-foreground font-medium">{rating}</span>
            <span className="text-muted-foreground">({reviews}+)</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-1 text-muted-foreground"
            whileHover={{ scale: 1.05, color: "hsl(var(--teal))" }}
          >
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </motion.div>
        </div>
        
        <motion.button 
          className="w-full btn-hero mt-4 text-base py-3"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 10px 25px rgba(78, 205, 196, 0.3)"
          }}
          whileTap={{ scale: 0.98 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30 
          }}
        >
          Book Now
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
