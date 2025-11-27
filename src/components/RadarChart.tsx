import { useEffect, useState } from "react";

export interface RadarData {
  expression: number;
  depth: number;
  clarity: number;
  introspection: number;
  energy: number;
}

interface RadarChartProps {
  data: RadarData;
}

export const RadarChart = ({ data }: RadarChartProps) => {
  const [animatedData, setAnimatedData] = useState(data);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedData(data);
    }, 50);
    return () => clearTimeout(timeout);
  }, [data]);

  const dimensions = ["Expression", "Depth", "Clarity", "Introspection", "Energy"];
  const values = Object.values(animatedData);
  
  // Calculate polygon points for radar chart
  const centerX = 100;
  const centerY = 100;
  const maxRadius = 80;
  
  const points = values.map((value, index) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const radius = (value / 100) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  const backgroundPoints = dimensions.map((_, index) => {
    const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
    const x = centerX + maxRadius * Math.cos(angle);
    const y = centerY + maxRadius * Math.sin(angle);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="px-6 pb-4">
      <svg viewBox="0 0 200 200" className="w-full h-40">
        {/* Background grid */}
        <polygon
          points={backgroundPoints}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          opacity="0.3"
        />
        
        {/* Data polygon */}
        <polygon
          points={points}
          fill="hsl(var(--primary))"
          fillOpacity="0.3"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="transition-all duration-300"
        />
        
        {/* Axis lines */}
        {dimensions.map((_, index) => {
          const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
          const x = centerX + maxRadius * Math.cos(angle);
          const y = centerY + maxRadius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}
        
        {/* Dimension labels */}
        {dimensions.map((label, index) => {
          const angle = (Math.PI * 2 * index) / dimensions.length - Math.PI / 2;
          const x = centerX + (maxRadius + 15) * Math.cos(angle);
          const y = centerY + (maxRadius + 15) * Math.sin(angle);
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[8px] fill-muted-foreground"
            >
              {label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
