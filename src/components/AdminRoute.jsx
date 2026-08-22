import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

// Requires both a logged-in user and an admin role.
// Not logged in -> /login. Logged in but not admin -> redirected home.
// This is a UX convenience only — the real enforcement is server-side
// (requireAdmin middleware), since a client-side check can't stop anyone
// who calls the API directly.
export default function AdminRoute({
  unauthenticatedElement = <Navigate to="/login" replace />,
  forbiddenElement = <Navigate to="/" replace />,
}) {
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return null;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  if (user?.role !== 'admin') {
    return forbiddenElement;
  }

  return <Outlet />;
}
