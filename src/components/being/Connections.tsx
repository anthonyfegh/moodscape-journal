import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RenderState } from '@/consciousness';

interface ConnectionsProps {
  renderState: RenderState;
}

// Fixed connection count to avoid buffer resize errors
const MAX_CONNECTIONS = 50;

// HSL to RGB helper
const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [r, g, b];
};

/**
 * Connection web with gradient colors based on consciousness state
 */
export const Connections = ({ renderState }: ConnectionsProps) => {
  const linesRef = useRef<THREE.LineSegments>(null);
  const timeRef = useRef(0);

  // Generate initial positions and per-line hue offsets
  const { positions, hueOffsets } = useMemo(() => {
    const pos = new Float32Array(MAX_CONNECTIONS * 2 * 3); // 2 points per line
    const hue = new Float32Array(MAX_CONNECTIONS);
    
    for (let i = 0; i < MAX_CONNECTIONS * 2; i++) {
      const i3 = i * 3;
      const radius = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
    }
    
    // Per-connection hue offset
    for (let i = 0; i < MAX_CONNECTIONS; i++) {
      hue[i] = (Math.random() - 0.5) * 0.15; // ±27 degrees variation
    }
    
    return { positions: pos, hueOffsets: hue };
  }, []);

  // Generate connection colors with variation
  const colors = useMemo(() => {
    const colorArray = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const baseHue = renderState.colorHue / 360;
    
    for (let i = 0; i < MAX_CONNECTIONS; i++) {
      const lineIdx = i * 2;
      
      // Connection color based on attachment (warmer = more attached)
      const warmthShift = renderState.connectionDensity * 0.1; // Shift toward warm colors
      const h = (baseHue + hueOffsets[i] + warmthShift + 1) % 1;
      const s = 0.4 + renderState.connectionDensity * 0.3;
      const l = 0.4 + renderState.glow * 0.2;
      
      const [r, g, b] = hslToRgb(h, s, l);
      
      // Both endpoints of the line get the same color
      for (let j = 0; j < 2; j++) {
        const idx = (lineIdx + j) * 3;
        colorArray[idx] = r;
        colorArray[idx + 1] = g;
        colorArray[idx + 2] = b;
      }
    }
    
    return colorArray;
  }, [renderState.colorHue, renderState.connectionDensity, renderState.glow, hueOffsets]);

  useFrame((state, delta) => {
    if (linesRef.current) {
      timeRef.current += delta;
      
      // Animate connection positions
      const pos = linesRef.current.geometry.attributes.position.array as Float32Array;
      const colorAttr = linesRef.current.geometry.attributes.color;
      const orbitDistance = 1.5 + renderState.coreRadius * 1.5;
      
      for (let i = 0; i < MAX_CONNECTIONS * 2; i++) {
        const i3 = i * 3;
        const angle = timeRef.current * 0.2 + i * 0.5;
        const radius = orbitDistance + Math.sin(timeRef.current + i) * 0.3;
        
        pos[i3] = Math.cos(angle) * radius;
        pos[i3 + 1] = Math.sin(angle * 0.7) * radius * 0.5;
        pos[i3 + 2] = Math.sin(angle * 0.5) * radius;
      }
      
      linesRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Animate colors with shimmer
      if (colorAttr) {
        const colorsArray = colorAttr.array as Float32Array;
        const baseHue = renderState.colorHue / 360;
        
        for (let i = 0; i < MAX_CONNECTIONS; i++) {
          const lineIdx = i * 2;
          
          // Time-based color shimmer
          const shimmer = Math.sin(timeRef.current * 0.8 + i * 0.3) * 0.05 * renderState.entropyLevel;
          const warmthShift = renderState.connectionDensity * 0.1;
          const h = (baseHue + hueOffsets[i] + warmthShift + shimmer + 1) % 1;
          const s = 0.4 + renderState.connectionDensity * 0.3;
          const l = 0.4 + renderState.glow * 0.2;
          
          const [r, g, b] = hslToRgb(h, s, l);
          
          for (let j = 0; j < 2; j++) {
            const idx = (lineIdx + j) * 3;
            colorsArray[idx] = r;
            colorsArray[idx + 1] = g;
            colorsArray[idx + 2] = b;
          }
        }
        colorAttr.needsUpdate = true;
      }
      
      // Fade connections based on density and time
      const opacity = (Math.sin(timeRef.current * 0.5) * 0.5 + 0.5) * renderState.connectionDensity * 0.4;
      (linesRef.current.material as THREE.LineBasicMaterial).opacity = opacity;
    }
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_CONNECTIONS * 2}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={MAX_CONNECTIONS * 2}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.3 * renderState.connectionDensity}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
};
