
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, 
  PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

const DashboardView: React.FC = () => {
  const { currentDataset } = useAppStore();

  const stats = useMemo(() => {
    if (!currentDataset) return [];
    
    return [
      {
        title: 'Data Completeness',
        value: `${currentDataset.dataQuality}%`,
        change: '+2.5%',
        icon: TrendingUp,
        color: 'from-green-400 to-green-600'
      },
      {
        title: 'Total Rows',
        value: currentDataset.rows.toLocaleString(),
        change: '+12%',
        icon: Users,
        color: 'from-blue-400 to-blue-600'
      },
      {
        title: 'Columns',
        value: currentDataset.columns.length.toString(),
        change: 'Stable',
        icon: Activity,
        color: 'from-purple-400 to-purple-600'
      },
      {
        title: 'Missing Values',
        value: Math.round((100 - currentDataset.dataQuality) * currentDataset.rows / 100).toString(),
        change: '-5%',
        icon: DollarSign,
        color: 'from-red-400 to-red-600'
      }
    ];
  }, [currentDataset]);

  const chartData = useMemo(() => {
    if (!currentDataset || !currentDataset.data) return [];
    
    // Sample the data for charts (take first 20 rows)
    return currentDataset.data.slice(0, 20).map((row, index) => ({
      index: index + 1,
      ...row
    }));
  }, [currentDataset]);

  const numericColumns = useMemo(() => {
    if (!currentDataset) return [];
    
    return currentDataset.columns.filter(col => {
      const sample = currentDataset.data[0]?.[col];
      return !isNaN(Number(sample)) && sample !== '';
    });
  }, [currentDataset]);

  const colors = ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ef4444'];

  if (!currentDataset) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No dataset selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Analyzing: <span className="text-[#00d4ff]">{currentDataset.name}</span> • 
          Domain: <span className="text-[#7c3aed] capitalize">{currentDataset.domain}</span> •
          Confidence: <span className="text-green-400">{currentDataset.confidence}%</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a] hover:border-[#00d4ff]/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-400">{stat.change}</span>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        {numericColumns.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Data Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="index" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2a2a2a', 
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={numericColumns[0]} 
                  stroke="#00d4ff" 
                  strokeWidth={2}
                  dot={{ fill: '#00d4ff', strokeWidth: 2 }}
                />
                {numericColumns[1] && (
                  <Line 
                    type="monotone" 
                    dataKey={numericColumns[1]} 
                    stroke="#7c3aed" 
                    strokeWidth={2}
                    dot={{ fill: '#7c3aed', strokeWidth: 2 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Bar Chart */}
        {numericColumns.length >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Data Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="index" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2a2a2a', 
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey={numericColumns[0]} fill="#00d4ff" radius={[4, 4, 0, 0]} />
                {numericColumns[1] && (
                  <Bar dataKey={numericColumns[1]} fill="#7c3aed" radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Scatter Plot */}
        {numericColumns.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Correlation Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey={numericColumns[0]} stroke="#666" />
                <YAxis dataKey={numericColumns[1]} stroke="#666" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2a2a2a', 
                    border: '1px solid #3a3a3a',
                    borderRadius: '8px'
                  }} 
                />
                <Scatter dataKey={numericColumns[1]} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Data Quality Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Complete Data', value: currentDataset.dataQuality },
                  { name: 'Missing Data', value: 100 - currentDataset.dataQuality }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#10b981" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#2a2a2a', 
                  border: '1px solid #3a3a3a',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Detected Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-[#1a1a1a] rounded-lg p-6 border border-[#2a2a2a]"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Detected Features</h3>
        <div className="flex flex-wrap gap-2">
          {currentDataset.detectedFeatures.map((feature, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-[#00d4ff]/20 text-[#00d4ff] rounded-full text-sm border border-[#00d4ff]/30"
            >
              {feature}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardView;
