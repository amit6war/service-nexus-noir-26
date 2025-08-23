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
          
          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <CartIcon className="w-6 h-6 text-teal" />
                <h2 className="text-xl font-bold">Your Cart</h2>
                <Badge variant="secondary">{itemCount}</Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {itemCount === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <CartIcon className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground mb-4">
                    Add services to your cart to get started
                  </p>
                  <Button onClick={onClose} className="bg-teal hover:bg-teal/90">
                    Browse Services
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{item.service_title}</CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <User className="w-3 h-3" />
                                <span>{item.provider_name}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                <span>{item.duration_minutes} minutes</span>
                              </div>
                              <span className="font-semibold text-teal">${item.price}</span>
                            </div>
                            
                            {item.scheduled_date && (
                              <div className="text-sm text-muted-foreground">
                                Scheduled: {format(new Date(item.scheduled_date), 'PPP p')}
                              </div>
                            )}
                            
                            {item.special_instructions && (
                              <div className="text-sm">
                                <span className="font-medium">Instructions:</span>
                                <p className="text-muted-foreground mt-1">{item.special_instructions}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {itemCount > 0 && (
              <div className="border-t p-6 bg-muted/30">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-teal">${getTotalPrice()}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={handleProceedToCheckout}
                      className="w-full bg-teal hover:bg-teal/90"
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>
                    
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="w-full"
                      size="sm"
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