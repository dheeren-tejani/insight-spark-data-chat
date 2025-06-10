import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, 
  PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity, BarChart3, Scatter3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import ChartSelector from './ChartSelector';
import AdvancedChartsView from './AdvancedChartsView';

const DashboardView: React.FC = () => {
  const { currentDataset } = useAppStore();
  
  // State for selected columns for each chart
  const [lineChartColumns, setLineChartColumns] = useState<{primary: string, secondary: string}>({ primary: '', secondary: '' });
  const [barChartColumns, setBarChartColumns] = useState<{primary: string, secondary: string}>({ primary: '', secondary: '' });
  const [scatterChartColumns, setScatterChartColumns] = useState<{x: string, y: string}>({ x: '', y: '' });
  const [areaChartColumn, setAreaChartColumn] = useState<string>('');
  const [radarChartColumns, setRadarChartColumns] = useState<string[]>([]);

  const stats = useMemo(() => {
    if (!currentDataset) return [];
    
    return [
      {
        title: 'Data Completeness',
        value: `${currentDataset.dataQuality}%`,
        change: '+2.5%',
        icon: TrendingUp,
        color: 'from-primary/80 to-primary'
      },
      {
        title: 'Total Rows',
        value: currentDataset.rows.toLocaleString(),
        change: '+12%',
        icon: Users,
        color: 'from-secondary/80 to-secondary'
      },
      {
        title: 'Columns',
        value: currentDataset.columns.length.toString(),
        change: 'Stable',
        icon: Activity,
        color: 'from-accent to-accent'
      },
      {
        title: 'Missing Values',
        value: Math.round((100 - currentDataset.dataQuality) * currentDataset.rows / 100).toString(),
        change: '-5%',
        icon: DollarSign,
        color: 'from-destructive/80 to-destructive'
      }
    ];
  }, [currentDataset]);

  const chartData = useMemo(() => {
    if (!currentDataset || !currentDataset.data) return [];
    
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

  // Initialize default columns when dataset changes
  React.useEffect(() => {
    if (numericColumns.length > 0) {
      setLineChartColumns({ 
        primary: numericColumns[0] || '', 
        secondary: numericColumns[1] || '' 
      });
      setBarChartColumns({ 
        primary: numericColumns[0] || '', 
        secondary: numericColumns[1] || '' 
      });
      setScatterChartColumns({ 
        x: numericColumns[0] || '', 
        y: numericColumns[1] || '' 
      });
      setAreaChartColumn(numericColumns[0] || '');
      setRadarChartColumns(numericColumns.slice(0, 5));
    }
  }, [numericColumns]);

  const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  if (!currentDataset) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No dataset selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Analyzing: <span className="text-primary">{currentDataset.name}</span> • 
          Domain: <span className="text-secondary capitalize">{currentDataset.domain}</span> •
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
              className="bg-card rounded-lg p-6 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-400">{stat.change}</span>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium">{stat.title}</h3>
              <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Basic Charts</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center space-x-2">
            <Scatter3 className="w-4 h-4" />
            <span>Advanced Charts</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-lg p-6 border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Trend Analysis</h3>
              <div className="space-y-2">
                <ChartSelector
                  columns={numericColumns}
                  selectedColumn={lineChartColumns.primary}
                  onColumnChange={(col) => setLineChartColumns(prev => ({ ...prev, primary: col }))}
                  label="Primary"
                />
                <ChartSelector
                  columns={numericColumns}
                  selectedColumn={lineChartColumns.secondary}
                  onColumnChange={(col) => setLineChartColumns(prev => ({ ...prev, secondary: col }))}
                  label="Secondary"
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  {lineChartColumns.primary && (
                    <Line 
                      type="monotone" 
                      dataKey={lineChartColumns.primary} 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                    />
                  )}
                  {lineChartColumns.secondary && (
                    <Line 
                      type="monotone" 
                      dataKey={lineChartColumns.secondary} 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card rounded-lg p-6 border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Distribution Analysis</h3>
              <div className="space-y-2">
                <ChartSelector
                  columns={numericColumns}
                  selectedColumn={barChartColumns.primary}
                  onColumnChange={(col) => setBarChartColumns(prev => ({ ...prev, primary: col }))}
                  label="Primary"
                />
                <ChartSelector
                  columns={numericColumns}
                  selectedColumn={barChartColumns.secondary}
                  onColumnChange={(col) => setBarChartColumns(prev => ({ ...prev, secondary: col }))}
                  label="Secondary"
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  {barChartColumns.primary && (
                    <Bar dataKey={barChartColumns.primary} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  )}
                  {barChartColumns.secondary && (
                    <Bar dataKey={barChartColumns.secondary} fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Area Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-card rounded-lg p-6 border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Area Trend</h3>
              <ChartSelector
                columns={numericColumns}
                selectedColumn={areaChartColumn}
                onColumnChange={setAreaChartColumn}
                label="Column"
              />
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  {areaChartColumn && (
                    <Area 
                      type="monotone" 
                      dataKey={areaChartColumn} 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Scatter Plot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-lg p-6 border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Correlation Analysis</h3>
              <div className="space-y-2">
                <ChartSelector
                  columns={numericColumns}
                  selectedColumn={scatterChartColumns.x}
                  onColumnChange={(col) => setScatterChartColumns(prev => ({ ...prev, x: col }))}
                  label="X-Axis"
                />
                <ChartSelector
                  columns={numericColumns}
                  selectedColumn={scatterChartColumns.y}
                  onColumnChange={(col) => setScatterChartColumns(prev => ({ ...prev, y: col }))}
                  label="Y-Axis"
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey={scatterChartColumns.x} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey={scatterChartColumns.y} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  {scatterChartColumns.x && scatterChartColumns.y && (
                    <Scatter dataKey={scatterChartColumns.y} fill="hsl(var(--primary))" />
                  )}
                </ScatterChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Composed Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-card rounded-lg p-6 border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Combined Analysis</h3>
              <div className="space-y-2">
                <ChartSelector
                  columns={numericColumns}
                  selectedColumn={lineChartColumns.primary}
                  onColumnChange={(col) => setLineChartColumns(prev => ({ ...prev, primary: col }))}
                  label="Line Data"
                />
                <ChartSelector
                  columns={numericColumns}
                  selectedColumn={barChartColumns.primary}
                  onColumnChange={(col) => setBarChartColumns(prev => ({ ...prev, primary: col }))}
                  label="Bar Data"
                />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Legend />
                  {barChartColumns.primary && (
                    <Bar dataKey={barChartColumns.primary} fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  )}
                  {lineChartColumns.primary && (
                    <Line 
                      type="monotone" 
                      dataKey={lineChartColumns.primary} 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-card rounded-lg p-6 border border-border"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Data Quality Breakdown</h3>
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
                    <Cell fill="hsl(var(--primary))" />
                    <Cell fill="hsl(var(--destructive))" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
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
            transition={{ delay: 0.8 }}
            className="bg-card rounded-lg p-6 border border-border"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Detected Features</h3>
            <div className="flex flex-wrap gap-2">
              {currentDataset.detectedFeatures.map((feature, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30"
                >
                  {feature}
                </span>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedChartsView />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardView;
