import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'card' | 'digital' | 'check' | 'credit';
  isActive: boolean;
  icon: string;
  description: string;
  fees: number;
  feesType: 'percentage' | 'fixed';
  requiresReceipt: boolean;
  order: number;
}

interface PaymentMethodsContextType {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  getActivePaymentMethods: () => PaymentMethod[];
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

export const PaymentMethodsContext = createContext<PaymentMethodsContextType | undefined>(undefined);

const defaultPaymentMethods: PaymentMethod[] = [
  {
    id: 'cash',
    name: 'Espèces',
    type: 'cash',
    isActive: true,
    icon: 'Banknote',
    description: 'Paiement en espèces',
    fees: 0,
    feesType: 'fixed',
    requiresReceipt: false,
    order: 1,
  },
  {
    id: 'card',
    name: 'Carte bancaire',
    type: 'card',
    isActive: true,
    icon: 'CreditCard',
    description: 'Paiement par carte bancaire (Visa, Mastercard)',
    fees: 2,
    feesType: 'percentage',
    requiresReceipt: true,
    order: 2,
  },
  {
    id: 'mobile_money',
    name: 'Mobile Money',
    type: 'digital',
    isActive: true,
    icon: 'Smartphone',
    description: 'Orange Money, MTN Mobile Money, Wave',
    fees: 1,
    feesType: 'percentage',
    requiresReceipt: true,
    order: 3,
  },
  {
    id: 'check',
    name: 'Chèque',
    type: 'check',
    isActive: false,
    icon: 'FileText',
    description: 'Paiement par chèque',
    fees: 0,
    feesType: 'fixed',
    requiresReceipt: true,
    order: 4,
  },
  {
    id: 'credit',
    name: 'Crédit',
    type: 'credit',
    isActive: false,
    icon: 'Clock',
    description: 'Paiement à crédit / Ardoise',
    fees: 0,
    feesType: 'fixed',
    requiresReceipt: true,
    order: 5,
  },
];

export const usePaymentMethodsProvider = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(defaultPaymentMethods);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'payment_methods')
        .maybeSingle();

      if (error) throw error;

      if (data?.value) {
        setPaymentMethods(data.value as PaymentMethod[]);
      } else {
        await savePaymentMethods(defaultPaymentMethods);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentMethods = async (methods: PaymentMethod[]) => {
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key: 'payment_methods',
          value: methods,
        }, {
          onConflict: 'key',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving payment methods:', error);
      throw error;
    }
  };

  const getActivePaymentMethods = () => {
    return paymentMethods
      .filter(method => method.isActive)
      .sort((a, b) => a.order - b.order);
  };

  const updatePaymentMethod = async (id: string, updates: Partial<PaymentMethod>) => {
    const updatedMethods = paymentMethods.map(method =>
      method.id === id ? { ...method, ...updates } : method
    );

    setPaymentMethods(updatedMethods);
    await savePaymentMethods(updatedMethods);
  };

  const resetToDefaults = async () => {
    setPaymentMethods(defaultPaymentMethods);
    await savePaymentMethods(defaultPaymentMethods);
  };

  return {
    paymentMethods,
    loading,
    getActivePaymentMethods,
    updatePaymentMethod,
    resetToDefaults,
  };
};

export const usePaymentMethods = () => {
  const context = useContext(PaymentMethodsContext);
  if (context === undefined) {
    throw new Error('usePaymentMethods must be used within a PaymentMethodsProvider');
  }
  return context;
};
