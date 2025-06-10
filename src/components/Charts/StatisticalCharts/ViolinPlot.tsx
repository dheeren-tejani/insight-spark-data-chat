
import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, Line } from 'recharts';
import { motion } from 'framer-motion';

interface ViolinPlotData {
  category: string;
  values: number[];
  density?: Array<{ value: number; density: number }>;
  statistics?: {
    median: number;
    q1: number;
    q3: number;
    mean: number;
  };
}

interface ViolinPlotConfig {
  bandwidth: 'auto' | number;
  showBoxPlot: boolean;
  showMedian: boolean;
  showQuartiles: boolean;
  colors: {
    violin: string;
    median: string;
    quartiles: string;
    box: string;
  };
  opacity: number;
}

interface ViolinPlotProps {
  data: ViolinPlotData[];
  config: ViolinPlotConfig;
  theme?: any;
  animation?: any;
  interaction?: any;
}

// Kernel Density Estimation function
const kernelDensityEstimation = (values: number[], bandwidth: number): Array<{ value: number; density: number }> => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const step = range / 100;
  const result = [];

  for (let x = min; x <= max; x += step) {
    let density = 0;
    for (const value of values) {
      const u = (x - value) / bandwidth;
      density += Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
    }
    density = density / (values.length * bandwidth);
    result.push({ value: x, density });
  }

  return result;
};

const calculateStatistics = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  return {
    median: n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)],
    q1: sorted[Math.floor(n * 0.25)],
    q3: sorted[Math.floor(n * 0.75)],
    mean: values.reduce((sum, val) => sum + val, 0) / n,
  };
};

export const ViolinPlot: React.FC<ViolinPlotProps> = ({ data, config, theme, animation }) => {
  const processedData = useMemo(() => {
    return data.map((item, index) => {
      const bandwidth = config.bandwidth === 'auto' 
        ? Math.pow(item.values.length, -1/5) * (Math.max(...item.values) - Math.min(...item.values)) * 0.2
        : config.bandwidth;
      
      const density = kernelDensityEstimation(item.values, bandwidth);
      const statistics = calculateStatistics(item.values);
      
      return {
        ...item,
        density,
        statistics,
        x: index,
        maxDensity: Math.max(...density.map(d => d.density)),
      };
    });
  }, [data, config.bandwidth]);

  const defaultConfig: ViolinPlotConfig = {
    bandwidth: 'auto',
    showBoxPlot: true,
    showMedian: true,
    showQuartiles: true,
    colors: {
      violin: 'hsl(var(--primary))',
      median: 'hsl(var(--secondary))',
      quartiles: 'hsl(var(--accent))',
      box: 'hsl(var(--muted))',
    },
    opacity: 0.7,
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
        <svg width="100%" height="100%" viewBox="0 0 800 400">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="1" strokeDasharray="2,2"/>
            </pattern>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1"/>
          
          {processedData.map((item, index) => {
            const x = 100 + index * 150;
            const width = 100;
            const height = 300;
            const y = 50;
            
            return (
              <g key={item.category}>
                {/* Violin shape */}
                <path
                  d={item.density.map((d, i) => {
                    const normalizedDensity = d.density / item.maxDensity;
                    const yPos = y + (d.value - Math.min(...item.values)) / (Math.max(...item.values) - Math.min(...item.values)) * height;
                    const leftX = x + width/2 - normalizedDensity * width/2;
                    const rightX = x + width/2 + normalizedDensity * width/2;
                    
                    if (i === 0) return `M ${leftX} ${yPos}`;
                    return `L ${leftX} ${yPos}`;
                  }).join(' ') + 
                  item.density.slice().reverse().map((d, i) => {
                    const normalizedDensity = d.density / item.maxDensity;
                    const yPos = y + (d.value - Math.min(...item.values)) / (Math.max(...item.values) - Math.min(...item.values)) * height;
                    const rightX = x + width/2 + normalizedDensity * width/2;
                    return `L ${rightX} ${yPos}`;
                  }).join(' ') + ' Z'}
                  fill={defaultConfig.colors.violin}
                  fillOpacity={defaultConfig.opacity}
                  stroke={defaultConfig.colors.violin}
                  strokeWidth={1}
                />
                
                {/* Box plot overlay */}
                {defaultConfig.showBoxPlot && item.statistics && (
                  <g>
                    {/* Box */}
                    <rect
                      x={x + width/2 - 10}
                      y={y + (item.statistics.q1 - Math.min(...item.values)) / (Math.max(...item.values) - Math.min(...item.values)) * height}
                      width={20}
                      height={(item.statistics.q3 - item.statistics.q1) / (Math.max(...item.values) - Math.min(...item.values)) * height}
                      fill={defaultConfig.colors.box}
                      stroke={defaultConfig.colors.box}
                      strokeWidth={1}
                      fillOpacity={0.3}
                    />
                    
                    {/* Median line */}
                    {defaultConfig.showMedian && (
                      <line
                        x1={x + width/2 - 15}
                        y1={y + (item.statistics.median - Math.min(...item.values)) / (Math.max(...item.values) - Math.min(...item.values)) * height}
                        x2={x + width/2 + 15}
                        y2={y + (item.statistics.median - Math.min(...item.values)) / (Math.max(...item.values) - Math.min(...item.values)) * height}
                        stroke={defaultConfig.colors.median}
                        strokeWidth={2}
                      />
                    )}
                  </g>
                )}
                
                {/* Category label */}
                <text
                  x={x + width/2}
                  y={y + height + 20}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="12"
                >
                  {item.category}
                </text>
              </g>
            );
          })}
        </svg>
      </ResponsiveContainer>
    </motion.div>
  );
};
