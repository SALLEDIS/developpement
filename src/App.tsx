import React, { createContext } from 'react';
import { useAuthProvider, AuthContext } from './hooks/useAuth';
import { useProductProvider, ProductContext } from './hooks/useProducts';
import { useOrderProvider, OrderContext } from './hooks/useOrders';
import { useTableProvider, TableContext } from './hooks/useTables';
import { useUserProvider, UserContext } from './hooks/useUsers';
import { useExpenseProvider, ExpenseContext } from './hooks/useExpenses';
import { useSettingsProvider, SettingsContext } from './hooks/useSettings';
import { useCashSessionProvider, CashSessionContext } from './hooks/useCashSession';
import { usePaymentMethodsProvider, PaymentMethodsContext } from './hooks/usePaymentMethods';
import { useSecuritySettingsProvider, SecuritySettingsContext } from './hooks/useSecuritySettings';
import { usePrinterProvider, PrinterContext } from './hooks/usePrinters';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import MainApp from './components/MainApp';

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const products = useProductProvider();
  return <ProductContext.Provider value={products}>{children}</ProductContext.Provider>;
};

const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const orders = useOrderProvider();
  return <OrderContext.Provider value={orders}>{children}</OrderContext.Provider>;
};

const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tables = useTableProvider();
  return <TableContext.Provider value={tables}>{children}</TableContext.Provider>;
};

const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const users = useUserProvider();
  return <UserContext.Provider value={users}>{children}</UserContext.Provider>;
};

const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const expenses = useExpenseProvider();
  return <ExpenseContext.Provider value={expenses}>{children}</ExpenseContext.Provider>;
};

const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settings = useSettingsProvider();
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
};

const CashSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cashSession = useCashSessionProvider();
  return <CashSessionContext.Provider value={cashSession}>{children}</CashSessionContext.Provider>;
};

const PaymentMethodsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const paymentMethods = usePaymentMethodsProvider();
  return <PaymentMethodsContext.Provider value={paymentMethods}>{children}</PaymentMethodsContext.Provider>;
};

const SecuritySettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const securitySettings = useSecuritySettingsProvider();
  return <SecuritySettingsContext.Provider value={securitySettings}>{children}</SecuritySettingsContext.Provider>;
};

const PrinterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const printers = usePrinterProvider();
  return <PrinterContext.Provider value={printers}>{children}</PrinterContext.Provider>;
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <MainApp /> : <LoginForm />;
};

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <PaymentMethodsProvider>
          <SecuritySettingsProvider>
            <PrinterProvider>
              <OrderProvider>
                <ExpenseProvider>
                  <CashSessionProvider>
                    <UserProvider>
                      <ProductProvider>
                        <TableProvider>
                          <AppContent />
                        </TableProvider>
                      </ProductProvider>
                    </UserProvider>
                  </CashSessionProvider>
                </ExpenseProvider>
              </OrderProvider>
            </PrinterProvider>
          </SecuritySettingsProvider>
        </PaymentMethodsProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;