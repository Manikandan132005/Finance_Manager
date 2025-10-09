import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const Analytics: React.FC = () => {
  const { payments, loans } = useFinance();

  const monthlyTrends = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        year: date.getFullYear(),
        monthNum: date.getMonth() + 1,
      };
    });

    const monthlyData = last6Months.map(({ month, year, monthNum }) => {
      const monthStr = `${year}-${String(monthNum).padStart(2, '0')}`;
      const monthPayments = payments.filter((p) => p.paymentDate.startsWith(monthStr));
      const collected = monthPayments.reduce((sum, p) => sum + p.paymentAmount, 0);

      const monthLoans = loans.filter((l) => l.loanDate.startsWith(monthStr));
      const disbursed = monthLoans.reduce((sum, l) => sum + l.loanAmount, 0);

      const interest = monthLoans.reduce((sum, l) => {
        const principal = l.loanAmount;
        const totalAmount = l.totalAmount - l.documentCharges;
        return sum + (totalAmount - principal);
      }, 0);

      return { month, collected, disbursed, interest };
    });

    return monthlyData;
  }, [payments, loans]);

  const profitLossData = useMemo(() => {
    const totalDisbursed = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    const totalCollected = payments.reduce((sum, payment) => sum + payment.paymentAmount, 0);
    const totalInterest = loans.reduce((sum, loan) => {
      const principal = loan.loanAmount;
      const totalAmount = loan.totalAmount - loan.documentCharges;
      return sum + (totalAmount - principal);
    }, 0);
    const documentCharges = loans.reduce((sum, loan) => sum + loan.documentCharges, 0);

    const totalRevenue = totalInterest + documentCharges;
    const outstanding = totalDisbursed - totalCollected;
    const profit = totalCollected - totalDisbursed + totalInterest;

    return {
      totalDisbursed,
      totalCollected,
      totalInterest,
      documentCharges,
      totalRevenue,
      outstanding,
      profit,
    };
  }, [payments, loans]);

  const loanStatusData = useMemo(() => {
    const active = loans.filter((l) => l.status === 'active').length;
    const completed = loans.filter((l) => l.status === 'completed').length;
    const overdue = loans.filter((l) => l.status === 'overdue').length;
    return { active, completed, overdue };
  }, [loans]);

  const lineChartData = {
    labels: monthlyTrends.map((d) => d.month),
    datasets: [
      {
        label: 'Collections',
        data: monthlyTrends.map((d) => d.collected),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Disbursements',
        data: monthlyTrends.map((d) => d.disbursed),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const barChartData = {
    labels: monthlyTrends.map((d) => d.month),
    datasets: [
      {
        label: 'Interest Income',
        data: monthlyTrends.map((d) => d.interest),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: ['Active Loans', 'Completed Loans', 'Overdue Loans'],
    datasets: [
      {
        data: [loanStatusData.active, loanStatusData.completed, loanStatusData.overdue],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['rgb(59, 130, 246)', 'rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Financial Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">₹{profitLossData.totalRevenue.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-1">Interest + Charges</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Collected</h3>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">₹{profitLossData.totalCollected.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Outstanding</h3>
            <PieChart size={24} />
          </div>
          <p className="text-3xl font-bold">₹{profitLossData.outstanding.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-1">Pending recovery</p>
        </div>

        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Net Profit</h3>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">₹{profitLossData.profit.toFixed(2)}</p>
          <p className="text-sm opacity-75 mt-1">Total earnings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Collections vs Disbursements</h2>
          <div style={{ height: '300px' }}>
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Interest Income</h2>
          <div style={{ height: '300px' }}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Loan Portfolio Distribution</h2>
          <div style={{ height: '300px' }} className="flex items-center justify-center">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Key Performance Indicators</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div>
                <p className="text-sm text-gray-600">Collection Efficiency</p>
                <p className="text-2xl font-bold text-blue-600">
                  {profitLossData.totalDisbursed > 0
                    ? ((profitLossData.totalCollected / profitLossData.totalDisbursed) * 100).toFixed(1)
                    : '0'}
                  %
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div>
                <p className="text-sm text-gray-600">Average Interest Rate</p>
                <p className="text-2xl font-bold text-green-600">
                  {loans.length > 0
                    ? (loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length).toFixed(2)
                    : '0'}
                  %
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
              <div>
                <p className="text-sm text-gray-600">Active Loan Portfolio</p>
                <p className="text-2xl font-bold text-orange-600">{loanStatusData.active}</p>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
              <div>
                <p className="text-sm text-gray-600">Total Interest Earned</p>
                <p className="text-2xl font-bold text-teal-600">₹{profitLossData.totalInterest.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
