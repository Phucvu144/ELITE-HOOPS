import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // --- GIẢI THÍCH VỀ useEffect VÀ SESSION PERSISTENCE ---
  // useEffect này chạy ngay khi ứng dụng được "Mounted" (tải lên lần đầu).
  // Nó kiểm tra trong localStorage xem có key 'user_session' không.
  // Nếu có, nó sẽ parse dữ liệu JSON đó và cập nhật vào State của ứng dụng.
  // Đây chính là cách web "nhớ mặt" khách: Dữ liệu trong localStorage không bị mất khi F5 trang.
  useEffect(() => {
    const savedSession = localStorage.getItem('user_session');
    if (savedSession) {
      try {
        const userData = JSON.parse(savedSession);
        setUser(userData);
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Lỗi khi đọc session:', error);
        localStorage.removeItem('user_session');
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('user_session', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user_session');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
