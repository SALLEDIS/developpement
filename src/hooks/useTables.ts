import { useState, useEffect, createContext, useContext } from 'react';
import { Table } from '../types';
import { mockTables } from '../data/mockData';

interface TableContextType {
  tables: Table[];
  addTable: (table: Omit<Table, 'id'>) => void;
  updateTable: (id: string, table: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  updateTableStatus: (id: string, status: Table['status']) => void;
  getAvailableTables: () => Table[];
  getTablesBySection: (section: string) => Table[];
  getTableByNumber: (number: number) => Table | undefined;
}

const TableContext = createContext<TableContextType | undefined>(undefined);

export const useTables = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTables doit être utilisé dans un TableProvider');
  }
  return context;
};

export const useTableProvider = () => {
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [isInitialized, setIsInitialized] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    if (!isInitialized) {
      console.log('useTables - Initialisation du hook');
      
      const storedTables = localStorage.getItem('restobar_tables');
      if (storedTables) {
        try {
          const parsedTables = JSON.parse(storedTables);
          if (Array.isArray(parsedTables)) {
            setTables(parsedTables);
            console.log('useTables - Tables chargées depuis localStorage:', parsedTables.length);
          }
        } catch (error) {
          console.error('useTables - Erreur lors du chargement des tables:', error);
          setTables(mockTables);
        }
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Sauvegarder automatiquement les tables
  useEffect(() => {
    if (isInitialized && tables.length > 0) {
      try {
        const tablesJson = JSON.stringify(tables);
        const currentStored = localStorage.getItem('restobar_tables');
        
        if (currentStored !== tablesJson) {
          localStorage.setItem('restobar_tables', tablesJson);
          console.log('useTables - Tables sauvegardées automatiquement:', tables.length);
        }
      } catch (error) {
        console.error('useTables - Erreur lors de la sauvegarde des tables:', error);
      }
    }
  }, [tables, isInitialized]);

  const addTable = (tableData: Omit<Table, 'id'>) => {
    try {
      const newTable: Table = {
        ...tableData,
        id: Date.now().toString(),
      };
      
      setTables(prev => {
        const updatedTables = [...prev, newTable];
        console.log('useTables - Nouvelle table ajoutée:', newTable.number, 'Total:', updatedTables.length);
        return updatedTables;
      });
    } catch (error) {
      console.error('useTables - Erreur lors de l\'ajout de la table:', error);
    }
  };

  const updateTable = (id: string, tableData: Partial<Table>) => {
    try {
      setTables(prev => {
        const updatedTables = prev.map(t => 
          t.id === id ? { ...t, ...tableData } : t
        );
        console.log('useTables - Table mise à jour:', id);
        return updatedTables;
      });
    } catch (error) {
      console.error('useTables - Erreur lors de la mise à jour de la table:', error);
    }
  };

  const deleteTable = (id: string) => {
    try {
      setTables(prev => {
        const updatedTables = prev.filter(t => t.id !== id);
        console.log('useTables - Table supprimée, Total restant:', updatedTables.length);
        return updatedTables;
      });
    } catch (error) {
      console.error('useTables - Erreur lors de la suppression de la table:', error);
    }
  };

  const updateTableStatus = (id: string, status: Table['status']) => {
    updateTable(id, { status });
  };

  const getAvailableTables = () => {
    return tables.filter(t => t.status === 'available');
  };

  const getTablesBySection = (section: string) => {
    return tables.filter(t => t.section === section);
  };

  const getTableByNumber = (number: number) => {
    return tables.find(t => t.number === number);
  };

  return {
    tables,
    addTable,
    updateTable,
    deleteTable,
    updateTableStatus,
    getAvailableTables,
    getTablesBySection,
    getTableByNumber,
  };
};

export { TableContext };