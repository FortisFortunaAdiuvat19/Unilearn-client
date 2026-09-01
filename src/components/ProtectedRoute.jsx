import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AuthSyncError from '@/components/AuthSyncError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback /> }) {
  const { user, isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    // Any other auth error (the profile sync failing, most likely) is not
    // actually a "you're not logged in" situation — Firebase already
    // confirmed the credentials. Redirecting to /login here would just
    // loop forever, since re-entering an already-correct password can't
    // fix a broken connection to the backend.
    return <AuthSyncError message={authError.message} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Catches anyone signed in without a matric number — most commonly
  // Google sign-in, which has no form step to collect one, but also any
  // account that predates this field existing at all. Not applied to
  // /complete-registration itself (that route isn't wrapped in
  // ProtectedRoute), so there's no loop.
  if (!user?.matric_number) {
    return <Navigate to="/complete-registration" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
