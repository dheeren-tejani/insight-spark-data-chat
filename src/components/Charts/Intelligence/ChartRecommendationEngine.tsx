import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, ScatterChart, PieChart, Activity, Network } from 'lucide-react';

interface ChartRecommendation {
  type: string;
  title: string;
  confidence: number;
  reasoning: string;
  icon: React.ComponentType<any>;
  config: any;
  dataCharacteristics: string[];
}

interface DataCharacteristics {
  rowCount: number;
  columnCount: number;
  numericColumns: string[];
  categoricalColumns: string[];
  temporalColumns: string[];
  hasNulls: boolean;
  correlations: Array<{ columns: string[]; correlation: number }>;
  trends: string[];
}

interface ChartRecommendationEngineProps {
  data: any[];
  columns: string[];
  onSelectRecommendation: (recommendation: ChartRecommendation) => void;
}

const analyzeDataCharacteristics = (data: any[], columns: string[]): DataCharacteristics => {
  const sampleSize = Math.min(100, data.length);
  const sample = data.slice(0, sampleSize);
  
  const numericColumns = columns.filter(col => {
    return sample.every(row => !isNaN(Number(row[col])) && row[col] !== '');
  });
  
  const categoricalColumns = columns.filter(col => {
    const uniqueValues = new Set(sample.map(row => row[col]));
    const uniqueRatio = uniqueValues.size / sample.length;
    return uniqueRatio < 0.5 && !numericColumns.includes(col);
  });
  
  const temporalColumns = columns.filter(col => {
    return sample.some(row => {
      const val = row[col];
      return !isNaN(Date.parse(val)) || /\d{4}-\d{2}-\d{2}/.test(val);
    });
  });
  
  const hasNulls = sample.some(row => 
    columns.some(col => row[col] === null || row[col] === undefined || row[col] === '')
  );
  
  // Simple correlation calculation for numeric columns
  const correlations: Array<{ columns: string[]; correlation: number }> = [];
  for (let i = 0; i < numericColumns.length; i++) {
    for (let j = i + 1; j < numericColumns.length; j++) {
      const col1 = numericColumns[i];
      const col2 = numericColumns[j];
      
      const values1 = sample.map(row => Number(row[col1])).filter(v => !isNaN(v));
      const values2 = sample.map(row => Number(row[col2])).filter(v => !isNaN(v));
      
      if (values1.length > 5 && values2.length > 5) {
        const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
        const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
        
        let numerator = 0;
        let denominator1 = 0;
        let denominator2 = 0;
        
        for (let k = 0; k < Math.min(values1.length, values2.length); k++) {
          const diff1 = values1[k] - mean1;
          const diff2 = values2[k] - mean2;
          numerator += diff1 * diff2;
          denominator1 += diff1 * diff1;
          denominator2 += diff2 * diff2;
        }
        
        const correlation = numerator / Math.sqrt(denominator1 * denominator2);
        if (!isNaN(correlation)) {
          correlations.push({ columns: [col1, col2], correlation });
        }
      }
    }
  }
  
  const trends = [];
  if (temporalColumns.length > 0 && numericColumns.length > 0) {
    trends.push('temporal');
  }
  if (correlations.some(c => Math.abs(c.correlation) > 0.7)) {
    trends.push('strong_correlation');
  }
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    trends.push('categorical_numeric');
  }
  
  return {
    rowCount: data.length,
    columnCount: columns.length,
    numericColumns,
    categoricalColumns,
    temporalColumns,
    hasNulls,
    correlations,
    trends,
  };
};

