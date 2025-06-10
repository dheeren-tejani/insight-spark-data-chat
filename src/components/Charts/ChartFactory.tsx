
import React from 'react';
import { BoxPlot } from './StatisticalCharts/BoxPlot';
import { ViolinPlot } from './StatisticalCharts/ViolinPlot';
import { WaterfallChart } from './BusinessCharts/WaterfallChart';
import { CandlestickChart } from './FinancialCharts/CandlestickChart';
import { NetworkChart } from './NetworkCharts/NetworkChart';
import { Scatter3D } from './3DCharts/Scatter3D';
import { ChartRecommendationEngine } from './Intelligence/ChartRecommendationEngine';

export interface ChartConfig {
  type: string;
  data: any[];
  config: any;
  theme?: ChartTheme;
  animation?: AnimationConfig;
  interaction?: InteractionConfig;
}

export interface ChartTheme {
  name: string;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    accent: string[];
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  typography: {
    fontFamily: string;
    fontSize: {
      small: number;
      medium: number;
      large: number;
    };
  };
}

export interface AnimationConfig {
  duration: number;
  easing: 'linear' | 'easeInOut' | 'easeIn' | 'easeOut' | 'bounce';
  delay?: number;
  stagger?: number;
}

export interface InteractionConfig {
  hover: {
    enabled: boolean;
    highlight: 'item' | 'series' | 'category';
  };
  selection: {
    enabled: boolean;
    mode: 'single' | 'multiple' | 'brush';
  };
  zoom: {
    enabled: boolean;
    type: 'x' | 'y' | 'xy';
  };
}

const chartComponents = {
  'box-plot': BoxPlot,
  'violin-plot': ViolinPlot,
  'waterfall': WaterfallChart,
  'candlestick': CandlestickChart,
  'network': NetworkChart,
  'scatter-3d': Scatter3D,
};

export const ChartFactory: React.FC<ChartConfig> = ({ type, data, config, theme, animation, interaction }) => {
  const ChartComponent = chartComponents[type as keyof typeof chartComponents];
  
  if (!ChartComponent) {
    return (
      <div className="flex items-center justify-center h-64 bg-card border border-border rounded-lg">
        <p className="text-muted-foreground">Chart type "{type}" not supported</p>
      </div>
    );
  }

  return (
    <ChartComponent 
      data={data} 
      config={config} 
      theme={theme}
      animation={animation}
      interaction={interaction}
    />
  );
};

export default ChartFactory;
