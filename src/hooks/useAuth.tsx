
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type AppRole = 'customer' | 'provider' | 'admin' | 'superadmin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any, role?: AppRole) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  profileRole: AppRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileRole, setProfileRole] = useState<AppRole | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSigningOutRef = useRef(false);

  console.log('[Auth] Current state:', { user: user?.id, session: session?.access_token ? 'exists' : 'none', loading, profileRole });

  // Helper to load role from profiles
  const loadProfileRole = async (userId: string | undefined | null) => {
    if (!userId) {
      setProfileRole(null);
      return;
    }
    
    console.log('[Auth] Loading profile role for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('[Auth] Failed to fetch profile role:', error.message);
        setProfileRole('customer'); // Default to customer if no profile found
        return;
      }

      if (data?.role) {
        const role = data.role as AppRole;
        console.log('[Auth] Profile role detected:', role);
        setProfileRole(role);
        
        // Navigate based on role after successful authentication
        setTimeout(() => {
          const currentPath = window.location.pathname;
          if (currentPath === '/auth' || currentPath === '/') {
            switch (role) {
              case 'customer':
                window.location.href = '/customer-dashboard';
                break;
              case 'provider':
                window.location.href = '/provider-dashboard';
                break;
              case 'admin':
              case 'superadmin':
                window.location.href = '/admin-dashboard';
                break;
              default:
                window.location.href = '/';
            }
          }
        }, 100);
      } else {
        console.log('[Auth] No role found in profile, defaulting to customer');
        setProfileRole('customer');
      }
    } catch (error) {
      console.error('[Auth] Error loading profile role:', error);
      setProfileRole('customer');
    }
  };

  // Auto logout after inactivity
  const handleAutoLogout = useCallback(async () => {
    console.log('[Auth] Auto logout due to inactivity');
    toast({
      title: "Session Expired",
      description: "You have been logged out due to inactivity.",
      variant: "destructive",
    });
    await signOut();
  }, []);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    if (user && !isSigningOutRef.current) {
      inactivityTimerRef.current = setTimeout(() => {
        handleAutoLogout();
      }, 30 * 60 * 1000); // 30 minutes
    }
  }, [user, handleAutoLogout]);

  // Track user activity
  useEffect(() => {
    if (!user || isSigningOutRef.current) return;

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    resetInactivityTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [user, resetInactivityTimer]);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('[Auth] Auth state changed:', event, session?.user?.id);
        
        // Handle sign out event
        if (event === 'SIGNED_OUT') {
          console.log('[Auth] Handling sign out event');
          setSession(null);
          setUser(null);
          setProfileRole(null);
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
          }
          setLoading(false);
          return;
        }
        
        setSession(session);
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        
        // Load the role from profiles when auth state changes
        if (nextUser && session && !isSigningOutRef.current) {
          setTimeout(() => {
            if (mounted && !isSigningOutRef.current) {
              loadProfileRole(nextUser.id);
            }
          }, 0);
        } else {
          setProfileRole(null);
          if (inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current);
            inactivityTimerRef.current = null;
          }
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting session:', error);
          setLoading(false);
          return;
        }

        console.log('[Auth] Initial session check:', session?.user?.id);
        
        if (mounted && !isSigningOutRef.current) {
          setSession(session);
          const nextUser = session?.user ?? null;
          setUser(nextUser);
          
          if (nextUser && session) {
            setTimeout(() => {
              if (mounted && !isSigningOutRef.current) {
                loadProfileRole(nextUser.id);
              }
            }, 0);
          } else {
            setProfileRole(null);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData?: any, role: AppRole = 'customer') => {
    console.log('[Auth] Starting signup process for role:', role);
    
    const redirectUrl = `${window.location.origin}/`;
    
    const signupData = {
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          ...userData,
          role: role
        }
      }
    };

    const { data, error } = await supabase.auth.signUp(signupData);

    if (error) {
      console.error('[Auth] Signup error:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please use a different email or sign in instead.";
      }
      
      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      console.log('[Auth] Signup successful:', data);
      
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Success",
          description: "Please check your email to confirm your account before signing in.",
        });
      }
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('[Auth] Starting signin process');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('[Auth] Signin error:', error);
      
      let errorMessage = error.message;
      
      if (error.message.includes('Email not confirmed')) {
        errorMessage = "Please check your email and click the confirmation link before signing in.";
      } else if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      }
      
      toast({
        title: "Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } else {
      console.log('[Auth] Signin successful:', data);
    }

    return { error };
  };

  const signOut = async () => {
    console.log('[Auth] Starting signout process');
    
    // Prevent multiple simultaneous signouts
    if (isSigningOutRef.current) {
      console.log('[Auth] Signout already in progress');
      return { error: null };
    }
    
    try {
      isSigningOutRef.current = true;
      
      // Clear inactivity timer immediately
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      
      console.log('[Auth] Calling Supabase signOut');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('[Auth] Signout error:', error);
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
        isSigningOutRef.current = false;
        return { error };
      }
      
      console.log('[Auth] Signout successful');
      
      // Clear all state
      setUser(null);
      setSession(null);
      setProfileRole(null);
      setLoading(false);
      
      // Navigate to home page
      window.location.href = '/';
      
      return { error: null };
    } catch (error) {
      console.error('[Auth] Signout exception:', error);
      isSigningOutRef.current = false;
      
      // Clear state anyway
      setUser(null);
      setSession(null);
      setProfileRole(null);
      
      // Navigate to home even on error
      window.location.href = '/';
      return { error };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    profileRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