const generateRecommendations = (characteristics: DataCharacteristics): ChartRecommendation[] => {
  const recommendations: ChartRecommendation[] = [];
  
  // Line Chart for temporal data
  if (characteristics.temporalColumns.length > 0 && characteristics.numericColumns.length > 0) {
    recommendations.push({
      type: 'line',
      title: 'Line Chart',
      confidence: 0.9,
      reasoning: 'Ideal for showing trends over time with your temporal data',
      icon: TrendingUp,
      config: {
        xAxis: characteristics.temporalColumns[0],
        yAxis: characteristics.numericColumns[0],
      },
      dataCharacteristics: ['temporal', 'trending'],
    });
  }
  
  // Bar Chart for categorical vs numeric
  if (characteristics.categoricalColumns.length > 0 && characteristics.numericColumns.length > 0) {
    recommendations.push({
      type: 'bar',
      title: 'Bar Chart',
      confidence: 0.85,
      reasoning: 'Perfect for comparing numeric values across categories',
      icon: BarChart3,
      config: {
        xAxis: characteristics.categoricalColumns[0],
        yAxis: characteristics.numericColumns[0],
      },
      dataCharacteristics: ['categorical', 'comparative'],
    });
  }
  
  // Scatter Plot for correlations
  if (characteristics.numericColumns.length >= 2) {
    const strongCorrelation = characteristics.correlations.find(c => Math.abs(c.correlation) > 0.7);
    recommendations.push({
      type: 'scatter',
      title: 'Scatter Plot',
      confidence: strongCorrelation ? 0.95 : 0.7,
      reasoning: strongCorrelation 
        ? `Strong correlation detected (${strongCorrelation.correlation.toFixed(2)}) between variables`
        : 'Explore relationships between numeric variables',
      icon: ScatterChart,
      config: {
        xAxis: characteristics.numericColumns[0],
        yAxis: characteristics.numericColumns[1],
      },
      dataCharacteristics: ['correlation', 'numeric'],
    });
  }
  
  // Box Plot for statistical analysis
  if (characteristics.numericColumns.length > 0 && characteristics.categoricalColumns.length > 0) {
    recommendations.push({
      type: 'box-plot',
      title: 'Box Plot',
      confidence: 0.8,
      reasoning: 'Analyze distribution and identify outliers across categories',
      icon: Activity,
      config: {
        category: characteristics.categoricalColumns[0],
        value: characteristics.numericColumns[0],
      },
      dataCharacteristics: ['statistical', 'distribution'],
    });
  }
  
  // Pie Chart for composition
  if (characteristics.categoricalColumns.length > 0 && characteristics.numericColumns.length > 0) {
    const uniqueCategories = characteristics.categoricalColumns.length;
    if (uniqueCategories <= 8) {
      recommendations.push({
        type: 'pie',
        title: 'Pie Chart',
        confidence: 0.75,
        reasoning: 'Show composition and proportions of categories',
        icon: PieChart,
        config: {
          category: characteristics.categoricalColumns[0],
          value: characteristics.numericColumns[0],
        },
        dataCharacteristics: ['composition', 'proportional'],
      });
    }
  }
  
  // Network Chart for relational data
  if (characteristics.columnCount >= 3 && characteristics.rowCount < 1000) {
    recommendations.push({
      type: 'network',
      title: 'Network Chart',
      confidence: 0.6,
      reasoning: 'Explore relationships and connections in your data',
      icon: Network,
      config: {
        source: characteristics.categoricalColumns[0] || characteristics.numericColumns[0],
        target: characteristics.categoricalColumns[1] || characteristics.numericColumns[1],
      },
      dataCharacteristics: ['relational', 'network'],
    });
  }
  
  return recommendations.sort((a, b) => b.confidence - a.confidence);
};

export const ChartRecommendationEngine: React.FC<ChartRecommendationEngineProps> = ({
  data,
  columns,
  onSelectRecommendation,
}) => {
  const characteristics = useMemo(() => {
    return analyzeDataCharacteristics(data, columns);
  }, [data, columns]);
  
  const recommendations = useMemo(() => {
    return generateRecommendations(characteristics);
  }, [characteristics]);
  
  if (recommendations.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Chart Recommendations</h3>
        <p className="text-muted-foreground">No chart recommendations available for this dataset.</p>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Chart Recommendations</h3>
      
      {/* Data Summary */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-foreground mb-2">Data Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Rows:</span>
            <span className="ml-2 text-foreground font-medium">{characteristics.rowCount.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Columns:</span>
            <span className="ml-2 text-foreground font-medium">{characteristics.columnCount}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Numeric:</span>
            <span className="ml-2 text-foreground font-medium">{characteristics.numericColumns.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Categorical:</span>
            <span className="ml-2 text-foreground font-medium">{characteristics.categoricalColumns.length}</span>
          </div>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="space-y-3">
        {recommendations.slice(0, 5).map((recommendation, index) => {
          const Icon = recommendation.icon;
          return (
            <motion.div
              key={recommendation.type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/30 cursor-pointer transition-colors"
              onClick={() => onSelectRecommendation(recommendation)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h5 className="font-medium text-foreground">{recommendation.title}</h5>
                  <p className="text-sm text-muted-foreground">{recommendation.reasoning}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {recommendation.dataCharacteristics.map((char, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-secondary/20 text-secondary rounded-full"
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">
                  {Math.round(recommendation.confidence * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">confidence</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
