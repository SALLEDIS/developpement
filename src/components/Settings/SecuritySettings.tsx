import React, { useState } from 'react';
import { Shield, Lock, Clock, AlertTriangle, Eye, Key, Database, Bell, RotateCcw, Save, Info } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useSecuritySettings } from '../../hooks/useSecuritySettings';

const SecuritySettings: React.FC = () => {
  const { settings, updateSettings, resetToDefaults, loading } = useSecuritySettings();
  const [hasChanges, setHasChanges] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings({ ...localSettings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      alert('Paramètres de sécurité enregistrés avec succès');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleReset = async () => {
    if (confirm('Réinitialiser tous les paramètres de sécurité aux valeurs par défaut ?')) {
      await resetToDefaults();
      setHasChanges(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Chargement...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Paramètres de sécurité</h2>
            <p className="text-gray-600 mt-1">Configurez les règles de sécurité de votre système</p>
          </div>
          <div className="flex gap-3">
            {hasChanges && (
              <Button
                onClick={handleSave}
                icon={Save}
              >
                Enregistrer
              </Button>
            )}
            <Button
              variant="secondary"
              icon={RotateCcw}
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Sessions et Connexions */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sessions et connexions</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée de session (minutes)
                  </label>
                  <Input
                    type="number"
                    value={localSettings.sessionTimeout}
                    onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
                    min={30}
                    max={1440}
                  />
                  <p className="text-xs text-gray-500 mt-1">Déconnexion automatique après inactivité</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verrouillage auto (minutes)
                  </label>
                  <Input
                    type="number"
                    value={localSettings.autoLockTimeout}
                    onChange={(e) => handleChange('autoLockTimeout', parseInt(e.target.value))}
                    min={1}
                    max={60}
                  />
                  <p className="text-xs text-gray-500 mt-1">Verrouillage écran après inactivité</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tentatives max de connexion
                  </label>
                  <Input
                    type="number"
                    value={localSettings.maxLoginAttempts}
                    onChange={(e) => handleChange('maxLoginAttempts', parseInt(e.target.value))}
                    min={3}
                    max={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">Avant blocage du compte</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durée de blocage (minutes)
                  </label>
                  <Input
                    type="number"
                    value={localSettings.lockoutDuration}
                    onChange={(e) => handleChange('lockoutDuration', parseInt(e.target.value))}
                    min={5}
                    max={120}
                  />
                  <p className="text-xs text-gray-500 mt-1">Après tentatives échouées</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700">Sessions multiples</label>
                  <p className="text-xs text-gray-500">Autoriser plusieurs connexions simultanées</p>
                </div>
                <button
                  onClick={() => handleChange('allowMultipleSessions', !localSettings.allowMultipleSessions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.allowMultipleSessions ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.allowMultipleSessions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Politique de mots de passe */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Politique de mots de passe</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longueur minimale
                  </label>
                  <Input
                    type="number"
                    value={localSettings.passwordMinLength}
                    onChange={(e) => handleChange('passwordMinLength', parseInt(e.target.value))}
                    min={4}
                    max={20}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration (jours)
                  </label>
                  <Input
                    type="number"
                    value={localSettings.passwordExpiryDays}
                    onChange={(e) => handleChange('passwordExpiryDays', parseInt(e.target.value))}
                    min={0}
                    max={365}
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = jamais</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Majuscules obligatoires</label>
                  <button
                    onClick={() => handleChange('requireUppercase', !localSettings.requireUppercase)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.requireUppercase ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.requireUppercase ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Minuscules obligatoires</label>
                  <button
                    onClick={() => handleChange('requireLowercase', !localSettings.requireLowercase)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.requireLowercase ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.requireLowercase ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Chiffres obligatoires</label>
                  <button
                    onClick={() => handleChange('requireNumbers', !localSettings.requireNumbers)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.requireNumbers ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.requireNumbers ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Caractères spéciaux obligatoires</label>
                  <button
                    onClick={() => handleChange('requireSpecialChars', !localSettings.requireSpecialChars)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.requireSpecialChars ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.requireSpecialChars ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sécurité avancée */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sécurité avancée</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Authentification à deux facteurs</label>
                  <p className="text-xs text-gray-500">Code de vérification requis à la connexion</p>
                </div>
                <button
                  onClick={() => handleChange('twoFactorEnabled', !localSettings.twoFactorEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Code PIN pour actions sensibles</label>
                  <p className="text-xs text-gray-500">Suppression, modification de prix, annulation</p>
                </div>
                <button
                  onClick={() => handleChange('requirePinForSensitiveActions', !localSettings.requirePinForSensitiveActions)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.requirePinForSensitiveActions ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.requirePinForSensitiveActions ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Filtrage IP</label>
                  <p className="text-xs text-gray-500">Limiter l'accès à des adresses IP spécifiques</p>
                </div>
                <button
                  onClick={() => handleChange('ipWhitelisting', !localSettings.ipWhitelisting)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.ipWhitelisting ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.ipWhitelisting ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Audit et journalisation */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Audit et journalisation</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Journalisation des actions</label>
                  <p className="text-xs text-gray-500">Enregistrer toutes les actions importantes</p>
                </div>
                <button
                  onClick={() => handleChange('auditLogging', !localSettings.auditLogging)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.auditLogging ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.auditLogging ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rétention des logs (jours)
                </label>
                <Input
                  type="number"
                  value={localSettings.logRetentionDays}
                  onChange={(e) => handleChange('logRetentionDays', parseInt(e.target.value))}
                  min={7}
                  max={365}
                />
                <p className="text-xs text-gray-500 mt-1">Durée de conservation des journaux</p>
              </div>
            </div>
          </section>

          {/* Sauvegardes */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Sauvegardes</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Sauvegardes automatiques</label>
                  <p className="text-xs text-gray-500">Sauvegarde régulière de la base de données</p>
                </div>
                <button
                  onClick={() => handleChange('automaticBackup', !localSettings.automaticBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.automaticBackup ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.automaticBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {localSettings.automaticBackup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence de sauvegarde
                  </label>
                  <select
                    value={localSettings.backupFrequency}
                    onChange={(e) => handleChange('backupFrequency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Quotidienne</option>
                    <option value="weekly">Hebdomadaire</option>
                    <option value="monthly">Mensuelle</option>
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Notifications */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Alertes de sécurité</label>
                  <p className="text-xs text-gray-500">Notifier les événements de sécurité importants</p>
                </div>
                <button
                  onClick={() => handleChange('notifySecurityEvents', !localSettings.notifySecurityEvents)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.notifySecurityEvents ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.notifySecurityEvents ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-2">Recommandations de sécurité</h3>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• Activez l'authentification à deux facteurs pour les comptes administrateurs</li>
              <li>• Définissez une politique de mot de passe stricte (minimum 8 caractères avec chiffres)</li>
              <li>• Activez les sauvegardes automatiques quotidiennes</li>
              <li>• Conservez les journaux d'audit pendant au moins 90 jours</li>
              <li>• Configurez un timeout de session de 8 heures maximum</li>
              <li>• Limitez les tentatives de connexion à 5 maximum</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SecuritySettings;
