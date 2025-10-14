import { useState, useEffect, createContext, useContext } from 'react';
import { Expense } from '../types';

interface ExpenseContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getTodaysExpenses: () => Expense[];
  getExpensesByCategory: (category: string) => Expense[];
  getTotalExpenses: (startDate?: Date, endDate?: Date) => number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses doit être utilisé dans un ExpenseProvider');
  }
  return context;
};

export const useExpenseProvider = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isInitialized) {
      const storedExpenses = localStorage.getItem('restobar_expenses');
      if (storedExpenses) {
        try {
          const parsedExpenses = JSON.parse(storedExpenses);
          if (Array.isArray(parsedExpenses)) {
            const expensesWithDates = parsedExpenses.map(expense => ({
              ...expense,
              date: new Date(expense.date),
            }));
            setExpenses(expensesWithDates);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des charges:', error);
          setExpenses([]);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('restobar_expenses', JSON.stringify(expenses));
    }
  }, [expenses, isInitialized]);

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => 
      e.id === id ? { ...e, ...expenseData } : e
    ));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const getTodaysExpenses = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return expenses.filter(e => {
      const expenseDate = new Date(e.date);
      return expenseDate >= today && expenseDate < tomorrow;
    });
  };

  const getExpensesByCategory = (category: string) => {
    return expenses.filter(e => e.category === category);
  };

  const getTotalExpenses = (startDate?: Date, endDate?: Date) => {
    let filteredExpenses = expenses;
    
    if (startDate) {
      filteredExpenses = filteredExpenses.filter(e => new Date(e.date) >= startDate);
    }
    
    if (endDate) {
      filteredExpenses = filteredExpenses.filter(e => new Date(e.date) <= endDate);
    }
    
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    getTodaysExpenses,
    getExpensesByCategory,
    getTotalExpenses,
  };
};

export { ExpenseContext };