import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RenderState } from '@/consciousness';

interface ConnectionsProps {
  renderState: RenderState;
  particleCount: number;
}

/**
 * Connection web showing attachment between particles
 */
export const Connections = ({ renderState, particleCount }: ConnectionsProps) => {
  const linesRef = useRef<THREE.LineSegments>(null);
  const timeRef = useRef(0);

  // Generate initial connection pairs based on connection density
  const connectionPairs = useMemo(() => {
    const pairs: number[] = [];
    const maxConnections = Math.floor(particleCount * renderState.connectionDensity * 0.5);
    
    for (let i = 0; i < maxConnections; i++) {
      const p1 = Math.floor(Math.random() * particleCount);
      const p2 = Math.floor(Math.random() * particleCount);
      if (p1 !== p2) {
        pairs.push(p1, p2);
      }
    }
    
    return pairs;
  }, [particleCount, renderState.connectionDensity]);

  const positions = useMemo(() => {
    return new Float32Array(connectionPairs.length * 3);
  }, [connectionPairs.length]);

  // Connection color
  const lineColor = useMemo(() => {
    const h = renderState.colorHue / 360;
    return new THREE.Color().setHSL(h, 0.3, 0.5);
  }, [renderState.colorHue]);

  useFrame((state, delta) => {
    if (linesRef.current) {
      timeRef.current += delta;
      
      // Fade connections in and out
      const opacity = (Math.sin(timeRef.current * 0.5) * 0.5 + 0.5) * renderState.connectionDensity * 0.3;
      (linesRef.current.material as THREE.LineBasicMaterial).opacity = opacity;
    }
  });

  if (connectionPairs.length === 0) return null;

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={connectionPairs.length}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={lineColor}
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
};
