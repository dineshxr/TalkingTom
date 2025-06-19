import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder, Cone } from '@react-three/drei';
import { ConversationState } from '../types';
import { Mesh, Group } from 'three';

interface Character3DProps {
  state: ConversationState;
  volume?: number;
}

function CatCharacter({ state, volume = 0 }: { state: ConversationState; volume: number }) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  const leftEyeRef = useRef<Mesh>(null);
  const rightEyeRef = useRef<Mesh>(null);
  const leftEarRef = useRef<Mesh>(null);
  const rightEarRef = useRef<Mesh>(null);
  const mouthRef = useRef<Mesh>(null);
  const tailRef = useRef<Mesh>(null);
  const whiskerGroupRef = useRef<Group>(null);
  const bodyRef = useRef<Mesh>(null);

  useFrame((frameState, delta) => {
    if (!groupRef.current) return;

    const time = frameState.clock.elapsedTime;

    // Base idle animations
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.05;
    }

    // Tail animation (always active)
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(time * 2) * 0.3;
      tailRef.current.rotation.x = Math.sin(time * 1.5) * 0.2;
    }

    // Whiskers subtle movement
    if (whiskerGroupRef.current) {
      whiskerGroupRef.current.rotation.z = Math.sin(time * 3) * 0.02;
    }

    // State-specific animations
    switch (state) {
      case 'idle':
        // Gentle breathing
        if (bodyRef.current) {
          bodyRef.current.scale.y = 1 + Math.sin(time * 2) * 0.02;
        }
        // Occasional blink
        if (leftEyeRef.current && rightEyeRef.current) {
          const blinkTime = Math.sin(time * 0.5);
          if (blinkTime > 0.95) {
            leftEyeRef.current.scale.y = 0.1;
            rightEyeRef.current.scale.y = 0.1;
          } else {
            leftEyeRef.current.scale.y = 1;
            rightEyeRef.current.scale.y = 1;
          }
        }
        // Ears twitch occasionally
        if (leftEarRef.current && rightEarRef.current) {
          const twitchTime = Math.sin(time * 0.3);
          if (twitchTime > 0.9) {
            leftEarRef.current.rotation.z = 0.2;
            rightEarRef.current.rotation.z = -0.2;
          } else {
            leftEarRef.current.rotation.z = 0;
            rightEarRef.current.rotation.z = 0;
          }
        }
        break;

      case 'listening':
        // Alert posture - ears perked up
        if (leftEarRef.current && rightEarRef.current) {
          leftEarRef.current.rotation.x = -0.3;
          rightEarRef.current.rotation.x = -0.3;
          leftEarRef.current.position.y = 0.9;
          rightEarRef.current.position.y = 0.9;
        }
        // Wide eyes
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.setScalar(1.2);
          rightEyeRef.current.scale.setScalar(1.2);
        }
        // Head tilts with volume
        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(time * 8) * volume * 0.1;
          headRef.current.scale.setScalar(1 + volume * 0.05);
        }
        // Body leans forward slightly
        if (groupRef.current) {
          groupRef.current.rotation.x = -0.1;
        }
        break;

      case 'thinking':
        // Thoughtful expression - one ear down
        if (leftEarRef.current && rightEarRef.current) {
          leftEarRef.current.rotation.x = 0.2;
          rightEarRef.current.rotation.x = -0.1;
        }
        // Eyes look up and blink slowly
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.position.y = 0.75;
          rightEyeRef.current.position.y = 0.75;
          const slowBlink = Math.sin(time * 1.5);
          if (slowBlink > 0.7) {
            leftEyeRef.current.scale.y = 0.3;
            rightEyeRef.current.scale.y = 0.3;
          } else {
            leftEyeRef.current.scale.y = 1;
            rightEyeRef.current.scale.y = 1;
          }
        }
        // Head tilts side to side
        if (headRef.current) {
          headRef.current.rotation.z = Math.sin(time * 1.2) * 0.15;
        }
        // Tail curls up (thinking pose)
        if (tailRef.current) {
          tailRef.current.rotation.z = Math.sin(time * 1) * 0.5 + 0.8;
        }
        break;

      case 'speaking':
        // Happy expression - ears up and forward
        if (leftEarRef.current && rightEarRef.current) {
          leftEarRef.current.rotation.x = -0.2;
          rightEarRef.current.rotation.x = -0.2;
          leftEarRef.current.rotation.z = 0.1;
          rightEarRef.current.rotation.z = -0.1;
        }
        // Animated mouth for lip sync
        if (mouthRef.current) {
          const mouthAnimation = Math.sin(time * 12) * 0.5 + 0.5;
          mouthRef.current.scale.y = 0.3 + mouthAnimation * 0.7;
          mouthRef.current.scale.x = 1.2 - mouthAnimation * 0.3;
        }
        // Eyes squint slightly (happy expression)
        if (leftEyeRef.current && rightEyeRef.current) {
          leftEyeRef.current.scale.y = 0.8;
          rightEyeRef.current.scale.y = 0.8;
        }
        // Head bobs gently
        if (headRef.current) {
          headRef.current.position.y = Math.sin(time * 6) * 0.05;
        }
        // Tail wags happily
        if (tailRef.current) {
          tailRef.current.rotation.z = Math.sin(time * 8) * 0.6;
        }
        // Whiskers move more
        if (whiskerGroupRef.current) {
          whiskerGroupRef.current.rotation.z = Math.sin(time * 6) * 0.05;
        }
        break;

      case 'processing':
        // Confused/processing - ears at different angles
        if (leftEarRef.current && rightEarRef.current) {
          leftEarRef.current.rotation.z = Math.sin(time * 3) * 0.2;
          rightEarRef.current.rotation.z = Math.sin(time * 3 + Math.PI) * 0.2;
        }
        // Eyes dart around
        if (leftEyeRef.current && rightEyeRef.current) {
          const eyeMovement = Math.sin(time * 4) * 0.1;
          leftEyeRef.current.position.x = -0.3 + eyeMovement;
          rightEyeRef.current.position.x = 0.3 + eyeMovement;
        }
        // Head shakes slightly
        if (headRef.current) {
          headRef.current.rotation.y = Math.sin(time * 5) * 0.1;
        }
        break;
    }
  });

  const getMainColor = () => {
    switch (state) {
      case 'listening': return '#3B82F6'; // Blue
      case 'thinking': return '#F59E0B';  // Orange
      case 'speaking': return '#10B981';  // Green
      case 'processing': return '#8B5CF6'; // Purple
      default: return '#FF6B6B'; // Coral/Pink (cat-like)
    }
  };

  const getAccentColor = () => {
    switch (state) {
      case 'listening': return '#1E40AF';
      case 'thinking': return '#D97706';
      case 'speaking': return '#059669';
      case 'processing': return '#7C3AED';
      default: return '#FF5252';
    }
  };

  return (
    <group ref={groupRef}>
      {/* Head */}
      <Sphere ref={headRef} args={[1, 32, 32]} position={[0, 0.5, 0]}>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      
      {/* Cat Ears */}
      <Cone ref={leftEarRef} args={[0.3, 0.6, 8]} position={[-0.5, 1.2, 0]} rotation={[0, 0, -0.3]}>
        <meshPhongMaterial color={getMainColor()} />
      </Cone>
      <Cone ref={rightEarRef} args={[0.3, 0.6, 8]} position={[0.5, 1.2, 0]} rotation={[0, 0, 0.3]}>
        <meshPhongMaterial color={getMainColor()} />
      </Cone>
      
      {/* Inner ears */}
      <Cone args={[0.15, 0.3, 8]} position={[-0.5, 1.1, 0.1]} rotation={[0, 0, -0.3]}>
        <meshPhongMaterial color="#FFB6C1" />
      </Cone>
      <Cone args={[0.15, 0.3, 8]} position={[0.5, 1.1, 0.1]} rotation={[0, 0, 0.3]}>
        <meshPhongMaterial color="#FFB6C1" />
      </Cone>
      
      {/* Eyes */}
      <Sphere ref={leftEyeRef} args={[0.18, 16, 16]} position={[-0.3, 0.7, 0.8]}>
        <meshPhongMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere ref={rightEyeRef} args={[0.18, 16, 16]} position={[0.3, 0.7, 0.8]}>
        <meshPhongMaterial color="#FFFFFF" />
      </Sphere>
      
      {/* Pupils */}
      <Sphere args={[0.08, 16, 16]} position={[-0.3, 0.7, 0.9]}>
        <meshPhongMaterial color="#1F2937" />
      </Sphere>
      <Sphere args={[0.08, 16, 16]} position={[0.3, 0.7, 0.9]}>
        <meshPhongMaterial color="#1F2937" />
      </Sphere>
      
      {/* Eye shine */}
      <Sphere args={[0.03, 8, 8]} position={[-0.28, 0.72, 0.95]}>
        <meshPhongMaterial color="#FFFFFF" />
      </Sphere>
      <Sphere args={[0.03, 8, 8]} position={[0.32, 0.72, 0.95]}>
        <meshPhongMaterial color="#FFFFFF" />
      </Sphere>
      
      {/* Nose */}
      <Cone args={[0.08, 0.1, 3]} position={[0, 0.5, 0.95]} rotation={[Math.PI, 0, 0]}>
        <meshPhongMaterial color="#FFB6C1" />
      </Cone>
      
      {/* Mouth */}
      <Box ref={mouthRef} args={[0.3, 0.15, 0.1]} position={[0, 0.3, 0.9]}>
        <meshPhongMaterial color="#1F2937" />
      </Box>
      
      {/* Whiskers */}
      <group ref={whiskerGroupRef}>
        {/* Left whiskers */}
        <Cylinder args={[0.01, 0.01, 0.8]} position={[-0.8, 0.6, 0.5]} rotation={[0, 0, 0.1]}>
          <meshPhongMaterial color="#1F2937" />
        </Cylinder>
        <Cylinder args={[0.01, 0.01, 0.7]} position={[-0.8, 0.5, 0.5]} rotation={[0, 0, 0]}>
          <meshPhongMaterial color="#1F2937" />
        </Cylinder>
        <Cylinder args={[0.01, 0.01, 0.6]} position={[-0.8, 0.4, 0.5]} rotation={[0, 0, -0.1]}>
          <meshPhongMaterial color="#1F2937" />
        </Cylinder>
        
        {/* Right whiskers */}
        <Cylinder args={[0.01, 0.01, 0.8]} position={[0.8, 0.6, 0.5]} rotation={[0, 0, -0.1]}>
          <meshPhongMaterial color="#1F2937" />
        </Cylinder>
        <Cylinder args={[0.01, 0.01, 0.7]} position={[0.8, 0.5, 0.5]} rotation={[0, 0, 0]}>
          <meshPhongMaterial color="#1F2937" />
        </Cylinder>
        <Cylinder args={[0.01, 0.01, 0.6]} position={[0.8, 0.4, 0.5]} rotation={[0, 0, 0.1]}>
          <meshPhongMaterial color="#1F2937" />
        </Cylinder>
      </group>
      
      {/* Body */}
      <Sphere ref={bodyRef} args={[1.2, 32, 32]} position={[0, -1.2, 0]} scale={[1, 1.3, 0.9]}>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      
      {/* Chest/belly marking */}
      <Sphere args={[0.8, 32, 32]} position={[0, -1.2, 0.3]} scale={[1, 1.1, 0.5]}>
        <meshPhongMaterial color="#FFFFFF" />
      </Sphere>
      
      {/* Front paws */}
      <Sphere args={[0.25, 16, 16]} position={[-0.4, -2.2, 0.3]}>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      <Sphere args={[0.25, 16, 16]} position={[0.4, -2.2, 0.3]}>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      
      {/* Back paws */}
      <Sphere args={[0.3, 16, 16]} position={[-0.5, -2.2, -0.3]}>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      <Sphere args={[0.3, 16, 16]} position={[0.5, -2.2, -0.3]}>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      
      {/* Tail */}
      <Cylinder ref={tailRef} args={[0.15, 0.08, 2]} position={[0, -0.5, -1.2]} rotation={[0.5, 0, 0]}>
        <meshPhongMaterial color={getAccentColor()} />
      </Cylinder>
      
      {/* Tail tip */}
      <Sphere args={[0.12, 16, 16]} position={[0, 0.3, -2]}>
        <meshPhongMaterial color="#FFFFFF" />
      </Sphere>
      
      {/* Stripes on body */}
      <Cylinder args={[1.1, 1.1, 0.1]} position={[0, -0.8, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshPhongMaterial color={getAccentColor()} />
      </Cylinder>
      <Cylinder args={[1.0, 1.0, 0.1]} position={[0, -1.4, 0]} rotation={[Math.PI/2, 0, 0]}>
        <meshPhongMaterial color={getAccentColor()} />
      </Cylinder>
    </group>
  );
}

export const Character3D: React.FC<Character3DProps> = ({ state, volume = 0 }) => {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#FFB6C1" />
        <spotLight position={[0, 10, 5]} intensity={0.5} angle={0.3} penumbra={0.2} />
        <CatCharacter state={state} volume={volume} />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minDistance={4}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={3 * Math.PI / 4}
        />
      </Canvas>
    </div>
  );
};