import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';

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
    
    // Récupérer les utilisateurs depuis localStorage
    const storedUsers = localStorage.getItem('restobar_users');
    let users: User[] = [];
    
    if (storedUsers) {
      try {
        const parsedUsers = JSON.parse(storedUsers);
        users = parsedUsers.map((user: any) => ({
          ...user,
          createdAt: new Date(user.createdAt),
        }));
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    }

    // Authentification simulée - en production, ce serait un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Vérifier les identifiants par défaut
    if (email === 'admin@restobar.com' && password === 'admin123') {
      const mockUser: User = {
        id: '1',
        name: 'Utilisateur Admin',
        email: 'admin@restobar.com',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        permissions: ['all']
      };
      
      setUser(mockUser);
      localStorage.setItem('restobar_user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    }
    
    // Vérifier dans la base d'utilisateurs
    const foundUser = users.find(u => 
      u.email === email && 
      u.password === password && 
      u.isActive
    );
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('restobar_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
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