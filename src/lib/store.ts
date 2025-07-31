// src/lib/store.ts

import { create } from 'zustand';
import * as THREE from 'three';

// L'interfaccia Movie rimane la base per i nostri dati
export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  genres: string[];
  x: number;
  y: number;
  z: number;
  cluster_id: number;
  neighbor_ids: number[];
}

// Lo stato ora è più semplice e focalizzato
interface AppState {
  movies: Movie[];
  setMovies: (movies: Movie[]) => void;
  selectedMovie: Movie | null;
  selectMovie: (movie: Movie | null) => void;
  cameraTarget: THREE.Vector3 | null;
}

export const useAppStore = create<AppState>((set) => ({
  movies: [],
  setMovies: (movies) => set({ movies }),

  selectedMovie: null,
  cameraTarget: null,
  selectMovie: (movie) => {
    if (movie) {
      set({
        selectedMovie: movie,
        cameraTarget: new THREE.Vector3(movie.x, movie.y, movie.z + 5),
      });
    } else {
      // Quando deselezioniamo, torniamo alla visione d'insieme
      set({ 
        selectedMovie: null, 
        cameraTarget: new THREE.Vector3(0, 0, 100) // Posizione iniziale
      });
    }
  },
}));