import React, { useState } from 'react';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Card from '../ui/Card';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('admin@restobar.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (!success) {
      setError('Identifiants invalides. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Bienvenue sur RestoBar
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Connectez-vous à votre système de gestion
          </p>
        </div>
        
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              iconPosition="left"
              required
            />
            
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={Lock}
              iconPosition="left"
              required
            />
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              icon={LogIn}
              loading={isLoading}
            >
              Se connecter
            </Button>
          </form>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Identifiants de démonstration :</p>
            <p>Email : admin@restobar.com</p>
            <p>Mot de passe : admin123</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;