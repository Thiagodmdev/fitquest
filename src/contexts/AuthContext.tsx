import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../services/api';
import type { AppUser } from '../types';

export interface AuthContextValue {
  user: AppUser | null;
  /** Verdadeiro até o serviço responder se existe uma sessão salva. */
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      api.onAuthChange((nextUser) => {
        setUser(nextUser);
        setLoading(false);
      }),
    [],
  );

  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
