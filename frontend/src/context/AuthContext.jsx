import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

// Auth context
const AuthContext = createContext();

// Auth actions
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: null
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        
        const token = localStorage.getItem('token');
        if (token) {
          // Validate token and get user data
          const userData = await authService.getCurrentUser();
          if (userData) {
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData });
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
          }
        } else {
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.login(credentials);
      
      if (response.success) {
        const { token, user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Set user in state
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        
        return { success: true, user };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.register(userData);
      
      if (response.success) {
        const { token, user } = response.data;
        
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Set user in state
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        
        return { success: true, user };
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: response.message });
        return { success: false, message: response.message };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token from localStorage
      localStorage.removeItem('token');
      
      // Clear user from state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const updatedUser = await authService.updateProfile(profileData);
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: updatedUser });
      
      return { success: true, user: updatedUser };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed.';
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, message: errorMessage };
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has required role
  const hasRole = (requiredRoles) => {
    if (!state.user || !requiredRoles) return false;
    
    const userRole = state.user.role;
    return Array.isArray(requiredRoles) 
      ? requiredRoles.includes(userRole)
      : requiredRoles === userRole;
  };

  // Context value
  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;