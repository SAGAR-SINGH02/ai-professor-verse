import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Box } from '@react-three/drei';
import * as THREE from 'three';

interface ProfessorAvatarProps {
  isNightMode?: boolean;
  emotion?: 'neutral' | 'happy' | 'concerned' | 'encouraging' | 'thinking';
  isSpeaking?: boolean;
  lipSyncData?: number[];
}

// 3D Professor Model Component
const ProfessorModel: React.FC<{
  emotion: string;
  isSpeaking: boolean;
  isNightMode: boolean;
}> = ({ emotion, isSpeaking, isNightMode }) => {
  const meshRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const eyesRef = useRef<THREE.Group>(null);
  
  // Animation for breathing and subtle movements
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
    
    // Head movement based on emotion
    if (headRef.current) {
      const time = state.clock.elapsedTime;
      switch (emotion) {
        case 'thinking':
          headRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
          break;
        case 'encouraging':
          headRef.current.rotation.x = Math.sin(time * 2) * 0.05;
          break;
        default:
          headRef.current.rotation.y = Math.sin(time * 0.2) * 0.05;
      }
    }
    
    // Eye blinking animation
    if (eyesRef.current) {
      const blinkTime = Math.sin(state.clock.elapsedTime * 3);
      if (blinkTime > 0.98) {
        eyesRef.current.scale.y = 0.1;
      } else {
        eyesRef.current.scale.y = 1;
      }
    }
  });

  const bodyColor = isNightMode ? '#4a5568' : '#2d3748';
  const skinColor = isNightMode ? '#d69e2e' : '#f7931e';

  return (
    <group ref={meshRef}>
      {/* Body */}
      <Box
        position={[0, -1, 0]}
        args={[1.2, 2, 0.6]}
        material-color={bodyColor}
      />
      
      {/* Head */}
      <group ref={headRef} position={[0, 0.5, 0]}>
        <Box
          args={[0.8, 0.8, 0.8]}
          material-color={skinColor}
        />
        
        {/* Eyes */}
        <group ref={eyesRef}>
          <Box
            position={[-0.2, 0.1, 0.35]}
            args={[0.1, 0.1, 0.05]}
            material-color="#000000"
          />
          <Box
            position={[0.2, 0.1, 0.35]}
            args={[0.1, 0.1, 0.05]}
            material-color="#000000"
          />
        </group>
        
        {/* Mouth - changes based on speaking */}
        <Box
          position={[0, -0.2, 0.35]}
          args={[0.3, isSpeaking ? 0.15 : 0.05, 0.05]}
          material-color="#8b0000"
        />
        
        {/* Nose */}
        <Box
          position={[0, 0, 0.4]}
          args={[0.05, 0.1, 0.1]}
          material-color={skinColor}
        />
      </group>
      
      {/* Arms */}
      <Box
        position={[-0.8, -0.5, 0]}
        args={[0.3, 1.5, 0.3]}
        material-color={skinColor}
      />
      <Box
        position={[0.8, -0.5, 0]}
        args={[0.3, 1.5, 0.3]}
        material-color={skinColor}
      />
      
      {/* Gesture indicator when speaking */}
      {isSpeaking && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.2}
          color={isNightMode ? '#90cdf4' : '#3182ce'}
        >
          Speaking...
        </Text>
      )}
    </group>
  );
};

// Lighting setup for different modes
const SceneLighting: React.FC<{ isNightMode: boolean }> = ({ isNightMode }) => {
  return (
    <>
      <ambientLight intensity={isNightMode ? 0.3 : 0.6} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={isNightMode ? 0.5 : 1}
        color={isNightMode ? '#4299e1' : '#ffffff'}
        castShadow
      />
      <pointLight
        position={[-5, 5, 5]}
        intensity={isNightMode ? 0.3 : 0.5}
        color={isNightMode ? '#805ad5' : '#f7fafc'}
      />
    </>
  );
};

export const ProfessorAvatar: React.FC<ProfessorAvatarProps> = ({
  isNightMode = false,
  emotion = 'neutral',
  isSpeaking = false,
  lipSyncData = []
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading time for 3D model
    const timer = setTimeout(() => setIsLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        shadows
        className={`${isNightMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-100 to-blue-200'}`}
      >
        <SceneLighting isNightMode={isNightMode} />
        
        <ProfessorModel
          emotion={emotion}
          isSpeaking={isSpeaking}
          isNightMode={isNightMode}
        />
        
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
        
        <Environment preset={isNightMode ? 'night' : 'sunset'} />
      </Canvas>
    </div>
  );
};
