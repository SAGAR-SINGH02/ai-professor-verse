import React, { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface ThreeDAvatarProps {
  size?: number;
  className?: string;
  enableControls?: boolean;
}

const AvatarMesh: React.FC<{ size: number }> = ({ size = 2 }) => {
  // Using a placeholder texture
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Background
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw "AI" text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 400px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('AI', canvas.width / 2, canvas.height / 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    // Use the new Three.js color space API
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
  
  return (
    <mesh>
      <sphereGeometry args={[size, 64, 32]} />
      <meshStandardMaterial 
        map={texture} 
        roughness={0.5}
        metalness={0.1}
      />
    </mesh>
  );
};

const ThreeDAvatar: React.FC<ThreeDAvatarProps> = ({ 
  size = 2, 
  className = '',
  enableControls = false
}) => {
  return (
    <div className={`w-full h-64 md:h-96 ${className}`}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={null}>
          <AvatarMesh size={size} />
          <Environment preset="city" />
        </Suspense>
        {enableControls && <OrbitControls enableZoom={true} />}
      </Canvas>
    </div>
  );
};

export default ThreeDAvatar;
