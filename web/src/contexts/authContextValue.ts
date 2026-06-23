import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { UsuarioPerfil } from "../types/app";

export type AuthContextValue = {
  session: Session | null;
  usuario: UsuarioPerfil | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
