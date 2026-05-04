'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '@/shared/api/apiClient';
import { getCopy, LANGUAGES } from '@/shared/utils/i18n';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES.ENGLISH);
  const [copy, setCopy] = useState(getCopy(LANGUAGES.ENGLISH));

  // Check for existing session on mount
  useEffect(() => {
    // 1. Initial language check (smooth load)
    const savedLang = localStorage.getItem('av_lang');
    if (savedLang) {
      setCurrentLanguage(savedLang);
      setCopy(getCopy(savedLang));
    }

    // 2. Auth check
    const token = localStorage.getItem('av_token');
    if (token) {
      api.get('/api/auth/me')
        .then((userData) => {
          setUser(userData);
          const lang = userData.languagePreference || savedLang || LANGUAGES.ENGLISH;
          setCurrentLanguage(lang);
          setCopy(getCopy(lang));
          if (userData.languagePreference) localStorage.setItem('av_lang', lang);
        })
        .catch(() => {
          localStorage.removeItem('av_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api.post('/api/auth/login', { username, password });
    localStorage.setItem('av_token', data.token);
    setUser(data.user);
    const lang = data.user.languagePreference || LANGUAGES.ENGLISH;
    setCurrentLanguage(lang);
    setCopy(getCopy(lang));
    return data;
  }, []);

  const signup = useCallback(async (userData) => {
    const data = await api.post('/api/auth/signup', userData);
    localStorage.setItem('av_token', data.token);
    setUser(data.user);
    const lang = data.user.languagePreference || LANGUAGES.ENGLISH;
    setCurrentLanguage(lang);
    setCopy(getCopy(lang));
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('av_token');
    setUser(null);
    setCurrentLanguage(LANGUAGES.ENGLISH);
    setCopy(getCopy(LANGUAGES.ENGLISH));
  }, []);

  const changeLanguage = useCallback(async (lang) => {
    if (!Object.values(LANGUAGES).includes(lang)) return;
    
    // Optimistic UI update
    setCopy(getCopy(lang));
    setCurrentLanguage(lang);
    localStorage.setItem('av_lang', lang);
    
    if (user) {
      setUser(prev => ({ ...prev, languagePreference: lang }));
      try {
        await api.patch('/api/auth/me', { languagePreference: lang });
      } catch (err) {
        console.error('Failed to update language on server', err);
        // Optional: roll back UI if critical, but for lang it's usually fine to keep local
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      signup, 
      logout, 
      changeLanguage,
      copy,
      currentLanguage,
      isLoggedIn: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
