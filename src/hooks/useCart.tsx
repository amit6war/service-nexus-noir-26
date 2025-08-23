
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
        const parsed = JSON.parse(savedCart);
        console.log('Loading cart from localStorage:', parsed);
        setCartItems(parsed);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('servicenexus_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes (backup save)
  useEffect(() => {
    console.log('useEffect - Cart items changed:', cartItems);
    if (cartItems.length >= 0) {
      localStorage.setItem('servicenexus_cart', JSON.stringify(cartItems));
      console.log('useEffect - Cart saved to localStorage:', cartItems);
    }
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    console.log('addToCart called with:', item);
    
    // Check if service already exists with same provider (no duplicates allowed)
    const existingItem = cartItems.find(
      cartItem => cartItem.service_id === item.service_id && cartItem.provider_id === item.provider_id
    );

    if (existingItem) {
      console.log('Item already exists in cart');
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
      console.log('Service already exists with different provider');
      toast({
        title: "Service already selected",
        description: "You can only select one provider per service type. Remove the existing one first.",
        variant: "destructive"
      });
      return false;
    }

    const newItem: CartItem = {
      ...item,
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    console.log('Adding new item to cart:', newItem);
    
    // Use functional update to ensure we get the latest state
    setCartItems(prevItems => {
      const updatedItems = [...prevItems, newItem];
      console.log('Cart state updated - new items array:', updatedItems);
      // Save to localStorage immediately in the state update
      try {
        localStorage.setItem('servicenexus_cart', JSON.stringify(updatedItems));
        console.log('Cart saved to localStorage:', updatedItems);
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
      return updatedItems;
    });
    
    toast({
      title: "Added to cart",
      description: `${item.service_title} has been added to your cart`,
    });
    return true;
  };

  const removeFromCart = (itemId: string) => {
    console.log('Removing item from cart:', itemId);
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      console.log('Cart updated after removal:', updatedItems);
      return updatedItems;
    });
    toast({
      title: "Removed from cart",
      description: "Service has been removed from your cart",
    });
  };

  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    console.log('Updating cart item:', itemId, updates);
    setCartItems(prevItems => prevItems.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  };

  const clearCart = () => {
    console.log('Clearing cart');
    setCartItems([]);
    localStorage.removeItem('servicenexus_cart');
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  };

  const getTotalPrice = () => {
    const total = cartItems.reduce((total, item) => total + item.price, 0);
    console.log('Total price calculated:', total);
    return total;
  };

  const itemCount = cartItems.length;
  console.log('Current cart state - items:', cartItems.length, 'itemCount:', itemCount);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getTotalPrice,
    itemCount
  };
};
