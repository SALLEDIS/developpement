import React, { useState, useEffect } from 'react';
import { Printer, Wifi, Search, Monitor, Usb } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Printer as PrinterType } from '../../types';
import { mockCategories } from '../../data/mockData';

interface PrinterFormProps {
  printer?: PrinterType | null;
  onSave: (printer: Omit<PrinterType, 'id'>) => void;
  onCancel: () => void;
}

interface LocalPrinter {
  name: string;
  status: 'ready' | 'offline' | 'busy';
  isDefault: boolean;
  type: 'local' | 'network';
  port?: string;
}

const PrinterForm: React.FC<PrinterFormProps> = ({
  printer,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'cuisine' as 'cuisine' | 'bar' | 'caisse',
    connectionType: 'network' as 'network' | 'local',
    ipAddress: '',
    port: 9100,
    localPrinterName: '',
    model: '',
    paperSize: '80mm' as '58mm' | '80mm',
    isActive: true,
    isOnline: false,
    categories: [] as string[],
  });

  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSearchingPrinters, setIsSearchingPrinters] = useState(false);
  const [localPrinters, setLocalPrinters] = useState<LocalPrinter[]>([]);

  const printerModels = [
    'Epson TM-T88VI',
    'Epson TM-T20III',
    'Star TSP143III',
    'Star TSP650II',
    'Citizen CT-S310II',
    'Bixolon SRP-350III',
    'HP LaserJet',
    'Canon PIXMA',
    'Brother HL',
    'Custom',
  ];

  // Simulation des imprimantes locales détectées
  const mockLocalPrinters: LocalPrinter[] = [
    { name: 'Epson TM-T88VI (USB001)', status: 'ready', isDefault: true, type: 'local', port: 'USB001' },
    { name: 'HP LaserJet Pro M404n', status: 'ready', isDefault: false, type: 'local', port: 'USB002' },
    { name: 'Canon PIXMA TS3350', status: 'offline', isDefault: false, type: 'local', port: 'USB003' },
    { name: 'Brother HL-L2350DW', status: 'ready', isDefault: false, type: 'network', port: '192.168.1.105' },
    { name: 'Star TSP143III (Bluetooth)', status: 'busy', isDefault: false, type: 'local', port: 'BT001' },
  ];

  useEffect(() => {
    if (printer) {
      setFormData({
        name: printer.name,
        type: printer.type,
        connectionType: printer.ipAddress ? 'network' : 'local',
        ipAddress: printer.ipAddress,
        port: printer.port,
        localPrinterName: printer.ipAddress ? '' : printer.name,
        model: printer.model,
        paperSize: printer.paperSize,
        isActive: printer.isActive,
        isOnline: printer.isOnline,
        categories: printer.categories,
      });
    }
  }, [printer]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCategoryToggle = (categoryName: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter(c => c !== categoryName)
        : [...prev.categories, categoryName],
    }));
  };

  const handleSearchLocalPrinters = async () => {
    setIsSearchingPrinters(true);
    
    // Simulation de la recherche d'imprimantes locales
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLocalPrinters(mockLocalPrinters);
    setIsSearchingPrinters(false);
  };

  const handleSelectLocalPrinter = (localPrinter: LocalPrinter) => {
    setFormData(prev => ({
      ...prev,
      name: prev.name || localPrinter.name,
      localPrinterName: localPrinter.name,
      isOnline: localPrinter.status === 'ready',
      model: localPrinter.name.includes('Epson') ? 'Epson TM-T88VI' :
             localPrinter.name.includes('HP') ? 'HP LaserJet' :
             localPrinter.name.includes('Canon') ? 'Canon PIXMA' :
             localPrinter.name.includes('Brother') ? 'Brother HL' :
             localPrinter.name.includes('Star') ? 'Star TSP143III' : 'Custom',
    }));
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    
    // Simulation du test de connexion
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let isConnected = false;
    
    if (formData.connectionType === 'network') {
      // Test de connexion réseau
      isConnected = Math.random() > 0.3;
    } else {
      // Test d'imprimante locale
      const selectedPrinter = localPrinters.find(p => p.name === formData.localPrinterName);
      isConnected = selectedPrinter?.status === 'ready';
    }
    
    setFormData(prev => ({
      ...prev,
      isOnline: isConnected,
    }));
    
    setIsTestingConnection(false);
    
    if (isConnected) {
      alert('Connexion réussie ! L\'imprimante répond correctement.');
    } else {
      alert('Échec de la connexion. Vérifiez la configuration de l\'imprimante.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const printerData: Omit<PrinterType, 'id'> = {
      name: formData.name,
      type: formData.type,
      ipAddress: formData.connectionType === 'network' ? formData.ipAddress : formData.localPrinterName,
      port: formData.connectionType === 'network' ? formData.port : 0,
      model: formData.model,
      paperSize: formData.paperSize,
      isActive: formData.isActive,
      isOnline: formData.isOnline,
      categories: formData.categories,
    };
    
    onSave(printerData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-600';
      case 'offline': return 'text-red-600';
      case 'busy': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready': return 'Prête';
      case 'offline': return 'Hors ligne';
      case 'busy': return 'Occupée';
      default: return status;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Guide simple */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Configuration simplifiée</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Pour la caisse : sélectionnez l'imprimante locale (USB/Système)</p>
          <p>• Pour la cuisine/bar : utilisez une imprimante réseau si disponible</p>
          <p>• Testez la connexion avant de sauvegarder</p>
        </div>
      </div>

      {/* Informations générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nom simple"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Ex: Caisse principale"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Utilisation
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="caisse">Caisse (tickets clients)</option>
            <option value="cuisine">Cuisine (commandes)</option>
            <option value="bar">Bar (boissons)</option>
          </select>
        </div>
      </div>

      {/* Type de connexion */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Où est l'imprimante ?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleInputChange('connectionType', 'local')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              formData.connectionType === 'local'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Monitor className="h-6 w-6 mx-auto mb-1 text-green-600" />
            <div className="text-center">
              <h4 className="font-medium text-gray-900 text-sm">Locale (recommandé)</h4>
              <p className="text-xs text-gray-600">Branchée à cet ordinateur</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleInputChange('connectionType', 'network')}
            className={`p-3 rounded-lg border-2 transition-colors ${
              formData.connectionType === 'network'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Wifi className="h-6 w-6 mx-auto mb-1 text-blue-600" />
            <div className="text-center">
              <h4 className="font-medium text-gray-900 text-sm">Réseau</h4>
              <p className="text-xs text-gray-600">Connectée par IP</p>
            </div>
          </button>
        </div>
      </div>

      {/* Configuration réseau */}
      {formData.connectionType === 'network' && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Adresse réseau</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Input
                label="Adresse IP de l'imprimante"
                value={formData.ipAddress}
                onChange={(e) => handleInputChange('ipAddress', e.target.value)}
                placeholder="Ex: 192.168.1.100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Trouvez l'IP dans les paramètres de l'imprimante</p>
            </div>

            <Input
              label="Port"
              type="number"
              value={formData.port}
              onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 9100)}
              placeholder="9100"
              required
            />
          </div>
        </div>
      )}

      {/* Configuration locale */}
      {formData.connectionType === 'local' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Sélectionnez votre imprimante</h3>
            <Button
              type="button"
              onClick={handleSearchLocalPrinters}
              loading={isSearchingPrinters}
              icon={Search}
              size="sm"
            >
              {isSearchingPrinters ? 'Recherche...' : 'Chercher'}
            </Button>
          </div>
          
          {localPrinters.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {localPrinters.map((localPrinter, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.localPrinterName === localPrinter.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectLocalPrinter(localPrinter)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {localPrinter.type === 'local' ? (
                        <Usb className="h-5 w-5 text-gray-500" />
                      ) : (
                        <Wifi className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{localPrinter.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={getStatusColor(localPrinter.status)}>
                          {getStatusText(localPrinter.status)}
                        </span>
                        {localPrinter.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs">
                            Par défaut
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {formData.localPrinterName === localPrinter.name && (
                    <div className="text-blue-600">
                      <Printer className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
              <Printer className="h-10 w-10 mx-auto mb-2" />
              <p className="text-sm font-medium">Aucune imprimante trouvée</p>
              <p className="text-xs">Cliquez sur "Chercher" pour détecter</p>
            </div>
          )}
          
          {formData.localPrinterName && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Imprimante sélectionnée :</span>
              </div>
              <p className="text-sm text-green-700 mt-1">{formData.localPrinterName}</p>
            </div>
          )}
        </div>
      )}

      {/* Test de connexion */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={handleTestConnection}
          loading={isTestingConnection}
          icon={Wifi}
          className="flex-1"
          disabled={
            (formData.connectionType === 'network' && (!formData.ipAddress || !formData.port)) ||
            (formData.connectionType === 'local' && !formData.localPrinterName)
          }
        >
          {isTestingConnection ? 'Test en cours...' : 'Tester la connexion'}
        </Button>
        
        {formData.isOnline && (
          <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md">
            <Wifi className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">En ligne</span>
          </div>
        )}
      </div>

      {/* Configuration matérielle */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Paramètres (optionnel)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modèle (si connu)
            </label>
            <select
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Détection automatique</option>
              {printerModels.map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Largeur papier
            </label>
            <select
              value={formData.paperSize}
              onChange={(e) => handleInputChange('paperSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="80mm">80mm (standard)</option>
              <option value="58mm">58mm (compact)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Affectation des catégories */}
      {formData.type !== 'caisse' && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900">Quoi imprimer sur cette imprimante ?</h3>
          <p className="text-sm text-gray-600">
            Sélectionnez les catégories (laissez vide pour tout imprimer)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {mockCategories.map(category => (
              <label key={category.id} className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(category.name)}
                  onChange={() => handleCategoryToggle(category.name)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-900">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Statut */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">
            Imprimante active
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Les imprimantes inactives ne recevront pas de commandes d'impression
        </p>
      </div>


      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {printer ? 'Modifier' : 'Ajouter'} l'imprimante
        </Button>
      </div>
    </form>
  );
};

export default PrinterForm;