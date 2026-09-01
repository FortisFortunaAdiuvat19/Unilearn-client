import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut } from '@/lib/firebase';
import apiClient from '@/api/apiClient';

const AuthContext = createContext();

// Turns an axios error into a message that actually says what went wrong,
// instead of a generic "couldn't verify your profile." Distinguishing
// these matters: a CORS/network failure needs a completely different fix
// (server config) than a 401 (bad/expired token) or a 500 (server bug).
const describeSyncError = (error) => {
  if (error.response) {
    return `Server responded with ${error.response.status}: ${error.response.data?.message || error.message}`;
  }
  if (error.request) {
    return `No response from the server (${error.message}). This usually means a CORS or network configuration issue on the backend.`;
  }
  return error.message || 'Unknown error';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Firebase listener for auth state changes
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setIsLoadingAuth(true);
      if (firebaseUser) {
        try {
          // Sync Firebase user with MongoDB backend
          // We will create this endpoint in the Node server
          const response = await apiClient.post('/auth/sync', {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });

          // Merge Firebase data with custom DB roles (e.g., admin)
          setUser({ ...firebaseUser, ...response.data.user });
          setIsAuthenticated(true);
          setAuthError(null);
        } catch (error) {
          console.error('Failed to sync user with backend:', error);
          setAuthError({ type: 'sync_failed', message: `We couldn't verify your session: ${describeSyncError(error)}` });
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setAuthError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
      setAuthError({ type: 'login_failed', message: error.message });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      // Let the routing handle redirection
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const checkUserAuth = async () => {
    // Manually trigger a check if needed, though onAuthStateChanged handles most cases
    if (authChecked) return;
    setIsLoadingAuth(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const response = await apiClient.post('/auth/sync');
        setUser({ ...currentUser, ...response.data.user });
        setIsAuthenticated(true);
        setAuthError(null);
      } catch (error) {
        console.error('Failed to sync user with backend:', error);
        setAuthError({ type: 'sync_failed', message: `We couldn't verify your session: ${describeSyncError(error)}` });
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoadingAuth(false);
    setAuthChecked(true);
  };

  // For refreshing the merged user object after something changes it
  // server-side without a Firebase auth-state change happening (e.g. the
  // account-completion page setting a matric number) — checkUserAuth
  // above is a one-time-only fallback and won't re-run once authChecked
  // is already true, so this exists as its own, always-runnable version.
  const refreshUser = async () => {
    if (!auth.currentUser) return;
    try {
      const response = await apiClient.post('/auth/sync');
      setUser({ ...auth.currentUser, ...response.data.user });
      setAuthError(null);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      authError,
      authChecked,
      loginWithGoogle,
      logout,
      checkUserAuth,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
