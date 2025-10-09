import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Search, Plus, Eye, User } from 'lucide-react';
import { Customer, Loan } from '../types';

interface CustomerDashboardProps {
  onSelectCustomer: (customer: Customer) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onSelectCustomer }) => {
  const { customers, loans, addCustomer, addLoan } = useFinance();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const [customerForm, setCustomerForm] = useState({
    customerId: '',
    name: '',
    phoneNumber: '',
    area: '',
  });

  const [loanForm, setLoanForm] = useState({
    loanAmount: '',
    loanDurationDays: '',
    interestRate: '',
    documentCharges: '',
  });

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm)
  );

  const getCustomerLoans = (customerId: string): Loan[] => {
    return loans.filter((loan) => loan.customerId === customerId);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    addCustomer(customerForm);
    setCustomerForm({ customerId: '', name: '', phoneNumber: '', area: '' });
    setShowAddCustomer(false);
  };

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;

    const loanAmount = parseFloat(loanForm.loanAmount);
    const durationDays = parseInt(loanForm.loanDurationDays);
    const interestRate = parseFloat(loanForm.interestRate);
    const documentCharges = parseFloat(loanForm.documentCharges);

    const interestAmount = (loanAmount * interestRate * durationDays) / (100 * 365);
    const totalAmount = loanAmount + interestAmount + documentCharges;
    const dailyPaymentAmount = totalAmount / durationDays;

    addLoan({
      customerId: customer.id,
      loanAmount,
      loanDate: new Date().toISOString().split('T')[0],
      loanDurationDays: durationDays,
      interestRate,
      documentCharges,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      dailyPaymentAmount: parseFloat(dailyPaymentAmount.toFixed(2)),
    });

    setLoanForm({
      loanAmount: '',
      loanDurationDays: '',
      interestRate: '',
      documentCharges: '',
    });
    setShowAddLoan(false);
    setSelectedCustomerId('');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Customer Management</h1>
        <button
          onClick={() => setShowAddCustomer(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Customer ID, Name, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredCustomers.map((customer) => {
          const customerLoans = getCustomerLoans(customer.id);
          const activeLoan = customerLoans.find((l) => l.status === 'active');

          return (
            <div key={customer.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{customer.name}</h3>
                      <p className="text-sm text-gray-500">ID: {customer.customerId}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{customer.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Area</p>
                      <p className="font-medium text-gray-800">{customer.area}</p>
                    </div>
                  </div>

                  {activeLoan && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Active Loan</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Loan Amount</p>
                          <p className="font-semibold text-gray-800">₹{activeLoan.loanAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Amount</p>
                          <p className="font-semibold text-gray-800">₹{activeLoan.totalAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Balance</p>
                          <p className="font-semibold text-red-600">
                            ₹{(activeLoan.totalAmount - activeLoan.totalPaid).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Daily Payment</p>
                          <p className="font-semibold text-gray-800">₹{activeLoan.dailyPaymentAmount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-800">{activeLoan.loanDurationDays} days</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Interest Rate</p>
                          <p className="font-semibold text-gray-800">{activeLoan.interestRate}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectCustomer(customer)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <Eye size={18} />
                    View
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCustomerId(customer.id);
                      setShowAddLoan(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Plus size={18} />
                    Loan
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Customer</h2>
            <form onSubmit={handleAddCustomer}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
                  <input
                    type="text"
                    required
                    value={customerForm.customerId}
                    onChange={(e) => setCustomerForm({ ...customerForm, customerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="CUST001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={customerForm.phoneNumber}
                    onChange={(e) => setCustomerForm({ ...customerForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <input
                    type="text"
                    required
                    value={customerForm.area}
                    onChange={(e) => setCustomerForm({ ...customerForm, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddLoan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Loan</h2>
            <form onSubmit={handleAddLoan}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={loanForm.loanAmount}
                    onChange={(e) => setLoanForm({ ...loanForm, loanAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    required
                    value={loanForm.loanDurationDays}
                    onChange={(e) => setLoanForm({ ...loanForm, loanDurationDays: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={loanForm.interestRate}
                    onChange={(e) => setLoanForm({ ...loanForm, interestRate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Document Charges</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={loanForm.documentCharges}
                    onChange={(e) => setLoanForm({ ...loanForm, documentCharges: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLoan(false);
                    setSelectedCustomerId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Add Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
