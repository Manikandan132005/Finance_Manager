import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Calendar, Download, TrendingUp } from 'lucide-react';

export const DailyReports: React.FC = () => {
  const { payments, customers } = useFinance();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const dailyData = useMemo(() => {
    const datePayments = payments.filter((payment) => payment.paymentDate === selectedDate);

    const totalCollected = datePayments.reduce((sum, payment) => sum + payment.paymentAmount, 0);

    const paymentDetails = datePayments.map((payment) => {
      const customer = customers.find((c) => c.id === payment.customerId);
      return {
        customerName: customer?.name || 'Unknown',
        customerId: customer?.customerId || 'N/A',
        amount: payment.paymentAmount,
        time: new Date(payment.createdAt).toLocaleTimeString(),
      };
    });

    return { totalCollected, paymentDetails, count: datePayments.length };
  }, [payments, customers, selectedDate]);

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Customer ID', 'Customer Name', 'Amount', 'Time'],
      ...dailyData.paymentDetails.map((p) => [selectedDate, p.customerId, p.customerName, p.amount, p.time]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${selectedDate}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Daily Payment Reports</h1>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <div className="relative max-w-xs">
          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Collected</h3>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">₹{dailyData.totalCollected.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-1">{selectedDate}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Payments</h3>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">{dailyData.count}</p>
          <p className="text-sm opacity-75 mt-1">Transactions</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Average Payment</h3>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">
            ₹{dailyData.count > 0 ? (dailyData.totalCollected / dailyData.count).toFixed(2) : '0.00'}
          </p>
          <p className="text-sm opacity-75 mt-1">Per Transaction</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Payment Breakdown</h2>
        </div>

        {dailyData.paymentDetails.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyData.paymentDetails.map((payment, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.customerId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ₹{payment.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            <p>No payments recorded for this date</p>
          </div>
        )}
      </div>
    </div>
  );
};
