import { useState, useEffect, createContext, useContext } from 'react';
import { Printer } from '../types';
import { supabase } from '../lib/supabase';

interface PrinterContextType {
  printers: Printer[];
  addPrinter: (printer: Omit<Printer, 'id'>) => void;
  updatePrinter: (id: string, printer: Omit<Printer, 'id'>) => void;
  deletePrinter: (id: string) => void;
  getActivePrinters: () => Printer[];
  getPrintersByType: (type: 'cuisine' | 'bar' | 'caisse') => Printer[];
}

const PrinterContext = createContext<PrinterContextType | undefined>(undefined);

export const usePrinters = () => {
  const context = useContext(PrinterContext);
  if (context === undefined) {
    throw new Error('usePrinters doit être utilisé dans un PrinterProvider');
  }
  return context;
};

export const usePrinterProvider = () => {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      console.log('usePrinters - Initialisation du hook');

      const loadPrinters = async () => {
        try {
          const { data, error } = await supabase
            .from('printers')
            .select('*')
            .order('name', { ascending: true });

          if (error) {
            console.error('Erreur lors du chargement des imprimantes:', error);
            setPrinters([]);
          } else if (data) {
            const formattedPrinters: Printer[] = data.map((p: any) => ({
              id: p.id,
              name: p.name,
              type: p.type,
              ipAddress: p.ip_address || '',
              port: p.port || 0,
              model: p.model || '',
              paperSize: p.paper_size || '80mm',
              isActive: p.is_active,
              isOnline: p.is_online,
              categories: p.categories || [],
              autoprint: p.autoprint || false,
            }));
            setPrinters(formattedPrinters);
            console.log('usePrinters - Imprimantes chargées depuis Supabase:', formattedPrinters.length);
          }
        } catch (error) {
          console.error('usePrinters - Erreur lors du chargement des imprimantes:', error);
          setPrinters([]);
        } finally {
          setIsInitialized(true);
        }
      };

      loadPrinters();
    }
  }, [isInitialized]);

  const addPrinter = async (printerData: Omit<Printer, 'id'>) => {
    try {
      const { data, error } = await supabase.from('printers').insert([
        {
          name: printerData.name,
          type: printerData.type,
          ip_address: printerData.ipAddress,
          port: printerData.port,
          model: printerData.model,
          paper_size: printerData.paperSize,
          is_active: printerData.isActive,
          is_online: printerData.isOnline,
          categories: printerData.categories,
          autoprint: printerData.autoprint,
        },
      ]).select();

      if (error) {
        console.error('Erreur lors de l\'ajout de l\'imprimante:', error);
      } else if (data && data[0]) {
        const newPrinter: Printer = {
          id: data[0].id,
          name: data[0].name,
          type: data[0].type,
          ipAddress: data[0].ip_address || '',
          port: data[0].port || 0,
          model: data[0].model || '',
          paperSize: data[0].paper_size || '80mm',
          isActive: data[0].is_active,
          isOnline: data[0].is_online,
          categories: data[0].categories || [],
          autoprint: data[0].autoprint || false,
        };
        setPrinters(prev => [...prev, newPrinter]);
        console.log('usePrinters - Nouvelle imprimante ajoutée:', newPrinter.name);
      }
    } catch (error) {
      console.error('usePrinters - Erreur lors de l\'ajout de l\'imprimante:', error);
    }
  };

  const updatePrinter = async (id: string, printerData: Omit<Printer, 'id'>) => {
    try {
      const { error } = await supabase
        .from('printers')
        .update({
          name: printerData.name,
          type: printerData.type,
          ip_address: printerData.ipAddress,
          port: printerData.port,
          model: printerData.model,
          paper_size: printerData.paperSize,
          is_active: printerData.isActive,
          is_online: printerData.isOnline,
          categories: printerData.categories,
          autoprint: printerData.autoprint,
        })
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la mise à jour de l\'imprimante:', error);
      } else {
        setPrinters(prev => prev.map(p =>
          p.id === id ? { ...printerData, id } : p
        ));
        console.log('usePrinters - Imprimante mise à jour:', printerData.name);
      }
    } catch (error) {
      console.error('usePrinters - Erreur lors de la mise à jour de l\'imprimante:', error);
    }
  };

  const deletePrinter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('printers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de l\'imprimante:', error);
      } else {
        setPrinters(prev => prev.filter(p => p.id !== id));
        console.log('usePrinters - Imprimante supprimée');
      }
    } catch (error) {
      console.error('usePrinters - Erreur lors de la suppression de l\'imprimante:', error);
    }
  };

  const getActivePrinters = () => {
    return printers.filter(p => p.isActive && p.isOnline);
  };

  const getPrintersByType = (type: 'cuisine' | 'bar' | 'caisse') => {
    return printers.filter(p => p.type === type && p.isActive);
  };

  return {
    printers,
    addPrinter,
    updatePrinter,
    deletePrinter,
    getActivePrinters,
    getPrintersByType,
  };
};

export { PrinterContext };
