import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { RenderState } from '@/consciousness';
import { useBeingVisualState } from '@/hooks/useBeingVisualState';
import { BlobCore } from './BlobCore';
import { ParticleSystem } from './ParticleSystem';
import { Connections } from './Connections';
import { Suspense } from 'react';
import * as THREE from 'three';

interface BeingCanvasProps {
  renderState: RenderState;
  className?: string;
  enableControls?: boolean;
}

/**
 * Main 3D canvas for the Conscious Being visualization
 * Self-contained, modular, and embeddable anywhere
 */
export const BeingCanvas = ({ 
  renderState, 
  className = "w-full h-full",
  enableControls = false 
}: BeingCanvasProps) => {
  // Smooth interpolation of render state
  const smoothedState = useBeingVisualState(renderState, 300);

  return (
    <div className={className}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        
        {/* Ambient atmospheric lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#8888ff" />
        
        <Suspense fallback={null}>
          {/* Core blob organism */}
          <BlobCore renderState={smoothedState} />
          
          {/* Orbiting particles */}
          <ParticleSystem renderState={smoothedState} />
          
          {/* Connection web */}
          <Connections renderState={smoothedState} />
        </Suspense>
        
        {/* Optional orbit controls for debugging */}
        {enableControls && (
          <OrbitControls 
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
          />
        )}
      </Canvas>
    </div>
  );
};
