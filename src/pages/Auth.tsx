
import React, { useState, useEffect, ChangeEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import SignupWizard from '@/components/auth/SignupWizard';
import ConfirmationPage from '@/components/auth/ConfirmationPage';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, loading, profileRole } = useAuth(); // UPDATED: use profileRole from context
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationState, setConfirmationState] = useState<'idle' | 'confirming' | 'success' | 'error'>('idle');
  const [resendEmail, setResendEmail] = useState('');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Handle email confirmation
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');
      
      if (token && type === 'signup') {
        setConfirmationState('confirming');
        
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });
          
          if (error) {
            console.error('Email confirmation error:', error);
            setConfirmationState('error');
            toast({
              title: "Confirmation Failed",
              description: "The confirmation link is invalid or expired.",
              variant: "destructive",
            });
          } else {
            setConfirmationState('success');
            toast({
              title: "Email Confirmed!",
              description: "Your account has been successfully verified.",
            });
          }
        } catch (error) {
          console.error('Confirmation process error:', error);
          setConfirmationState('error');
        }
      }
    };

    handleEmailConfirmation();
  }, [searchParams, toast]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && confirmationState !== 'success') {
      // Use role from profiles table for accurate routing
      const role = profileRole || 'customer';
      console.log('Routing by profile role:', role);

      if (role === 'customer') {
        navigate('/customer-dashboard'); // FIXED: correct path
      } else if (role === 'provider') {
        navigate('/provider-dashboard');
      } else if (role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate, confirmationState, profileRole]);

  // Update the handleLoginSubmit function
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      if (!error) {
        // Redirection handled by useEffect based on profileRole
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!resendEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to resend confirmation.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: resendEmail
      });

      if (error) {
        toast({
          title: "Resend Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email Sent",
          description: "A new confirmation email has been sent to your inbox.",
        });
      }
    } catch (error) {
      console.error('Resend error:', error);
    }
  };

  // Email confirmation success/error screen
  if (confirmationState === 'success' || confirmationState === 'error') {
    return (
      <ConfirmationPage
        type={confirmationState}
        onBackToHome={() => navigate('/')}
        onContinueToSignIn={() => {
          setConfirmationState('idle');
          setIsLogin(true);
        }}
        onResendConfirmation={handleResendConfirmation}
        email={resendEmail}
        onEmailChange={setResendEmail}
      />
    );
  }

  // Show loading state while confirming
  if (confirmationState === 'confirming') {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="card-glass text-center">
            <div className="animate-spin w-8 h-8 border-2 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-foreground mb-2">Confirming Email</h2>
            <p className="text-muted-foreground">Please wait while we verify your account...</p>
          </div>
        </div>
      </div>
    );
  }

  function handleLoginInputChange(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <motion.button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-teal transition-colors mb-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </motion.button>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Login Card */}
              <div className="card-glass">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold text-foreground mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-muted-foreground">
                    Sign in to access your account
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={loginData.email}
                      onChange={handleLoginInputChange}
                      placeholder="Enter your email"
                      className="input-dark w-full transition-all duration-300 focus:ring-2 focus:ring-teal/20 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginInputChange}
                        placeholder="Enter your password"
                        className="input-dark w-full pr-12 transition-all duration-300 focus:ring-2 focus:ring-teal/20 rounded-lg"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-teal transition-colors"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" className="rounded border-border bg-secondary" />
                      <span className="text-sm text-muted-foreground">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-teal hover:text-teal-light transition-colors">
                      Forgot password?
                    </button>
                  </div>

                  <motion.button 
                    type="submit" 
                    disabled={isSubmitting || loading}
                    className="btn-hero w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg"
                    whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
                  >
                    {isSubmitting && '⏳'}
                    Sign In
                  </motion.button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-muted-foreground">
                    Don't have an account?
                  </p>
                  <button
                    onClick={() => setIsLogin(false)}
                    className="text-teal hover:text-teal-light font-medium transition-colors mt-1"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SignupWizard
                onBack={() => setIsLogin(true)}
                onSuccess={() => {
                  // Reset to login after successful signup
                  setIsLogin(true);
                }}
              />

              {/* Terms and Privacy */}
              <div className="mt-6 pt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <button className="text-teal hover:text-teal-light">Terms of Service</button>
                  {' '}and{' '}
                  <button className="text-teal hover:text-teal-light">Privacy Policy</button>
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground">
                  Already have an account?
                </p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-teal hover:text-teal-light font-medium transition-colors mt-1"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
