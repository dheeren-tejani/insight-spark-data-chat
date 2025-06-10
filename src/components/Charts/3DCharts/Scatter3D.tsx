
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Scatter3DData {
  x: number;
  y: number;
  z: number;
  color?: string;
  size?: number;
  label?: string;
}

interface Scatter3DConfig {
  axes: {
    x: { label: string; scale: 'linear' | 'log' };
    y: { label: string; scale: 'linear' | 'log' };
    z: { label: string; scale: 'linear' | 'log' };
  };
  camera: {
    distance: number;
    rotation: { x: number; y: number; z: number };
  };
  colors: {
    points: string;
    axes: string;
    grid: string;
  };
  pointSize: number;
  showGrid: boolean;
}

interface Scatter3DProps {
  data: Scatter3DData[];
  config: Scatter3DConfig;
  theme?: any;
  animation?: any;
  interaction?: any;
}

// 3D to 2D projection
const project3DTo2D = (
  x: number, 
  y: number, 
  z: number, 
  camera: { distance: number; rotation: { x: number; y: number; z: number } },
  centerX: number,
  centerY: number
) => {
  // Simple orthographic projection with rotation
  const rad = Math.PI / 180;
  const rotX = camera.rotation.x * rad;
  const rotY = camera.rotation.y * rad;
  const rotZ = camera.rotation.z * rad;
  
  // Apply rotations
  let x1 = x;
  let y1 = y * Math.cos(rotX) - z * Math.sin(rotX);
  let z1 = y * Math.sin(rotX) + z * Math.cos(rotX);
  
  let x2 = x1 * Math.cos(rotY) + z1 * Math.sin(rotY);
  let y2 = y1;
  let z2 = -x1 * Math.sin(rotY) + z1 * Math.cos(rotY);
  
  let x3 = x2 * Math.cos(rotZ) - y2 * Math.sin(rotZ);
  let y3 = x2 * Math.sin(rotZ) + y2 * Math.cos(rotZ);
  let z3 = z2;
  
  // Project to 2D
  const scale = camera.distance / (camera.distance + z3);
  
  return {
    x: centerX + x3 * scale * 100,
    y: centerY - y3 * scale * 100,
    z: z3,
    scale: scale,
  };
};

