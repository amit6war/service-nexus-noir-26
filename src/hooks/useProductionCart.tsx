
import { useState, useEffect, useCallback } from 'react';
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

export const useProductionCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart from Supabase
  const loadCart = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initialize cart
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Add item to cart - INSTANT UI UPDATE
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
        title: "Already in Cart",
        description: "This service is already in your cart.",
        variant: "destructive",
      });
      return false;
    }

    // Create optimistic item
    const tempId = `temp_${Date.now()}`;
    const optimisticItem: CartItem = { id: tempId, ...itemData };

    // INSTANT UI UPDATE
    setItems(prev => [...prev, optimisticItem]);

    // Show success toast immediately
    toast({
      title: "Added to Cart",
      description: `${itemData.service_name} added successfully.`,
    });

    try {
      // Background API call
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
      setItems(prev => 
        prev.map(item => item.id === tempId ? data : item)
      );

      return true;
    } catch (error) {
      console.error('Add item failed:', error);
      
      // Rollback on error
      setItems(prev => prev.filter(item => item.id !== tempId));
      
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [user?.id, items, toast]);

  // Remove item - INSTANT UI UPDATE
  const removeItem = useCallback(async (itemId: string) => {
    if (!user?.id) return false;

    const itemToRemove = items.find(item => item.id === itemId);
    if (!itemToRemove) return false;

    // INSTANT UI UPDATE
    setItems(prev => prev.filter(item => item.id !== itemId));

    // Show success toast immediately
    toast({
      title: "Removed from Cart",
      description: `${itemToRemove.service_name} removed successfully.`,
    });

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Remove item failed:', error);
      
      // Rollback on error
      setItems(prev => [...prev, itemToRemove]);
      
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [user?.id, items, toast]);

  // Clear cart - INSTANT UI UPDATE
  const clearCart = useCallback(async () => {
    if (!user?.id) return false;

    const originalItems = [...items];

    // INSTANT UI UPDATE
    setItems([]);

    toast({
      title: "Cart Cleared",
      description: "All items removed from cart.",
    });

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Clear cart failed:', error);
      
      // Rollback on error
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

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalPrice,
    itemCount: items.length,
    loading,
    refreshCart: loadCart
  };
};
