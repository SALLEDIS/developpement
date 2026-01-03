import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, AlertCircle, Plus, Settings } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import PrinterForm from './PrinterForm';
import PrintService from '../../services/PrintService';
import { usePrinters } from '../../hooks/usePrinters';
import { usePrintServerConfig } from '../../hooks/usePrintServerConfig';
import { Printer as PrinterType } from '../../types';

const PrinterSettings: React.FC = () => {
  const { printers, addPrinter, updatePrinter, deletePrinter } = usePrinters();
  const { config, isServerOnline, updateConfig } = usePrintServerConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [tempServerUrl, setTempServerUrl] = useState('http://localhost:3001');

  const printService = PrintService.getInstance();

  useEffect(() => {
    if (printers.length > 0) {
      printService.setPrinters(printers);
    }
  }, [printers]);

  const handleAutoSetup = async () => {
    setIsInitializing(true);
    try {
      await printService.refreshSystemPrinters();
      const defaultPrinter = printService.getDefaultSystemPrinter();

      if (defaultPrinter) {
        const cashPrinterData: Omit<PrinterType, 'id'> = {
          name: 'Imprimante Caisse',
          type: 'caisse',
          ipAddress: defaultPrinter.name,
          port: 0,
          model: 'Système',
          paperSize: '80mm',
          isActive: true,
          isOnline: true,
          categories: [],
          autoprint: true
        };

        await addPrinter(cashPrinterData);
        alert('✓ Configuration automatique terminée!\nImprimante de caisse prête.');
      } else {
        alert('Aucune imprimante système détectée.\nVeuillez en ajouter une manuellement.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration:', error);
      alert('Erreur lors de la détection automatique');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAddPrinter = () => {
    setEditingPrinter(null);
    setIsModalOpen(true);
  };

  const handleEditPrinter = (printer: PrinterType) => {
    setEditingPrinter(printer);
    setIsModalOpen(true);
  };

  const handleSavePrinter = async (printerData: Omit<PrinterType, 'id'>) => {
    if (editingPrinter) {
      await updatePrinter(editingPrinter.id, printerData);
    } else {
      await addPrinter(printerData);
    }
    setIsModalOpen(false);
    setEditingPrinter(null);
  };

  const handleDeletePrinter = async (printerId: string) => {
    if (confirm('Supprimer cette imprimante ?')) {
      await deletePrinter(printerId);
    }
  };

  const handleTestPrint = async (printer: PrinterType) => {
    console.log('\n=== TEST D\'IMPRESSION ===');
    console.log('Imprimante:', printer.name);
    console.log('Type:', printer.type);
    console.log('Port:', printer.port);
    console.log('ID:', printer.id);

    try {
      await printService.testPrint(printer.id);
      alert('✓ Test réussi!\n\nLa fenêtre d\'impression devrait s\'ouvrir automatiquement.\nSélectionnez votre imprimante et cliquez sur Imprimer.');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      console.error('✗ Erreur test impression:', error);
      alert('✗ Test échoué\n\nErreur: ' + errorMessage + '\n\nConsultez la console (F12) pour plus de détails.');
    }
  };

  const handleToggleActive = async (printerId: string) => {
    const printer = printers.find(p => p.id === printerId);
    if (printer) {
      const { id, ...printerData } = printer;
      await updatePrinter(printerId, { ...printerData, isActive: !printer.isActive });
    }
  };

  const handleToggleServerEnabled = async () => {
    console.log('=== TOGGLE SERVER ENABLED CLICKED ===');
    try {
      const newValue = !(config?.enabled || false);
      console.log('Toggling from', config?.enabled, 'to', newValue);
      await updateConfig({ enabled: newValue });
      console.log('Toggle successful');
    } catch (error) {
      console.error('=== TOGGLE ERROR ===');
      console.error('Full error object:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);

      let errorMessage = 'Erreur inconnue';
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else if (typeof error === 'object' && error !== null) {
        console.error('Error keys:', Object.keys(error));
        console.error('Error values:', Object.values(error));
        errorMessage = JSON.stringify(error, null, 2);
      }

      alert('Erreur lors de la mise à jour:\n' + errorMessage + '\n\nOuvrez la console (F12) pour plus de détails');
    }
  };

  const handleToggleAutoPrint = async () => {
    try {
      const newValue = !(config?.auto_print || false);
      await updateConfig({ auto_print: newValue });
    } catch (error) {
      console.error('Erreur complète:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert('Erreur lors de la mise à jour:\n' + errorMessage);
    }
  };

  const handleOpenConfigModal = () => {
    setTempServerUrl(config?.server_url || 'http://localhost:3001');
    setIsConfigModalOpen(true);
  };

  const handleSaveServerConfig = async () => {
    try {
      await updateConfig({ server_url: tempServerUrl });
      setIsConfigModalOpen(false);
      alert('✓ Configuration sauvegardée');
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'caisse': return 'Caisse';
      case 'cuisine': return 'Cuisine';
      case 'bar': return 'Bar';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'caisse': return 'bg-blue-100 text-blue-800';
      case 'cuisine': return 'bg-orange-100 text-orange-800';
      case 'bar': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Imprimantes</h2>
          <p className="text-gray-600">Configuration simple en 1 clic</p>
        </div>
      </div>

      <Card className={config?.enabled && isServerOnline ? 'border-green-200 bg-green-50' : 'border-gray-200'}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {config?.enabled && isServerOnline ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-900">Serveur d'impression actif</h3>
                    <p className="text-sm text-green-700">
                      Impression directe sans dialogue du navigateur
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      URL: {config.server_url}
                    </p>
                  </div>
                </>
              ) : config?.enabled && !isServerOnline ? (
                <>
                  <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-yellow-900">Serveur d'impression hors ligne</h3>
                    <p className="text-sm text-yellow-700">
                      Fallback: utilisation du dialogue d'impression du navigateur
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Pour activer: double-cliquez sur start-print-server.bat (Windows) ou ./start-print-server.sh (Mac/Linux)
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <AlertCircle className="h-6 w-6 text-gray-600 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">Serveur d'impression désactivé</h3>
                    <p className="text-sm text-gray-700">
                      Utilisation du dialogue d'impression du navigateur
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={Settings}
              onClick={handleOpenConfigModal}
            >
              Configurer
            </Button>
          </div>

          <div className="flex items-center gap-6 pt-3 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={config?.enabled || false}
                onChange={handleToggleServerEnabled}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Activer le serveur d'impression</span>
            </label>

            {config?.enabled && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config?.auto_print || false}
                  onChange={handleToggleAutoPrint}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Impression automatique</span>
              </label>
            )}
          </div>
        </div>
      </Card>

      {printers.length === 0 ? (
        <Card className="text-center py-12">
          <Printer className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Configuration automatique
          </h3>
          <p className="text-gray-600 mb-6">
            Cliquez pour détecter votre imprimante système
          </p>
          <Button
            onClick={handleAutoSetup}
            loading={isInitializing}
            size="lg"
            icon={Printer}
          >
            {isInitializing ? 'Détection...' : 'Configurer automatiquement'}
          </Button>
          <div className="mt-6 pt-6 border-t">
            <Button
              onClick={handleAddPrinter}
              variant="secondary"
              icon={Plus}
            >
              Ajouter manuellement
            </Button>
          </div>
        </Card>
      ) : (
        <>
          <Card className="border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">Configuration active</h3>
                <p className="text-sm text-green-700">
                  {printers.filter(p => p.isActive).length} imprimante(s) prête(s)
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mes imprimantes</h3>
              <Button onClick={handleAddPrinter} icon={Plus} size="sm">
                Ajouter
              </Button>
            </div>

            <div className="space-y-3">
              {printers.map(printer => (
                <div
                  key={printer.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    printer.isActive ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      printer.isActive ? 'bg-green-100' : 'bg-gray-200'
                    }`}>
                      <Printer className={`h-6 w-6 ${
                        printer.isActive ? 'text-green-600' : 'text-gray-500'
                      }`} />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{printer.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(printer.type)}`}>
                          {getTypeLabel(printer.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {printer.model} • {printer.paperSize}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleTestPrint(printer)}
                      disabled={!printer.isActive}
                    >
                      Test
                    </Button>

                    <button
                      onClick={() => handleToggleActive(printer.id)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        printer.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {printer.isActive ? 'Actif' : 'Inactif'}
                    </button>

                    <button
                      onClick={() => handleEditPrinter(printer)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Modifier
                    </button>

                    <button
                      onClick={() => handleDeletePrinter(printer.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Conseil</p>
                <p>Pour la caisse, utilisez l'imprimante système (configuration automatique)</p>
                <p>Pour cuisine/bar, ajoutez des imprimantes réseau si nécessaire</p>
              </div>
            </div>
          </Card>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrinter(null);
        }}
        title={editingPrinter ? 'Modifier' : 'Ajouter une imprimante'}
        size="lg"
      >
        <PrinterForm
          printer={editingPrinter}
          onSave={handleSavePrinter}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingPrinter(null);
          }}
        />
      </Modal>

      <Modal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configuration du serveur d'impression"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL du serveur
            </label>
            <Input
              type="text"
              value={tempServerUrl}
              onChange={(e) => setTempServerUrl(e.target.value)}
              placeholder="http://localhost:3001"
            />
            <p className="text-xs text-gray-500 mt-1">
              Par défaut: http://localhost:3001
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Instructions</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Lancez le serveur d'impression sur votre poste</li>
                  <li>Windows: double-cliquez sur start-print-server.bat</li>
                  <li>Mac/Linux: exécutez ./start-print-server.sh</li>
                  <li>Si le serveur tourne sur un autre poste, modifiez l'URL ci-dessus</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsConfigModalOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveServerConfig}>
              Sauvegarder
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PrinterSettings;
