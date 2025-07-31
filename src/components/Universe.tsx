// src/components/Universe.tsx

'use client';

import { Suspense, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useAppStore, type Movie } from '@/lib/store';
import Stars from './Stars';
import ConstellationLines from './ConstellationLines';

function CameraAnimator() {
  const cameraTarget = useAppStore((state) => state.cameraTarget);
  const controlsRef = useRef<OrbitControlsImpl>(null!);

  useFrame((state) => {
    if (controlsRef.current) {
      const target = cameraTarget || new THREE.Vector3(0, 0, 100);
      state.camera.position.lerp(target, 0.025);
      const lookAtTarget = cameraTarget 
        ? new THREE.Vector3(cameraTarget.x, cameraTarget.y, cameraTarget.z - 5)
        : new THREE.Vector3(0, 0, 0);
      controlsRef.current.target.lerp(lookAtTarget, 0.025);
    }
  });

  return <OrbitControls ref={controlsRef} makeDefault />;
}

export default function Universe() {
  // CORREZIONE: Selezioniamo ogni valore singolarmente
  const movies = useAppStore((state) => state.movies);
  const setMoviesInStore = useAppStore((state) => state.setMovies);

  useEffect(() => {
    if (movies.length > 0) return;
    fetch('/movies.json')
      .then((res) => res.json())
      .then((data) => {
        const scaledData = data.map((movie: Movie) => ({
          ...movie,
          x: movie.x * 10,
          y: movie.y * 10,
          z: movie.z * 10,
        }));
        setMoviesInStore(scaledData);
      });
  }, [movies.length, setMoviesInStore]);

  if (movies.length === 0) return null;

  return (
    <Canvas camera={{ position: [0, 0, 100], fov: 75 }}>
      <color attach="background" args={['#00000a']} />
      <ambientLight intensity={0.1} />
      <CameraAnimator />
      <Suspense fallback={null}>
        <Stars />
        <ConstellationLines />
      </Suspense>
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} intensity={0.9} mipmapBlur />
        <Vignette eskil={false} offset={0.1} darkness={0.9} />
      </EffectComposer>
    </Canvas>
  );
}