import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';

type UserRole = 'super_admin' | 'admin' | 'editor' | 'team_member' | 'distributor' | 'viewer' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isTeamMember: boolean;
  isDistributor: boolean;
  userRole: UserRole;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lazy singleton for supabase client — keeps it out of the critical JS bundle
let _sbPromise: Promise<SupabaseClient> | null = null;
function getSb(): Promise<SupabaseClient> {
  if (!_sbPromise) {
    _sbPromise = import('@/integrations/supabase/client').then(m => m.supabase);
  }
  return _sbPromise;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isTeamMember, setIsTeamMember] = useState(false);
  const [isDistributor, setIsDistributor] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>(null);
  const sbRef = useRef<SupabaseClient | null>(null);

  const checkUserRoles = useCallback(async (userId: string) => {
    const sb = sbRef.current ?? await getSb();
    const { data, error } = await sb
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    if (!error && data && data.length > 0) {
      const roles = data.map(r => r.role as string);
      
      if (roles.includes('super_admin')) {
        setIsSuperAdmin(true); setIsAdmin(true); setIsTeamMember(false); setIsDistributor(false); setUserRole('super_admin');
      } else if (roles.includes('admin')) {
        setIsSuperAdmin(false); setIsAdmin(true); setIsTeamMember(false); setIsDistributor(false); setUserRole('admin');
      } else if (roles.includes('editor')) {
        setIsSuperAdmin(false); setIsAdmin(true); setIsTeamMember(false); setIsDistributor(false); setUserRole('editor');
      } else if (roles.includes('distributor')) {
        setIsSuperAdmin(false); setIsAdmin(false); setIsTeamMember(false); setIsDistributor(true); setUserRole('distributor');
      } else if (roles.includes('team_member')) {
        setIsSuperAdmin(false); setIsAdmin(false); setIsTeamMember(true); setIsDistributor(false); setUserRole('team_member');
      } else {
        setIsSuperAdmin(false); setIsAdmin(false); setIsTeamMember(false); setIsDistributor(false); setUserRole('viewer');
      }
    } else {
      setIsSuperAdmin(false); setIsAdmin(false); setIsTeamMember(false); setIsDistributor(false); setUserRole(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | null = null;

    const bootstrap = () => {
      getSb().then(sb => {
      if (cancelled) return;
      sbRef.current = sb;

      const { data: { subscription } } = sb.auth.onAuthStateChange(
        (event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            setTimeout(() => checkUserRoles(session.user.id), 0);
          } else {
            setIsSuperAdmin(false); setIsAdmin(false); setIsTeamMember(false); setIsDistributor(false); setUserRole(null);
          }
          setLoading(false);
        }
      );

      sb.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) checkUserRoles(session.user.id);
        setLoading(false);
      });

        unsubscribe = () => subscription.unsubscribe();
        if (cancelled) unsubscribe();
      });
    };

    // Defer the session bootstrap past first paint so the Supabase chunk and
    // the auth request do not compete with the hero (LCP). Auth semantics are
    // unchanged: `loading` stays true until the real session resolves.
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const raf = requestAnimationFrame(() => {
      if (w.requestIdleCallback) w.requestIdleCallback(bootstrap, { timeout: 1000 });
      else setTimeout(bootstrap, 0);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      unsubscribe?.();
    };
  }, [checkUserRoles]);

  const signIn = async (email: string, password: string) => {
    const sb = sbRef.current ?? await getSb();
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, referralCode?: string) => {
    const sb = sbRef.current ?? await getSb();
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await sb.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName, referral_code: referralCode },
      },
    });
    return { error };
  };

  const signOut = async () => {
    const sb = sbRef.current ?? await getSb();
    await sb.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, session, loading, isAdmin, isSuperAdmin, isTeamMember, isDistributor, userRole,
      signIn, signUp, signOut 
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
