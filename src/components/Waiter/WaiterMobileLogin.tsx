import React, { useState } from 'react';
import { Smartphone, LogIn } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

interface WaiterMobileLoginProps {
  onLogin: () => void;
}

const WaiterMobileLogin: React.FC<WaiterMobileLoginProps> = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(code, code);
      onLogin();
    } catch (error) {
      alert('Code incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Mode Serveur</h1>
            <p className="text-gray-600">Entrez votre code pour commencer</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="Code serveur"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              className="text-center text-2xl tracking-widest"
            />

            <Button
              type="submit"
              size="lg"
              loading={isLoading}
              icon={LogIn}
              className="w-full"
            >
              Connexion
            </Button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              <strong>Première utilisation ?</strong>
              <br />
              Demandez votre code au gérant
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-white text-sm">
          <p>RestoBar - Interface Mobile Serveur</p>
        </div>
      </div>
    </div>
  );
};

export default WaiterMobileLogin;
