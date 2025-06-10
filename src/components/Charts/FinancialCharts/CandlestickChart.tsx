
import React, { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';
import { motion } from 'framer-motion';

interface CandlestickData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface CandlestickConfig {
  showVolume: boolean;
  indicators: {
    sma?: { period: number; color: string }[];
    ema?: { period: number; color: string }[];
    bollinger?: { period: number; stdDev: number; color: string };
  };
  colors: {
    bullish: string;
    bearish: string;
    wick: string;
    volume: { up: string; down: string };
  };
}

interface CandlestickProps {
  data: CandlestickData[];
  config: CandlestickConfig;
  theme?: any;
  animation?: any;
  interaction?: any;
}

// Technical indicator calculations
const calculateSMA = (data: number[], period: number): number[] => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
};

const calculateEMA = (data: number[], period: number): number[] => {
  const ema = [];
  const multiplier = 2 / (period + 1);
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(data[i]);
    } else {
      ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }
  }
  return ema;
};

const CandlestickBar = ({ x, y, width, height, payload, config }: any) => {
  if (!payload) return null;

  const isBullish = payload.close >= payload.open;
  const color = isBullish ? config.colors.bullish : config.colors.bearish;
  
  const bodyHeight = Math.abs(payload.close - payload.open);
  const bodyY = Math.min(payload.close, payload.open);
  const wickTop = payload.high;
  const wickBottom = payload.low;
  
  const scale = height / (Math.max(...[payload.high, payload.low, payload.open, payload.close]) - Math.min(...[payload.high, payload.low, payload.open, payload.close]));
  
  return (
    <g>
      {/* Wick */}
      <line
        x1={x + width / 2}
        y1={y}
        x2={x + width / 2}
        y2={y + height}
        stroke={config.colors.wick}
        strokeWidth={1}
      />
      
      {/* Body */}
      <rect
        x={x + width * 0.2}
        y={y + (height - bodyHeight * scale) / 2}
        width={width * 0.6}
        height={Math.max(bodyHeight * scale, 1)}
        fill={isBullish ? 'transparent' : color}
        stroke={color}
        strokeWidth={isBullish ? 2 : 1}
      />
    </g>
  );
};

export const CandlestickChart: React.FC<CandlestickProps> = ({ data, config, theme, animation }) => {
  const processedData = useMemo(() => {
    const closePrices = data.map(d => d.close);
    
    let processedData = data.map((item, index) => ({
      ...item,
      dateStr: item.date.toLocaleDateString(),
      index,
    }));

    // Add technical indicators
    if (config.indicators.sma) {
      config.indicators.sma.forEach((sma, i) => {
        const smaValues = calculateSMA(closePrices, sma.period);
        processedData = processedData.map((item, index) => ({
          ...item,
          [`sma${sma.period}`]: smaValues[index],
        }));
      });
    }

    if (config.indicators.ema) {
      config.indicators.ema.forEach((ema, i) => {
        const emaValues = calculateEMA(closePrices, ema.period);
        processedData = processedData.map((item, index) => ({
          ...item,
          [`ema${ema.period}`]: emaValues[index],
        }));
      });
    }

    return processedData;
  }, [data, config.indicators]);

  const defaultConfig: CandlestickConfig = {
    showVolume: true,
    indicators: {},
    colors: {
      bullish: 'hsl(var(--primary))',
      bearish: 'hsl(var(--destructive))',
      wick: 'hsl(var(--muted-foreground))',
      volume: {
        up: 'hsl(var(--primary))',
        down: 'hsl(var(--destructive))',
      },
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
            dataKey="dateStr" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            domain={['dataMin', 'dataMax']}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="text-foreground font-medium">{label}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">Open: {data.open.toFixed(2)}</p>
                      <p className="text-muted-foreground">High: {data.high.toFixed(2)}</p>
                      <p className="text-muted-foreground">Low: {data.low.toFixed(2)}</p>
                      <p className="text-muted-foreground">Close: {data.close.toFixed(2)}</p>
                      {data.volume && <p className="text-muted-foreground">Volume: {data.volume.toLocaleString()}</p>}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend />
          
          {/* Moving Averages */}
          {config.indicators.sma?.map((sma, index) => (
            <Line
              key={`sma-${sma.period}`}
              type="monotone"
              dataKey={`sma${sma.period}`}
              stroke={sma.color}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name={`SMA ${sma.period}`}
            />
          ))}
          
          {config.indicators.ema?.map((ema, index) => (
            <Line
              key={`ema-${ema.period}`}
              type="monotone"
              dataKey={`ema${ema.period}`}
              stroke={ema.color}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
              name={`EMA ${ema.period}`}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
