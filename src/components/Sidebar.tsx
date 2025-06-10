
import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { 
  Upload, 
  Database, 
  BarChart3, 
  Brain, 
  MessageCircle, 
  Settings,
  BarChart
} from 'lucide-react';

const menuItems = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'datasets', label: 'Datasets', icon: Database },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'insights', label: 'AI Insights', icon: Brain },
  { id: 'chat', label: 'Chat with AI', icon: MessageCircle },
];

const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, datasets } = useAppStore();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-[#0a0a0a] border-r border-[#2a2a2a] z-50">
      {/* Header */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] rounded-lg flex items-center justify-center">
            <BarChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">DataLens AI</h1>
            <p className="text-xs text-gray-400">AI-Powered Dataset Analyzer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const isDisabled = (item.id === 'dashboard' || item.id === 'insights' || item.id === 'chat') && datasets.length === 0;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => !isDisabled && setCurrentView(item.id as any)}
              disabled={isDisabled}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-[#00d4ff]/20 to-[#7c3aed]/20 border border-[#00d4ff]/30 text-[#00d4ff]' 
                  : isDisabled
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
                }
              `}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.id === 'datasets' && datasets.length > 0 && (
                <span className="ml-auto bg-[#00d4ff] text-[#0a0a0a] text-xs px-2 py-1 rounded-full">
                  {datasets.length}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="absolute bottom-4 left-4 right-4">
        <motion.button
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-[#1a1a1a] hover:text-white transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Sidebar;
