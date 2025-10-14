import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Printer, Wifi, WifiOff, Settings as SettingsIcon, Monitor, Usb, TestTube, RefreshCw, CheckCircle, RotateCcw, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import PrinterForm from './PrinterForm';
import PrintService from '../../services/PrintService';
import { Printer as PrinterType } from '../../types';

const PrinterSettings: React.FC = () => {
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const printService = PrintService.getInstance();

  useEffect(() => {
    // Initialiser le service avec les imprimantes et configurer l'imprimante par défaut
    initializePrintService();
  }, []);

  const initializePrintService = async () => {
    // Mettre à jour le service d'impression avec la liste des imprimantes
    printService.setPrinters(printers);
    
    // Rafraîchir la détection des imprimantes système
    await printService.refreshSystemPrinters();
    
    // Récupérer les imprimantes mises à jour (incluant l'imprimante de caisse auto-configurée)
    const updatedPrinters = printService.getActivePrinters();
    if (updatedPrinters.length > printers.length) {
      setPrinters(updatedPrinters);
    }
  };

  const handleRefreshSystemPrinters = async () => {
    setIsRefreshing(true);
    try {
      await printService.refreshSystemPrinters();
      
      // Récupérer les imprimantes système détectées
      const systemPrinters = printService.getSystemPrinters();
      const defaultPrinter = printService.getDefaultSystemPrinter();
      
      console.log('Imprimantes système détectées:', systemPrinters);
      console.log('Imprimante par défaut:', defaultPrinter?.name);
      
      // Mettre à jour la liste des imprimantes avec les nouvelles détections
      const updatedPrinters = [...printers];
      
      // Vérifier si l'imprimante de caisse par défaut a été créée/mise à jour
      const cashPrinter = updatedPrinters.find(p => p.type === 'caisse');
      if (defaultPrinter && (!cashPrinter || cashPrinter.id === 'default-cash-printer')) {
        const defaultCashPrinter: PrinterType = {
          id: 'default-cash-printer',
          name: `Caisse - ${defaultPrinter.name}`,
          type: 'caisse',
          ipAddress: defaultPrinter.name,
          port: 0,
          model: defaultPrinter.driver || 'Imprimante système',
          paperSize: '80mm',
          isActive: true,
          isOnline: defaultPrinter.status === 'ready',
          categories: []
        };
        
        if (cashPrinter) {
          // Mettre à jour l'imprimante existante
          const index = updatedPrinters.findIndex(p => p.id === cashPrinter.id);
          updatedPrinters[index] = defaultCashPrinter;
        } else {
          // Ajouter la nouvelle imprimante
          updatedPrinters.push(defaultCashPrinter);
        }
      }
      
      setPrinters(updatedPrinters);
      printService.setPrinters(updatedPrinters);
      
      alert(`Détection terminée!\nImprimantes trouvées: ${systemPrinters.length}\nImprimante par défaut: ${defaultPrinter?.name || 'Aucune'}`);
    } catch (error) {
      console.error('Erreur lors de la détection:', error);
      alert('Erreur lors de la détection des imprimantes système');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetPrinters = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les imprimantes ?\nCette action est irréversible.')) {
      setPrinters([]);
      printService.setPrinters([]);
      setShowResetConfirm(false);
      alert('Configuration des imprimantes réinitialisée avec succès.');
    }
  };

  const handleCreatePrinter = () => {
    setEditingPrinter(null);
    setIsModalOpen(true);
  };

  const handleEditPrinter = (printer: PrinterType) => {
    setEditingPrinter(printer);
    setIsModalOpen(true);
  };

  const handleSavePrinter = (printerData: Omit<PrinterType, 'id'>) => {
    if (editingPrinter) {
      const updatedPrinters = printers.map(p => 
        p.id === editingPrinter.id 
          ? { ...printerData, id: editingPrinter.id }
          : p
      );
      setPrinters(updatedPrinters);
      printService.setPrinters(updatedPrinters);
    } else {
      const newPrinter: PrinterType = {
        ...printerData,
        id: Date.now().toString(),
      };
      const updatedPrinters = [...printers, newPrinter];
      setPrinters(updatedPrinters);
      printService.setPrinters(updatedPrinters);
    }
    setIsModalOpen(false);
    setEditingPrinter(null);
  };

  const handleDeletePrinter = (printerId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette imprimante ?')) {
      const updatedPrinters = printers.filter(p => p.id !== printerId);
      setPrinters(updatedPrinters);
      printService.setPrinters(updatedPrinters);
    }
  };

  const handleTestPrint = async (printer: PrinterType) => {
    try {
      const success = await printService.testPrint(printer.id);
      if (success) {
        alert(`Test d'impression réussi sur ${printer.name}`);
      } else {
        alert(`Échec du test d'impression sur ${printer.name}`);
      }
    } catch (error) {
      alert(`Erreur lors du test d'impression: ${error}`);
    }
  };

  const handleToggleStatus = (printerId: string) => {
    const updatedPrinters = printers.map(p => 
      p.id === printerId 
        ? { ...p, isActive: !p.isActive }
        : p
    );
    setPrinters(updatedPrinters);
    printService.setPrinters(updatedPrinters);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'cuisine':
        return 'bg-orange-100 text-orange-800';
      case 'bar':
        return 'bg-blue-100 text-blue-800';
      case 'caisse':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'cuisine':
        return 'Cuisine';
      case 'bar':
        return 'Bar';
      case 'caisse':
        return 'Caisse';
      default:
        return type;
    }
  };

  const getConnectionIcon = (printer: PrinterType) => {
    if (printer.port > 0) {
      // Imprimante réseau
      return printer.isOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-red-500" />
      );
    } else {
      // Imprimante locale
      return printer.isOnline ? (
        <Monitor className="h-4 w-4 text-green-500" />
      ) : (
        <Usb className="h-4 w-4 text-red-500" />
      );
    }
  };

  const getConnectionText = (printer: PrinterType) => {
    if (printer.port > 0) {
      return `${printer.ipAddress}:${printer.port}`;
    } else {
      return printer.ipAddress; // Pour les imprimantes locales, on stocke le nom dans ipAddress
    }
  };

  const getConnectionType = (printer: PrinterType) => {
    return printer.port > 0 ? 'Réseau' : 'Système';
  };

  const isDefaultSystemPrinter = (printer: PrinterType) => {
    const defaultPrinter = printService.getDefaultSystemPrinter();
    return printer.port === 0 && printer.type === 'caisse' && 
           defaultPrinter && printer.ipAddress === defaultPrinter.name;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Configuration des imprimantes</h2>
          <p className="text-gray-600">Configuration simple et automatique de vos imprimantes</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleResetPrinters}
            variant="danger"
            icon={RotateCcw}
            size="sm"
          >
            Réinitialiser
          </Button>
          <Button
            onClick={handleRefreshSystemPrinters}
            variant="secondary"
            icon={RefreshCw}
            loading={isRefreshing}
          >
            {isRefreshing ? 'Détection...' : 'Détecter'}
          </Button>
          <Button onClick={handleCreatePrinter} icon={Plus}>
            Ajouter
          </Button>
        </div>
      </div>

      {/* Informations sur l'imprimante par défaut */}
      {(() => {
        const defaultPrinter = printService.getDefaultSystemPrinter();
        return defaultPrinter && (
          <Card className="border-green-200 bg-green-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-900">Imprimante système par défaut détectée</h3>
                <p className="text-sm text-green-700">
                  <span className="font-medium">{defaultPrinter.name}</span> - {defaultPrinter.driver}
                  {defaultPrinter.status === 'ready' ? ' (Prête)' : ` (${defaultPrinter.status})`}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Cette imprimante est automatiquement configurée pour la caisse
                </p>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-gray-900">{printers.length}</div>
          <div className="text-sm text-gray-600">Total</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {printers.filter(p => p.isActive && p.isOnline).length}
          </div>
          <div className="text-sm text-gray-600">En ligne</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {printers.filter(p => p.port > 0).length}
          </div>
          <div className="text-sm text-gray-600">Réseau</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {printers.filter(p => p.port === 0).length}
          </div>
          <div className="text-sm text-gray-600">Système</div>
        </Card>
        <Card padding="sm" className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {printers.filter(p => !p.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Inactives</div>
        </Card>
      </div>

      {/* Guide de démarrage rapide */}
      <Card className="border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Démarrage rapide</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>1.</strong> Cliquez sur "Détecter" pour trouver automatiquement votre imprimante principale</p>
              <p><strong>2.</strong> L'imprimante de caisse sera configurée automatiquement</p>
              <p><strong>3.</strong> Ajoutez d'autres imprimantes pour la cuisine/bar si nécessaire</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Liste des imprimantes */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Imprimantes configurées</h3>

        {printers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Printer className="h-16 w-16 mx-auto mb-4" />
            <h4 className="text-lg font-medium mb-2">Aucune imprimante configurée</h4>
            <p className="text-sm mb-4">Cliquez sur "Détecter" pour une configuration automatique</p>
            <div className="flex justify-center gap-3">
              <Button
                onClick={handleRefreshSystemPrinters}
                icon={RefreshCw}
                loading={isRefreshing}
                size="lg"
              >
                {isRefreshing ? 'Détection en cours...' : 'Détecter les imprimantes'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {printers.map(printer => (
              <div key={printer.id} className={`flex items-center justify-between p-4 rounded-lg ${
                isDefaultSystemPrinter(printer) ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
              }`}>
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${
                    printer.isOnline ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Printer className={`h-6 w-6 ${
                      printer.isOnline ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{printer.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(printer.type)}`}>
                        {getTypeText(printer.type)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        printer.port > 0 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {getConnectionType(printer)}
                      </span>
                      {getConnectionIcon(printer)}
                      {isDefaultSystemPrinter(printer) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Par défaut
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>{printer.model} • {printer.paperSize} • {getConnectionText(printer)}</p>
                      {printer.categories.length > 0 && (
                        <p className="mt-1">
                          <span className="font-medium">Catégories:</span> {printer.categories.join(', ')}
                        </p>
                      )}
                      {isDefaultSystemPrinter(printer) && (
                        <p className="text-green-600 text-xs mt-1">
                          Configurée automatiquement avec l'imprimante système par défaut
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleTestPrint(printer)}
                    disabled={!printer.isOnline || !printer.isActive}
                    icon={TestTube}
                  >
                    Test
                  </Button>
                  
                  <button
                    onClick={() => handleToggleStatus(printer.id)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      printer.isActive
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {printer.isActive ? 'Actif' : 'Inactif'}
                  </button>
                  
                  <button
                    onClick={() => handleEditPrinter(printer)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDeletePrinter(printer.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    disabled={printer.id === 'default-cash-printer'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Configuration globale */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration globale</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Paramètres d'impression</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Impression automatique des commandes</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Impression des tickets clients</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Impression des additions</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Impression des ajouts de commande</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Utiliser l'imprimante système par défaut pour la caisse</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Détection automatique des imprimantes locales</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Paramètres de connexion</h4>
            <div className="space-y-3">
              <Input
                label="Délai de connexion réseau (ms)"
                type="number"
                defaultValue="5000"
                size="sm"
              />
              <Input
                label="Tentatives de reconnexion"
                type="number"
                defaultValue="3"
                size="sm"
              />
              <Input
                label="Intervalle de vérification (min)"
                type="number"
                defaultValue="5"
                size="sm"
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vérification automatique du statut</span>
                <input type="checkbox" defaultChecked className="rounded" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modal de création/édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPrinter(null);
        }}
        title={editingPrinter ? 'Modifier l\'imprimante' : 'Ajouter une imprimante'}
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
    </div>
  );
};

export default PrinterSettings;