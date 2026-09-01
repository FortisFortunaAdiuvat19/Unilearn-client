import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import AuthSyncError from '@/components/AuthSyncError';

// Requires both a logged-in user and an admin role.
// Not logged in -> /login (remembering where they were headed).
// Logged in but not admin -> redirected home.
// This is a UX convenience only — the real enforcement is server-side
// (requireAdmin middleware), since a client-side check can't stop anyone
// who calls the API directly.
export default function AdminRoute({
  forbiddenElement = <Navigate to="/" replace />,
}) {
  const { user, isAuthenticated, isLoadingAuth, authChecked, authError } = useAuth();
  const location = useLocation();

  if (isLoadingAuth || !authChecked) {
    return null;
  }

  if (authError && authError.type !== 'user_not_registered') {
    return <AuthSyncError message={authError.message} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user?.matric_number) {
    return <Navigate to="/complete-registration" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return forbiddenElement;
  }

  return <Outlet />;
}
