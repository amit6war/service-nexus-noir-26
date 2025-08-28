
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface CartItem {
  id: string;
  service_id: string;
  provider_id: string;
  service_name: string;
  provider_name: string;
  base_price: number;
  final_price: number;
  duration_minutes: number;
  slot_start_time?: string;
  slot_end_time?: string;
  service_description?: string;
  location_address?: string;
  notes?: string;
  category?: string;
  subcategory?: string;
  provider_avatar_url?: string;
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  // Load cart data from database
  const loadCart = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      console.log('📦 Loading cart for user:', user.id);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (mountedRef.current) {
        setItems(data || []);
        console.log('✅ Cart loaded:', data?.length || 0, 'items');
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error);
      if (mountedRef.current) {
        toast({
          title: "Cart Error",
          description: "Failed to load cart items.",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [user?.id, toast]);

  // Initialize cart
  useEffect(() => {
    mountedRef.current = true;
    loadCart();

    return () => {
      mountedRef.current = false;
    };
  }, [loadCart]);

  // Add item to cart with instant UI update
  const addItem = useCallback(async (itemData: Omit<CartItem, 'id'>) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicates
    const exists = items.find(
      item => item.service_id === itemData.service_id && item.provider_id === itemData.provider_id
    );

    if (exists) {
      toast({
        title: "Item Already in Cart",
        description: "This service is already in your cart.",
        variant: "destructive",
      });
      return false;
    }

    // Create optimistic item with temporary ID
    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const optimisticItem: CartItem = {
      id: tempId,
      ...itemData
    };

    // Instant UI update
    setItems(prevItems => [...prevItems, optimisticItem]);

    try {
      console.log('➕ Adding item to cart:', itemData.service_name);

      // Make API call
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          ...itemData
        })
        .select()
        .single();

      if (error) throw error;

      // Replace optimistic item with real item
      setItems(prevItems => 
        prevItems.map(item => item.id === tempId ? data : item)
      );

      toast({
        title: "Added to Cart",
        description: `${itemData.service_name} added successfully.`,
      });

      return true;
    } catch (error) {
      console.error('❌ Add item failed:', error);
      
      // Rollback optimistic update
      setItems(prevItems => prevItems.filter(item => item.id !== tempId));
      
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [user?.id, items, toast]);

  // Remove item from cart with instant UI update
  const removeItem = useCallback(async (itemId: string) => {
    if (!user?.id) return false;

    const itemToRemove = items.find(item => item.id === itemId);
    if (!itemToRemove) return false;

    // Instant UI update
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));

    try {
      console.log('➖ Removing item from cart:', itemId);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Removed from Cart",
        description: `${itemToRemove.service_name} removed successfully.`,
      });

      return true;
    } catch (error) {
      console.error('❌ Remove item failed:', error);
      
      // Rollback optimistic update
      setItems(prevItems => [...prevItems, itemToRemove]);
      
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [user?.id, items, toast]);

  // Clear entire cart with instant UI update
  const clearCart = useCallback(async () => {
    if (!user?.id) return false;

    const originalItems = [...items];

    // Instant UI update
    setItems([]);

    try {
      console.log('🧹 Clearing cart for user:', user.id);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Cart Cleared",
        description: "All items removed from cart.",
      });

      return true;
    } catch (error) {
      console.error('❌ Clear cart failed:', error);
      
      // Rollback optimistic update
      setItems(originalItems);
      
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [user?.id, items, toast]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((sum, item) => sum + item.final_price, 0);
  }, [items]);

  const itemCount = items.length;

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalPrice,
    itemCount,
    loading,
    refreshCart: loadCart
  };
};
