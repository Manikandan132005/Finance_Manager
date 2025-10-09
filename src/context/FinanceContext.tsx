import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Loan, Payment } from '../types';

interface FinanceContextType {
  customers: Customer[];
  loans: Loan[];
  payments: Payment[];
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  addLoan: (loan: Omit<Loan, 'id' | 'createdAt' | 'totalPaid' | 'status'>) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  updateLoan: (loanId: string, updates: Partial<Loan>) => void;
  getCustomerById: (customerId: string) => Customer | undefined;
  getLoansByCustomerId: (customerId: string) => Loan[];
  getPaymentsByLoanId: (loanId: string) => Payment[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: 'finance_customers',
  LOANS: 'finance_loans',
  PAYMENTS: 'finance_payments',
};

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    return stored ? JSON.parse(stored) : [];
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOANS);
    return stored ? JSON.parse(stored) : [];
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
  };

  const addLoan = (loan: Omit<Loan, 'id' | 'createdAt' | 'totalPaid' | 'status'>) => {
    const newLoan: Loan = {
      ...loan,
      id: generateId(),
      totalPaid: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setLoans((prev) => [...prev, newLoan]);
  };

  const addPayment = (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...payment,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [...prev, newPayment]);

    setLoans((prev) =>
      prev.map((loan) => {
        if (loan.id === payment.loanId) {
          const newTotalPaid = loan.totalPaid + payment.paymentAmount;
          const status = newTotalPaid >= loan.totalAmount ? 'completed' : loan.status;
          return { ...loan, totalPaid: newTotalPaid, status };
        }
        return loan;
      })
    );
  };

  const updateLoan = (loanId: string, updates: Partial<Loan>) => {
    setLoans((prev) =>
      prev.map((loan) => (loan.id === loanId ? { ...loan, ...updates } : loan))
    );
  };

  const getCustomerById = (customerId: string) => {
    return customers.find((c) => c.customerId === customerId || c.id === customerId);
  };

  const getLoansByCustomerId = (customerId: string) => {
    const customer = getCustomerById(customerId);
    if (!customer) return [];
    return loans.filter((loan) => loan.customerId === customer.id);
  };

  const getPaymentsByLoanId = (loanId: string) => {
    return payments.filter((payment) => payment.loanId === loanId);
  };

  return (
    <FinanceContext.Provider
      value={{
        customers,
        loans,
        payments,
        addCustomer,
        addLoan,
        addPayment,
        updateLoan,
        getCustomerById,
        getLoansByCustomerId,
        getPaymentsByLoanId,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};
