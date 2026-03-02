import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: boolean;
}

export function ProtectedRoute({ children, requireRole = true }: ProtectedRouteProps) {
  const { user, isLoading, hasValidRole } = useAuth();
  const location = useLocation();

  // Dev mode bypass - skip auth during development
  const isDev = import.meta.env.DEV;
  if (isDev) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireRole && !hasValidRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="p-4 rounded-full bg-warning/10 w-fit mx-auto">
            <svg className="w-12 h-12 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Role Assignment Required</h2>
          <p className="text-muted-foreground">
            Your account has been created, but you haven't been assigned a role yet. 
            Please contact a Treasury administrator to assign you either the <strong>Treasury</strong> or <strong>FP&A</strong> role.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-primary hover:underline text-sm"
          >
            Refresh to check role status
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
