import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AppUser } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: AppUser | null;
  isLoggedIn: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch additional user info from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: data.fullName || firebaseUser.displayName || 'User',
            });
          } else {
            // Fallback to basic info if doc doesn't exist
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            fullName: firebaseUser.displayName || 'User',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoggedIn: !!user, 
      loading,
      logout 
    }}>
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
