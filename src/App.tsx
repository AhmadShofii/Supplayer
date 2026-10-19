/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { DashboardView } from './components/DashboardView';
import { Header } from './components/Header';
import { InventoryView } from './components/InventoryView';
import { ProductView } from './components/ProductView';
import { PurchaseOrderView } from './components/PurchaseOrderView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { SupplierView } from './components/SupplierView';
import { ToastContainer } from './components/ToastContainer';
import { UsersView } from './components/UsersView';
import { AppProvider, useApp } from './context/AppContext';

const MainLayout: React.FC = () => {
  const { currentUser, activeTab } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (!currentUser) {
    return <AuthScreen />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'suppliers':
        return <SupplierView />;
      case 'products':
        return <ProductView />;
      case 'inventory':
        return <InventoryView />;
      case 'orders':
        return <PurchaseOrderView />;
      case 'reports':
        return <ReportsView />;
      case 'users':
        return <UsersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6F4] text-[#27313B] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Interactive Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
