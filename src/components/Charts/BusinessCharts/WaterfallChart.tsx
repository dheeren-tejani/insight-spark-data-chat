
import React, { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface WaterfallData {
  category: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
  cumulative?: number;
  start?: number;
  end?: number;
}

interface WaterfallConfig {
  showConnectors: boolean;
  showTotal: boolean;
  colors: {
    positive: string;
    negative: string;
    total: string;
    connector: string;
  };
  valueLabels: {
    show: boolean;
    position: 'inside' | 'outside';
    format: string;
  };
}

interface WaterfallProps {
  data: WaterfallData[];
  config: WaterfallConfig;
  theme?: any;
  animation?: any;
  interaction?: any;
}

export const WaterfallChart: React.FC<WaterfallProps> = ({ data, config, theme, animation }) => {
  const processedData = useMemo(() => {
    let cumulative = 0;
    return data.map((item, index) => {
      const start = cumulative;
      
      if (item.type === 'total') {
        cumulative = item.value;
      } else {
        cumulative += item.value;
      }
      
      const end = cumulative;
      const barValue = item.type === 'total' ? item.value : Math.abs(item.value);
      const barStart = item.type === 'total' ? 0 : (item.value >= 0 ? start : end);
      
      return {
        ...item,
        cumulative,
        start,
        end,
        barValue,
        barStart,
        isFloating: item.type !== 'total',
      };
    });
  }, [data]);

  const defaultConfig: WaterfallConfig = {
    showConnectors: true,
    showTotal: true,
    colors: {
      positive: 'hsl(var(--primary))',
      negative: 'hsl(var(--destructive))',
      total: 'hsl(var(--secondary))',
      connector: 'hsl(var(--muted-foreground))',
    },
    valueLabels: {
      show: true,
      position: 'outside',
      format: ',.0f',
    },
    ...config,
  };

  const CustomBar = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload) return null;

    const color = payload.type === 'total' 
      ? defaultConfig.colors.total
      : payload.value >= 0 
        ? defaultConfig.colors.positive 
        : defaultConfig.colors.negative;

    return (
      <g>
        <rect
          x={x}
          y={payload.isFloating ? y : y}
          width={width}
          height={height}
          fill={color}
          stroke={color}
          strokeWidth={1}
          opacity={0.8}
        />
        
        {/* Value label */}
        {defaultConfig.valueLabels.show && (
          <text
            x={x + width / 2}
            y={defaultConfig.valueLabels.position === 'inside' ? y + height / 2 : y - 5}
            textAnchor="middle"
            fill="hsl(var(--foreground))"
            fontSize="11"
            fontWeight="500"
          >
            {payload.value.toLocaleString()}
          </text>
        )}
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                const data = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-foreground font-medium">{label}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">Value: {data.value.toLocaleString()}</p>
                      <p className="text-muted-foreground">Cumulative: {data.cumulative.toLocaleString()}</p>
                      <p className="text-muted-foreground">Type: {data.type}</p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          <Bar 
            dataKey="barValue" 
            shape={<CustomBar />}
          >
            {processedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.type === 'total' 
                  ? defaultConfig.colors.total
                  : entry.value >= 0 
                    ? defaultConfig.colors.positive 
                    : defaultConfig.colors.negative
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
