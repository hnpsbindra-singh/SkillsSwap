import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../config/api';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sb_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/profile/me'), {
        headers: { 'Authorization': 'Bearer ' + token },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Auth fetch error:', err);
      // Token might be invalid
      localStorage.removeItem('sb_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (username, password) => {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Login failed');
    }
    // Backend returns JWT token as plain text
    const jwt = await res.text();
    localStorage.setItem('sb_token', jwt);
    setToken(jwt);
  };

  const register = async (name, username, password) => {
    const res = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, password }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Registration failed');
    }
    // Returns { id, name, username, recoveryCode }
    return await res.json();
  };

  const forgotPassword = async (username, newPassword, key) => {
    const res = await fetch(apiUrl('/api/auth/forgotPassword'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, newPassword, key }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Password reset failed');
    }
    return await res.json();
  };

  const logout = () => {
    localStorage.removeItem('sb_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await fetch(apiUrl('/api/profile/me'), {
      method: 'PUT',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Profile update failed');
    }
    const updated = await res.json();
    setUser(updated);
    return updated;
  };

  const uploadProfilePicture = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const res = await fetch(apiUrl('/api/profile/picture'), {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
      },
      body: formData,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Upload failed');
    }
    const url = await res.text();
    // Re-fetch user to update profile pic
    await fetchUser();
    return url;
  };

  const isAdmin = user?.role === 'ADMIN';

  const value = {
    token,
    user,
    loading,
    isAdmin,
    login,
    register,
    forgotPassword,
    logout,
    updateProfile,
    uploadProfilePicture,
    fetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
