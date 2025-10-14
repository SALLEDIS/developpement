import React, { useState } from 'react';
import { Store, Phone, Mail, MapPin, MessageCircle, Save, Upload, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useSettings } from '../../hooks/useSettings';

const RestaurantSettings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [logoPreview, setLogoPreview] = useState<string>(settings.logo || '');

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Le logo ne doit pas dépasser 2MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoPreview(result);
        handleInputChange('logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoPreview('');
    handleInputChange('logo', '');
  };

  const handleSave = () => {
    updateSettings(formData);
    alert('Paramètres sauvegardés avec succès !');
  };

  const testWhatsApp = () => {
    const testMessage = encodeURIComponent('Test de connexion WhatsApp depuis RestoBar 🍽️');
    const whatsappUrl = `https://wa.me/${formData.whatsappNumber.replace(/[^0-9]/g, '')}?text=${testMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres du restaurant</h2>
        <p className="text-gray-600">Configurez les informations de votre établissement</p>
      </div>

      {/* Informations générales */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations générales</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom du restaurant"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              icon={Store}
              iconPosition="left"
              required
            />
            
            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              icon={Phone}
              iconPosition="left"
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            icon={Mail}
            iconPosition="left"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse complète
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Adresse complète du restaurant"
            />
          </div>
        </div>
      </Card>

      {/* Logo */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo du restaurant</h3>
        
        <div className="space-y-4">
          {logoPreview ? (
            <div className="relative inline-block">
              <img
                src={logoPreview}
                alt="Logo"
                className="w-32 h-32 object-contain border border-gray-300 rounded-lg bg-white p-2"
              />
              <button
                type="button"
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Cliquez pour ajouter un logo ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF jusqu'à 2MB
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          )}
          
          <p className="text-xs text-gray-500">
            Le logo apparaîtra sur tous les tickets et documents imprimés
          </p>
        </div>
      </Card>

      {/* Configuration WhatsApp */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration WhatsApp</h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Numéro WhatsApp"
                value={formData.whatsappNumber}
                onChange={(e) => handleInputChange('whatsappNumber', e.target.value)}
                icon={MessageCircle}
                iconPosition="left"
                placeholder="+225 01 02 03 04 05"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Numéro pour recevoir les rapports de clôture de caisse
              </p>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={testWhatsApp}
                variant="secondary"
                icon={MessageCircle}
                disabled={!formData.whatsappNumber}
              >
                Tester
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Comment configurer WhatsApp :</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Saisissez le numéro avec l'indicatif pays (ex: +225...)</li>
              <li>2. Cliquez sur "Tester" pour vérifier la connexion</li>
              <li>3. Les rapports de clôture seront envoyés automatiquement</li>
              <li>4. Assurez-vous que WhatsApp est installé sur l'appareil</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Configuration fiscale */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration fiscale</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taux de TVA (%)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.taxRate * 100}
              onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) / 100 || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <Input
            label="Devise"
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            placeholder="CFA"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuseau horaire
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Africa/Abidjan">Abidjan (GMT+0)</option>
              <option value="Africa/Casablanca">Casablanca (GMT+1)</option>
              <option value="Africa/Cairo">Le Caire (GMT+2)</option>
              <option value="Europe/Paris">Paris (GMT+1)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Aperçu */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu des documents</h3>
        
        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
          <div className="text-center mb-4">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-16 h-16 mx-auto mb-2 object-contain" />
            ) : (
              <div className="text-2xl mb-2">🍽️</div>
            )}
            <div className="font-bold">{formData.name}</div>
            <div>{formData.address}</div>
            <div>Tél: {formData.phone}</div>
            <div>Email: {formData.email}</div>
          </div>
          <div className="border-t border-gray-300 pt-2 text-center">
            <div className="text-xs text-gray-600">
              Aperçu de l'en-tête des tickets et factures
            </div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleSave} icon={Save}>
          Sauvegarder les paramètres
        </Button>
      </div>
    </div>
  );
};

export default RestaurantSettings;