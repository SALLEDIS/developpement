import { useState, useEffect, createContext, useContext } from 'react';
import { RestaurantSettings } from '../types';

interface SettingsContextType {
  settings: RestaurantSettings;
  updateSettings: (settings: Partial<RestaurantSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings doit être utilisé dans un SettingsProvider');
  }
  return context;
};

export const useSettingsProvider = () => {
  const [settings, setSettings] = useState<RestaurantSettings>({
    id: '1',
    name: 'RestoBar',
    address: '123 Avenue Principale, Abidjan, Côte d\'Ivoire',
    phone: '+225 01 02 03 04 05',
    email: 'contact@restobar.ci',
    whatsappNumber: '+22501020304',
    taxRate: 0.1,
    currency: 'CFA',
    timezone: 'Africa/Abidjan',
  });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const storedSettings = localStorage.getItem('restobar_settings');
      if (storedSettings) {
        try {
          const parsedSettings = JSON.parse(storedSettings);
          setSettings(parsedSettings);
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('restobar_settings', JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  const updateSettings = (newSettings: Partial<RestaurantSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return {
    settings,
    updateSettings,
  };
};

export { SettingsContext };