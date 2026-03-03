// TEMPORARY: Auth bypass for development — restore original logic for production
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: boolean;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}
