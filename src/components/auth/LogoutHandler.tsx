import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function LogoutHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Try to sign out from Supabase if configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseAnonKey) {
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.warn('Supabase signout failed:', error);
      }

      // Capture role before clearing storage so we can route correctly
      const lastRole = localStorage.getItem('userRole');

      // Clear localStorage for both Supabase and mock auth
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      // Also clear persisted email to avoid stale user context after logout
      localStorage.removeItem('userEmail');

      // Redirect based on previous role
      if (lastRole === 'parent') {
        navigate('/login', { replace: true });
      } else if (lastRole === 'teacher') {
        navigate('/teacher/login', { replace: true });
      } else {
        // Default (admin or unknown) -> public homepage
        navigate('/', { replace: true });
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Logging out...</h2>
        <p className="text-muted-foreground">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}