import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sphere, Box, Cylinder, Cone, Stars, Cloud } from '@react-three/drei';
import { ConversationState } from '../types';
import { Mesh, Group, PointLight, Color, Vector3 } from 'three';
import * as THREE from 'three';

interface Character3DProps {
  state: ConversationState;
  volume?: number;
  onPoke?: () => void;
  pokeReaction?: string;
}

function FloatingParticles({ state, volume }: { state: ConversationState; volume: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  const particleCount = 100;

  useFrame((frameState) => {
    if (!particlesRef.current) return;

    const time = frameState.clock.elapsedTime;
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Create floating motion based on conversation state
      const baseSpeed = state === 'speaking' ? 2 : state === 'listening' ? 1.5 : 1;
      const volumeEffect = 1 + volume * 0.5;
      
      positions[i3 + 1] += Math.sin(time * baseSpeed + i * 0.1) * 0.01 * volumeEffect;
      positions[i3] += Math.cos(time * baseSpeed * 0.5 + i * 0.05) * 0.005 * volumeEffect;
      positions[i3 + 2] += Math.sin(time * baseSpeed * 0.3 + i * 0.08) * 0.008 * volumeEffect;

      // Reset particles that drift too far
      if (Math.abs(positions[i3]) > 10) positions[i3] *= 0.1;
      if (Math.abs(positions[i3 + 1]) > 8) positions[i3 + 1] *= 0.1;
      if (Math.abs(positions[i3 + 2]) > 10) positions[i3 + 2] *= 0.1;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const getParticleColor = () => {
    switch (state) {
      case 'listening': return '#60A5FA';
      case 'thinking': return '#FBBF24';
      case 'speaking': return '#34D399';
      case 'processing': return '#A78BFA';
      default: return '#F472B6';
    }
  };

  // Generate random particle positions
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color={getParticleColor()}
        size={0.1}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function DynamicLighting({ state, volume }: { state: ConversationState; volume: number }) {
  const mainLightRef = useRef<PointLight>(null);
  const accentLightRef = useRef<PointLight>(null);
  const ambientLightRef = useRef<THREE.AmbientLight>(null);

  useFrame((frameState) => {
    const time = frameState.clock.elapsedTime;

    if (mainLightRef.current) {
      // Main light intensity based on state
      const baseIntensity = state === 'speaking' ? 1.2 : state === 'listening' ? 1.0 : 0.8;
      mainLightRef.current.intensity = baseIntensity + Math.sin(time * 2) * 0.1 + volume * 0.3;

      // Light color based on state
      switch (state) {
        case 'listening':
          mainLightRef.current.color.setHex(0x3B82F6);
          break;
        case 'thinking':
          mainLightRef.current.color.setHex(0xF59E0B);
          break;
        case 'speaking':
          mainLightRef.current.color.setHex(0x10B981);
          break;
        case 'processing':
          mainLightRef.current.color.setHex(0x8B5CF6);
          break;
        default:
          mainLightRef.current.color.setHex(0xFF6B6B);
      }

      // Dynamic light movement
      mainLightRef.current.position.x = Math.sin(time * 0.5) * 2;
      mainLightRef.current.position.z = Math.cos(time * 0.3) * 2;
    }

    if (accentLightRef.current) {
      // Accent light for rim lighting
      accentLightRef.current.intensity = 0.5 + volume * 0.4;
      accentLightRef.current.position.x = -Math.sin(time * 0.7) * 3;
      accentLightRef.current.position.z = -Math.cos(time * 0.4) * 3;
    }

    if (ambientLightRef.current) {
      // Subtle ambient light variation
      ambientLightRef.current.intensity = 0.3 + Math.sin(time * 0.2) * 0.1;
    }
  });

  return (
    <>
      <ambientLight ref={ambientLightRef} intensity={0.3} />
      <pointLight
        ref={mainLightRef}
        position={[5, 5, 5]}
        intensity={1}
        distance={20}
        decay={2}
        castShadow
      />
      <pointLight
        ref={accentLightRef}
        position={[-5, 3, -5]}
        intensity={0.5}
        distance={15}
        decay={2}
        color="#FFB6C1"
      />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={0.2}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </>
  );
}

function InteractiveGround({ state }: { state: ConversationState }) {
  const groundRef = useRef<Mesh>(null);

  useFrame((frameState) => {
    if (!groundRef.current) return;

    const time = frameState.clock.elapsedTime;
    
    // Subtle ground animation
    groundRef.current.rotation.z = Math.sin(time * 0.1) * 0.02;
    
    // Ground color based on state
    const material = groundRef.current.material as THREE.MeshPhongMaterial;
    switch (state) {
      case 'listening':
        material.color.lerp(new Color(0x1E3A8A), 0.05);
        break;
      case 'thinking':
        material.color.lerp(new Color(0x92400E), 0.05);
        break;
      case 'speaking':
        material.color.lerp(new Color(0x064E3B), 0.05);
        break;
      case 'processing':
        material.color.lerp(new Color(0x581C87), 0.05);
        break;
      default:
        material.color.lerp(new Color(0x374151), 0.05);
    }
  });

  return (
    <Cylinder
      ref={groundRef}
      args={[8, 8, 0.2, 32]}
      position={[0, -3, 0]}
      receiveShadow
    >
      <meshPhongMaterial color="#374151" transparent opacity={0.8} />
    </Cylinder>
  );
}

function FloatingOrbs({ state, volume }: { state: ConversationState; volume: number }) {
  const orbsRef = useRef<Group>(null);

  useFrame((frameState) => {
    if (!orbsRef.current) return;

    const time = frameState.clock.elapsedTime;
    
    orbsRef.current.children.forEach((orb, index) => {
      const mesh = orb as Mesh;
      const radius = 4 + index * 0.5;
      const speed = 0.5 + index * 0.1;
      const volumeEffect = 1 + volume * 0.3;

      mesh.position.x = Math.cos(time * speed + index * Math.PI * 0.5) * radius * volumeEffect;
      mesh.position.z = Math.sin(time * speed + index * Math.PI * 0.5) * radius * volumeEffect;
      mesh.position.y = 2 + Math.sin(time * (speed * 2) + index) * 0.5;

      // Orb rotation
      mesh.rotation.x += 0.01;
      mesh.rotation.y += 0.02;

      // Scale based on volume
      const baseScale = 0.3 + index * 0.1;
      mesh.scale.setScalar(baseScale + volume * 0.2);
    });
  });

  const getOrbColor = (index: number) => {
    const colors = {
      listening: ['#60A5FA', '#3B82F6', '#1D4ED8'],
      thinking: ['#FBBF24', '#F59E0B', '#D97706'],
      speaking: ['#34D399', '#10B981', '#059669'],
      processing: ['#A78BFA', '#8B5CF6', '#7C3AED'],
      idle: ['#F472B6', '#EC4899', '#DB2777']
    };
    return colors[state] ? colors[state][index % 3] : colors.idle[index % 3];
  };

  return (
    <group ref={orbsRef}>
      {[...Array(6)].map((_, index) => (
        <Sphere key={index} args={[0.3, 16, 16]} castShadow>
          <meshPhongMaterial
            color={getOrbColor(index)}
            transparent
            opacity={0.7}
            emissive={getOrbColor(index)}
            emissiveIntensity={0.2}
          />
        </Sphere>
      ))}
    </group>
  );
}

function CatCharacter({ 
  state, 
  volume = 0, 
  onPoke, 
  pokeReaction 
}: { 
  state: ConversationState; 
  volume: number;
  onPoke?: () => void;
  pokeReaction?: string;
}) {
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
  
  // Poke reaction state
  const pokeAnimationRef = useRef<number>(0);
  const lastPokeTimeRef = useRef<number>(0);

  useFrame((frameState, delta) => {
    if (!groupRef.current) return;

    const time = frameState.clock.elapsedTime;

    // Handle poke animation
    if (pokeReaction && time - lastPokeTimeRef.current < 2) {
      pokeAnimationRef.current = Math.max(0, pokeAnimationRef.current - delta * 2);
      
      // Poke reaction animations
      if (groupRef.current) {
        const bounceIntensity = pokeAnimationRef.current;
        groupRef.current.position.y = Math.sin(time * 15) * 0.2 * bounceIntensity;
        groupRef.current.rotation.z = Math.sin(time * 10) * 0.1 * bounceIntensity;
      }
      
      // Eyes get bigger during poke
      if (leftEyeRef.current && rightEyeRef.current) {
        const eyeScale = 1 + pokeAnimationRef.current * 0.5;
        leftEyeRef.current.scale.setScalar(eyeScale);
        rightEyeRef.current.scale.setScalar(eyeScale);
      }
      
      // Ears perk up
      if (leftEarRef.current && rightEarRef.current) {
        leftEarRef.current.rotation.x = -0.5 * pokeAnimationRef.current;
        rightEarRef.current.rotation.x = -0.5 * pokeAnimationRef.current;
      }
      
      // Tail goes crazy
      if (tailRef.current) {
        tailRef.current.rotation.z = Math.sin(time * 20) * 0.8 * pokeAnimationRef.current;
      }
    } else {
      // Normal animations when not being poked
      
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
    }
  });

  // Handle poke trigger
  useEffect(() => {
    if (pokeReaction) {
      pokeAnimationRef.current = 1;
      lastPokeTimeRef.current = performance.now() / 1000;
    }
  }, [pokeReaction]);

  const handleClick = () => {
    if (onPoke) {
      onPoke();
    }
  };

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
    <group 
      ref={groupRef} 
      castShadow 
      receiveShadow
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Head */}
      <Sphere ref={headRef} args={[1, 32, 32]} position={[0, 0.5, 0]} castShadow>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      
      {/* Cat Ears */}
      <Cone ref={leftEarRef} args={[0.3, 0.6, 8]} position={[-0.5, 1.2, 0]} rotation={[0, 0, -0.3]} castShadow>
        <meshPhongMaterial color={getMainColor()} />
      </Cone>
      <Cone ref={rightEarRef} args={[0.3, 0.6, 8]} position={[0.5, 1.2, 0]} rotation={[0, 0, 0.3]} castShadow>
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
      <Sphere ref={bodyRef} args={[1.2, 32, 32]} position={[0, -1.2, 0]} scale={[1, 1.3, 0.9]} castShadow>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      
      {/* Chest/belly marking */}
      <Sphere args={[0.8, 32, 32]} position={[0, -1.2, 0.3]} scale={[1, 1.1, 0.5]}>
        <meshPhongMaterial color="#FFFFFF" />
      </Sphere>
      
      {/* Front paws */}
      <Sphere args={[0.25, 16, 16]} position={[-0.4, -2.2, 0.3]} castShadow>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      <Sphere args={[0.25, 16, 16]} position={[0.4, -2.2, 0.3]} castShadow>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      
      {/* Back paws */}
      <Sphere args={[0.3, 16, 16]} position={[-0.5, -2.2, -0.3]} castShadow>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      <Sphere args={[0.3, 16, 16]} position={[0.5, -2.2, -0.3]} castShadow>
        <meshPhongMaterial color={getMainColor()} />
      </Sphere>
      
      {/* Tail */}
      <Cylinder ref={tailRef} args={[0.15, 0.08, 2]} position={[0, -0.5, -1.2]} rotation={[0.5, 0, 0]} castShadow>
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

function EnvironmentEffects({ state }: { state: ConversationState }) {
  return (
    <>
      <Stars
        radius={100}
        depth={50}
        count={1000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
      <fog attach="fog" args={['#f0f0f0', 10, 50]} />
    </>
  );
}

export const Character3D: React.FC<Character3DProps> = ({ 
  state, 
  volume = 0, 
  onPoke, 
  pokeReaction 
}) => {
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 2, 8], fov: 50 }}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <DynamicLighting state={state} volume={volume} />
        <EnvironmentEffects state={state} />
        <FloatingParticles state={state} volume={volume} />
        <FloatingOrbs state={state} volume={volume} />
        <InteractiveGround state={state} />
        <CatCharacter 
          state={state} 
          volume={volume} 
          onPoke={onPoke}
          pokeReaction={pokeReaction}
        />
        <OrbitControls 
          enablePan={false} 
          enableZoom={true}
          minDistance={5}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={3 * Math.PI / 4}
          autoRotate={state === 'idle'}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};