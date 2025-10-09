import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { CustomerDashboard } from './components/CustomerDashboard';
import { PaymentEntry } from './components/PaymentEntry';
import { DailyReports } from './components/DailyReports';
import { MonthlyReports } from './components/MonthlyReports';
import { Analytics } from './components/Analytics';
import { Customer } from './types';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  FileText,
  Calendar,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';

type Page = 'dashboard' | 'payment' | 'daily' | 'monthly' | 'analytics';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard' as Page, label: 'Customers', icon: Users },
    { id: 'payment' as Page, label: 'Payment Entry', icon: DollarSign },
    { id: 'daily' as Page, label: 'Daily Reports', icon: FileText },
    { id: 'monthly' as Page, label: 'Monthly Reports', icon: Calendar },
    { id: 'analytics' as Page, label: 'Analytics', icon: BarChart3 },
  ];

  const handleNavigation = (page: Page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                  <LayoutDashboard className="text-white" size={28} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Finance Manager</h1>
                  <p className="text-xs text-gray-500">Loan & Payment Tracking</p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>

              <div className="hidden lg:flex gap-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        currentPage === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-2 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                        currentPage === item.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </nav>

        <main className="max-w-7xl mx-auto">
          {currentPage === 'dashboard' && (
            <CustomerDashboard
              onSelectCustomer={(customer) => {
                setSelectedCustomer(customer);
              }}
            />
          )}
          {currentPage === 'payment' && <PaymentEntry />}
          {currentPage === 'daily' && <DailyReports />}
          {currentPage === 'monthly' && <MonthlyReports />}
          {currentPage === 'analytics' && <Analytics />}
        </main>

        {selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Customer Details</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-lg text-gray-800 mb-3">{selectedCustomer.name}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Customer ID</p>
                      <p className="font-medium text-gray-800">{selectedCustomer.customerId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{selectedCustomer.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Area</p>
                      <p className="font-medium text-gray-800">{selectedCustomer.area}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-800">
                        {new Date(selectedCustomer.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </FinanceProvider>
  );
}

export default App;
