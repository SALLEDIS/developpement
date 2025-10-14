import React, { useState } from 'react';
import { Plus, Edit, Trash2, User, Shield, Mail, Calendar, Key, Eye, EyeOff } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useUsers } from '../../hooks/useUsers';
import { User as UserType } from '../../types';

const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, getUsersByRole } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'waiter' as UserType['role'],
    isActive: true,
    permissions: [] as string[],
  });

  const roles = [
    { value: 'admin', label: 'Administrateur', color: 'red', permissions: ['all'] },
    { value: 'manager', label: 'Manager', color: 'blue', permissions: ['orders', 'products', 'reports', 'users'] },
    { value: 'waiter', label: 'Serveur', color: 'green', permissions: ['orders', 'tables'] },
    { value: 'kitchen', label: 'Cuisine', color: 'orange', permissions: ['orders'] },
    { value: 'cashier', label: 'Caissier', color: 'purple', permissions: ['orders', 'payments'] },
  ];

  const allPermissions = [
    { id: 'all', label: 'Tous les droits' },
    { id: 'orders', label: 'Gestion des commandes' },
    { id: 'products', label: 'Gestion des produits' },
    { id: 'tables', label: 'Gestion des tables' },
    { id: 'payments', label: 'Gestion des paiements' },
    { id: 'reports', label: 'Rapports et analyses' },
    { id: 'users', label: 'Gestion des utilisateurs' },
    { id: 'settings', label: 'Paramètres système' },
  ];

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'waiter',
      isActive: true,
      permissions: ['orders'],
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: user.password || '',
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions,
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = () => {
    if (!formData.name || !formData.email || !formData.password) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const userData = {
      ...formData,
      createdAt: editingUser?.createdAt || new Date(),
    };

    if (editingUser) {
      updateUser(editingUser.id, userData);
    } else {
      addUser(userData);
    }

    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      deleteUser(userId);
    }
  };

  const handleRoleChange = (role: UserType['role']) => {
    const roleConfig = roles.find(r => r.value === role);
    setFormData(prev => ({
      ...prev,
      role,
      permissions: roleConfig?.permissions || [],
    }));
  };

  const handlePermissionToggle = (permission: string) => {
    if (permission === 'all') {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes('all') ? [] : ['all'],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission && p !== 'all')
          : [...prev.permissions.filter(p => p !== 'all'), permission],
      }));
    }
  };

  const getRoleColor = (role: UserType['role']) => {
    const roleConfig = roles.find(r => r.value === role);
    return roleConfig?.color || 'gray';
  };

  const getRoleLabel = (role: UserType['role']) => {
    const roleConfig = roles.find(r => r.value === role);
    return roleConfig?.label || role;
  };

  const getPermissionText = (permissions: string[]) => {
    if (permissions.includes('all')) return 'Tous les droits';
    return permissions.map(p => allPermissions.find(ap => ap.id === p)?.label).join(', ');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des utilisateurs</h2>
          <p className="text-gray-600">Gérez les comptes utilisateurs, mots de passe et permissions</p>
        </div>
        <Button onClick={handleCreateUser} icon={Plus}>
          Nouvel utilisateur
        </Button>
      </div>

      {/* Statistiques par rôle */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {roles.map(role => (
          <Card key={role.value} padding="sm" className="text-center">
            <div className={`text-2xl font-bold text-${role.color}-600`}>
              {getUsersByRole(role.value as UserType['role']).length}
            </div>
            <div className="text-sm text-gray-600">{role.label}s</div>
          </Card>
        ))}
      </div>

      {/* Liste des utilisateurs */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Utilisateurs ({users.length})
        </h3>

        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="h-16 w-16 mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">Aucun utilisateur</h4>
            <p className="text-sm mb-4">Créez votre premier utilisateur pour commencer</p>
            <Button onClick={handleCreateUser} icon={Plus}>
              Créer un utilisateur
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold bg-${getRoleColor(user.role)}-500`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{user.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-800`}>
                        {getRoleLabel(user.role)}
                      </span>
                      {!user.isActive && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactif
                        </span>
                      )}
                      {user.password && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Key className="h-3 w-3 mr-1" />
                          Mot de passe
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {user.createdAt.toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Shield className="h-3 w-3" />
                        <span className="text-xs">{getPermissionText(user.permissions)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  {user.id !== '1' && ( // Empêcher la suppression de l'admin principal
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de création/édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom complet"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Saisir le mot de passe"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={generatePassword}
                icon={Key}
              >
                Générer
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Le mot de passe doit contenir au moins 6 caractères
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {roles.map(role => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => handleRoleChange(role.value as UserType['role'])}
                  className={`p-3 rounded-lg border-2 transition-colors text-left ${
                    formData.role === role.value
                      ? `border-${role.color}-500 bg-${role.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{role.label}</div>
                  <div className="text-sm text-gray-600">
                    {role.permissions.includes('all') ? 'Tous les droits' : role.permissions.join(', ')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions spécifiques
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allPermissions.map(permission => (
                <label key={permission.id} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission.id)}
                    onChange={() => handlePermissionToggle(permission.id)}
                    className="mr-2"
                    disabled={permission.id !== 'all' && formData.permissions.includes('all')}
                  />
                  <span className="text-sm text-gray-700">{permission.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">
                Utilisateur actif
              </span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setIsModalOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveUser}>
              {editingUser ? 'Modifier' : 'Créer'} l'utilisateur
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;