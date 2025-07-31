// src/components/DynamicUniverse.tsx

'use client';

import dynamic from 'next/dynamic';

// La modifica chiave è qui: .then(mod => mod.default)
const Universe = dynamic(
  () => import('@/components/Universe').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <p className="text-white text-center text-lg">Caricamento dell'universo...</p>,
  }
);

export default function DynamicUniverse() {
  return <Universe />;
}