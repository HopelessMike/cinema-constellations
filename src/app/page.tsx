// src/app/page.tsx
'use client'; 
import dynamic from 'next/dynamic';
import SearchBar from '@/components/SearchBar';
import InfoPanel from '@/components/InfoPanel'; // Importiamo il pannello

const DynamicUniverse = dynamic(() => import('@/components/DynamicUniverse'), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">
    <p className="text-white text-lg">Caricamento dell'universo...</p>
  </div>,
});

// Questa pagina ora è solo un contenitore pulito
export default function HomePage() {
  return (
    <main className="w-screen h-screen bg-black">
      <SearchBar />
      <InfoPanel />
      <DynamicUniverse />
    </main>
  );
}