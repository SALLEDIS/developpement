import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session utilisateur stockée
    const storedUser = localStorage.getItem('restobar_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Chercher l'utilisateur dans Supabase par email et PIN
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('pin_code', password)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Erreur lors de la connexion:', error);
        setIsLoading(false);
        return false;
      }

      if (users) {
        const user: User = {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          isActive: users.is_active,
          createdAt: new Date(users.created_at),
          permissions: users.role === 'admin' ? ['all'] : []
        };

        setUser(user);
        localStorage.setItem('restobar_user', JSON.stringify(user));
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('restobar_user');
  };

  return {
    user,
    login,
    logout,
    isLoading,
  };
};

export { AuthContext };