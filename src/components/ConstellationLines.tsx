// src/components/ConstellationLines.tsx

'use client';

import { useMemo } from 'react';
import { useAppStore, type Movie } from '@/lib/store';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

export default function ConstellationLines() {
  // CORREZIONE: Selezioniamo ogni valore singolarmente
  const selectedMovie = useAppStore((state) => state.selectedMovie);
  const movies = useAppStore((state) => state.movies);

  const lines = useMemo(() => {
    if (!selectedMovie || movies.length === 0) return [];
    const startPoint = new THREE.Vector3(selectedMovie.x, selectedMovie.y, selectedMovie.z);
    return selectedMovie.neighbor_ids
      .map(neighborId => {
        const neighborMovie = movies.find(m => m.id === neighborId);
        if (!neighborMovie) return null;
        const endPoint = new THREE.Vector3(neighborMovie.x, neighborMovie.y, neighborMovie.z);
        return { start: startPoint, end: endPoint, id: `${selectedMovie.id}-${neighborId}` };
      })
      .filter((line): line is { start: THREE.Vector3; end: THREE.Vector3; id: string; } => line !== null);
  }, [selectedMovie, movies]);

  return (
    <group>
      {lines.map(line => (
        <Line
          key={line.id}
          points={[line.start, line.end]}
          color="#00ffff"
          lineWidth={1.5}
          transparent
          opacity={0.6}
        />
      ))}
    </group>
  );
}