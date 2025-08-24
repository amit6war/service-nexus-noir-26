
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Trash2, ShoppingCart as CartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useShoppingCart } from '@/hooks/useShoppingCart';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface CartSectionProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartSection: React.FC<CartSectionProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, getTotalPrice, clearCart, itemCount } = useShoppingCart();
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Full Screen Cart Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-background border shadow-2xl z-50 overflow-hidden flex flex-col rounded-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-teal/5 to-teal/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal/10 rounded-full">
                  <CartIcon className="w-6 h-6 text-teal" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Your Shopping Cart</h2>
                  <p className="text-muted-foreground">
                    {itemCount === 0 ? 'No items' : `${itemCount} ${itemCount === 1 ? 'item' : 'items'}`} in your cart
                  </p>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">{itemCount}</Badge>
              </div>
              <Button variant="ghost" size="lg" onClick={onClose} className="h-12 w-12">
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {itemCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="p-6 bg-muted/30 rounded-full mb-6">
                    <CartIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Discover amazing services from our trusted providers and add them to your cart to get started
                  </p>
                  <Button onClick={onClose} className="bg-teal hover:bg-teal/90 px-8 py-3">
                    Browse Services
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-xl mb-2">{item.service_title}</CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <User className="w-4 h-4" />
                                  <span>{item.provider_name}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-10 w-10 p-0"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{item.duration_minutes} minutes</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-2xl font-bold text-teal">${item.price}</span>
                                </div>
                              </div>
                              
                              {item.scheduled_date && (() => {
                                const date = new Date(item.scheduled_date);
                                const isValidDate = !isNaN(date.getTime());
                                
                                return isValidDate ? (
                                  <div className="p-3 bg-muted/30 rounded-lg">
                                    <div className="text-sm">
                                      <span className="font-medium text-foreground">Scheduled:</span>
                                      <p className="text-muted-foreground mt-1">
                                        {format(date, 'PPP p')}
                                      </p>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                              
                              {item.special_instructions && (
                                <div className="p-3 bg-muted/30 rounded-lg">
                                  <div className="text-sm">
                                    <span className="font-medium text-foreground">Special Instructions:</span>
                                    <p className="text-muted-foreground mt-1">{item.special_instructions}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {itemCount > 0 && (
              <div className="border-t bg-gradient-to-r from-muted/30 to-muted/10">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <span className="text-sm text-muted-foreground">Total Amount</span>
                      <div className="text-3xl font-bold text-teal">${getTotalPrice()}</div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{itemCount} {itemCount === 1 ? 'service' : 'services'} selected</p>
                      <p>Ready for checkout</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      onClick={handleProceedToCheckout}
                      className="flex-1 bg-teal hover:bg-teal/90 h-14 text-lg"
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>
                    
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="px-6 h-14"
                      size="lg"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSection;
