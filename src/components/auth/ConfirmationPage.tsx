
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Mail, ArrowLeft } from 'lucide-react';

interface ConfirmationPageProps {
  type: 'success' | 'error';
  onBackToHome: () => void;
  onContinueToSignIn: () => void;
  onResendConfirmation: () => void;
  email?: string;
  onEmailChange?: (email: string) => void;
}

const ConfirmationPage = ({
  type,
  onBackToHome,
  onContinueToSignIn,
  onResendConfirmation,
  email,
  onEmailChange
}: ConfirmationPageProps) => {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.button 
          onClick={onBackToHome}
          className="flex items-center gap-2 text-muted-foreground hover:text-teal transition-colors mb-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Home</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass text-center"
        >
          {type === 'success' ? (
            <>
              <div className="mb-6">
                <CheckCircle className="w-16 h-16 text-teal mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  ✅ Email Confirmed Successfully!
                </h1>
                <p className="text-muted-foreground">
                  Your account has been verified. You can now sign in to access your account.
                </p>
              </div>
              
              <motion.button
                onClick={onContinueToSignIn}
                className="btn-hero w-full flex items-center justify-center gap-2 rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Mail className="w-4 h-4" />
                Continue to Sign In
              </motion.button>
            </>
          ) : (
            <>
              <div className="mb-6">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Confirmation Failed
                </h1>
                <p className="text-muted-foreground mb-4">
                  The confirmation link is invalid or expired. Please try again.
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="resend-email" className="block text-sm font-medium text-foreground mb-2 text-left">
                    Email Address
                  </label>
                  <input
                    id="resend-email"
                    type="email"
                    value={email || ''}
                    onChange={(e) => onEmailChange?.(e.target.value)}
                    placeholder="Enter your email address"
                    className="input-dark w-full rounded-lg"
                    required
                  />
                </div>
                
                <motion.button
                  onClick={onResendConfirmation}
                  className="btn-hero w-full rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Resend Confirmation Email
                </motion.button>
                
                <motion.button
                  onClick={onContinueToSignIn}
                  className="btn-ghost w-full rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Back to Sign In
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
