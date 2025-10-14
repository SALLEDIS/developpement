import React, { useState } from 'react';
import { X, Calculator, DollarSign, MessageCircle, TrendingUp } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useCashSession } from '../../hooks/useCashSession';

interface CashClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CashClosureModal: React.FC<CashClosureModalProps> = ({ isOpen, onClose }) => {
  const { currentSession, closeSession } = useCashSession();
  const [endingCash, setEndingCash] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const calculateExpectedCash = () => {
    if (!currentSession) return 0;
    return currentSession.startingCash + currentSession.totalSales - currentSession.totalExpenses;
  };

  const handleCloseSession = async () => {
    if (endingCash < 0) {
      alert('Le montant de fin doit être positif');
      return;
    }

    setIsClosing(true);
    try {
      await closeSession(endingCash);
      onClose();
      setEndingCash(0);
    } catch (error) {
      console.error('Erreur lors de la clôture:', error);
      alert('Erreur lors de la clôture de caisse');
    } finally {
      setIsClosing(false);
    }
  };

  if (!isOpen || !currentSession) return null;

  const expectedCash = calculateExpectedCash();
  const difference = endingCash - expectedCash;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* En-tête */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Calculator className="h-6 w-6 text-red-600" />
              <h2 className="text-lg font-semibold text-gray-900">Clôture de caisse</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-4 space-y-6">
            {/* Résumé de la session */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Résumé de la session</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Caissier :</span>
                    <span className="font-medium">{currentSession.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ouverture :</span>
                    <span>{currentSession.startTime.toLocaleTimeString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fond de caisse :</span>
                    <span>{currentSession.startingCash.toLocaleString('fr-FR')} CFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ventes totales :</span>
                    <span className="text-green-600">+{currentSession.totalSales.toLocaleString('fr-FR')} CFA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Charges totales :</span>
                    <span className="text-red-600">-{currentSession.totalExpenses.toLocaleString('fr-FR')} CFA</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Caisse attendue :</span>
                      <span>{expectedCash.toLocaleString('fr-FR')} CFA</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Comptage final</h3>
                <Input
                  label="Montant compté dans la caisse (CFA)"
                  type="number"
                  value={endingCash}
                  onChange={(e) => setEndingCash(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  icon={DollarSign}
                  iconPosition="left"
                  required
                />
                
                {endingCash > 0 && (
                  <div className={`p-3 rounded-lg border ${
                    difference === 0 ? 'border-green-200 bg-green-50' :
                    difference > 0 ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Écart :</span>
                      <span className={`font-semibold ${
                        difference === 0 ? 'text-green-600' :
                        difference > 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {difference.toLocaleString('fr-FR')} CFA
                      </span>
                    </div>
                    {difference === 0 && (
                      <p className="text-xs text-green-600 mt-1">✓ Caisse équilibrée</p>
                    )}
                    {difference > 0 && (
                      <p className="text-xs text-blue-600 mt-1">↗ Excédent en caisse</p>
                    )}
                    {difference < 0 && (
                      <p className="text-xs text-red-600 mt-1">↘ Manque en caisse</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques détaillées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ventes par catégorie */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Ventes par catégorie</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {currentSession.salesByCategory.length > 0 ? (
                    currentSession.salesByCategory.map((cat, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>{cat.category} ({cat.count})</span>
                        <span className="font-medium">{cat.amount.toLocaleString('fr-FR')} CFA</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucune vente</p>
                  )}
                </div>
              </div>

              {/* Ventes par utilisateur */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Ventes par utilisateur</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {currentSession.salesByUser.length > 0 ? (
                    currentSession.salesByUser.map((user, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>{user.userName} ({user.count})</span>
                        <span className="font-medium">{user.amount.toLocaleString('fr-FR')} CFA</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Aucune vente</p>
                  )}
                </div>
              </div>
            </div>

            {/* Informations WhatsApp */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Envoi automatique du rapport</span>
              </div>
              <p className="text-sm text-blue-800">
                Le rapport de clôture détaillé sera automatiquement envoyé sur WhatsApp avec :
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• Résumé financier complet</li>
                <li>• Ventes par catégorie et utilisateur</li>
                <li>• Répartition des paiements</li>
                <li>• Format optimisé pour impression 80mm</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isClosing}
              >
                Annuler
              </Button>
              <Button
                onClick={handleCloseSession}
                variant="danger"
                icon={Calculator}
                loading={isClosing}
                disabled={endingCash < 0}
              >
                {isClosing ? 'Clôture en cours...' : 'Clôturer et envoyer rapport'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashClosureModal;