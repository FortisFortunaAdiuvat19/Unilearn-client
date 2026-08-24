import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

// Keeps already-authenticated users away from /login, /register, etc.
// so they don't land on an auth form while already signed in.
export default function PublicOnlyRoute({ redirectTo = '/community' }) {
  const { isAuthenticated, isLoadingAuth, authChecked } = useAuth();

  // AuthenticatedApp already shows a full-page loader while auth is
  // resolving, so this just avoids a flash before that settles.
  if (isLoadingAuth || !authChecked) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
