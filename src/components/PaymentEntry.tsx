import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { DollarSign, CheckCircle, AlertCircle } from 'lucide-react';

export const PaymentEntry: React.FC = () => {
  const { customers, loans, addPayment, getCustomerById } = useFinance();
  const [customerId, setCustomerId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const customer = getCustomerById(customerId);
  const customerLoans = customer
    ? loans.filter((loan) => loan.customerId === customer.id && loan.status === 'active')
    : [];

  const selectedLoan = customerLoans.find((loan) => loan.id === selectedLoanId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedLoan) {
      setError('Please select a loan');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    const remainingBalance = selectedLoan.totalAmount - selectedLoan.totalPaid;
    if (amount > remainingBalance) {
      setError(`Payment amount cannot exceed remaining balance of ₹${remainingBalance.toFixed(2)}`);
      return;
    }

    const balanceAfterPayment = remainingBalance - amount;

    addPayment({
      loanId: selectedLoan.id,
      customerId: customer!.id,
      paymentAmount: amount,
      paymentDate: new Date().toISOString().split('T')[0],
      balanceAfterPayment,
    });

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCustomerId('');
      setPaymentAmount('');
      setSelectedLoanId('');
    }, 2000);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Daily Payment Entry</h1>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
                <input
                  type="text"
                  value={customerId}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    setSelectedLoanId('');
                    setError('');
                  }}
                  placeholder="Enter Customer ID"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {customer && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Customer Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium text-gray-800">{customer.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{customer.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Area</p>
                      <p className="font-medium text-gray-800">{customer.area}</p>
                    </div>
                  </div>
                </div>
              )}

              {customerLoans.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Loan</label>
                  <select
                    value={selectedLoanId}
                    onChange={(e) => setSelectedLoanId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Choose a loan</option>
                    {customerLoans.map((loan) => (
                      <option key={loan.id} value={loan.id}>
                        Loan ₹{loan.loanAmount.toFixed(2)} - Balance: ₹
                        {(loan.totalAmount - loan.totalPaid).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedLoan && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">Loan Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Loan Amount</p>
                      <p className="font-medium text-gray-800">₹{selectedLoan.loanAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <p className="font-medium text-gray-800">₹{selectedLoan.totalAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Paid</p>
                      <p className="font-medium text-green-600">₹{selectedLoan.totalPaid.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Remaining Balance</p>
                      <p className="font-medium text-red-600">
                        ₹{(selectedLoan.totalAmount - selectedLoan.totalPaid).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Daily Payment</p>
                      <p className="font-medium text-gray-800">₹{selectedLoan.dailyPaymentAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium text-gray-800">{selectedLoan.loanDurationDays} days</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="number"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={!selectedLoan}
                  />
                </div>
                {selectedLoan && (
                  <button
                    type="button"
                    onClick={() => setPaymentAmount(selectedLoan.dailyPaymentAmount.toString())}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    Use daily payment amount (₹{selectedLoan.dailyPaymentAmount.toFixed(2)})
                  </button>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
                  <AlertCircle size={20} />
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!customer || !selectedLoan || !paymentAmount}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold"
              >
                Submit Payment
              </button>
            </div>
          </form>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
              <p className="text-gray-600">Payment of ₹{parseFloat(paymentAmount).toFixed(2)} recorded</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
