
import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface BoxPlotData {
  category: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  mean?: number;
}

interface BoxPlotConfig {
  orientation: 'horizontal' | 'vertical';
  showOutliers: boolean;
  showMean: boolean;
  colors: {
    box: string;
    median: string;
    whisker: string;
    outlier: string;
    mean: string;
  };
  animation: {
    duration: number;
    easing: string;
  };
}

interface BoxPlotProps {
  data: BoxPlotData[];
  config: BoxPlotConfig;
  theme?: any;
  animation?: any;
  interaction?: any;
}

const BoxPlotShape: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  payload: BoxPlotData;
  config: BoxPlotConfig;
}> = ({ x, y, width, height, payload, config }) => {
  const boxHeight = height * 0.6;
  const boxY = y + (height - boxHeight) / 2;
  
  // Calculate positions based on quartiles
  const q1Height = (payload.q1 - payload.min) / (payload.max - payload.min) * boxHeight;
  const medianHeight = (payload.median - payload.min) / (payload.max - payload.min) * boxHeight;
  const q3Height = (payload.q3 - payload.min) / (payload.max - payload.min) * boxHeight;
  
  return (
    <g>
      {/* Whiskers */}
      <line
        x1={x + width / 2}
        y1={boxY}
        x2={x + width / 2}
        y2={boxY + boxHeight}
        stroke={config.colors.whisker}
        strokeWidth={2}
      />
      
      {/* Box */}
      <rect
        x={x + width * 0.25}
        y={boxY + q1Height}
        width={width * 0.5}
        height={q3Height - q1Height}
        fill={config.colors.box}
        stroke={config.colors.box}
        strokeWidth={1}
        fillOpacity={0.7}
      />
      
      {/* Median line */}
      <line
        x1={x + width * 0.25}
        y1={boxY + medianHeight}
        x2={x + width * 0.75}
        y2={boxY + medianHeight}
        stroke={config.colors.median}
        strokeWidth={3}
      />
      
      {/* Mean point */}
      {config.showMean && payload.mean && (
        <circle
          cx={x + width / 2}
          cy={boxY + ((payload.mean - payload.min) / (payload.max - payload.min)) * boxHeight}
          r={4}
          fill={config.colors.mean}
          stroke="white"
          strokeWidth={1}
        />
      )}
      
      {/* Outliers */}
      {config.showOutliers && payload.outliers?.map((outlier, index) => (
        <circle
          key={index}
          cx={x + width / 2 + (Math.random() - 0.5) * width * 0.3}
          cy={boxY + ((outlier - payload.min) / (payload.max - payload.min)) * boxHeight}
          r={2}
          fill={config.colors.outlier}
          opacity={0.7}
        />
      ))}
    </g>
  );
};

export const BoxPlot: React.FC<BoxPlotProps> = ({ data, config, theme, animation }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      value: item.median, // For positioning
    }));
  }, [data]);

  const defaultConfig: BoxPlotConfig = {
    orientation: 'vertical',
    showOutliers: true,
    showMean: true,
    colors: {
      box: 'hsl(var(--primary))',
      median: 'hsl(var(--secondary))',
      whisker: 'hsl(var(--muted-foreground))',
      outlier: 'hsl(var(--destructive))',
      mean: 'hsl(var(--accent))',
    },
    animation: {
      duration: 800,
      easing: 'easeInOutCubic',
    },
    ...config,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="category" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload as BoxPlotData;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-foreground font-medium">{label}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">Min: {data.min}</p>
                      <p className="text-muted-foreground">Q1: {data.q1}</p>
                      <p className="text-primary font-medium">Median: {data.median}</p>
                      <p className="text-muted-foreground">Q3: {data.q3}</p>
                      <p className="text-muted-foreground">Max: {data.max}</p>
                      {data.mean && <p className="text-accent">Mean: {data.mean.toFixed(2)}</p>}
                      {data.outliers && <p className="text-destructive">Outliers: {data.outliers.length}</p>}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
