import { useState, useEffect, createContext, useContext } from 'react';
import { Table } from '../types';
import { supabase } from '../lib/supabase';

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
  const [tables, setTables] = useState<Table[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Chargement initial des données depuis Supabase
  useEffect(() => {
    if (!isInitialized) {
      console.log('useTables - Initialisation du hook');

      const loadTables = async () => {
        try {
          const { data, error } = await supabase
            .from('tables')
            .select('*')
            .order('number', { ascending: true });

          if (error) {
            console.error('Erreur lors du chargement des tables:', error);
            setTables([]);
          } else if (data) {
            const formattedTables: Table[] = data.map((t: any) => ({
              id: t.id,
              number: t.number,
              capacity: t.capacity,
              section: t.section,
              status: t.status,
            }));
            setTables(formattedTables);
            console.log('useTables - Tables chargées depuis Supabase:', formattedTables.length);
          }
        } catch (error) {
          console.error('useTables - Erreur lors du chargement des tables:', error);
          setTables([]);
        } finally {
          setIsInitialized(true);
        }
      };

      loadTables();
    }
  }, [isInitialized]);

  const addTable = async (tableData: Omit<Table, 'id'>) => {
    try {
      const { data, error } = await supabase.from('tables').insert([
        {
          number: tableData.number,
          capacity: tableData.capacity,
          section: tableData.section,
          status: tableData.status,
        },
      ]).select();

      if (error) {
        console.error('Erreur lors de l\'ajout de la table:', error);
      } else if (data && data[0]) {
        const newTable: Table = {
          id: data[0].id,
          number: data[0].number,
          capacity: data[0].capacity,
          section: data[0].section,
          status: data[0].status,
        };
        setTables(prev => [...prev, newTable]);
        console.log('useTables - Nouvelle table ajoutée:', newTable.number);
      }
    } catch (error) {
      console.error('useTables - Erreur lors de l\'ajout de la table:', error);
    }
  };

  const updateTable = async (id: string, tableData: Partial<Table>) => {
    try {
      const updateData: any = {};
      if (tableData.number !== undefined) updateData.number = tableData.number;
      if (tableData.capacity !== undefined) updateData.capacity = tableData.capacity;
      if (tableData.section !== undefined) updateData.section = tableData.section;
      if (tableData.status !== undefined) updateData.status = tableData.status;

      const { error } = await supabase
        .from('tables')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la mise à jour de la table:', error);
      } else {
        setTables(prev => prev.map(t =>
          t.id === id ? { ...t, ...tableData } : t
        ));
        console.log('useTables - Table mise à jour:', id);
      }
    } catch (error) {
      console.error('useTables - Erreur lors de la mise à jour de la table:', error);
    }
  };

  const deleteTable = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression de la table:', error);
      } else {
        setTables(prev => prev.filter(t => t.id !== id));
        console.log('useTables - Table supprimée');
      }
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