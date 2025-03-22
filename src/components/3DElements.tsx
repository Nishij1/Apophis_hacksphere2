import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Float } from '@react-three/drei';

export const DNAHelix = () => {
  const meshRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
    >
      <group ref={meshRef}>
        {Array.from({ length: 10 }).map((_, i) => (
          <group key={i} position={[0, i * 0.4 - 2, 0]} rotation={[0, (i * Math.PI) / 5, 0]}>
            <mesh position={[1, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[-1, 0, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#34D399" emissive="#10B981" emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </Float>
  );
};

export const FloatingPills = () => {
  return (
    <group>
      {Array.from({ length: 5 }).map((_, i) => (
        <Float
          key={i}
          speed={1 + Math.random()}
          rotationIntensity={0.5}
          floatIntensity={0.5}
          position={[
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
          ]}
        >
          <mesh>
            <capsuleGeometry args={[0.2, 0.4, 16, 16]} />
            <meshStandardMaterial 
              color="#F472B6"
              emissive="#EC4899"
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};