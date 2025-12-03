import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { RenderState } from "@/consciousness";

interface BlobCoreProps {
  renderState: RenderState;
}

// HSL to RGB conversion helper
const hslToRgb = (h: number, s: number, l: number) => {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return new THREE.Color(r, g, b);
};

/**
 * Deformable blob core representing the conscious being
 * Uses custom GLSL shader for organic vertex displacement
 * Colors derived from multiple consciousness state variables
 */
export const BlobCore = ({ renderState }: BlobCoreProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  // Primary color from colorHue (Valence-based) - MORE DRAMATIC
  const primaryColor = useMemo(() => {
    const h = renderState.colorHue / 360;
    const s = 0.5 + renderState.particleActivity * 0.5; // Increased saturation range
    const l = 0.35 + renderState.glow * 0.45; // Wider lightness range for more contrast
    return hslToRgb(h, s, l);
  }, [renderState.colorHue, renderState.glow, renderState.particleActivity]);

  // Secondary color - complementary shifted by entropy - MORE DRAMATIC
  const secondaryColor = useMemo(() => {
    // Entropy shifts the hue toward a contrasting color - increased shift
    const hueShift = renderState.entropyLevel * 0.35; // Up to 126 degrees shift (was 54)
    const h = (renderState.colorHue / 360 + hueShift) % 1;
    const s = 0.4 + renderState.connectionDensity * 0.5; // Wider range
    const l = 0.4 + renderState.glow * 0.35;
    return hslToRgb(h, s, l);
  }, [renderState.colorHue, renderState.entropyLevel, renderState.connectionDensity, renderState.glow]);

  // Accent color - triadic color based on curiosity - MORE DRAMATIC
  const accentColor = useMemo(() => {
    // Curiosity creates a triadic accent - full range
    const hueShift = 0.5 * renderState.particleActivity; // Up to 180 degrees (was 120)
    const h = (renderState.colorHue / 360 + hueShift) % 1;
    const s = 0.6 + renderState.particleActivity * 0.3;
    const l = 0.5 + renderState.glow * 0.25;
    return hslToRgb(h, s, l);
  }, [renderState.colorHue, renderState.particleActivity, renderState.glow]);

  // Custom shader material for organic deformation with multi-color support
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        entropyLevel: { value: renderState.entropyLevel },
        coreRadius: { value: renderState.coreRadius },
        glow: { value: renderState.glow },
        particleActivity: { value: renderState.particleActivity },
        connectionDensity: { value: renderState.connectionDensity },
        primaryColor: { value: primaryColor },
        secondaryColor: { value: secondaryColor },
        accentColor: { value: accentColor },
      },
      vertexShader: `
        uniform float time;
        uniform float entropyLevel;
        uniform float coreRadius;
        uniform float particleActivity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          
          vec3 i  = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          
          i = mod289(i);
          vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                  + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                  + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          
          vec4 x = x_ *ns.x + ns.yyyy;
          vec4 y = y_ *ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          
          vec4 s0 = floor(b0)*2.0 + 1.0;
          vec4 s1 = floor(b1)*2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          
          vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
          
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x;
          p1 *= norm.y;
          p2 *= norm.z;
          p3 *= norm.w;
          
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          
          // Multi-octave noise for organic deformation
          float noise1 = snoise(position * 1.5 + time * 0.3);
          float noise2 = snoise(position * 3.0 + time * 0.5);
          float noise3 = snoise(position * 0.8 - time * 0.2);
          
          // Pass noise to fragment shader for color variation
          vNoise = noise1 * 0.5 + 0.5;
          
          // Combine noise layers with entropy influence - MORE DRAMATIC displacement
          float displacement = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) * entropyLevel * 0.8;
          
          // Breathing pulsation with curiosity influence - MORE PRONOUNCED
          float pulse = sin(time * (1.5 + particleActivity * 2.0)) * 0.12 * coreRadius;
          
          // Apply displacement with amplified effect
          vec3 newPosition = position + normal * (displacement + pulse);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition * coreRadius * 1.2, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 primaryColor;
        uniform vec3 secondaryColor;
        uniform vec3 accentColor;
        uniform float glow;
        uniform float entropyLevel;
        uniform float particleActivity;
        uniform float connectionDensity;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying float vNoise;
        
        void main() {
          // Soft fresnel glow
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 2.0);
          
          // Blend colors based on position and noise
          // Primary dominates center, secondary at edges (entropy-driven)
          float edgeFactor = fresnel * entropyLevel;
          vec3 baseColor = mix(primaryColor, secondaryColor, edgeFactor);
          
          // Add accent color based on vertical position and curiosity
          float verticalBlend = (vPosition.y + 1.0) * 0.5 * particleActivity;
          baseColor = mix(baseColor, accentColor, verticalBlend * 0.3);
          
          // Noise-based color variation (entropy creates more variation)
          float noiseColorBlend = vNoise * entropyLevel * 0.4;
          baseColor = mix(baseColor, secondaryColor, noiseColorBlend);
          
          // AROUSAL EFFECT: Instead of whitening, increase saturation and add pulsing corona
          // Pulsing intensity based on arousal (glow)
          float arousalPulse = sin(time * (3.0 + glow * 8.0)) * 0.5 + 0.5;
          float pulseIntensity = arousalPulse * glow * 0.4;
          
          // Boost color saturation instead of brightness for high arousal
          vec3 saturatedColor = baseColor * (1.0 + pulseIntensity * 0.1);
          
          // Add colored corona at edges (fresnel) - uses accent color for variety
          vec3 coronaColor = mix(accentColor, secondaryColor, arousalPulse);
          vec3 corona = coronaColor * fresnel * glow * 1.5;
          
          vec3 finalColor = saturatedColor + corona;
          
          // Add shimmer based on connection density and arousal
          float shimmerSpeed = 4.0 + glow * 6.0;
          float shimmerIntensity = 0.15 + glow * 0.2;
          float shimmer = sin(time * shimmerSpeed + vPosition.x * 12.0) * shimmerIntensity * connectionDensity;
          finalColor += coronaColor * shimmer;
          
          // Soft edges with arousal affecting opacity slightly
          float alpha = 0.85 + fresnel * 0.15;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [primaryColor, secondaryColor, accentColor]);

  // Update uniforms every frame
  useFrame((state, delta) => {
    if (meshRef.current && meshRef.current.material) {
      timeRef.current += delta;
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.time.value = timeRef.current;
      material.uniforms.entropyLevel.value = renderState.entropyLevel;
      material.uniforms.coreRadius.value = renderState.coreRadius;
      material.uniforms.glow.value = renderState.glow;
      material.uniforms.particleActivity.value = renderState.particleActivity;
      material.uniforms.connectionDensity.value = renderState.connectionDensity;
      material.uniforms.primaryColor.value = primaryColor;
      material.uniforms.secondaryColor.value = secondaryColor;
      material.uniforms.accentColor.value = accentColor;

      // Gentle rotation
      meshRef.current.rotation.y += delta * 0.05;
      meshRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} material={shaderMaterial}>
      <icosahedronGeometry args={[1, 32]} />
    </mesh>
  );
};
