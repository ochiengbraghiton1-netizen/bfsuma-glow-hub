import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL params
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const errorParam = params.get('error') || hashParams.get('error');
        if (errorParam) {
          const errorDesc = params.get('error_description') || hashParams.get('error_description') || 'Authentication failed';
          setError(errorDesc);
          setTimeout(() => navigate('/auth?error=true'), 2000);
          return;
        }

        // Try to get session - Supabase client auto-detects tokens in URL
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          setError(sessionError.message);
          setTimeout(() => navigate('/auth?error=true'), 2000);
          return;
        }

        if (session) {
          // Check user role for redirect
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id);

          const isAdmin = roles?.some(r => ['super_admin', 'admin', 'editor'].includes(r.role));
          navigate(isAdmin ? '/admin' : '/account', { replace: true });
        } else {
          // No session yet, wait for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              subscription.unsubscribe();
              navigate('/account', { replace: true });
            }
          });

          // Timeout fallback
          setTimeout(() => {
            subscription.unsubscribe();
            navigate('/auth?error=true', { replace: true });
          }, 5000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An unexpected error occurred');
        setTimeout(() => navigate('/auth?error=true'), 2000);
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <p className="text-destructive font-medium">{error}</p>
            <p className="text-sm text-muted-foreground">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
