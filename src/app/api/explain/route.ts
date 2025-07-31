import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// 1. Inizializziamo il client di OpenAI fuori dal gestore della richiesta
// Questo è più efficiente perché non viene ricreato ad ogni chiamata.
// La chiave API viene letta in modo sicuro dalle variabili d'ambiente.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    // 2. Estrai i dati dal corpo della richiesta
    const body = await request.json();
    // Attendiamo l'intero oggetto film, non solo il titolo
    const { movie1, movie2 } = body;

    if (!movie1 || !movie2) {
      return NextResponse.json(
        { error: 'Dati dei film "movie1" e "movie2" mancanti' },
        { status: 400 }
      );
    }

    // 3. Prompt Engineering: creiamo le istruzioni per l'AI
    const systemPrompt = `Sei un critico cinematografico esperto e un brillante narratore. Il tuo stile è conciso, evocativo e profondo. Non usare mai più di 60 parole. Confronta i due film forniti, evidenziando una somiglianza tematica, stilistica o narrativa chiave in modo poetico. Inizia la frase direttamente, senza preamboli come "Entrambi i film..." o simili.`;
    
    const userPrompt = `Film 1: ${movie1.title} (${movie1.genres.join(', ')}). Sinossi: ${movie1.overview}\n\nFilm 2: ${movie2.title} (${movie2.genres.join(', ')}). Sinossi: ${movie2.overview}`;

    // 4. Chiamata all'API di OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Un ottimo modello per equilibrio tra costo e qualità
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7, // Controlla la "creatività" della risposta
      max_tokens: 150, // Limita la lunghezza della risposta generata
    });
    
    const explanation = completion.choices[0].message.content;

    if (!explanation) {
      return NextResponse.json(
        { error: "L'AI non è riuscita a generare una spiegazione." },
        { status: 500 }
      );
    }

    // 5. Restituiamo la spiegazione generata dall'AI
    return NextResponse.json({ explanation });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Errore interno del server durante la chiamata a OpenAI' },
      { status: 500 }
    );
  }
}