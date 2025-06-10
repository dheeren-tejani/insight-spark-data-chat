
import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { FileText, Calendar, Eye, Database, TrendingUp } from 'lucide-react';

const DatasetList: React.FC = () => {
  const { datasets, currentDataset, setCurrentDataset, setCurrentView } = useAppStore();

  const handleDatasetSelect = (dataset: any) => {
    setCurrentDataset(dataset);
    setCurrentView('dashboard');
  };

  if (datasets.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
          <Database className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No Datasets Yet</h3>
        <p className="text-gray-400 mb-6">Upload your first dataset to get started with AI-powered analysis</p>
        <button
          onClick={() => useAppStore.getState().setCurrentView('upload')}
          className="px-6 py-3 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Upload Dataset
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Your Datasets</h1>
          <p className="text-gray-400">{datasets.length} dataset{datasets.length !== 1 ? 's' : ''} uploaded</p>
        </div>
        <button
          onClick={() => useAppStore.getState().setCurrentView('upload')}
          className="px-4 py-2 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Upload New
        </button>
      </div>

      {/* Dataset Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {datasets.map((dataset, index) => (
          <motion.div
            key={dataset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              bg-[#1a1a1a] rounded-lg p-6 border transition-all duration-200 cursor-pointer
              ${currentDataset?.id === dataset.id 
                ? 'border-[#00d4ff] shadow-lg shadow-[#00d4ff]/20' 
                : 'border-[#2a2a2a] hover:border-[#00d4ff]/50'
              }
            `}
            onClick={() => handleDatasetSelect(dataset)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{dataset.name}</h3>
                  <p className="text-sm text-gray-400">{dataset.filename}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium capitalize
                  ${dataset.domain === 'finance' ? 'bg-green-500/20 text-green-400' :
                    dataset.domain === 'healthcare' ? 'bg-blue-500/20 text-blue-400' :
                    dataset.domain === 'business' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }
                `}>
                  {dataset.domain}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#0a0a0a] rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <Database className="w-4 h-4 text-[#00d4ff]" />
                  <span className="text-sm text-gray-400">Rows</span>
                </div>
                <p className="text-lg font-semibold text-white">{dataset.rows.toLocaleString()}</p>
              </div>
              <div className="bg-[#0a0a0a] rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-[#7c3aed]" />
                  <span className="text-sm text-gray-400">Columns</span>
                </div>
                <p className="text-lg font-semibold text-white">{dataset.columns.length}</p>
              </div>
            </div>

            {/* Data Quality */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Data Quality</span>
                <span className="text-sm font-medium text-white">{dataset.dataQuality}%</span>
              </div>
              <div className="w-full bg-[#2a2a2a] rounded-full h-2">
                <div 
                  className={`h-full rounded-full ${
                    dataset.dataQuality >= 80 ? 'bg-green-500' :
                    dataset.dataQuality >= 60 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${dataset.dataQuality}%` }}
                />
              </div>
            </div>

            {/* Detected Features */}
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Detected Features</p>
              <div className="flex flex-wrap gap-1">
                {dataset.detectedFeatures.slice(0, 3).map((feature, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-[#00d4ff]/20 text-[#00d4ff] rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
                {dataset.detectedFeatures.length > 3 && (
                  <span className="px-2 py-1 bg-[#2a2a2a] text-gray-400 rounded text-xs">
                    +{dataset.detectedFeatures.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-[#2a2a2a]">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{dataset.uploadDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDatasetSelect(dataset);
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-[#00d4ff]/20 text-[#00d4ff] rounded text-sm hover:bg-[#00d4ff]/30 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DatasetList;
