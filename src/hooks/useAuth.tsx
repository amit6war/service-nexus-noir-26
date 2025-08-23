
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type AppRole = 'customer' | 'provider' | 'admin';

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
        setProfileRole(null);
        return;
      }

      if (data?.role) {
        const role = data.role as AppRole;
        console.log('[Auth] Profile role detected:', role);
        setProfileRole(role);
      } else {
        console.log('[Auth] No role found in profile');
        setProfileRole(null);
      }
    } catch (error) {
      console.error('[Auth] Error loading profile role:', error);
      setProfileRole(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] Auth state changed:', event, session?.user?.id);
        setSession(session);
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        
        // Load the role from profiles when auth state changes
        if (nextUser) {
          await loadProfileRole(nextUser.id);
        } else {
          setProfileRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[Auth] Initial session check:', session?.user?.id);
      setSession(session);
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      
      // Load the role from profiles on initial load
      if (nextUser) {
        await loadProfileRole(nextUser.id);
      } else {
        setProfileRole(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any, role: AppRole = 'customer') => {
    console.log('[Auth] Starting signup process for role:', role);
    
    const redirectUrl = `${window.location.origin}/`;
    
    // Prepare user metadata with role information
    const signupData = {
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          ...userData,
          role: role // Include role in user metadata
        }
      }
    };

    const { data, error } = await supabase.auth.signUp(signupData);

    if (error) {
      console.error('[Auth] Signup error:', error);
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log('[Auth] Signup successful:', data);
      
      // If user is created immediately (not pending email confirmation)
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
      
      // Provide more user-friendly error messages
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
      // Role loading will be handled by the auth state change listener
    }

    return { error };
  };

  const signOut = async () => {
    console.log('[Auth] Starting signout process');
    
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('[Auth] Signout error:', error);
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Clear local state
      setProfileRole(null);
      console.log('[Auth] Signout successful');
    }

    return { error };
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
