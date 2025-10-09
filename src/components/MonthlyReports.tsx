import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Calendar, TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react';

export const MonthlyReports: React.FC = () => {
  const { payments, loans, customers } = useFinance();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const monthlyData = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const monthStart = `${year}-${month}-01`;
    const monthEnd = `${year}-${month}-31`;

    const monthPayments = payments.filter(
      (payment) => payment.paymentDate >= monthStart && payment.paymentDate <= monthEnd
    );

    const totalCollected = monthPayments.reduce((sum, payment) => sum + payment.paymentAmount, 0);

    const activeLoans = loans.filter((loan) => loan.status === 'active').length;
    const completedLoans = loans.filter(
      (loan) =>
        loan.status === 'completed' &&
        loan.createdAt >= monthStart &&
        loan.createdAt <= monthEnd + 'T23:59:59'
    ).length;
    const overdueLoans = loans.filter((loan) => loan.status === 'overdue').length;

    const interestIncome = loans
      .filter(
        (loan) =>
          loan.loanDate >= monthStart && loan.loanDate <= monthEnd
      )
      .reduce((sum, loan) => {
        const principal = loan.loanAmount;
        const totalAmount = loan.totalAmount - loan.documentCharges;
        const interest = totalAmount - principal;
        return sum + interest;
      }, 0);

    const customerPayments = monthPayments.reduce((acc, payment) => {
      const customer = customers.find((c) => c.id === payment.customerId);
      if (customer) {
        const key = customer.customerId;
        if (!acc[key]) {
          acc[key] = {
            customerId: customer.customerId,
            customerName: customer.name,
            totalPaid: 0,
            paymentCount: 0,
          };
        }
        acc[key].totalPaid += payment.paymentAmount;
        acc[key].paymentCount += 1;
      }
      return acc;
    }, {} as Record<string, { customerId: string; customerName: string; totalPaid: number; paymentCount: number }>);

    const topCustomers = Object.values(customerPayments)
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 10);

    return {
      totalCollected,
      activeLoans,
      completedLoans,
      overdueLoans,
      interestIncome,
      transactionCount: monthPayments.length,
      topCustomers,
    };
  }, [payments, loans, customers, selectedMonth]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Monthly Reports</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
        <div className="relative max-w-xs">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Collection</h3>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">₹{monthlyData.totalCollected.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-1">{monthlyData.transactionCount} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Active Loans</h3>
            <Users size={24} />
          </div>
          <p className="text-3xl font-bold">{monthlyData.activeLoans}</p>
          <p className="text-sm opacity-75 mt-1">Currently active</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Completed Loans</h3>
            <CheckCircle size={24} />
          </div>
          <p className="text-3xl font-bold">{monthlyData.completedLoans}</p>
          <p className="text-sm opacity-75 mt-1">This month</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Overdue Loans</h3>
            <AlertCircle size={24} />
          </div>
          <p className="text-3xl font-bold">{monthlyData.overdueLoans}</p>
          <p className="text-sm opacity-75 mt-1">Require attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Interest Income</span>
              <span className="text-xl font-bold text-green-600">₹{monthlyData.interestIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Average Transaction</span>
              <span className="text-xl font-bold text-blue-600">
                ₹
                {monthlyData.transactionCount > 0
                  ? (monthlyData.totalCollected / monthlyData.transactionCount).toFixed(2)
                  : '0.00'}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <span className="text-gray-700 font-medium">Collection Rate</span>
              <span className="text-xl font-bold text-teal-600">
                {monthlyData.activeLoans > 0
                  ? ((monthlyData.transactionCount / monthlyData.activeLoans) * 100).toFixed(1)
                  : '0'}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Loan Status Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50 rounded">
              <div>
                <p className="font-semibold text-gray-800">Active Loans</p>
                <p className="text-sm text-gray-600">Currently running</p>
              </div>
              <span className="text-2xl font-bold text-green-600">{monthlyData.activeLoans}</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
              <div>
                <p className="font-semibold text-gray-800">Completed</p>
                <p className="text-sm text-gray-600">Fully paid this month</p>
              </div>
              <span className="text-2xl font-bold text-blue-600">{monthlyData.completedLoans}</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-red-500 bg-red-50 rounded">
              <div>
                <p className="font-semibold text-gray-800">Overdue</p>
                <p className="text-sm text-gray-600">Needs follow-up</p>
              </div>
              <span className="text-2xl font-bold text-red-600">{monthlyData.overdueLoans}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Top Paying Customers</h2>
        </div>

        {monthlyData.topCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyData.topCustomers.map((customer, index) => (
                  <tr key={customer.customerId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.customerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{customer.paymentCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ₹{customer.totalPaid.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No payment data available for this month</p>
          </div>
        )}
      </div>
    </div>
  );
};
