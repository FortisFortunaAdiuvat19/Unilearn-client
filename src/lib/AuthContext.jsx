import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signOut } from '@/lib/firebase';
import apiClient from '@/api/apiClient';

const AuthContext = createContext();

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
          setAuthError({ type: 'sync_failed', message: 'Failed to verify user profile.' });
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
    if (!authChecked) {
      setIsLoadingAuth(true);
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
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
      checkUserAuth
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
