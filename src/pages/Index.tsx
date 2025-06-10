
import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import Sidebar from '../components/Sidebar';
import UploadArea from '../components/Upload/UploadArea';
import DatasetList from '../components/Datasets/DatasetList';
import DashboardView from '../components/Dashboard/DashboardView';
import InsightsView from '../components/AIInsights/InsightsView';
import ChatView from '../components/Chat/ChatView';

const Index: React.FC = () => {
  const { currentView } = useAppStore();

  const renderContent = () => {
    switch (currentView) {
      case 'upload':
        return <UploadArea />;
      case 'datasets':
        return <DatasetList />;
      case 'dashboard':
        return <DashboardView />;
      case 'insights':
        return <InsightsView />;
      case 'chat':
        return <ChatView />;
      default:
        return <UploadArea />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        <main className="p-8">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Index;
