
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

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

export const useCartV2 = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const mountedRef = useRef(true);
  const lastUpdateRef = useRef<number>(0);
  const optimisticUpdateRef = useRef<string | null>(null);

  console.log('🛒 useCartV2 - Current state:', { 
    itemCount: items.length, 
    loading, 
    syncing,
    initialized,
    userId: user?.id 
  });

  // Cleanup function for real-time subscription
  const cleanupRealtimeSubscription = useCallback(() => {
    if (channelRef.current) {
      console.log('🧹 Cleaning up real-time subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  // Load cart data from database
  const loadCartData = useCallback(async (forceRefresh = false) => {
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      setInitialized(false);
      return;
    }

    // Prevent duplicate loads unless forced
    const now = Date.now();
    if (!forceRefresh && (now - lastUpdateRef.current) < 1000) {
      return;
    }
    lastUpdateRef.current = now;

    try {
      console.log('📦 Loading cart data for user:', user.id);
      
      const { data: cartItems, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error loading cart:', error);
        throw error;
      }

      if (mountedRef.current) {
        setItems(cartItems || []);
        console.log('✅ Cart loaded successfully:', cartItems?.length || 0, 'items');
      }
    } catch (error) {
      console.error('❌ Failed to load cart data:', error);
      if (mountedRef.current) {
        toast({
          title: "Cart Error",
          description: "Failed to load cart. Please try again.",
          variant: "destructive",
        });
      }
    }
  }, [user?.id, toast]);

  // Handle real-time updates with optimistic update protection
  const handleRealtimeUpdate = useCallback((payload: any) => {
    if (!mountedRef.current) return;

    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    // Skip real-time updates if we're in the middle of an optimistic update
    if (optimisticUpdateRef.current) {
      console.log('🔄 Skipping real-time update during optimistic operation:', optimisticUpdateRef.current);
      return;
    }
    
    setItems(currentItems => {
      let newItems = [...currentItems];
      
      switch (eventType) {
        case 'INSERT':
          console.log('➕ Real-time: Item added', newRecord.service_name);
          const existsInsert = newItems.some(item => item.id === newRecord.id);
          if (!existsInsert) {
            newItems = [...newItems, newRecord];
          }
          break;
        
        case 'UPDATE':
          console.log('✏️ Real-time: Item updated', newRecord.service_name);
          newItems = newItems.map(item => 
            item.id === newRecord.id ? newRecord : item
          );
          break;
        
        case 'DELETE':
          console.log('➖ Real-time: Item removed', oldRecord?.service_name || oldRecord?.id);
          newItems = newItems.filter(item => item.id !== oldRecord.id);
          break;
        
        default:
          return currentItems;
      }
      
      return newItems;
    });
  }, []);

  // Set up real-time subscription
  const setupRealtimeSubscription = useCallback(() => {
    if (!user?.id || channelRef.current) return;

    console.log('🔄 Setting up real-time subscription for cart');

    const channel = supabase
      .channel(`cart-changes-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Real-time cart update received:', payload);
          handleRealtimeUpdate(payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription failed');
          setTimeout(() => {
            if (mountedRef.current && user?.id) {
              cleanupRealtimeSubscription();
              setupRealtimeSubscription();
            }
          }, 2000);
        }
      });

    channelRef.current = channel;
  }, [user?.id, handleRealtimeUpdate, cleanupRealtimeSubscription]);

  // Initialize cart and set up real-time subscriptions
  useEffect(() => {
    mountedRef.current = true;
    
    if (!user?.id) {
      setItems([]);
      setLoading(false);
      setInitialized(false);
      cleanupRealtimeSubscription();
      return;
    }

    const initializeCart = async () => {
      try {
        setLoading(true);
        console.log('🚀 Initializing cart for user:', user.id);

        await loadCartData(true);
        setupRealtimeSubscription();
        
      } catch (error) {
        console.error('❌ Cart initialization failed:', error);
        if (mountedRef.current) {
          toast({
            title: "Cart Error",
            description: "Failed to initialize cart. Please refresh the page.",
            variant: "destructive",
          });
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeCart();

    return () => {
      mountedRef.current = false;
      cleanupRealtimeSubscription();
    };
  }, [user?.id, loadCartData, setupRealtimeSubscription, cleanupRealtimeSubscription, toast]);

  const addItem = useCallback(async (itemData: Omit<CartItem, 'id'>) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your cart.",
        variant: "destructive",
      });
      return false;
    }

    // Check for existing items before making API call
    const existingItem = items.find(
      item => item.service_id === itemData.service_id && item.provider_id === itemData.provider_id
    );

    if (existingItem) {
      toast({
        title: "Item Already in Cart",
        description: "This service from this provider is already in your cart.",
        variant: "destructive",
      });
      return false;
    }

    const serviceExists = items.find(item => item.service_id === itemData.service_id);
    if (serviceExists) {
      toast({
        title: "Service Already Selected",
        description: "You can only select one provider per service. Remove the existing one first.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setSyncing(true);
      console.log('🔄 Adding item to cart:', itemData.service_name);

      // Create temporary item for optimistic update
      const tempId = `temp_${Date.now()}`;
      const optimisticItem: CartItem = {
        id: tempId,
        ...itemData
      };

      // Set optimistic update flag
      optimisticUpdateRef.current = 'add';

      // Immediately update UI (optimistic update)
      if (mountedRef.current) {
        setItems(currentItems => [...currentItems, optimisticItem]);
        console.log('⚡ Optimistic add: Item added to UI immediately');
      }

      // Make API call
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          ...itemData
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding item to cart:', error);
        // Revert optimistic update on error
        if (mountedRef.current) {
          setItems(currentItems => currentItems.filter(item => item.id !== tempId));
        }
        throw error;
      }

      console.log('✅ Item added to cart successfully:', data);
      
      // Replace optimistic item with real item
      if (mountedRef.current) {
        setItems(currentItems => 
          currentItems.map(item => item.id === tempId ? data : item)
        );
        console.log('🔄 Replaced optimistic item with real item');
      }

      toast({
        title: "Added to Cart",
        description: `${itemData.service_name} has been added to your cart.`,
      });

      return true;
    } catch (error) {
      console.error('❌ Add item failed:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSyncing(false);
      // Clear optimistic update flag after a delay to allow real-time updates
      setTimeout(() => {
        optimisticUpdateRef.current = null;
      }, 500);
    }
  }, [user?.id, items, toast]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!user?.id) return false;

    const itemToRemove = items.find(item => item.id === itemId);
    if (!itemToRemove) return false;

    try {
      setSyncing(true);
      console.log('🔄 Removing item from cart:', itemId);

      // Set optimistic update flag
      optimisticUpdateRef.current = 'remove';

      // Immediately update UI (optimistic update)
      if (mountedRef.current) {
        setItems(currentItems => currentItems.filter(item => item.id !== itemId));
        console.log('⚡ Optimistic remove: Item removed from UI immediately');
      }

      // Make API call
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error removing item:', error);
        // Revert optimistic update on error
        if (mountedRef.current) {
          setItems(currentItems => [...currentItems, itemToRemove]);
        }
        throw error;
      }

      console.log('✅ Item removed successfully');

      toast({
        title: "Removed from Cart",
        description: `${itemToRemove.service_name} has been removed from your cart.`,
      });

      return true;
    } catch (error) {
      console.error('❌ Remove item failed:', error);
      toast({
        title: "Error",
        description: "Failed to remove item. Please try again.",
        variant: "destructive",
      });
      
      // Reload cart data on error to ensure consistency
      if (mountedRef.current) {
        loadCartData(true);
      }
      
      return false;
    } finally {
      setSyncing(false);
      // Clear optimistic update flag after a delay
      setTimeout(() => {
        optimisticUpdateRef.current = null;
      }, 500);
    }
  }, [user?.id, items, toast, loadCartData]);

  const clearCart = useCallback(async () => {
    if (!user?.id) return false;

    const currentItems = [...items];

    try {
      setSyncing(true);
      console.log('🔄 Clearing cart for user:', user.id);

      // Set optimistic update flag
      optimisticUpdateRef.current = 'clear';

      // Immediately update UI (optimistic update)
      if (mountedRef.current) {
        setItems([]);
        console.log('⚡ Optimistic clear: Cart cleared from UI immediately');
      }

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Error clearing cart:', error);
        // Revert optimistic update on error
        if (mountedRef.current) {
          setItems(currentItems);
        }
        throw error;
      }

      console.log('✅ Cart cleared successfully');

      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
      });

      return true;
    } catch (error) {
      console.error('❌ Clear cart failed:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSyncing(false);
      // Clear optimistic update flag after a delay
      setTimeout(() => {
        optimisticUpdateRef.current = null;
      }, 500);
    }
  }, [user?.id, items, toast]);

  const updateCartMetadata = useCallback(async () => {
    if (!user?.id) return;

    try {
      const totalAmount = items.reduce((sum, item) => sum + item.final_price, 0);
      
      const { error } = await supabase
        .from('cart_metadata')
        .upsert({
          user_id: user.id,
          total_items: items.length,
          total_amount: totalAmount,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('❌ Error updating cart metadata:', error);
      } else {
        console.log('✅ Cart metadata updated');
      }
    } catch (error) {
      console.error('❌ Error updating cart metadata:', error);
    }
  }, [user?.id, items]);

  // Update metadata whenever items change
  useEffect(() => {
    if (initialized && user?.id && items.length >= 0) {
      updateCartMetadata();
    }
  }, [items, initialized, updateCartMetadata]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((sum, item) => sum + item.final_price, 0);
  }, [items]);

  const refreshCart = useCallback(() => {
    loadCartData(true);
  }, [loadCartData]);

  const itemCount = items.length;

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalPrice,
    itemCount,
    loading,
    syncing,
    initialized,
    refreshCart
  };
};
