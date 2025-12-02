import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RenderState } from '@/consciousness';

interface FlowingAuraProps {
  renderState: RenderState;
}

// HSL to RGB helper
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

/**
 * Flowing aura rings that pulse and shift based on consciousness state
 */
export const FlowingAura = ({ renderState }: FlowingAuraProps) => {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  // Create shader material for flowing rings
  const createRingMaterial = (hueOffset: number, speedMult: number) => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        baseHue: { value: renderState.colorHue / 360 },
        hueOffset: { value: hueOffset },
        glow: { value: renderState.glow },
        entropy: { value: renderState.entropyLevel },
        activity: { value: renderState.particleActivity },
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
        uniform float time;
        uniform float baseHue;
        uniform float hueOffset;
        uniform float glow;
        uniform float entropy;
        uniform float activity;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        vec3 hsl2rgb(float h, float s, float l) {
          vec3 rgb = clamp(abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return l + s * (rgb - 0.5) * (1.0 - abs(2.0 * l - 1.0));
        }
        
        void main() {
          // Flowing wave pattern
          float wave = sin(vUv.x * 6.28318 * 3.0 + time * 2.0) * 0.5 + 0.5;
          float wave2 = sin(vUv.x * 6.28318 * 5.0 - time * 1.5 + entropy * 3.0) * 0.5 + 0.5;
          
          // Combine waves with entropy influence
          float flow = mix(wave, wave2, entropy * 0.5);
          
          // Color shifting based on position and time
          float hueShift = sin(time * 0.5 + vUv.x * 3.14159) * entropy * 0.1;
          float h = mod(baseHue + hueOffset + hueShift, 1.0);
          float s = 0.6 + activity * 0.3;
          float l = 0.4 + glow * 0.3;
          
          vec3 color = hsl2rgb(h, s, l);
          
          // Fade at edges
          float edgeFade = 1.0 - abs(vUv.y - 0.5) * 2.0;
          edgeFade = pow(edgeFade, 2.0);
          
          // Pulsing opacity
          float pulse = 0.3 + sin(time * 1.5) * 0.1 * glow;
          float alpha = flow * edgeFade * pulse * (0.3 + activity * 0.4);
          
          gl_FragColor = vec4(color * (1.0 + glow * 0.5), alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  };

  const material1 = useMemo(() => createRingMaterial(0, 1), []);
  const material2 = useMemo(() => createRingMaterial(0.15, 0.7), []);
  const material3 = useMemo(() => createRingMaterial(-0.1, 1.3), []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    const updateRing = (ref: React.RefObject<THREE.Mesh>, material: THREE.ShaderMaterial, 
                        baseScale: number, rotSpeed: number, wobble: number) => {
      if (ref.current) {
        // Update uniforms
        material.uniforms.time.value = timeRef.current;
        material.uniforms.baseHue.value = renderState.colorHue / 360;
        material.uniforms.glow.value = renderState.glow;
        material.uniforms.entropy.value = renderState.entropyLevel;
        material.uniforms.activity.value = renderState.particleActivity;
        
        // Scale based on core radius
        const scale = baseScale * (0.8 + renderState.coreRadius * 0.4);
        ref.current.scale.setScalar(scale);
        
        // Rotation with wobble based on entropy
        ref.current.rotation.z += delta * rotSpeed * (0.5 + renderState.particleActivity * 0.5);
        ref.current.rotation.x = Math.sin(timeRef.current * wobble) * renderState.entropyLevel * 0.3;
        ref.current.rotation.y = Math.cos(timeRef.current * wobble * 0.7) * renderState.entropyLevel * 0.2;
      }
    };
    
    updateRing(ring1Ref, material1, 1.8, 0.15, 0.5);
    updateRing(ring2Ref, material2, 2.2, -0.1, 0.3);
    updateRing(ring3Ref, material3, 2.6, 0.08, 0.7);
  });

  return (
    <group>
      <mesh ref={ring1Ref} material={material1}>
        <torusGeometry args={[1, 0.08, 16, 64]} />
      </mesh>
      <mesh ref={ring2Ref} material={material2} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[1, 0.06, 16, 64]} />
      </mesh>
      <mesh ref={ring3Ref} material={material3} rotation={[Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[1, 0.05, 16, 64]} />
      </mesh>
    </group>
  );
};
