import { createContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { AuthAccess, AuthPermission } from "@/features/crm/auth/types/auth-access";

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  access: AuthAccess;
  loading: boolean;
  authError: string | null;
  hasPermission: (permission: AuthPermission) => boolean;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
