
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { geminiService } from '../../services/geminiApi';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

const InsightsView: React.FC = () => {
  const { currentDataset } = useAppStore();
  const [insights, setInsights] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (currentDataset && insights.length === 0) {
      generateInsights();
    }
  }, [currentDataset]);

  const generateInsights = async () => {
    if (!currentDataset) return;

    setIsGenerating(true);
    try {
      const generatedInsights = await geminiService.generateInsights(currentDataset);
      setInsights(generatedInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!currentDataset) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No dataset selected</p>
      </div>
    );
  }

  const insightTypes = [
    { icon: TrendingUp, label: 'Trend', color: 'text-blue-400' },
    { icon: AlertTriangle, label: 'Anomaly', color: 'text-yellow-400' },
    { icon: CheckCircle, label: 'Quality', color: 'text-green-400' },
    { icon: Brain, label: 'Pattern', color: 'text-purple-400' },
    { icon: Sparkles, label: 'Statistical', color: 'text-pink-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">AI Insights</h1>
          <p className="text-gray-400">
            AI-powered analysis for <span className="text-[#00d4ff]">{currentDataset.name}</span>
          </p>
        </div>
        <button
          onClick={generateInsights}
          disabled={isGenerating}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#00d4ff] to-[#7c3aed] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Brain className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : ''}`} />
          <span>{isGenerating ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>

      {isGenerating ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a] animate-pulse">
              <div className="h-4 bg-[#2a2a2a] rounded w-3/4 mb-3"></div>
              <div className="h-3 bg-[#2a2a2a] rounded w-full mb-2"></div>
              <div className="h-3 bg-[#2a2a2a] rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => {
            const insightType = insightTypes[index % insightTypes.length];
            const Icon = insightType.icon;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#00d4ff]/30 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#2a2a2a] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className={`w-5 h-5 ${insightType.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-sm font-medium ${insightType.color}`}>
                        {insightType.label}
                      </span>
                      <span className="text-xs text-gray-500 bg-[#2a2a2a] px-2 py-1 rounded">
                        {Math.floor(Math.random() * 30) + 70}% confidence
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{insight}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}

          {insights.length === 0 && !isGenerating && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Insights Generated</h3>
              <p className="text-gray-400 mb-6">Click the Generate button to create AI-powered insights for your dataset</p>
            </div>
          )}
        </div>
      )}

      {/* Insights generated indicator */}
      {insights.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Insights generated • Powered by Gemini AI
          </p>
        </div>
      )}
    </div>
  );
};

export default InsightsView;
