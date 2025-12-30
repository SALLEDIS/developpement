import React, { useState, useEffect } from 'react';
import { Printer } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Printer as PrinterType } from '../../types';

interface PrinterFormProps {
  printer?: PrinterType | null;
  onSave: (printer: Omit<PrinterType, 'id'>) => void;
  onCancel: () => void;
}

const PrinterForm: React.FC<PrinterFormProps> = ({ printer, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'cuisine' as 'cuisine' | 'bar' | 'caisse',
    useSystemPrinter: true,
    ipAddress: '',
    port: 9100,
  });

  useEffect(() => {
    if (printer) {
      setFormData({
        name: printer.name,
        type: printer.type,
        useSystemPrinter: printer.port === 0,
        ipAddress: printer.ipAddress,
        port: printer.port || 9100,
      });
    }
  }, [printer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const printerData: Omit<PrinterType, 'id'> = {
      name: formData.name,
      type: formData.type,
      ipAddress: formData.useSystemPrinter ? 'Imprimante système' : formData.ipAddress,
      port: formData.useSystemPrinter ? 0 : formData.port,
      model: formData.useSystemPrinter ? 'Système' : 'Réseau',
      paperSize: '80mm',
      isActive: true,
      isOnline: true,
      categories: [],
      autoprint: true
    };

    onSave(printerData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Caisse:</strong> Utilisez l'imprimante système (recommandé)
          <br />
          <strong>Cuisine/Bar:</strong> Utilisez une imprimante réseau si disponible
        </p>
      </div>

      <Input
        label="Nom de l'imprimante"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Ex: Imprimante Cuisine"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Type d'imprimante
        </label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="caisse">Caisse (tickets clients)</option>
          <option value="cuisine">Cuisine (commandes)</option>
          <option value="bar">Bar (boissons)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Connexion
        </label>
        <div className="space-y-3">
          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              checked={formData.useSystemPrinter}
              onChange={() => setFormData({ ...formData, useSystemPrinter: true })}
              className="mt-1 mr-3"
            />
            <div>
              <div className="font-medium text-gray-900">Imprimante système</div>
              <div className="text-sm text-gray-600">Utiliser l'imprimante de cet ordinateur (recommandé pour la caisse)</div>
            </div>
          </label>

          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              checked={!formData.useSystemPrinter}
              onChange={() => setFormData({ ...formData, useSystemPrinter: false })}
              className="mt-1 mr-3"
            />
            <div>
              <div className="font-medium text-gray-900">Imprimante réseau</div>
              <div className="text-sm text-gray-600">Connectée par IP (pour cuisine/bar)</div>
            </div>
          </label>
        </div>
      </div>

      {!formData.useSystemPrinter && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <Input
            label="Adresse IP"
            value={formData.ipAddress}
            onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
            placeholder="Ex: 192.168.1.100"
            required={!formData.useSystemPrinter}
          />
          <Input
            label="Port"
            type="number"
            value={formData.port}
            onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 9100 })}
            placeholder="9100"
            required={!formData.useSystemPrinter}
          />
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" icon={Printer}>
          {printer ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};

export default PrinterForm;
