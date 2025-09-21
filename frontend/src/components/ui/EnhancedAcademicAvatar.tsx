import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Text,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';

interface EnhancedAcademicAvatarProps {
  emotion?: 'neutral' | 'happy' | 'concerned' | 'encouraging' | 'thinking';
  isSpeaking?: boolean;
  className?: string;
  enableInteraction?: boolean;
  showBackground?: boolean;
}

// Academic Avatar Model Component
const AcademicAvatarModel: React.FC<{
  emotion: string;
  isSpeaking: boolean;
}> = ({ emotion, isSpeaking }) => {
  const group = useRef<THREE.Group>(null);
  const leftArm = useRef<THREE.Group>(null);
  const rightArm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  // Animation loop
  useFrame((state) => {
    if (group.current) {
      // Subtle breathing animation
      const breathing = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      group.current.position.y = breathing;

      // Head movements based on emotion
      if (head.current) {
        switch (emotion) {
          case 'thinking':
            head.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
            head.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
            break;
          case 'happy':
            head.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
            head.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.05;
            break;
          case 'concerned':
            head.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
            head.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.05 - 0.1;
            break;
          default:
            head.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
            head.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
        }
      }

      // Arm gestures based on emotion
      if (leftArm.current) {
        leftArm.current.rotation.z = emotion === 'encouraging' ? 0.5 : 0.1;
        leftArm.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      }

      if (rightArm.current) {
        rightArm.current.rotation.z = emotion === 'encouraging' ? -0.5 : -0.1;
        rightArm.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.05;
      }
    }
  });

  // Create materials
  const materials = useMemo(() => {
    const skinMaterial = new THREE.MeshStandardMaterial({
      color: '#d4a574',
      roughness: 0.8,
      metalness: 0.1,
    });

    const suitMaterial = new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      roughness: 0.3,
      metalness: 0.1,
    });

    const robeMaterial = new THREE.MeshStandardMaterial({
      color: '#2c1810',
      roughness: 0.4,
      metalness: 0.1,
    });

    const goldMaterial = new THREE.MeshStandardMaterial({
      color: '#ffd700',
      roughness: 0.2,
      metalness: 0.8,
    });

    const tieMaterial = new THREE.MeshStandardMaterial({
      color: '#8b0000',
      roughness: 0.3,
      metalness: 0.1,
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
      color: '#4a4a4a',
      roughness: 0.7,
      metalness: 0.1,
    });

    const bookMaterial = new THREE.MeshStandardMaterial({
      color: '#8b4513',
      roughness: 0.6,
      metalness: 0.1,
    });

    const penMaterial = new THREE.MeshStandardMaterial({
      color: '#2c2c2c',
      roughness: 0.2,
      metalness: 0.3,
    });

    return {
      skin: skinMaterial,
      suit: suitMaterial,
      robe: robeMaterial,
      gold: goldMaterial,
      tie: tieMaterial,
      hair: hairMaterial,
      book: bookMaterial,
      pen: penMaterial,
    };
  }, []);

  return (
    <group ref={group} dispose={null}>
      {/* Body */}
      <group position={[0, 0, 0]}>
        {/* Head */}
        <group ref={head} position={[0, 1.7, 0]}>
          {/* Face */}
          <mesh position={[0, 0, 0]} material={materials.skin}>
            <sphereGeometry args={[0.25, 32, 32]} />
          </mesh>

          {/* Hair */}
          <mesh position={[0, 0.1, 0]} material={materials.hair}>
            <sphereGeometry args={[0.27, 32, 32]} />
          </mesh>

          {/* Eyes */}
          <mesh position={[0.08, 0.05, 0.22]} material={new THREE.MeshStandardMaterial({ color: '#000000' })}>
            <sphereGeometry args={[0.02, 16, 16]} />
          </mesh>
          <mesh position={[-0.08, 0.05, 0.22]} material={new THREE.MeshStandardMaterial({ color: '#000000' })}>
            <sphereGeometry args={[0.02, 16, 16]} />
          </mesh>

          {/* Nose */}
          <mesh position={[0, 0, 0.25]} material={materials.skin}>
            <sphereGeometry args={[0.02, 16, 16]} />
          </mesh>

          {/* Mouth */}
          <mesh
            position={[0, -0.05, 0.23]}
            material={new THREE.MeshStandardMaterial({ color: '#8b4513' })}
          >
            <sphereGeometry args={[0.02, 16, 16]} />
          </mesh>
        </group>

        {/* Torso */}
        <mesh position={[0, 1.2, 0]} material={materials.suit}>
          <boxGeometry args={[0.6, 0.8, 0.3]} />
        </mesh>

        {/* Academic Robe */}
        <mesh position={[0, 1.0, 0]} material={materials.robe}>
          <cylinderGeometry args={[0.35, 0.4, 1.2, 32]} />
        </mesh>

        {/* Gold Trim on Robe */}
        <mesh position={[0, 1.4, 0.16]} material={materials.gold}>
          <torusGeometry args={[0.35, 0.02, 8, 32]} />
        </mesh>
        <mesh position={[0, 0.6, 0.16]} material={materials.gold}>
          <torusGeometry args={[0.35, 0.02, 8, 32]} />
        </mesh>

        {/* Arms */}
        <group ref={leftArm} position={[-0.4, 1.4, 0]}>
          <mesh material={materials.suit}>
            <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          </mesh>
          {/* Book in left hand */}
          <mesh position={[0, -0.4, 0]} material={materials.book}>
            <boxGeometry args={[0.15, 0.25, 0.03]} />
          </mesh>
        </group>

        <group ref={rightArm} position={[0.4, 1.4, 0]}>
          <mesh material={materials.suit}>
            <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
          </mesh>
          {/* Pen/Pointer in right hand */}
          <mesh position={[0, -0.4, 0]} material={materials.pen}>
            <cylinderGeometry args={[0.005, 0.005, 0.2, 8]} />
          </mesh>
        </group>

        {/* Legs */}
        <mesh position={[-0.15, 0.3, 0]} material={materials.suit}>
          <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
        </mesh>
        <mesh position={[0.15, 0.3, 0]} material={materials.suit}>
          <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
        </mesh>

        {/* Tie */}
        <mesh position={[0, 1.1, 0.16]} material={materials.tie}>
          <boxGeometry args={[0.08, 0.3, 0.02]} />
        </mesh>

        {/* Vest buttons */}
        <mesh position={[0, 1.3, 0.17]} material={materials.gold}>
          <sphereGeometry args={[0.015, 16, 16]} />
        </mesh>
        <mesh position={[0, 1.1, 0.17]} material={materials.gold}>
          <sphereGeometry args={[0.015, 16, 16]} />
        </mesh>
        <mesh position={[0, 0.9, 0.17]} material={materials.gold}>
          <sphereGeometry args={[0.015, 16, 16]} />
        </mesh>
      </group>

      {/* Professional glow effect */}
      <pointLight
        color="#ffd700"
        intensity={isSpeaking ? 1.5 : 0.8}
        distance={3}
        position={[0, 1.5, 1]}
      />
    </group>
  );
};

