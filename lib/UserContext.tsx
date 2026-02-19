'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SessionUser } from '@/lib/types';

interface UserContextType {
  user: SessionUser | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({ user: null, loading: true });

interface UserProviderProps {
  children: ReactNode;
  initialUser?: SessionUser | null;
}

export function UserProvider({ children, initialUser }: UserProviderProps) {
  const [user, setUser] = useState<SessionUser | null>(initialUser ?? null);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    // Skip fetch if we already have the user from server
    if (initialUser) return;

    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [initialUser]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
