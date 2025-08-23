import { useState, useEffect, useCallback } from 'react';
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

const CART_STORAGE_KEY = 'servicenexus_shopping_cart';

export const useShoppingCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
          console.log('✅ Cart loaded from storage:', parsedCart.length, 'items');
        }
      }
    } catch (error) {
      console.error('❌ Error loading cart from storage:', error);
      localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setInitialized(true);
    }
  }, []);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (initialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        console.log('💾 Cart saved to storage:', items.length, 'items');
      } catch (error) {
        console.error('❌ Error saving cart to storage:', error);
      }
    }
  }, [items, initialized]);

  const addItem = useCallback((itemData: Omit<CartItem, 'id'>) => {
    console.log('🛒 Adding item to cart:', itemData);
    
    // Check if service already exists with same provider
    const existingItem = items.find(
      item => item.service_id === itemData.service_id && item.provider_id === itemData.provider_id
    );

    if (existingItem) {
      console.log('⚠️ Item already exists in cart');
      toast({
        title: "Already in cart",
        description: "This service from this provider is already in your cart",
        variant: "destructive"
      });
      return false;
    }

    // Check if service already exists with different provider
    const serviceExists = items.find(item => item.service_id === itemData.service_id);
    if (serviceExists) {
      console.log('⚠️ Service already exists with different provider');
      toast({
        title: "Service already selected",
        description: "You can only select one provider per service type. Remove the existing one first.",
        variant: "destructive"
      });
      return false;
    }

    // Create new item
    const newItem: CartItem = {
      ...itemData,
      id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    // Update state
    setItems(prevItems => {
      const newItems = [...prevItems, newItem];
      console.log('✅ Cart updated - total items:', newItems.length);
      return newItems;
    });

    toast({
      title: "Added to cart",
      description: `${itemData.service_title} has been added to your cart`,
    });

    return true;
  }, [items, toast]);

  const removeItem = useCallback((itemId: string) => {
    console.log('🗑️ Removing item from cart:', itemId);
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      console.log('✅ Item removed - remaining items:', newItems.length);
      return newItems;
    });
    
    toast({
      title: "Removed from cart",
      description: "Service has been removed from your cart",
    });
  }, [toast]);

  const updateItem = useCallback((itemId: string, updates: Partial<CartItem>) => {
    console.log('✏️ Updating cart item:', itemId, updates);
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    console.log('🧹 Clearing cart');
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  }, [toast]);

  const getTotalPrice = useCallback(() => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    console.log('💰 Total price calculated:', total);
    return total;
  }, [items]);

  const itemCount = items.length;

  console.log('🛒 Current cart state:', { itemCount, initialized });

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearCart,
    getTotalPrice,
    itemCount,
    initialized
  };
};