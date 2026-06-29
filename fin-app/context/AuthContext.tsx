"use client";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  login: (email: string, pass: string) => ReturnType<typeof signInWithEmailAndPassword>;
  logout: () => ReturnType<typeof signOut>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signup = useCallback(async (email: string, pass: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, {
      displayName: name,
    });
    setUser({ ...userCredential.user, displayName: name });
  }, []);

  const login = useCallback(
    (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass),
    []
  );

  const logout = useCallback(() => signOut(auth), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
