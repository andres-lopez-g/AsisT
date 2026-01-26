import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleCloud = (props) => {
    const ref = useRef();
    const [hovered, setHovered] = useState(false);

    // Create 2000 random points in a sphere
    const [positions, originalPositions] = useMemo(() => {
        const count = 2000;
        const positions = new Float32Array(count * 3);
        const originalPositions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const theta = THREE.MathUtils.randFloatSpread(360);
            const phi = THREE.MathUtils.randFloatSpread(360);

            const x = THREE.MathUtils.randFloatSpread(10);
            const y = THREE.MathUtils.randFloatSpread(10) * 0.5; // Flatter spread
            const z = THREE.MathUtils.randFloatSpread(10);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;
        }

        return [positions, originalPositions];
    }, []);

    // Frame loop for animation
    useFrame((state) => {
        const { clock, mouse } = state;
        const time = clock.getElapsedTime();

        // Convert normalized mouse coordinates (-1 to 1) to world space approximation
        // Note: This is an approximation for performance since unprojecting every frame for every point is heavy
        const mouseX = mouse.x * 10;
        const mouseY = mouse.y * 10;

        const positionsArray = ref.current.geometry.attributes.position.array;

        for (let i = 0; i < 2000; i++) {
            // Current position
            let x = positionsArray[i * 3];
            let y = positionsArray[i * 3 + 1];
            let z = positionsArray[i * 3 + 2];

            // Base position (original)
            const ox = originalPositions[i * 3];
            const oy = originalPositions[i * 3 + 1];
            const oz = originalPositions[i * 3 + 2];

            // Wave movement
            const waveX = Math.sin(time * 0.2 + ox * 0.5) * 0.2;
            const waveY = Math.cos(time * 0.3 + oy * 0.5) * 0.2;

            // Interaction (Repulsion)
            const dx = mouseX - x;
            const dy = mouseY - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 3; // Radius of influence

            let forceX = 0;
            let forceY = 0;
            let forceZ = 0;

            if (dist < maxDist) {
                const force = (maxDist - dist) / maxDist;
                const angle = Math.atan2(dy, dx);
                forceX = -Math.cos(angle) * force * 2;
                forceY = -Math.sin(angle) * force * 2;
                forceZ = force * 2; // Also push back in Z
            }

            // Apply forces (spring back to original + wave + interaction)
            // Spring back
            x += (ox + waveX - x) * 0.05;
            y += (oy + waveY - y) * 0.05;
            z += (oz - z) * 0.05;

            // Apply interaction
            x += forceX;
            y += forceY;
            z += forceZ;

            // Update buffer
            positionsArray[i * 3] = x;
            positionsArray[i * 3 + 1] = y;
            positionsArray[i * 3 + 2] = z;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;

        // Slow rotation of the whole cloud
        ref.current.rotation.x = time / 20;
        ref.current.rotation.y = time / 25;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={positions} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#37352f" // Notion Dark Gray (matching theme)
                    size={0.03}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
};

const ParticlesBackground = () => {
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                {/* Ambient light for general visibility if we used standard material, but point material is self-illuminated mostly */}
                <ParticleCloud />
            </Canvas>
        </div>
    );
};

export default ParticlesBackground;
