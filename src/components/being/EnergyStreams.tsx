import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RenderState } from '@/consciousness';

interface EnergyStreamsProps {
  renderState: RenderState;
}

const ORB_COUNT = 12;

/**
 * Floating energy orbs that drift around the being
 * Soft, nebula-like wisps instead of lines
 */
export const EnergyStreams = ({ renderState }: EnergyStreamsProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const orbsRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  // Generate orb data
  const orbData = useMemo(() => {
    const data: { 
      baseAngle: number; 
      speed: number; 
      radius: number; 
      size: number;
      hueOffset: number;
      phase: number;
      verticalSpeed: number;
    }[] = [];
    
    for (let i = 0; i < ORB_COUNT; i++) {
      data.push({
        baseAngle: (i / ORB_COUNT) * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.3,
        radius: 1.8 + Math.random() * 1.2,
        size: 0.15 + Math.random() * 0.25,
        hueOffset: (Math.random() - 0.5) * 0.25,
        phase: Math.random() * Math.PI * 2,
        verticalSpeed: 0.3 + Math.random() * 0.4,
      });
    }
    
    return data;
  }, []);

  // Create shader material for soft glowing orbs
  const createOrbMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(1, 1, 1) },
        glow: { value: 0.5 },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float glow;
        uniform float time;
        varying vec2 vUv;
        
        void main() {
          // Soft radial gradient
          vec2 center = vUv - 0.5;
          float dist = length(center) * 2.0;
          
          // Soft falloff
          float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
          alpha = pow(alpha, 1.5);
          
          // Inner glow
          float innerGlow = 1.0 - smoothstep(0.0, 0.5, dist);
          vec3 finalColor = color * (1.0 + innerGlow * glow);
          
          gl_FragColor = vec4(finalColor, alpha * 0.6);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  };

  const materials = useMemo(() => {
    return orbData.map(() => createOrbMaterial());
  }, [orbData]);

  // HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): THREE.Color => {
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
    
    return new THREE.Color(r, g, b);
  };

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    const baseRadius = 1.5 + renderState.coreRadius * 0.5;
    const flowSpeed = 0.3 + renderState.particleActivity * 0.5;
    const wobble = renderState.entropyLevel * 0.8;
    const baseHue = renderState.colorHue / 360;
    
    orbsRef.current.forEach((orb, i) => {
      if (!orb) return;
      
      const data = orbData[i];
      const material = materials[i];
      
      // Orbital position
      const angle = data.baseAngle + timeRef.current * data.speed * flowSpeed;
      const radius = baseRadius * data.radius;
      
      // Vertical bobbing with entropy influence
      const verticalOffset = Math.sin(timeRef.current * data.verticalSpeed + data.phase) * wobble;
      
      // Position with gentle drift
      orb.position.x = Math.cos(angle) * radius;
      orb.position.y = verticalOffset;
      orb.position.z = Math.sin(angle) * radius;
      
      // Scale pulsing
      const scalePulse = 1 + Math.sin(timeRef.current * 2 + data.phase) * 0.2 * renderState.glow;
      const baseScale = data.size * (0.8 + renderState.coreRadius * 0.4);
      orb.scale.setScalar(baseScale * scalePulse);
      
      // Always face camera (billboard effect)
      orb.lookAt(state.camera.position);
      
      // Update color based on state
      const h = (baseHue + data.hueOffset + Math.sin(timeRef.current * 0.3 + i) * renderState.entropyLevel * 0.1 + 1) % 1;
      const s = 0.5 + renderState.particleActivity * 0.4;
      const l = 0.5 + renderState.glow * 0.3;
      
      material.uniforms.color.value = hslToRgb(h, s, l);
      material.uniforms.glow.value = renderState.glow;
      material.uniforms.time.value = timeRef.current;
    });
    
    // Rotate the whole group slowly
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {orbData.map((data, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) orbsRef.current[i] = el; }}
          material={materials[i]}
        >
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
};
