import React, { useState } from 'react';
import { DollarSign, Clock, Users, TrendingUp, MessageCircle, Printer, Calculator } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';
import { useCashSession } from '../../hooks/useCashSession';
import { useAuth } from '../../hooks/useAuth';

const CashManagement: React.FC = () => {
  const { currentSession, openSession, closeSession, isSessionOpen } = useCashSession();
  const { user } = useAuth();
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [startingCash, setStartingCash] = useState(0);
  const [endingCash, setEndingCash] = useState(0);

  const handleOpenSession = () => {
    if (startingCash < 0) {
      alert('Le montant de départ doit être positif');
      return;
    }
    
    openSession(startingCash);
    setIsOpenModalOpen(false);
    setStartingCash(0);
    alert('Session de caisse ouverte avec succès !');
  };

  const handleCloseSession = async () => {
    if (endingCash < 0) {
      alert('Le montant de fin doit être positif');
      return;
    }
    
    await closeSession(endingCash);
    setIsCloseModalOpen(false);
    setEndingCash(0);
  };

  const formatDuration = (startTime: Date) => {
    const now = new Date();
    const diff = now.getTime() - startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const calculateExpectedCash = () => {
    if (!currentSession) return 0;
    return currentSession.startingCash + currentSession.totalSales - currentSession.totalExpenses;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion de caisse</h2>
          <p className="text-gray-600">Ouverture, clôture et suivi des sessions de caisse</p>
        </div>
        
        <div className="flex gap-2">
          {!isSessionOpen ? (
            <Button onClick={() => setIsOpenModalOpen(true)} icon={DollarSign}>
              Ouvrir la caisse
            </Button>
          ) : (
            <Button 
              onClick={() => setIsCloseModalOpen(true)} 
              variant="danger"
              icon={Calculator}
            >
              Clôturer la caisse
            </Button>
          )}
        </div>
      </div>

      {/* Statut de la session */}
      {isSessionOpen && currentSession ? (
        <Card className="border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-green-900">Session active</h3>
                <p className="text-sm text-green-700">
                  Ouverte par {currentSession.userName} • {formatDuration(currentSession.startTime)}
                </p>
                <p className="text-xs text-green-600">
                  Depuis {currentSession.startTime.toLocaleTimeString('fr-FR')}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-green-900">
                {currentSession.totalSales.toLocaleString('fr-FR')} CFA
              </div>
              <div className="text-sm text-green-700">Ventes totales</div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="border-gray-200 bg-gray-50">
          <div className="text-center py-8">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune session active</h3>
            <p className="text-gray-600 mb-4">Ouvrez une session de caisse pour commencer</p>
            <Button onClick={() => setIsOpenModalOpen(true)} icon={DollarSign}>
              Ouvrir la caisse
            </Button>
          </div>
        </Card>
      )}

      {/* Détails de la session active */}
      {isSessionOpen && currentSession && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {currentSession.startingCash.toLocaleString('fr-FR')}
            </div>
            <div className="text-sm text-gray-600">Fond de caisse</div>
          </Card>
          
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {currentSession.totalSales.toLocaleString('fr-FR')}
            </div>
            <div className="text-sm text-gray-600">Ventes</div>
          </Card>
          
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {currentSession.totalExpenses.toLocaleString('fr-FR')}
            </div>
            <div className="text-sm text-gray-600">Charges</div>
          </Card>
          
          <Card padding="sm" className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {calculateExpectedCash().toLocaleString('fr-FR')}
            </div>
            <div className="text-sm text-gray-600">Caisse attendue</div>
          </Card>
        </div>
      )}

      {/* Statistiques détaillées */}
      {isSessionOpen && currentSession && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ventes par catégorie */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes par catégorie</h3>
            {currentSession.salesByCategory.length > 0 ? (
              <div className="space-y-3">
                {currentSession.salesByCategory.map((cat, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{cat.category}</p>
                      <p className="text-sm text-gray-600">{cat.count} articles</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {cat.amount.toLocaleString('fr-FR')} CFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune vente pour le moment</p>
            )}
          </Card>

          {/* Ventes par utilisateur */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventes par utilisateur</h3>
            {currentSession.salesByUser.length > 0 ? (
              <div className="space-y-3">
                {currentSession.salesByUser.map((user, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.userName}</p>
                        <p className="text-sm text-gray-600">{user.count} commandes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {user.amount.toLocaleString('fr-FR')} CFA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">Aucune vente pour le moment</p>
            )}
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Ouverture de caisse</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Comptez l'argent dans la caisse</li>
              <li>2. Saisissez le montant de départ</li>
              <li>3. Cliquez sur "Ouvrir la caisse"</li>
              <li>4. La session démarre automatiquement</li>
            </ol>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Clôture de caisse</h4>
            <ol className="text-sm text-gray-600 space-y-1">
              <li>1. Comptez l'argent en fin de service</li>
              <li>2. Saisissez le montant final</li>
              <li>3. Cliquez sur "Clôturer la caisse"</li>
              <li>4. Le rapport est envoyé sur WhatsApp</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Modal d'ouverture */}
      <Modal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        title="Ouvrir la session de caisse"
      >
        <div className="space-y-4">
          <div className="text-center">
            <DollarSign className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nouvelle session de caisse
            </h3>
            <p className="text-gray-600">
              Comptez l'argent présent dans la caisse et saisissez le montant
            </p>
          </div>

          <Input
            label="Montant de départ (CFA)"
            type="number"
            value={startingCash}
            onChange={(e) => setStartingCash(parseInt(e.target.value) || 0)}
            placeholder="0"
            icon={DollarSign}
            iconPosition="left"
            required
          />

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Caissier :</strong> {user?.name}<br />
              <strong>Date :</strong> {new Date().toLocaleDateString('fr-FR')}<br />
              <strong>Heure :</strong> {new Date().toLocaleTimeString('fr-FR')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsOpenModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleOpenSession}
              icon={DollarSign}
              disabled={startingCash < 0}
            >
              Ouvrir la caisse
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de clôture */}
      <Modal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Clôturer la session de caisse"
        size="lg"
      >
        <div className="space-y-6">
          <div className="text-center">
            <Calculator className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Clôture de caisse
            </h3>
            <p className="text-gray-600">
              Comptez l'argent présent dans la caisse et vérifiez les montants
            </p>
          </div>

          {currentSession && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card padding="sm">
                <h4 className="font-medium text-gray-900 mb-2">Résumé de la session</h4>
                <div className="space-y-2 text-sm">
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
                      <span>{calculateExpectedCash().toLocaleString('fr-FR')} CFA</span>
                    </div>
                  </div>
                </div>
              </Card>

              <div>
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
                  <div className="mt-3 p-3 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Écart :</span>
                      <span className={`font-semibold ${
                        endingCash - calculateExpectedCash() === 0 ? 'text-green-600' :
                        endingCash - calculateExpectedCash() > 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {(endingCash - calculateExpectedCash()).toLocaleString('fr-FR')} CFA
                      </span>
                    </div>
                    {endingCash - calculateExpectedCash() === 0 && (
                      <p className="text-xs text-green-600 mt-1">✓ Caisse équilibrée</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-amber-900">Envoi automatique</span>
            </div>
            <p className="text-sm text-amber-800">
              Le rapport de clôture sera automatiquement envoyé sur WhatsApp avec tous les détails de la session.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsCloseModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCloseSession}
              variant="danger"
              icon={Calculator}
              disabled={endingCash < 0}
            >
              Clôturer et envoyer rapport
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CashManagement;