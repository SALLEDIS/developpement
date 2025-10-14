import { useState, useEffect, createContext, useContext } from 'react';
import { CashSession, Order, Expense } from '../types';
import { useAuth } from './useAuth';
import { useOrders } from './useOrders';
import { useExpenses } from './useExpenses';
import { useSettings } from './useSettings';

interface CashSessionContextType {
  currentSession: CashSession | null;
  openSession: (startingCash: number) => void;
  closeSession: (endingCash: number) => Promise<void>;
  isSessionOpen: boolean;
}

const CashSessionContext = createContext<CashSessionContextType | undefined>(undefined);

export const useCashSession = () => {
  const context = useContext(CashSessionContext);
  if (context === undefined) {
    throw new Error('useCashSession doit être utilisé dans un CashSessionProvider');
  }
  return context;
};

export const useCashSessionProvider = () => {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();
  const { getTodaysOrders, orders } = useOrders();
  const { getTodaysExpenses, expenses } = useExpenses();
  const { settings } = useSettings();

  useEffect(() => {
    if (!isInitialized) {
      const storedSession = localStorage.getItem('restobar_current_session');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.status === 'open') {
            setCurrentSession({
              ...parsedSession,
              startTime: new Date(parsedSession.startTime),
            });
          }
        } catch (error) {
          console.error('Erreur lors du chargement de la session:', error);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized && currentSession) {
      localStorage.setItem('restobar_current_session', JSON.stringify(currentSession));
    }
  }, [currentSession, isInitialized]);

  const openSession = (startingCash: number) => {
    if (!user) return;

    const newSession: CashSession = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      startTime: new Date(),
      startingCash,
      totalSales: 0,
      totalExpenses: 0,
      salesByCategory: [],
      salesByUser: [],
      salesByPaymentMethod: [],
      orders: [],
      expenses: [],
      status: 'open',
    };

    setCurrentSession(newSession);
  };

  const generateClosureReport = (session: CashSession): string => {
    const date = new Date();
    let report = '';
    
    report += '================================\n';
    report += '      🍽️ RESTOBAR\n';
    report += '    CLOTURE DE CAISSE\n';
    report += '================================\n';
    report += '\n';
    report += `Date: ${date.toLocaleDateString('fr-FR')}\n`;
    report += `Heure: ${date.toLocaleTimeString('fr-FR')}\n`;
    report += `Caissier: ${session.userName}\n`;
    report += `Session: ${session.startTime.toLocaleTimeString('fr-FR')} - ${date.toLocaleTimeString('fr-FR')}\n`;
    report += '\n';
    report += '================================\n';
    report += '         RESUME FINANCIER\n';
    report += '================================\n';
    report += '\n';
    report += `Fond de caisse: ${session.startingCash.toLocaleString('fr-FR')} CFA\n`;
    report += `Ventes totales: ${session.totalSales.toLocaleString('fr-FR')} CFA\n`;
    report += `Charges totales: ${session.totalExpenses.toLocaleString('fr-FR')} CFA\n`;
    report += `Caisse attendue: ${(session.startingCash + session.totalSales - session.totalExpenses).toLocaleString('fr-FR')} CFA\n`;
    if (session.endingCash !== undefined) {
      report += `Caisse comptee: ${session.endingCash.toLocaleString('fr-FR')} CFA\n`;
      const difference = session.endingCash - (session.startingCash + session.totalSales - session.totalExpenses);
      report += `Ecart: ${difference.toLocaleString('fr-FR')} CFA\n`;
    }
    report += '\n';
    
    report += '================================\n';
    report += '      VENTES PAR CATEGORIE\n';
    report += '================================\n';
    report += '\n';
    session.salesByCategory.forEach(cat => {
      report += `${cat.category}:\n`;
      report += `  Quantite: ${cat.count}\n`;
      report += `  Montant: ${cat.amount.toLocaleString('fr-FR')} CFA\n`;
      report += '\n';
    });
    
    report += '================================\n';
    report += '      VENTES PAR UTILISATEUR\n';
    report += '================================\n';
    report += '\n';
    session.salesByUser.forEach(user => {
      report += `${user.userName}:\n`;
      report += `  Commandes: ${user.count}\n`;
      report += `  Montant: ${user.amount.toLocaleString('fr-FR')} CFA\n`;
      report += '\n';
    });
    
    report += '================================\n';
    report += '    REPARTITION PAIEMENTS\n';
    report += '================================\n';
    report += '\n';
    session.salesByPaymentMethod.forEach(payment => {
      const methodText = payment.method === 'cash' ? 'Especes' :
                        payment.method === 'card' ? 'Carte' : 'Digital';
      report += `${methodText}:\n`;
      report += `  Transactions: ${payment.count}\n`;
      report += `  Montant: ${payment.amount.toLocaleString('fr-FR')} CFA\n`;
      report += '\n';
    });
    
    report += '================================\n';
    report += `Total commandes: ${session.orders.length}\n`;
    report += `Total charges: ${session.expenses.length}\n`;
    report += '\n';
    report += '     Merci pour votre travail!\n';
    report += '================================\n';

    return report;
  };

  const sendWhatsAppReport = async (report: string) => {
    try {
      const encodedMessage = encodeURIComponent(report);
      const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
      
      // Ouvrir WhatsApp dans un nouvel onglet
      window.open(whatsappUrl, '_blank');
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi WhatsApp:', error);
      return false;
    }
  };

  const closeSession = async (endingCash: number) => {
    if (!currentSession) return;

    // Calculer les statistiques de la session
    const todaysOrders = getTodaysOrders();
    const todaysExpenses = getTodaysExpenses();
    
    const sessionOrders = todaysOrders.filter(order => 
      order.createdAt >= currentSession.startTime && 
      order.status === 'paid'
    );
    
    const sessionExpenses = todaysExpenses.filter(expense =>
      expense.date >= currentSession.startTime
    );

    const totalSales = sessionOrders.reduce((sum, order) => sum + order.total, 0);
    const totalExpenses = sessionExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    // Ventes par catégorie
    const salesByCategory = sessionOrders.reduce((acc, order) => {
      order.items.forEach(item => {
        const category = item.category || 'Autres';
        const existing = acc.find(c => c.category === category);
        if (existing) {
          existing.amount += item.price * item.quantity;
          existing.count += item.quantity;
        } else {
          acc.push({
            category,
            amount: item.price * item.quantity,
            count: item.quantity,
          });
        }
      });
      return acc;
    }, [] as { category: string; amount: number; count: number }[]);

    // Ventes par utilisateur
    const salesByUser = sessionOrders.reduce((acc, order) => {
      const userId = order.waiterId || 'unknown';
      const userName = order.waiterId ? 'Serveur' : 'Caisse';
      const existing = acc.find(u => u.userId === userId);
      if (existing) {
        existing.amount += order.total;
        existing.count += 1;
      } else {
        acc.push({
          userId,
          userName,
          amount: order.total,
          count: 1,
        });
      }
      return acc;
    }, [] as { userId: string; userName: string; amount: number; count: number }[]);

    // Ventes par méthode de paiement
    const salesByPaymentMethod = sessionOrders.reduce((acc, order) => {
      const method = order.paymentMethod || 'cash';
      const existing = acc.find(p => p.method === method);
      if (existing) {
        existing.amount += order.total;
        existing.count += 1;
      } else {
        acc.push({
          method,
          amount: order.total,
          count: 1,
        });
      }
      return acc;
    }, [] as { method: string; amount: number; count: number }[]);

    const closedSession: CashSession = {
      ...currentSession,
      endTime: new Date(),
      endingCash,
      totalSales,
      totalExpenses,
      salesByCategory,
      salesByUser,
      salesByPaymentMethod,
      orders: sessionOrders.map(o => o.id),
      expenses: sessionExpenses.map(e => e.id),
      status: 'closed',
    };

    // Générer le rapport
    const report = generateClosureReport(closedSession);
    
    // Envoyer sur WhatsApp
    const whatsappSent = await sendWhatsAppReport(report);
    
    if (whatsappSent) {
      alert('Clôture de caisse effectuée avec succès !\nRapport envoyé sur WhatsApp.');
    } else {
      alert('Clôture de caisse effectuée.\nErreur lors de l\'envoi WhatsApp.');
    }

    // Sauvegarder la session fermée
    const closedSessions = JSON.parse(localStorage.getItem('restobar_closed_sessions') || '[]');
    closedSessions.push(closedSession);
    localStorage.setItem('restobar_closed_sessions', JSON.stringify(closedSessions));

    // Fermer la session courante
    setCurrentSession(null);
    localStorage.removeItem('restobar_current_session');
  };

  const isSessionOpen = currentSession?.status === 'open';

  return {
    currentSession,
    openSession,
    closeSession,
    isSessionOpen,
  };
};

export { CashSessionContext };