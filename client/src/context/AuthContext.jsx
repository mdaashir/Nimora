import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth from sessionStorage or location.state
  useEffect(() => {
    const initAuth = () => {
      try {
        // First, try to get from sessionStorage
        const storedRollNo = sessionStorage.getItem('nimora_rollno');
        const storedAuth = sessionStorage.getItem('nimora_auth');

        if (storedRollNo && storedAuth) {
          // Restore from sessionStorage
          setAuth({
            rollNo: storedRollNo,
            password: storedAuth, // Already base64 encoded
            isAuthenticated: true
          });
        } else if (location.state?.rollNo && location.state?.password) {
          // Get from location.state and store it
          const { rollNo, password } = location.state;
          sessionStorage.setItem('nimora_rollno', rollNo);
          sessionStorage.setItem('nimora_auth', password);

          setAuth({
            rollNo,
            password,
            isAuthenticated: true
          });
        } else {
          // No authentication found
          setAuth(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [location.state]);

  // Login function
  const login = (rollNo, password) => {
    try {
      sessionStorage.setItem('nimora_rollno', rollNo);
      sessionStorage.setItem('nimora_auth', password);

      setAuth({
        rollNo,
        password,
        isAuthenticated: true
      });

      return true;
    } catch (error) {
      console.error('Error during login:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    try {
      sessionStorage.removeItem('nimora_rollno');
      sessionStorage.removeItem('nimora_auth');
      sessionStorage.removeItem('nimora_combined_data');
      setAuth(null);
      navigate('/');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Get decoded password
  const getDecodedPassword = () => {
    if (!auth?.password) return null;
    try {
      return atob(auth.password);
    } catch (error) {
      console.error('Error decoding password:', error);
      return null;
    }
  };

  const value = {
    auth,
    loading,
    login,
    logout,
    getDecodedPassword,
    isAuthenticated: !!auth?.isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
