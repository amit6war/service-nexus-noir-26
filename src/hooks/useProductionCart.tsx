
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

  console.log('🛒 useProductionCart render - items count:', items.length);

  // Load cart from Supabase
  const loadCart = useCallback(async () => {
    if (!user?.id) {
      console.log('🛒 No user, clearing cart');
      setItems([]);
      setLoading(false);
      return;
    }

    console.log('🛒 Loading cart from Supabase for user:', user.id);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error loading cart:', error);
        throw error;
      }
      
      console.log('✅ Cart loaded from Supabase:', data?.length || 0, 'items');
      setItems(data || []);
    } catch (error) {
      console.error('❌ Failed to load cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Initialize cart
  useEffect(() => {
    console.log('🛒 Initializing cart...');
    loadCart();
  }, [loadCart]);

  // Add item to cart with INSTANT UI update
  const addItem = useCallback(async (itemData: Omit<CartItem, 'id'>) => {
    console.log('🛒 ADD ITEM called:', itemData.service_name);
    
    if (!user?.id) {
      console.log('❌ No user authenticated');
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicates in current state
    const exists = items.find(
      item => item.service_id === itemData.service_id && item.provider_id === itemData.provider_id
    );

    if (exists) {
      console.log('⚠️ Item already exists in cart');
      toast({
        title: "Already in Cart",
        description: "This service is already in your cart.",
        variant: "destructive",
      });
      return false;
    }

    // Create optimistic item with temporary ID
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticItem: CartItem = { id: tempId, ...itemData };

    console.log('🛒 Adding optimistic item to state:', optimisticItem.service_name);
    
    // INSTANT UI UPDATE - Add to state immediately
    setItems(prevItems => {
      const newItems = [...prevItems, optimisticItem];
      console.log('✅ State updated - new count:', newItems.length);
      return newItems;
    });

    // Show success toast immediately
    toast({
      title: "Added to Cart",
      description: `${itemData.service_name} added successfully.`,
    });

    try {
      console.log('🔄 Saving to Supabase...');
      // Background API call
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          ...itemData
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase insert failed:', error);
        throw error;
      }

      console.log('✅ Item saved to Supabase:', data.id);
      
      // Replace optimistic item with real item from database
      setItems(prevItems => 
        prevItems.map(item => item.id === tempId ? data : item)
      );

      return true;
    } catch (error) {
      console.error('❌ Add item failed:', error);
      
      // Rollback on error - remove optimistic item
      setItems(prevItems => {
        const rolledBack = prevItems.filter(item => item.id !== tempId);
        console.log('🔄 Rolled back - count:', rolledBack.length);
        return rolledBack;
      });
      
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [user?.id, items, toast]);

  // Remove item with INSTANT UI update
  const removeItem = useCallback(async (itemId: string) => {
    console.log('🗑️ REMOVE ITEM called:', itemId);
    
    if (!user?.id) return false;

    const itemToRemove = items.find(item => item.id === itemId);
    if (!itemToRemove) {
      console.log('⚠️ Item not found in state');
      return false;
    }

    console.log('🗑️ Removing item from state:', itemToRemove.service_name);
    
    // INSTANT UI UPDATE - Remove from state immediately
    setItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== itemId);
      console.log('✅ State updated - new count:', newItems.length);
      return newItems;
    });

    // Show success toast immediately
    toast({
      title: "Removed from Cart",
      description: `${itemToRemove.service_name} removed successfully.`,
    });

    try {
      console.log('🔄 Removing from Supabase...');
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Supabase delete failed:', error);
        throw error;
      }

      console.log('✅ Item removed from Supabase');
      return true;
    } catch (error) {
      console.error('❌ Remove item failed:', error);
      
      // Rollback on error - add item back
      setItems(prevItems => {
        const rolledBack = [...prevItems, itemToRemove];
        console.log('🔄 Rolled back - count:', rolledBack.length);
        return rolledBack;
      });
      
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [user?.id, items, toast]);

  // Clear cart with INSTANT UI update
  const clearCart = useCallback(async () => {
    console.log('🧹 CLEAR CART called');
    
    if (!user?.id) return false;

    const originalItems = [...items];
    
    console.log('🧹 Clearing cart state');
    
    // INSTANT UI UPDATE - Clear state immediately
    setItems([]);

    toast({
      title: "Cart Cleared",
      description: "All items removed from cart.",
    });

    try {
      console.log('🔄 Clearing from Supabase...');
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Supabase clear failed:', error);
        throw error;
      }

      console.log('✅ Cart cleared from Supabase');
      return true;
    } catch (error) {
      console.error('❌ Clear cart failed:', error);
      
      // Rollback on error - restore items
      setItems(originalItems);
      
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  }, [user?.id, items, toast]);

  const getTotalPrice = useCallback(() => {
    const total = items.reduce((sum, item) => sum + item.final_price, 0);
    console.log('💰 Total price calculated:', total);
    return total;
  }, [items]);

  const itemCount = items.length;

  console.log('🛒 Hook returning:', { 
    itemCount, 
    loading, 
    itemTitles: items.map(i => i.service_name) 
  });

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
