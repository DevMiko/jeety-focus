import type { Role, UserProfile } from '@/constants/mock-data';
import { USERS } from '@/constants/mock-data';
import { useAuth } from '@/context/AuthContext';
import React, { createContext, useContext } from 'react';

interface RoleContextType {
  role: Role | null;
  user: UserProfile | null;
  setRole: (role: Role) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType>({
  role: null,
  user: null,
  setRole: () => {},
  logout: () => {},
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  // Délègue à AuthContext tout en gardant la même interface publique
  const setRole = (r: Role) => {
    auth.setRole(r);
  };

  const logout = () => {
    auth.logout();
  };

  // Tant que l'API n'est pas branchée, on continue d'utiliser USERS mock
  // Quand l'API sera prête, auth.userdata contiendra les vraies données
  const user = auth.userdata ?? (auth.role ? USERS[auth.role] : null);

  return (
    <RoleContext.Provider value={{ role: auth.role, user, setRole, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  return useContext(RoleContext);
}