// Academic Background Component
const AcademicBackground: React.FC = () => {
  const bookshelves = useMemo(() => {
    const shelves = [];
    const colors = ['#8b0000', '#006400', '#00008b', '#8b008b', '#006400', '#8b0000'];

    for (let i = 0; i < 3; i++) {
      const shelfGroup = (
        <group key={i} position={[-3 + i * 3, 0, -2]}>
          {/* Bookshelf structure */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[2.5, 2, 0.2]} />
            <meshStandardMaterial color="#8b4513" />
          </mesh>

          {/* Books */}
          {Array.from({ length: 8 }, (_, j) => (
            <mesh key={`${i}-${j}`} position={[-1 + j * 0.25, 1.2, 0.12]}>
              <boxGeometry args={[0.2, 0.4, 0.05]} />
              <meshStandardMaterial color={colors[j % colors.length]} />
            </mesh>
          ))}
        </group>
      );
      shelves.push(shelfGroup);
    }
    return shelves;
  }, []);

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f5f5dc" />
      </mesh>

      {/* Bookshelves */}
      {bookshelves}

      {/* Desk */}
      <mesh position={[0, 0.4, 1]}>
        <boxGeometry args={[1.5, 0.1, 0.8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Academic atmosphere */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
    </group>
  );
};

export const EnhancedAcademicAvatar: React.FC<EnhancedAcademicAvatarProps> = ({
  emotion = 'neutral',
  isSpeaking = false,
  className = '',
  enableInteraction = true,
  showBackground = true
}) => {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.5, 4], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting setup */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[0, 3, 2]} intensity={0.5} />

        {/* Background */}
        {showBackground && <AcademicBackground />}

        {/* Avatar */}
        <AcademicAvatarModel emotion={emotion} isSpeaking={isSpeaking} />

        {/* Shadows */}
        <ContactShadows
          position={[0, -0.5, 0]}
          opacity={0.4}
          scale={8}
          blur={2}
          far={4}
          resolution={512}
          color="#000000"
        />

        {/* Environment */}
        <Environment preset="studio" />

        {/* Controls */}
        {enableInteraction && (
          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={2}
            maxDistance={6}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.2}
          />
        )}
      </Canvas>

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

      {/* Professional indicator */}
      <div className="absolute bottom-2 right-2 bg-amber-500/20 text-amber-400 px-2 py-1 rounded text-xs">
        Academic Avatar
      </div>
    </div>
  );
};
