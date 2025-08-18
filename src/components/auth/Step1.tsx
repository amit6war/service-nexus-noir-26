
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Phone, Lock } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Step1Props {
  formData: {
    email: string;
    phone: string;
    password: string;
  };
  selectedRole: 'customer' | 'provider';
  showPassword: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleChange: (role: 'customer' | 'provider') => void;
  onTogglePassword: () => void;
}

const Step1 = ({
  formData,
  selectedRole,
  showPassword,
  onInputChange,
  onRoleChange,
  onTogglePassword,
}: Step1Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Account Information</h3>
        <p className="text-sm text-muted-foreground">Let's start with the basics</p>
      </div>

      <div className="space-y-5">
        {/* Account Info Section */}
        <div className="bg-secondary/30 rounded-xl p-4 space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4 text-teal" />
            Account Details
          </h4>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={onInputChange}
                placeholder="Enter your email"
                className="input-dark w-full pl-10 transition-all duration-300 focus:ring-2 focus:ring-teal/20 rounded-lg shadow-sm"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={onInputChange}
                placeholder="Enter your phone number"
                className="input-dark w-full pl-10 transition-all duration-300 focus:ring-2 focus:ring-teal/20 rounded-lg shadow-sm"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
              Password *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={onInputChange}
                placeholder="Enter your password"
                className="input-dark w-full pl-10 pr-12 transition-all duration-300 focus:ring-2 focus:ring-teal/20 rounded-lg shadow-sm"
                required
              />
              <motion.button
                type="button"
                onClick={onTogglePassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-teal transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Role Selector Section */}
        <div className="bg-secondary/30 rounded-xl p-4">
          <label className="block text-sm font-medium text-foreground mb-3">
            I want to sign up as *
          </label>
          <RadioGroup
            value={selectedRole}
            onValueChange={(val) => onRoleChange(val as 'customer' | 'provider')}
            className="grid grid-cols-1 gap-3"
          >
            <motion.label 
              htmlFor="role-customer" 
              className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3 cursor-pointer hover:bg-card transition-all duration-300 hover:border-teal/50 hover:shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <RadioGroupItem id="role-customer" value="customer" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">👤 Customer</span>
                </div>
                <p className="text-xs text-muted-foreground">Find and book services</p>
              </div>
            </motion.label>

            <motion.label 
              htmlFor="role-provider" 
              className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3 cursor-pointer hover:bg-card transition-all duration-300 hover:border-teal/50 hover:shadow-sm"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RadioGroupItem id="role-provider" value="provider" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">🛠️ Service Provider</span>
                </div>
                <p className="text-xs text-muted-foreground">Offer your services</p>
              </div>
            </motion.label>
          </RadioGroup>
        </div>
      </div>
    </motion.div>
  );
};

export default Step1;
