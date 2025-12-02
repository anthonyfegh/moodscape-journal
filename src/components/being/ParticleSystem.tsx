import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RenderState } from '@/consciousness';

interface ParticleSystemProps {
  renderState: RenderState;
}

// Fixed particle count to avoid buffer resize errors
const MAX_PARTICLES = 150;

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
 * Orbiting particles with multi-color system based on consciousness state
 */
export const ParticleSystem = ({ renderState }: ParticleSystemProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  const timeRef = useRef(0);

  // Generate particle positions and per-particle hue offsets
  const { positions, velocities, hueOffsets } = useMemo(() => {
    const pos = new Float32Array(MAX_PARTICLES * 3);
    const vel = new Float32Array(MAX_PARTICLES * 3);
    const hue = new Float32Array(MAX_PARTICLES);
    
    for (let i = 0; i < MAX_PARTICLES; i++) {
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
      
      // Per-particle hue offset for color variation
      hue[i] = (Math.random() - 0.5) * 0.2; // ±36 degrees variation
    }
    
    return { positions: pos, velocities: vel, hueOffsets: hue };
  }, []);

  // Generate particle colors with variation
  const colors = useMemo(() => {
    const colorArray = new Float32Array(MAX_PARTICLES * 3);
    const baseHue = renderState.colorHue / 360;
    
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const i3 = i * 3;
      
      // Each particle has unique hue based on entropy-scaled variation
      const hueVariation = hueOffsets[i] * renderState.entropyLevel;
      const h = (baseHue + hueVariation + 1) % 1;
      
      // Saturation varies with curiosity
      const s = 0.5 + renderState.particleActivity * 0.4;
      
      // Lightness varies with glow and per-particle randomness
      const l = 0.5 + renderState.glow * 0.3 + hueOffsets[i] * 0.1;
      
      const [r, g, b] = hslToRgb(h, s, Math.max(0.3, Math.min(0.9, l)));
      colorArray[i3] = r;
      colorArray[i3 + 1] = g;
      colorArray[i3 + 2] = b;
    }
    
    return colorArray;
  }, [renderState.colorHue, renderState.entropyLevel, renderState.particleActivity, renderState.glow, hueOffsets]);

  useFrame((state, delta) => {
    if (particlesRef.current) {
      timeRef.current += delta;
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const colorAttr = particlesRef.current.geometry.attributes.color;
      
      // Animate particles with activity-based speed
      const speed = 0.3 + renderState.particleActivity * 0.7;
      const orbitDistance = 1.5 + renderState.coreRadius * 1.5;
      
      for (let i = 0; i < MAX_PARTICLES; i++) {
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
      
      // Update colors dynamically
      if (colorAttr) {
        const colorsArray = colorAttr.array as Float32Array;
        const baseHue = renderState.colorHue / 360;
        
        for (let i = 0; i < MAX_PARTICLES; i++) {
          const i3 = i * 3;
          
          // Animate hue slightly over time for shimmer effect
          const timeOffset = Math.sin(timeRef.current * 0.5 + i * 0.1) * 0.05 * renderState.entropyLevel;
          const hueVariation = hueOffsets[i] * renderState.entropyLevel + timeOffset;
          const h = (baseHue + hueVariation + 1) % 1;
          const s = 0.5 + renderState.particleActivity * 0.4;
          const l = 0.5 + renderState.glow * 0.3 + hueOffsets[i] * 0.1;
          
          const [r, g, b] = hslToRgb(h, s, Math.max(0.3, Math.min(0.9, l)));
          colorsArray[i3] = r;
          colorsArray[i3 + 1] = g;
          colorsArray[i3 + 2] = b;
        }
        colorAttr.needsUpdate = true;
      }
      
      // Gentle rotation of particle system
      particlesRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={MAX_PARTICLES}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={MAX_PARTICLES}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06 * (0.5 + renderState.glow * 0.5)}
        vertexColors
        transparent
        opacity={0.4 + renderState.particleActivity * 0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};
