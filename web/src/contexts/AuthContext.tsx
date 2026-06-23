import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import {
  getCurrentSession,
  getUsuarioPerfil,
  signInWithEmail,
  signOut as supabaseSignOut,
} from "../services/authService";
import { supabase } from "../services/supabase/client";
import type { UsuarioPerfil } from "../types/app";
import { AuthContext, type AuthContextValue } from "./authContextValue";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(nextSession: Session | null) {
    setSession(nextSession);

    if (!nextSession) {
      setUsuario(null);
      return;
    }

    const profile = await getUsuarioPerfil(nextSession);
    setUsuario(profile);
  }

  useEffect(() => {
    let active = true;

    getCurrentSession()
      .then(async (currentSession) => {
        if (!active) return;
        await loadProfile(currentSession);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const subscription = supabase?.auth.onAuthStateChange(
      async (_event, nextSession) => {
        await loadProfile(nextSession);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      usuario,
      loading,
      async login(email, password) {
        setLoading(true);
        try {
          const nextSession = await signInWithEmail(email, password);
          await loadProfile(nextSession);
        } finally {
          setLoading(false);
        }
      },
      async logout() {
        setLoading(true);
        try {
          await supabaseSignOut();
          await loadProfile(null);
        } finally {
          setLoading(false);
        }
      },
    }),
    [loading, session, usuario]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
