import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RenderState } from '@/consciousness';

interface ConnectionsProps {
  renderState: RenderState;
}

// Fixed connection count to avoid buffer resize errors
const MAX_CONNECTIONS = 50;

/**
 * Connection web showing attachment between particles
 */
export const Connections = ({ renderState }: ConnectionsProps) => {
  const linesRef = useRef<THREE.LineSegments>(null);
  const timeRef = useRef(0);

  // Generate initial positions with fixed count
  const positions = useMemo(() => {
    const pos = new Float32Array(MAX_CONNECTIONS * 2 * 3); // 2 points per line
    
    for (let i = 0; i < MAX_CONNECTIONS * 2; i++) {
      const i3 = i * 3;
      const radius = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
    }
    
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (linesRef.current) {
      timeRef.current += delta;
      
      // Animate connection positions
      const pos = linesRef.current.geometry.attributes.position.array as Float32Array;
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
      
      // Fade connections based on density and time
      const opacity = (Math.sin(timeRef.current * 0.5) * 0.5 + 0.5) * renderState.connectionDensity * 0.3;
      (linesRef.current.material as THREE.LineBasicMaterial).opacity = opacity;
    }
  });

  // Connection color
  const h = renderState.colorHue / 360;
  const lineColor = new THREE.Color().setHSL(h, 0.3, 0.5);

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_CONNECTIONS * 2}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={lineColor}
        transparent
        opacity={0.2 * renderState.connectionDensity}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
};
