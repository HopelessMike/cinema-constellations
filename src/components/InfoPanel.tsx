// src/components/InfoPanel.tsx

'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useAppStore, type Movie } from '@/lib/store';
import { X, Loader } from 'lucide-react';

export default function InfoPanel() {
  // CORREZIONE: Selezioniamo ogni valore singolarmente per stabilità
  const selectedMovie = useAppStore((state) => state.selectedMovie);
  const selectMovie = useAppStore((state) => state.selectMovie);
  const movies = useAppStore((state) => state.movies);
  
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparisonTarget, setComparisonTarget] = useState<Movie | null>(null);

  useEffect(() => {
    setExplanation('');
    setError('');
    setComparisonTarget(null);
  }, [selectedMovie]);

  const handleCompare = async (neighborMovie: Movie) => {
    if (!selectedMovie) return;
    setIsLoading(true);
    setError('');
    setComparisonTarget(neighborMovie);
    try {
      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movie1: selectedMovie, movie2: neighborMovie }),
      });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setExplanation(data.explanation);
    } catch (err) {
      setError('Impossibile generare la spiegazione.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const neighborMovies = useMemo(() => {
    if (!selectedMovie) return [];
    return selectedMovie.neighbor_ids
      .map(id => movies.find(m => m.id === id))
      .filter((m): m is Movie => !!m);
  }, [selectedMovie, movies]);

  return (
    <div
      className={`absolute top-0 right-0 h-full w-full max-w-md bg-card/60 backdrop-blur-xl border-l border-border/50 p-6 text-foreground overflow-y-auto transition-transform duration-500 ease-in-out
      ${selectedMovie ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <button onClick={() => selectMovie(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
        <X size={24} />
      </button>

      {selectedMovie && (
        <>
          <div className="flex flex-col items-center text-center">
            <Image
              src={selectedMovie.poster_path}
              alt={`Locandina di ${selectedMovie.title}`}
              width={200}
              height={300}
              className="w-48 h-auto rounded-md mb-4"
            />
            <h2 className="text-2xl font-bold">{selectedMovie.title}</h2>
            <p className="text-sm text-muted-foreground mt-2">{selectedMovie.overview}</p>
          </div>
          <hr className="my-6 border-border/50" />
          <div>
            <h3 className="text-lg font-semibold mb-3">Confronta con:</h3>
            <div className="flex flex-col space-y-2">
              {neighborMovies.map(neighbor => (
                <button
                  key={neighbor.id}
                  onClick={() => handleCompare(neighbor)}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/80 transition-colors w-full text-left"
                >
                  <Image src={neighbor.poster_path} alt="" width={32} height={48} className="w-8 rounded-sm" />
                  <span>{neighbor.title}</span>
                </button>
              ))}
            </div>
          </div>
          {(isLoading || explanation || error) && <hr className="my-6 border-border/50" />}
          <div className="min-h-24">
            {isLoading && (
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Loader className="animate-spin" size={20} />
                <span>L'AI sta pensando...</span>
              </div>
            )}
            {error && <p className="text-destructive text-center">{error}</p>}
            {explanation && (
              <div>
                <h4 className="font-semibold mb-2">Analisi AI: {selectedMovie.title} vs {comparisonTarget?.title}</h4>
                <p className="text-muted-foreground text-sm italic">"{explanation}"</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}