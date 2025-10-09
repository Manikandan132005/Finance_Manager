export interface Customer {
  id: string;
  customerId: string;
  name: string;
  phoneNumber: string;
  area: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  customerId: string;
  loanAmount: number;
  loanDate: string;
  loanDurationDays: number;
  interestRate: number;
  documentCharges: number;
  totalAmount: number;
  dailyPaymentAmount: number;
  totalPaid: number;
  status: 'active' | 'completed' | 'overdue';
  createdAt: string;
}

export interface Payment {
  id: string;
  loanId: string;
  customerId: string;
  paymentAmount: number;
  paymentDate: string;
  balanceAfterPayment: number;
  createdAt: string;
}

export interface DailyReport {
  date: string;
  totalCollected: number;
  payments: Array<{
    customerName: string;
    customerId: string;
    amount: number;
  }>;
}

export interface MonthlyReport {
  month: string;
  totalCollected: number;
  activeLoans: number;
  completedLoans: number;
  overdueLoans: number;
  interestIncome: number;
}
