
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import SignupWizard from '@/components/auth/SignupWizard';

const Auth = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await signIn(email, password);
    if (!error) {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy/90 to-teal/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {mode === 'signin' && (
            <motion.div
              key="signin"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
                <CardHeader className="space-y-2 pb-4 pt-8">
                  <CardTitle className="text-3xl font-bold text-center text-foreground">
                    Welcome Back
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    Sign in to Service N-B
                  </p>
                </CardHeader>
                <CardContent className="grid gap-6 p-8">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-teal transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    disabled={loading} 
                    onClick={handleSignIn} 
                    className="w-full bg-teal hover:bg-teal/90 text-white"
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  <div className="flex justify-between text-sm">
                    <Button variant="link" onClick={() => setMode('forgot')} className="text-muted-foreground hover:text-teal">
                      Forgot password?
                    </Button>
                    <Button variant="link" onClick={() => setMode('signup')} className="text-muted-foreground hover:text-teal">
                      Create an account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          {mode === 'signup' && (
            <SignupWizard 
              onBack={() => setMode('signin')}
              onSuccess={() => setMode('signin')}
            />
          )}
          
          {mode === 'forgot' && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
                <CardHeader className="space-y-2 pb-4 pt-8">
                  <CardTitle className="text-3xl font-bold text-center text-foreground">
                    Reset Password
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    Enter your email to reset your password
                  </p>
                </CardHeader>
                <CardContent className="grid gap-6 p-8">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button disabled={loading} onClick={() => {}} className="w-full bg-teal hover:bg-teal/90">
                    {loading ? 'Sending reset link...' : 'Send Reset Link'}
                  </Button>
                  <div className="flex justify-center">
                    <Button variant="link" onClick={() => setMode('signin')} className="text-muted-foreground hover:text-teal">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Sign In
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Auth;
