
import React, { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface NetworkNode {
  id: string;
  label: string;
  size?: number;
  color?: string;
  group?: string;
  x?: number;
  y?: number;
}

interface NetworkLink {
  source: string;
  target: string;
  weight?: number;
  color?: string;
}

interface NetworkConfig {
  forces: {
    charge: number;
    link: number;
    center: number;
    collision: number;
  };
  nodeSize: {
    min: number;
    max: number;
  };
  colors: {
    nodes: string[];
    links: string;
  };
  showLabels: boolean;
  clustering: boolean;
}

interface NetworkProps {
  data: {
    nodes: NetworkNode[];
    links: NetworkLink[];
  };
  config?: Partial<NetworkConfig>;
  theme?: any;
  animation?: any;
  interaction?: any;
}

// Simple force simulation
const forceSimulation = (nodes: NetworkNode[], links: NetworkLink[], config: NetworkConfig, width: number, height: number) => {
  const processedNodes = nodes.map(node => ({
    ...node,
    x: node.x || Math.random() * width,
    y: node.y || Math.random() * height,
    vx: 0,
    vy: 0,
  }));

  const processedLinks = links.map(link => ({
    ...link,
    sourceNode: processedNodes.find(n => n.id === link.source),
    targetNode: processedNodes.find(n => n.id === link.target),
  }));

  // Run simulation steps
  for (let i = 0; i < 100; i++) {
    // Charge force (repulsion)
    for (let i = 0; i < processedNodes.length; i++) {
      for (let j = i + 1; j < processedNodes.length; j++) {
        const dx = processedNodes[j].x! - processedNodes[i].x!;
        const dy = processedNodes[j].y! - processedNodes[i].y!;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = config.forces.charge / (distance * distance);
        
        processedNodes[i].vx! -= (dx / distance) * force;
        processedNodes[i].vy! -= (dy / distance) * force;
        processedNodes[j].vx! += (dx / distance) * force;
        processedNodes[j].vy! += (dy / distance) * force;
      }
    }

    // Link force (attraction)
    processedLinks.forEach(link => {
      if (link.sourceNode && link.targetNode) {
        const dx = link.targetNode.x! - link.sourceNode.x!;
        const dy = link.targetNode.y! - link.sourceNode.y!;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (distance - 50) * config.forces.link;
        
        link.sourceNode.vx! += (dx / distance) * force * 0.5;
        link.sourceNode.vy! += (dy / distance) * force * 0.5;
        link.targetNode.vx! -= (dx / distance) * force * 0.5;
        link.targetNode.vy! -= (dy / distance) * force * 0.5;
      }
    });

    // Center force
    const centerX = width / 2;
    const centerY = height / 2;
    processedNodes.forEach(node => {
      node.vx! += (centerX - node.x!) * config.forces.center;
      node.vy! += (centerY - node.y!) * config.forces.center;
    });

    // Update positions
    processedNodes.forEach(node => {
      node.x! += node.vx! * 0.1;
      node.y! += node.vy! * 0.1;
      node.vx! *= 0.9; // damping
      node.vy! *= 0.9;
      
      // Bounds checking
      node.x! = Math.max(20, Math.min(width - 20, node.x!));
      node.y! = Math.max(20, Math.min(height - 20, node.y!));
    });
  }

  return { nodes: processedNodes, links: processedLinks };
};

export const NetworkChart: React.FC<NetworkProps> = ({ data, config = {}, theme, animation }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 });

  const defaultConfig: NetworkConfig = {
    forces: {
      charge: 0.1,
      link: 0.01,
      center: 0.001,
      collision: 1,
    },
    nodeSize: {
      min: 5,
      max: 20,
    },
    colors: {
      nodes: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'],
      links: 'hsl(var(--muted-foreground))',
    },
    showLabels: true,
    clustering: false,
  };

  const mergedConfig: NetworkConfig = {
    forces: { ...defaultConfig.forces, ...config.forces },
    nodeSize: { ...defaultConfig.nodeSize, ...config.nodeSize },
    colors: { ...defaultConfig.colors, ...config.colors },
    showLabels: config.showLabels ?? defaultConfig.showLabels,
    clustering: config.clustering ?? defaultConfig.clustering,
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const simulationData = useMemo(() => {
    if (!data || !data.nodes || !data.links) return { nodes: [], links: [] };
    return forceSimulation(data.nodes, data.links, mergedConfig, dimensions.width, dimensions.height);
  }, [data, mergedConfig, dimensions]);

  if (!data || !data.nodes || !data.links) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-muted-foreground">No network data available</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <svg ref={svgRef} width="100%" height="100%" className="border border-border rounded">
        {/* Links */}
        {simulationData.links.map((link, index) => (
          link.sourceNode && link.targetNode && (
            <line
              key={`link-${index}`}
              x1={link.sourceNode.x}
              y1={link.sourceNode.y}
              x2={link.targetNode.x}
              y2={link.targetNode.y}
              stroke={link.color || mergedConfig.colors.links}
              strokeWidth={link.weight ? Math.sqrt(link.weight) : 1}
              strokeOpacity={0.6}
            />
          )
        ))}
        
        {/* Nodes */}
        {simulationData.nodes.map((node, index) => {
          const nodeSize = node.size || mergedConfig.nodeSize.min;
          const nodeColor = node.color || mergedConfig.colors.nodes[index % mergedConfig.colors.nodes.length];
          
          return (
            <g key={`node-${node.id}`}>
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeSize}
                fill={nodeColor}
                stroke="white"
                strokeWidth={2}
                className="cursor-pointer hover:opacity-80"
              />
              
              {mergedConfig.showLabels && (
                <text
                  x={node.x}
                  y={node.y! + nodeSize + 15}
                  textAnchor="middle"
                  fill="hsl(var(--foreground))"
                  fontSize="10"
                  fontWeight="500"
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </motion.div>
  );
};
