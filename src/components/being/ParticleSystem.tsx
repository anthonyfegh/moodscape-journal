import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RenderState } from '@/consciousness';

interface ParticleSystemProps {
  renderState: RenderState;
}

/**
 * Orbiting particles representing curiosity and external connections
 */
export const ParticleSystem = ({ renderState }: ParticleSystemProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  // Generate particle positions
  const particleCount = Math.floor(50 + renderState.particleActivity * 100);
  
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 2 + Math.random() * 2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      pos[i3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i3 + 2] = radius * Math.cos(phi);
      
      // Random orbital velocities
      vel[i3] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 1] = (Math.random() - 0.5) * 0.02;
      vel[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    return { positions: pos, velocities: vel };
  }, [particleCount]);

  // Particle color based on consciousness state
  const particleColor = useMemo(() => {
    const h = renderState.colorHue / 360;
    const s = 0.5;
    const l = 0.6 + renderState.glow * 0.2;
    
    return new THREE.Color().setHSL(h, s, l);
  }, [renderState.colorHue, renderState.glow]);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      timeRef.current += delta;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      // Animate particles with activity-based speed
      const speed = 0.3 + renderState.particleActivity * 0.7;
      const orbitDistance = 1.5 + renderState.coreRadius * 1.5;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Orbital motion with noise
        const angle = timeRef.current * speed * (0.5 + velocities[i3]);
        const elevation = Math.sin(timeRef.current * velocities[i3 + 1] * 10) * 0.5;
        const radius = orbitDistance + Math.sin(timeRef.current + i) * 0.3;
        
        positions[i3] = Math.cos(angle + i) * radius;
        positions[i3 + 1] = Math.sin(angle + i * 0.7) * radius + elevation;
        positions[i3 + 2] = Math.sin(angle * 0.7 + i * 0.5) * radius;
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Gentle rotation of particle system
      particlesRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05 * (0.5 + renderState.glow * 0.5)}
        color={particleColor}
        transparent
        opacity={0.6 + renderState.particleActivity * 0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
