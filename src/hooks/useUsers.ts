import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';

interface UserContextType {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUsersByRole: (role: User['role']) => User[];
  getActiveUsers: () => User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers doit être utilisé dans un UserProvider');
  }
  return context;
};

export const useUserProvider = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Utilisateurs par défaut
  const defaultUsers: User[] = [
    {
      id: '1',
      name: 'Administrateur',
      email: 'admin@restobar.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      permissions: ['all']
    },
    {
      id: '2',
      name: 'Manager Principal',
      email: 'manager@restobar.com',
      role: 'manager',
      isActive: true,
      createdAt: new Date(),
      permissions: ['orders', 'products', 'reports', 'users']
    }
  ];

  useEffect(() => {
    if (!isInitialized) {
      const storedUsers = localStorage.getItem('restobar_users');
      if (storedUsers) {
        try {
          const parsedUsers = JSON.parse(storedUsers);
          if (Array.isArray(parsedUsers)) {
            const usersWithDates = parsedUsers.map(user => ({
              ...user,
              createdAt: new Date(user.createdAt),
            }));
            setUsers(usersWithDates);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          setUsers(defaultUsers);
        }
      } else {
        setUsers(defaultUsers);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('restobar_users', JSON.stringify(users));
    }
  }, [users, isInitialized]);

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, ...userData } : u
    ));
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const getUsersByRole = (role: User['role']) => {
    return users.filter(u => u.role === role && u.isActive);
  };

  const getActiveUsers = () => {
    return users.filter(u => u.isActive);
  };

  return {
    users,
    addUser,
    updateUser,
    deleteUser,
    getUsersByRole,
    getActiveUsers,
  };
};

export { UserContext };