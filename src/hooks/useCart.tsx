
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  service_id: string;
  provider_id: string;
  service_title: string;
  provider_name: string;
  price: number;
  duration_minutes: number;
  scheduled_date?: string;
  special_instructions?: string;
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('servicenexus_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('servicenexus_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('servicenexus_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    // Check if service already exists with same provider (no duplicates allowed)
    const existingItem = cartItems.find(
      cartItem => cartItem.service_id === item.service_id && cartItem.provider_id === item.provider_id
    );

    if (existingItem) {
      toast({
        title: "Already in cart",
        description: "This service from this provider is already in your cart",
        variant: "destructive"
      });
      return false;
    }

    // Check if service already exists with different provider (only one provider per service)
    const serviceExists = cartItems.find(cartItem => cartItem.service_id === item.service_id);
    if (serviceExists) {
      toast({
        title: "Service already selected",
        description: "You can only select one provider per service type. Remove the existing one first.",
        variant: "destructive"
      });
      return false;
    }

    const newItem: CartItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    setCartItems(prev => [...prev, newItem]);
    toast({
      title: "Added to cart",
      description: `${item.service_title} has been added to your cart`,
    });
    return true;
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast({
      title: "Removed from cart",
      description: "Service has been removed from your cart",
    });
  };

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('servicenexus_cart');
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const getItemCount = () => {
    return cartItems.length;
  };

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getTotalPrice,
    itemCount: getItemCount()
  };
};