export const Scatter3D: React.FC<Scatter3DProps> = ({ data, config, theme, animation }) => {
  const [rotation, setRotation] = React.useState(config.camera.rotation);
  const [isDragging, setIsDragging] = React.useState(false);
  const [lastMouse, setLastMouse] = React.useState({ x: 0, y: 0 });

  const dimensions = { width: 800, height: 600 };
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  const projectedData = useMemo(() => {
    return data.map(point => {
      const projected = project3DTo2D(
        point.x, point.y, point.z, 
        { ...config.camera, rotation }, 
        centerX, centerY
      );
      
      return {
        ...point,
        projected,
      };
    }).sort((a, b) => a.projected.z - b.projected.z); // Sort by depth for proper rendering
  }, [data, rotation, config.camera, centerX, centerY]);

  const axisLines = useMemo(() => {
    const axisLength = 100;
    const axes = [
      { start: [-axisLength, 0, 0], end: [axisLength, 0, 0], color: 'red', label: config.axes.x.label },
      { start: [0, -axisLength, 0], end: [0, axisLength, 0], color: 'green', label: config.axes.y.label },
      { start: [0, 0, -axisLength], end: [0, 0, axisLength], color: 'blue', label: config.axes.z.label },
    ];

    return axes.map(axis => {
      const startProj = project3DTo2D(
        axis.start[0], axis.start[1], axis.start[2],
        { ...config.camera, rotation },
        centerX, centerY
      );
      const endProj = project3DTo2D(
        axis.end[0], axis.end[1], axis.end[2],
        { ...config.camera, rotation },
        centerX, centerY
      );
      
      return {
        ...axis,
        startProj,
        endProj,
      };
    });
  }, [rotation, config.camera, config.axes, centerX, centerY]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;
    
    setRotation(prev => ({
      x: prev.x + deltaY * 0.5,
      y: prev.y + deltaX * 0.5,
      z: prev.z,
    }));
    
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const defaultConfig: Scatter3DConfig = {
    axes: {
      x: { label: 'X Axis', scale: 'linear' },
      y: { label: 'Y Axis', scale: 'linear' },
      z: { label: 'Z Axis', scale: 'linear' },
    },
    camera: {
      distance: 500,
      rotation: { x: 15, y: 30, z: 0 },
    },
    colors: {
      points: 'hsl(var(--primary))',
      axes: 'hsl(var(--muted-foreground))',
      grid: 'hsl(var(--border))',
    },
    pointSize: 4,
    showGrid: true,
    ...config,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <div className="relative w-full h-full">
        <svg
          width="100%"
          height="100%"
          className="cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid lines */}
          {defaultConfig.showGrid && (
            <g opacity={0.3}>
              {Array.from({ length: 21 }, (_, i) => {
                const coord = (i - 10) * 10;
                return (
                  <g key={i}>
                    {/* X grid lines */}
                    <line
                      x1={project3DTo2D(coord, -100, 0, { ...config.camera, rotation }, centerX, centerY).x}
                      y1={project3DTo2D(coord, -100, 0, { ...config.camera, rotation }, centerX, centerY).y}
                      x2={project3DTo2D(coord, 100, 0, { ...config.camera, rotation }, centerX, centerY).x}
                      y2={project3DTo2D(coord, 100, 0, { ...config.camera, rotation }, centerX, centerY).y}
                      stroke={defaultConfig.colors.grid}
                      strokeWidth={0.5}
                    />
                    {/* Y grid lines */}
                    <line
                      x1={project3DTo2D(-100, coord, 0, { ...config.camera, rotation }, centerX, centerY).x}
                      y1={project3DTo2D(-100, coord, 0, { ...config.camera, rotation }, centerX, centerY).y}
                      x2={project3DTo2D(100, coord, 0, { ...config.camera, rotation }, centerX, centerY).x}
                      y2={project3DTo2D(100, coord, 0, { ...config.camera, rotation }, centerX, centerY).y}
                      stroke={defaultConfig.colors.grid}
                      strokeWidth={0.5}
                    />
                  </g>
                );
              })}
            </g>
          )}

          {/* Axis lines */}
          {axisLines.map((axis, index) => (
            <g key={index}>
              <line
                x1={axis.startProj.x}
                y1={axis.startProj.y}
                x2={axis.endProj.x}
                y2={axis.endProj.y}
                stroke={axis.color}
                strokeWidth={2}
              />
              <text
                x={axis.endProj.x + 10}
                y={axis.endProj.y}
                fill={defaultConfig.colors.axes}
                fontSize="12"
                fontWeight="bold"
              >
                {axis.label}
              </text>
            </g>
          ))}

          {/* Data points */}
          {projectedData.map((point, index) => (
            <circle
              key={index}
              cx={point.projected.x}
              cy={point.projected.y}
              r={(point.size || defaultConfig.pointSize) * point.projected.scale}
              fill={point.color || defaultConfig.colors.points}
              stroke="white"
              strokeWidth={1}
              opacity={Math.max(0.3, point.projected.scale)}
              className="cursor-pointer hover:opacity-80"
            >
              <title>
                {point.label || `(${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`}
              </title>
            </circle>
          ))}
        </svg>

        {/* Controls */}
        <div className="absolute top-4 right-4 bg-card border border-border rounded-lg p-3 text-sm">
          <p className="text-muted-foreground mb-2">3D Controls:</p>
          <p className="text-xs text-muted-foreground">Click and drag to rotate</p>
          <div className="mt-2 space-y-1">
            <p className="text-xs">X: {rotation.x.toFixed(1)}°</p>
            <p className="text-xs">Y: {rotation.y.toFixed(1)}°</p>
            <p className="text-xs">Points: {data.length}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
