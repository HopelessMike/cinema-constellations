// src/components/SearchBar.tsx

'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from '@/components/ui/command';
import { useAppStore, type Movie } from '@/lib/store';

export default function SearchBar() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [query, setQuery] = useState('');
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Prendiamo l'azione per selezionare un film dal nostro store Zustand
  const selectMovie = useAppStore((state) => state.selectMovie);

  // Carichiamo tutti i film una sola volta
  useEffect(() => {
    fetch('/movies.json')
      .then((res) => res.json())
      .then((data) => setAllMovies(data));
  }, []);

  // Gestione della scorciatoia da tastiera (Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        searchContainerRef.current?.querySelector('input')?.focus();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  // Gestione del click fuori dal componente per chiudere i risultati
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleInputChange = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length > 0) {
      const filtered = allMovies
        .filter((movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 3);
      setFilteredMovies(filtered);
    } else {
      setFilteredMovies([]);
    }
  };

  const handleSelect = (movie: Movie) => {
    setQuery('');
    setFilteredMovies([]);
    setIsFocused(false);
    selectMovie(movie); // Usiamo l'azione dello store per aggiornare lo stato globale
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-10" ref={searchContainerRef}>
      <Command
        shouldFilter={false}
        className="bg-card/50 backdrop-blur-md border border-border/50 rounded-lg overflow-hidden"
      >
        <div className="flex items-center border-b border-border/50 pr-2">
            <CommandInput
              value={query}
              onValueChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              placeholder="Cerca un film..."
              className="text-lg text-foreground placeholder:text-muted-foreground border-0 focus:ring-0 bg-transparent"
            />
            <kbd className="bg-muted text-muted-foreground rounded px-1.5 py-0.5 text-xs">
                Ctrl+K
            </kbd>
        </div>
        
        {isFocused && (
          <CommandList>
            {query.length > 0 && filteredMovies.length === 0 && (
              <CommandEmpty>Nessun risultato trovato.</CommandEmpty>
            )}
            {filteredMovies.map((movie) => (
              <CommandItem
                key={movie.id}
                onSelect={() => handleSelect(movie)}
                value={movie.title}
                className="cursor-pointer data-[selected=true]:bg-accent/80"
              >
                <div className="flex items-center py-2">
                  <Image
                    src={movie.poster_path}
                    alt={`Locandina di ${movie.title}`}
                    width={40}
                    height={60}
                    className="w-10 h-auto rounded-sm mr-4"
                  />
                  <span className="text-foreground">{movie.title}</span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  );
}