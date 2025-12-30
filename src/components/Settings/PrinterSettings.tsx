import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import PrinterForm from './PrinterForm';
import PrintService from '../../services/PrintService';
import { Printer as PrinterType } from '../../types';

const PrinterSettings: React.FC = () => {
  const [printers, setPrinters] = useState<PrinterType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<PrinterType | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const printService = PrintService.getInstance();

  useEffect(() => {
    loadPrinters();
  }, []);

  const loadPrinters = () => {
    const savedPrinters = localStorage.getItem('restobar_printers');
    if (savedPrinters) {
      try {
        const parsedPrinters = JSON.parse(savedPrinters);
        setPrinters(parsedPrinters);
        printService.setPrinters(parsedPrinters);
      } catch (error) {
        console.error('Erreur lors du chargement des imprimantes:', error);
        setPrinters([]);
      }
    }
  };

  useEffect(() => {
    if (printers.length > 0) {
      localStorage.setItem('restobar_printers', JSON.stringify(printers));
    }
  }, [printers]);

  const handleAutoSetup = async () => {
    setIsInitializing(true);
    try {
      await printService.refreshSystemPrinters();
      const defaultPrinter = printService.getDefaultSystemPrinter();

      if (defaultPrinter) {
        const cashPrinter: PrinterType = {
          id: 'cash-printer',
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

        setPrinters([cashPrinter]);
        printService.setPrinters([cashPrinter]);
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

  const handleSavePrinter = (printerData: Omit<PrinterType, 'id'>) => {
    if (editingPrinter) {
      const updatedPrinters = printers.map(p =>
        p.id === editingPrinter.id ? { ...printerData, id: editingPrinter.id } : p
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
    if (confirm('Supprimer cette imprimante ?')) {
      const updatedPrinters = printers.filter(p => p.id !== printerId);
      setPrinters(updatedPrinters);
      printService.setPrinters(updatedPrinters);
    }
  };

  const handleTestPrint = async (printer: PrinterType) => {
    try {
      await printService.testPrint(printer.id);
      alert('✓ Test réussi!');
    } catch (error) {
      alert('✗ Test échoué\nVérifiez l\'imprimante.');
      console.error('Erreur test impression:', error);
    }
  };

  const handleToggleActive = (printerId: string) => {
    const updatedPrinters = printers.map(p =>
      p.id === printerId ? { ...p, isActive: !p.isActive } : p
    );
    setPrinters(updatedPrinters);
    printService.setPrinters(updatedPrinters);
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
    </div>
  );
};

export default PrinterSettings;
