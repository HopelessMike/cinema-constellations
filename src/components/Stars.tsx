// src/components/Stars.tsx

'use client';

import { useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import * as THREE from 'three';

const defaultColor = new THREE.Color('#ffffff');
const selectedColor = new THREE.Color('#00ffff');
const neighborColor = new THREE.Color('#33aaff');

export default function Stars() {
  // CORREZIONE: Selezioniamo ogni valore singolarmente
  const movies = useAppStore((state) => state.movies);
  const selectedMovie = useAppStore((state) => state.selectedMovie);
  
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  useEffect(() => {
    if (!meshRef.current || movies.length === 0) return;
    for (let i = 0; i < movies.length; i++) {
        const { x, y, z } = movies[i];
        const matrix = new THREE.Matrix4().setPosition(x, y, z);
        meshRef.current.setMatrixAt(i, matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [movies]);

  useEffect(() => {
    if (!meshRef.current || movies.length === 0) return;
    for (let i = 0; i < movies.length; i++) {
      meshRef.current.setColorAt(i, defaultColor);
    }
    if (selectedMovie) {
      selectedMovie.neighbor_ids.forEach(neighborId => {
        const neighborIndex = movies.findIndex(m => m.id === neighborId);
        if(neighborIndex !== -1) meshRef.current.setColorAt(neighborIndex, neighborColor);
      });
      const selectedIndex = movies.findIndex(m => m.id === selectedMovie.id);
      if (selectedIndex !== -1) meshRef.current.setColorAt(selectedIndex, selectedColor);
    }
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [selectedMovie, movies]);

  if (movies.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, movies.length]}>
      <sphereGeometry args={[0.2, 16, 16]} />
      <meshBasicMaterial vertexColors />
    </instancedMesh>
  );
}