import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'super_admin' | 'admin' | 'editor' | 'team_member' | 'viewer' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isTeamMember: boolean;
  userRole: UserRole;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);

  const checkUserRoles = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (!error && data && data.length > 0) {
      const roles = data.map(r => r.role as string);
      
      if (roles.includes('super_admin')) {
        setIsSuperAdmin(true);
        setIsAdmin(true);
        setIsTeamMember(false);
        setUserRole('super_admin');
      } else if (roles.includes('admin')) {
        setIsSuperAdmin(false);
        setIsAdmin(true);
        setIsTeamMember(false);
        setUserRole('admin');
      } else if (roles.includes('editor')) {
        setIsSuperAdmin(false);
        setIsAdmin(true);
        setIsTeamMember(false);
        setUserRole('editor');
      } else if (roles.includes('team_member')) {
        setIsSuperAdmin(false);
        setIsAdmin(false);
        setIsTeamMember(true);
        setUserRole('team_member');
      } else {
        setIsSuperAdmin(false);
        setIsAdmin(false);
        setIsTeamMember(false);
        setUserRole('viewer');
      }
    } else {
      setIsSuperAdmin(false);
      setIsAdmin(false);
      setIsTeamMember(false);
      setUserRole(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => {
            checkUserRoles(session.user.id);
          }, 0);
        } else {
          setIsSuperAdmin(false);
          setIsAdmin(false);
          setIsTeamMember(false);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRoles(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, referralCode?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          referral_code: referralCode,
        },
      },
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      isAdmin, 
      isSuperAdmin, 
      isTeamMember, 
      userRole,
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
