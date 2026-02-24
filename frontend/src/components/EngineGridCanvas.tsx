import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';

const GridParticles = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const linesRef = useRef<THREE.LineSegments>(null);
    const { invalidate, pointer } = useThree();

    const particleCount = 80;

    // Generate initial positions
    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 8;

            // #E27C37 (Orange)
            colors[i * 3] = 0.88;
            colors[i * 3 + 1] = 0.48;
            colors[i * 3 + 2] = 0.21;
        }
        return { positions, colors };
    }, []);

    // Lines based on distance
    const linePositions = useMemo(() => {
        const lines = [];
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < 2.0) {
                    lines.push(
                        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                        positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                    );
                }
            }
        }
        return new Float32Array(lines);
    }, [positions]);

    // Force updates on mouse move since frameloop="demand"
    useEffect(() => {
        const handleMouseMove = () => invalidate();
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [invalidate]);

    useFrame(() => {
        // Smoothly interpolate rotation to pointer position
        if (pointsRef.current && linesRef.current) {
            const targetX = pointer.x * 0.5;
            const targetY = pointer.y * 0.5;

            pointsRef.current.rotation.y += (targetX - pointsRef.current.rotation.y) * 0.05;
            pointsRef.current.rotation.x += (-targetY - pointsRef.current.rotation.x) * 0.05;

            linesRef.current.rotation.y = pointsRef.current.rotation.y;
            linesRef.current.rotation.x = pointsRef.current.rotation.x;
        }
    });

    return (
        <group>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={particleCount} array={colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.06} vertexColors sizeAttenuation transparent opacity={0.9} />
            </points>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={linePositions.length / 3} array={linePositions} itemSize={3} />
                </bufferGeometry>
                <lineBasicMaterial color="#006C67" transparent opacity={0.4} />
            </lineSegments>
        </group>
    );
};

export default function EngineGridCanvas() {
    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 0 }}>
            <Canvas
                frameloop="demand"
                camera={{ position: [0, 0, 4.5], fov: 60 }}
                style={{ background: 'transparent' }}
            >
                <fog attach="fog" args={['#ffffff', 2, 7]} />
                <GridParticles />
            </Canvas>
        </div>
    );
}
