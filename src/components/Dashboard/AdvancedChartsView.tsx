
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import ChartFactory, { ChartConfig } from '../Charts/ChartFactory';
import { ChartRecommendationEngine } from '../Charts/Intelligence/ChartRecommendationEngine';
import ChartSelector from './ChartSelector';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const AdvancedChartsView: React.FC = () => {
  const { currentDataset } = useAppStore();
  const [selectedChartType, setSelectedChartType] = useState<string>('box-plot');
  const [chartConfig, setChartConfig] = useState<any>({});
  const [selectedColumns, setSelectedColumns] = useState<Record<string, string>>({});

  const chartTypes = [
    { value: 'box-plot', label: 'Box Plot', category: 'Statistical' },
    { value: 'violin-plot', label: 'Violin Plot', category: 'Statistical' },
    { value: 'waterfall', label: 'Waterfall Chart', category: 'Business' },
    { value: 'candlestick', label: 'Candlestick Chart', category: 'Financial' },
    { value: 'network', label: 'Network Chart', category: 'Network' },
    { value: 'scatter-3d', label: '3D Scatter Plot', category: '3D' },
  ];

  const numericColumns = useMemo(() => {
    if (!currentDataset) return [];
    
    return currentDataset.columns.filter(col => {
      const sample = currentDataset.data[0]?.[col];
      return !isNaN(Number(sample)) && sample !== '';
    });
  }, [currentDataset]);

  const categoricalColumns = useMemo(() => {
    if (!currentDataset) return [];
    
    return currentDataset.columns.filter(col => {
      const uniqueValues = new Set(currentDataset.data.slice(0, 100).map(row => row[col]));
      const uniqueRatio = uniqueValues.size / Math.min(100, currentDataset.data.length);
      return uniqueRatio < 0.5 && !numericColumns.includes(col);
    });
  }, [currentDataset, numericColumns]);

  const processedData = useMemo(() => {
    if (!currentDataset || !currentDataset.data) return [];

    switch (selectedChartType) {
      case 'box-plot':
        if (!selectedColumns.category || !selectedColumns.value) return [];
        
        const categories = [...new Set(currentDataset.data.map(row => row[selectedColumns.category]))];
        return categories.map(category => {
          const categoryData = currentDataset.data
            .filter(row => row[selectedColumns.category] === category)
            .map(row => Number(row[selectedColumns.value]))
            .filter(val => !isNaN(val))
            .sort((a, b) => a - b);
          
          if (categoryData.length === 0) return null;
          
          const q1Index = Math.floor(categoryData.length * 0.25);
          const medianIndex = Math.floor(categoryData.length * 0.5);
          const q3Index = Math.floor(categoryData.length * 0.75);
          
          return {
            category,
            min: categoryData[0],
            q1: categoryData[q1Index],
            median: categoryData[medianIndex],
            q3: categoryData[q3Index],
            max: categoryData[categoryData.length - 1],
            mean: categoryData.reduce((a, b) => a + b, 0) / categoryData.length,
            outliers: [], // Simplified - could calculate IQR outliers
          };
        }).filter(Boolean);

      case 'violin-plot':
        if (!selectedColumns.category || !selectedColumns.value) return [];
        
        const violinCategories = [...new Set(currentDataset.data.map(row => row[selectedColumns.category]))];
        return violinCategories.map(category => {
          const values = currentDataset.data
            .filter(row => row[selectedColumns.category] === category)
            .map(row => Number(row[selectedColumns.value]))
            .filter(val => !isNaN(val));
          
          return {
            category,
            values,
          };
        });

      case 'waterfall':
        if (!selectedColumns.category || !selectedColumns.value) return [];
        
        return currentDataset.data.slice(0, 10).map((row, index) => ({
          category: row[selectedColumns.category],
          value: Number(row[selectedColumns.value]) || 0,
          type: index === currentDataset.data.length - 1 ? 'total' : 
                (Number(row[selectedColumns.value]) >= 0 ? 'positive' : 'negative'),
        }));

      case 'candlestick':
        if (!selectedColumns.open || !selectedColumns.high || !selectedColumns.low || !selectedColumns.close) return [];
        
        return currentDataset.data.slice(0, 50).map((row, index) => ({
          date: new Date(2024, 0, index + 1), // Mock dates
          open: Number(row[selectedColumns.open]) || 0,
          high: Number(row[selectedColumns.high]) || 0,
          low: Number(row[selectedColumns.low]) || 0,
          close: Number(row[selectedColumns.close]) || 0,
          volume: row[selectedColumns.volume] ? Number(row[selectedColumns.volume]) : undefined,
        }));

      case 'network':
        if (!selectedColumns.source || !selectedColumns.target) return [];
        
        const nodes = new Set();
        const links: any[] = [];
        
        currentDataset.data.slice(0, 50).forEach(row => {
          const source = String(row[selectedColumns.source]);
          const target = String(row[selectedColumns.target]);
          nodes.add(source);
          nodes.add(target);
          links.push({
            source,
            target,
            weight: selectedColumns.weight ? Number(row[selectedColumns.weight]) || 1 : 1,
          });
        });
        
        return {
          nodes: Array.from(nodes).map(id => ({
            id: String(id),
            label: String(id),
            size: 5 + Math.random() * 10,
          })),
          links,
        };

      case 'scatter-3d':
        if (!selectedColumns.x || !selectedColumns.y || !selectedColumns.z) return [];
        
        return currentDataset.data.slice(0, 200).map((row, index) => ({
          x: Number(row[selectedColumns.x]) || 0,
          y: Number(row[selectedColumns.y]) || 0,
          z: Number(row[selectedColumns.z]) || 0,
          label: `Point ${index + 1}`,
        }));

      default:
        return [];
    }
  }, [currentDataset, selectedChartType, selectedColumns]);

  const handleRecommendationSelect = (recommendation: any) => {
    setSelectedChartType(recommendation.type);
    setChartConfig(recommendation.config);
    setSelectedColumns(recommendation.config);
  };

  if (!currentDataset) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">No dataset selected</p>
      </div>
    );
  }

  const getColumnSelectors = () => {
    switch (selectedChartType) {
      case 'box-plot':
      case 'violin-plot':
        return (
          <div className="space-y-4">
            <ChartSelector
              columns={categoricalColumns}
              selectedColumn={selectedColumns.category || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, category: col }))}
              label="Category Column"
            />
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.value || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, value: col }))}
              label="Value Column"
            />
          </div>
        );

      case 'waterfall':
        return (
          <div className="space-y-4">
            <ChartSelector
              columns={currentDataset.columns}
              selectedColumn={selectedColumns.category || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, category: col }))}
              label="Category Column"
            />
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.value || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, value: col }))}
              label="Value Column"
            />
          </div>
        );

      case 'candlestick':
        return (
          <div className="space-y-4">
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.open || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, open: col }))}
              label="Open Price"
            />
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.high || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, high: col }))}
              label="High Price"
            />
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.low || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, low: col }))}
              label="Low Price"
            />
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.close || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, close: col }))}
              label="Close Price"
            />
          </div>
        );

      case 'network':
        return (
          <div className="space-y-4">
            <ChartSelector
              columns={currentDataset.columns}
              selectedColumn={selectedColumns.source || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, source: col }))}
              label="Source Node"
            />
            <ChartSelector
              columns={currentDataset.columns}
              selectedColumn={selectedColumns.target || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, target: col }))}
              label="Target Node"
            />
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.weight || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, weight: col }))}
              label="Weight (Optional)"
            />
          </div>
        );

      case 'scatter-3d':
        return (
          <div className="space-y-4">
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.x || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, x: col }))}
              label="X Axis"
            />
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.y || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, y: col }))}
              label="Y Axis"
            />
            <ChartSelector
              columns={numericColumns}
              selectedColumn={selectedColumns.z || ''}
              onColumnChange={(col) => setSelectedColumns(prev => ({ ...prev, z: col }))}
              label="Z Axis"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Advanced Visualizations</h1>
        <p className="text-muted-foreground">
          Professional-grade charts with statistical analysis and AI recommendations
        </p>
      </div>

      {/* Chart Recommendations */}
      <ChartRecommendationEngine
        data={currentDataset.data}
        columns={currentDataset.columns}
        onSelectRecommendation={handleRecommendationSelect}
      />

      {/* Chart Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chart Configuration</CardTitle>
            <CardDescription>Select chart type and configure columns</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chart Type Selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Chart Type</label>
              <Select value={selectedChartType} onValueChange={setSelectedChartType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select chart type" />
                </SelectTrigger>
                <SelectContent>
                  {chartTypes.map((chart) => (
                    <SelectItem key={chart.value} value={chart.value}>
                      <div className="flex items-center space-x-2">
                        <span>{chart.label}</span>
                        <span className="text-xs text-muted-foreground">({chart.category})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Column Selectors */}
            {getColumnSelectors()}
          </CardContent>
        </Card>

        {/* Chart Display */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>
              {chartTypes.find(t => t.value === selectedChartType)?.label || 'Chart'}
            </CardTitle>
            <CardDescription>
              Interactive visualization with {processedData.length || 0} data points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              {processedData.length > 0 ? (
                <ChartFactory
                  type={selectedChartType}
                  data={processedData}
                  config={{}}
                  animation={{ duration: 800, easing: 'easeInOutCubic' }}
                  interaction={{
                    hover: { enabled: true, highlight: 'item' },
                    selection: { enabled: true, mode: 'single' },
                    zoom: { enabled: true, type: 'xy' },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    Please select the required columns to display the chart
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedChartsView;
