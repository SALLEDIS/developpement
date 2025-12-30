import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

export interface SecuritySettings {
  sessionTimeout: number;
  autoLockTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  passwordMinLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  passwordExpiryDays: number;
  twoFactorEnabled: boolean;
  auditLogging: boolean;
  logRetentionDays: number;
  requirePinForSensitiveActions: boolean;
  allowMultipleSessions: boolean;
  ipWhitelisting: boolean;
  whitelistedIPs: string[];
  automaticBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  notifySecurityEvents: boolean;
}

interface SecuritySettingsContextType {
  settings: SecuritySettings;
  loading: boolean;
  updateSettings: (updates: Partial<SecuritySettings>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const SecuritySettingsContext = createContext<SecuritySettingsContextType | undefined>(undefined);

const defaultSecuritySettings: SecuritySettings = {
  sessionTimeout: 480,
  autoLockTimeout: 15,
  maxLoginAttempts: 5,
  lockoutDuration: 30,
  passwordMinLength: 6,
  requireUppercase: false,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  passwordExpiryDays: 90,
  twoFactorEnabled: false,
  auditLogging: true,
  logRetentionDays: 90,
  requirePinForSensitiveActions: true,
  allowMultipleSessions: false,
  ipWhitelisting: false,
  whitelistedIPs: [],
  automaticBackup: true,
  backupFrequency: 'daily',
  notifySecurityEvents: true,
};

export const useSecuritySettingsProvider = () => {
  const [settings, setSettings] = useState<SecuritySettings>(defaultSecuritySettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'security_settings')
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        setSettings(data.value as SecuritySettings);
      } else {
        await saveSettings(defaultSecuritySettings);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: SecuritySettings) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'security_settings',
          value: newSettings,
        }, {
          onConflict: 'key',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving security settings:', error);
      throw error;
    }
  };

  const updateSettings = async (updates: Partial<SecuritySettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await saveSettings(newSettings);
  };

  const resetToDefaults = async () => {
    setSettings(defaultSecuritySettings);
    await saveSettings(defaultSecuritySettings);
  };

  return {
    settings,
    loading,
    updateSettings,
    resetToDefaults,
  };
};

export const useSecuritySettings = () => {
  const context = useContext(SecuritySettingsContext);
  if (context === undefined) {
    throw new Error('useSecuritySettings must be used within a SecuritySettingsProvider');
  }
  return context;
};
