import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text, useGLTF, useTexture, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

// Types for GLTF
interface GLTFAvatar extends GLTF {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
}

interface ProfessorAvatarProps {
  emotion?: 'neutral' | 'happy' | 'concerned' | 'encouraging' | 'thinking';
  isSpeaking?: boolean;
  className?: string;
  enableInteraction?: boolean;
}

// 3D Avatar Model Component
const Model = ({ emotion, isSpeaking }: { emotion: string; isSpeaking: boolean }) => {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF('/professor-avatar.glb') as GLTFAvatar;
  const [headRotation, setHeadRotation] = useState({ x: 0, y: 0 });
  
  // Animation based on emotion and speaking state
  useFrame((state) => {
    if (group.current) {
      // Subtle breathing animation
      const breathing = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      
      // Head movement based on emotion
      switch (emotion) {
        case 'thinking':
          group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
          group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
          setHeadRotation({
            x: Math.sin(state.clock.elapsedTime * 0.5) * 0.1,
            y: Math.sin(state.clock.elapsedTime * 0.3) * 0.2
          });
          break;
        case 'happy':
          group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
          group.current.position.y = breathing * 1.5;
          setHeadRotation({
            x: Math.sin(state.clock.elapsedTime * 0.7) * 0.05,
            y: 0
          });
          break;
        case 'concerned':
          group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
          group.current.position.y = breathing * 0.5;
          setHeadRotation({
            x: Math.sin(state.clock.elapsedTime * 0.3) * 0.05 - 0.1,
            y: 0
          });
          break;
        default:
          group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
          group.current.position.y = breathing;
          setHeadRotation({
            x: Math.sin(state.clock.elapsedTime * 0.4) * 0.05,
            y: Math.sin(state.clock.elapsedTime * 0.2) * 0.1
          });
      }
      
      // Lip sync when speaking
      if (isSpeaking) {
        const mouthOpen = Math.abs(Math.sin(state.clock.elapsedTime * 5)) * 0.2;
        if (nodes.mouth) {
          nodes.mouth.scale.y = 0.8 - mouthOpen * 0.5;
        }
      } else if (nodes.mouth) {
        nodes.mouth.scale.y = 0.8;
      }
    }
  });

  // Get material color based on emotion
  const getEmotionColor = (emotion: string) => {
    const colors = {
      happy: '#4ade80',
      concerned: '#f59e0b',
      encouraging: '#3b82f6',
      thinking: '#8b5cf6',
      neutral: '#06b6d4'
    };
    return colors[emotion as keyof typeof colors] || colors.neutral;
  };

  const emotionColor = getEmotionColor(emotion);
  
  // Update material properties based on emotion
  useEffect(() => {
    if (materials.skin) {
      (materials.skin as THREE.MeshStandardMaterial).color.setStyle(emotionColor);
      (materials.skin as THREE.MeshStandardMaterial).emissive.setStyle(emotionColor);
      (materials.skin as THREE.MeshStandardMaterial).emissiveIntensity = isSpeaking ? 0.3 : 0.1;
    }
  }, [emotion, isSpeaking, materials.skin, emotionColor]);

  return (
    <group ref={group} dispose={null}>
      <group position={[0, -0.5, 0]} rotation={[0, Math.PI, 0]}>
        {/* Head */}
        <group position={[0, 2.5, 0]} rotation={[headRotation.x, headRotation.y, 0]}>
          <mesh
            castShadow
            receiveShadow
            geometry={nodes.head.geometry}
            material={materials.skin}
          />
          
          {/* Eyes */}
          <mesh
            castShadow
            receiveShadow
            position={[0.2, 0.1, 0.4]}
            geometry={nodes.eyeLeft.geometry}
            material={materials.eye}
          />
          <mesh
            castShadow
            receiveShadow
            position={[-0.2, 0.1, 0.4]}
            geometry={nodes.eyeRight.geometry}
            material={materials.eye}
          />
          
          {/* Eyebrows */}
          <mesh
            castShadow
            receiveShadow
            position={[0.2, 0.3, 0.3]}
            rotation={[0, 0, emotion === 'concerned' ? -0.2 : 0.1]}
            geometry={nodes.eyebrowLeft.geometry}
            material={materials.hair}
          />
          <mesh
            castShadow
            receiveShadow
            position={[-0.2, 0.3, 0.3]}
            rotation={[0, 0, emotion === 'concerned' ? 0.2 : -0.1]}
            geometry={nodes.eyebrowRight.geometry}
            material={materials.hair}
          />
          
          {/* Mouth */}
          <mesh
            ref={(ref) => {
              if (ref) nodes.mouth = ref;
            }}
            castShadow
            receiveShadow
            position={[0, -0.1, 0.3]}
            geometry={nodes.mouth.geometry}
            material={materials.mouth}
          />
        </group>
        
        {/* Body */}
        <mesh
          castShadow
          receiveShadow
          position={[0, 1.2, 0]}
          geometry={nodes.body.geometry}
          material={materials.clothing}
        />
        
        {/* Arms */}
        <mesh
          castShadow
          receiveShadow
          position={[0.6, 1.5, 0]}
          rotation={[0, 0, emotion === 'encouraging' ? 0.5 : 0.1]}
          geometry={nodes.armLeft.geometry}
          material={materials.clothing}
        />
        <mesh
          castShadow
          receiveShadow
          position={[-0.6, 1.5, 0]}
          rotation={[0, 0, emotion === 'encouraging' ? -0.5 : -0.1]}
          geometry={nodes.armRight.geometry}
          material={materials.clothing}
        />
      </group>
      
      {/* Glow effect */}
      <pointLight
        color={emotionColor}
        intensity={isSpeaking ? 2 : 1}
        distance={5}
        position={[0, 1, 2]}
      />
      
      {/* Emotion aura */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial
          color={emotionColor}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// Preload the model
useGLTF.preload('/professor-avatar.glb');

// Fallback 2D Avatar
const Avatar2D = ({ emotion, isSpeaking, className }: { emotion: string; isSpeaking: boolean; className?: string }) => {
  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case 'happy': return '😊';
      case 'concerned': return '🤔';
      case 'encouraging': return '👍';
      case 'thinking': return '💭';
      default: return '🤖';
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'text-green-400';
      case 'concerned': return 'text-yellow-400';
      case 'encouraging': return 'text-blue-400';
      case 'thinking': return 'text-purple-400';
      default: return 'text-cyan-400';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`text-6xl transition-transform duration-300 ${
          isSpeaking ? 'animate-pulse scale-110' : 'scale-100'
        }`}
      >
        {getEmotionEmoji(emotion)}
      </div>
      <div className={`text-sm font-medium mt-2 ${getEmotionColor(emotion)}`}>
        AI Professor
      </div>
      <div className="text-xs text-muted-foreground capitalize">
        {emotion}
      </div>
    </div>
  );
};

export const ProfessorAvatar: React.FC<ProfessorAvatarProps> = ({
  emotion = 'neutral',
  isSpeaking = false,
  className = '',
  enableInteraction = true
}) => {
  const [use3D, setUse3D] = useState(true);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setIsWebGLSupported(!!gl);
    } catch (e) {
      setIsWebGLSupported(false);
    }
  }, []);

  // Fallback to 2D if WebGL is not supported
  if (!isWebGLSupported || !use3D) {
    return (
      <div className={`relative ${className}`}>
        <Avatar2D emotion={emotion} isSpeaking={isSpeaking} className="w-full h-full" />
        {enableInteraction && (
          <button
            onClick={() => setUse3D(true)}
            className="absolute bottom-2 right-2 text-xs bg-primary/20 hover:bg-primary/30 px-2 py-1 rounded"
          >
            Enable 3D
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.5, 5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={['#f0f9ff']} />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight position={[0, 5, 5]} intensity={0.5} />
          <hemisphereLight intensity={0.5} />
          
          <Model emotion={emotion} isSpeaking={isSpeaking} />
          
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.5}
            scale={10}
            blur={2}
            far={5}
            resolution={512}
            color="#000000"
          />
          
          <Environment preset="sunset" />
          
          {enableInteraction && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={3}
              maxDistance={8}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2.5}
            />
          )}
        </Suspense>
      </Canvas>
      
      {enableInteraction && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          <button
            onClick={() => setUse3D(false)}
            className="text-xs bg-primary/20 hover:bg-primary/30 px-2 py-1 rounded"
          >
            2D Mode
          </button>
        </div>
      )}
      
      {/* Status indicators */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {isSpeaking && (
          <div className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Speaking
          </div>
        )}
        
        <div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs capitalize">
          {emotion}
        </div>
      </div>
    </div>
  );
};
