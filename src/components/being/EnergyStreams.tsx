import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RenderState } from '@/consciousness';

interface EnergyStreamsProps {
  renderState: RenderState;
}

const STREAM_COUNT = 8;
const POINTS_PER_STREAM = 50;

/**
 * Flowing energy streams that spiral around the being
 */
export const EnergyStreams = ({ renderState }: EnergyStreamsProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.Line[]>([]);
  const timeRef = useRef(0);

  // Generate initial stream data
  const streamData = useMemo(() => {
    const data: { baseAngle: number; speed: number; radius: number; hueOffset: number }[] = [];
    
    for (let i = 0; i < STREAM_COUNT; i++) {
      data.push({
        baseAngle: (i / STREAM_COUNT) * Math.PI * 2,
        speed: 0.5 + Math.random() * 0.5,
        radius: 1.5 + Math.random() * 0.5,
        hueOffset: (Math.random() - 0.5) * 0.2,
      });
    }
    
    return data;
  }, []);

  // Create geometries for each stream
  const geometries = useMemo(() => {
    return streamData.map(() => {
      const positions = new Float32Array(POINTS_PER_STREAM * 3);
      const colors = new Float32Array(POINTS_PER_STREAM * 3);
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      return geometry;
    });
  }, [streamData]);

  // HSL to RGB
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

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    const baseRadius = 1.2 + renderState.coreRadius * 0.8;
    const flowSpeed = 0.5 + renderState.particleActivity * 1.0;
    const wobble = renderState.entropyLevel * 0.5;
    
    geometries.forEach((geometry, streamIdx) => {
      const stream = streamData[streamIdx];
      const positions = geometry.attributes.position.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;
      
      const baseHue = renderState.colorHue / 360;
      
      for (let i = 0; i < POINTS_PER_STREAM; i++) {
        const t = i / POINTS_PER_STREAM;
        const i3 = i * 3;
        
        // Spiral motion
        const angle = stream.baseAngle + t * Math.PI * 4 + timeRef.current * stream.speed * flowSpeed;
        const radius = baseRadius * stream.radius * (0.5 + t * 0.5);
        const height = (t - 0.5) * 2 * (1 + wobble * Math.sin(timeRef.current + streamIdx));
        
        // Add noise-based displacement
        const noiseX = Math.sin(t * 10 + timeRef.current * 2 + streamIdx) * wobble * 0.3;
        const noiseY = Math.cos(t * 8 + timeRef.current * 1.5 + streamIdx) * wobble * 0.3;
        
        positions[i3] = Math.cos(angle) * radius + noiseX;
        positions[i3 + 1] = height + noiseY;
        positions[i3 + 2] = Math.sin(angle) * radius;
        
        // Color varies along stream and with state
        const hueVariation = stream.hueOffset + t * renderState.entropyLevel * 0.2;
        const h = (baseHue + hueVariation + 1) % 1;
        const s = 0.5 + renderState.glow * 0.3;
        const l = 0.4 + t * 0.3 + renderState.glow * 0.2;
        
        const [r, g, b] = hslToRgb(h, s, l);
        colors[i3] = r;
        colors[i3 + 1] = g;
        colors[i3 + 2] = b;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    });
    
    // Rotate the whole group slowly
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {geometries.map((geometry, i) => (
        <primitive key={i} object={new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.4 + renderState.connectionDensity * 0.4,
            blending: THREE.AdditiveBlending,
          })
        )} />
      ))}
    </group>
  );
};
