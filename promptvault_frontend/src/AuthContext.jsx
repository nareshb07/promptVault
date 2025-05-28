import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import apiClient from './services/api'; // Assuming your apiClient is in src/services/api.js

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/user/me/');
      setUser(response.data);
    } catch (error) {
      setUser(null);
      if (error.response && error.response.status !== 401) { // Don't log 401 as an "error" in console
        console.error("Error fetching current user:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // This function can be called after a successful login redirect if needed,
  // but useEffect already handles initial load.
  const login = () => {
    // Primarily to re-trigger a user fetch if some external event happens
    // For Google OAuth via Django, the cookie is set by Django,
    // and then fetchCurrentUser will pick it up.
    return fetchCurrentUser();
  };

  const logout = () => {
    // Frontend state update. Actual logout is Django's responsibility via redirect.
    setUser(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><p className="text-xl">Loading authentication...</p></div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loadingAuth: loading, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);