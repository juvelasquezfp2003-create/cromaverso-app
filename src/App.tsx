import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas'; // Librería de fotos
import TextEditor from './components/TextEditor';
import Sidebar from './components/Sidebar';

// Definición de tipos para el guardado
export interface SavedWriting {
  id: string;
  title: string;
  content: string;
  date: string;
  emotion: string;
}

// 1. DICCIONARIO EMOCIONAL (Rápido)
const detectEmotion = (text: string) => {
  const recentText = text.slice(-60).toLowerCase(); 
  if (recentText.match(/ira|furia|odio|rabia|fuego|sangre|grito|ardor|guerra|golpe|infierno|maldit|quemar|destruir|matar|enemigo|colera|volcán|ceniza/)) return 'ira';
  if (recentText.match(/triste|pena|llanto|soledad|gris|dolor|adios|vacío|olvido|lágrima|frío|noche|nostalgia|melancolía|depre|ausencia|roto|perder|jamás|nunca|lejos|final/)) return 'tristeza';
  if (recentText.match(/amor|calma|paz|luz|suave|beso|cariño|te amo|corazón|abrazo|pasión|dulce|brillo|cielo|flor|vida|juntos|amar|feliz|alegría|sonrisa|sol|éxito|bailar/)) return 'amor';
  return 'neutral';
};

// 2. AUDIOS (Recuerda poner tus propios links si estos caducan)
const audioTracks = {
  neutral: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  ira: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
  tristeza: 'https://cdn.pixabay.com/download/audio/2021/11/23/audio_035a336ce6.mp3',
  amor: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_3b27568582.mp3'
};

function App() {
  const [text, setText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Referencia para la "Cámara"
  const captureRef = useRef<HTMLDivElement>(null);

  // Carga de Biblioteca
  const [savedWritings, setSavedWritings] = useState<SavedWriting[]>(() => {
    const saved = localStorage.getItem('cromaverso_library');
    return saved ? JSON.parse(saved) : [];
  });

  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentEmotion = detectEmotion(text);

  // --- FUNCIÓN FOTOGRÁFICA DE ALTA CALIDAD ---
  const handleDownloadImage = async () => {
    if (!captureRef.current) return;
    
    // Ocultar placeholder temporalmente
    const textarea = document.querySelector('textarea');
    const originalPlaceholder = textarea?.placeholder;
    if (textarea) textarea.placeholder = "";

    try {
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true,
        scale: 4, // <--- AQUÍ ESTÁ EL CAMBIO: Calidad Ultra HD (4x)
        backgroundColor: null, // Mantiene transparencias si las hay
        logging: false
      });

      // Descarga automática
      const link = document.createElement('a');
      link.download = `CromaVerso-${currentEmotion}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png', 1.0); // Calidad máxima 1.0
      link.click();
    } catch (error) {
      console.error("Error al capturar:", error);
      alert("Error al generar la imagen. Intenta de nuevo.");
    } finally {
      // Restaurar placeholder
      if (textarea && originalPlaceholder) textarea.placeholder = originalPlaceholder;
    }
  };
  // ---------------------------------------------

  const handleSave = () => {
    if (!text.trim()) return alert("El lienzo está vacío.");
    const title = prompt("¿Título de la obra?") || "Sin título";
    const newWriting: SavedWriting = {
      id: Date.now().toString(),
      title,
      content: text,
      date: new Date().toLocaleDateString(),
      emotion: currentEmotion
    };
    const updated = [newWriting, ...savedWritings];
    setSavedWritings(updated);
    localStorage.setItem('cromaverso_library', JSON.stringify(updated));
  };

  const handleLoad = (w: SavedWriting) => {
    if (text.length > 10 && !window.confirm("¿Reemplazar actual?")) return;
    setText(w.content);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("¿Borrar permanentemente?")) return;
    const updated = savedWritings.filter(w => w.id !== id);
    setSavedWritings(updated);
    localStorage.setItem('cromaverso_library', JSON.stringify(updated));
  };

  // Efecto de Audio
  useEffect(() => {
    if (isMuted) return;
    const newTrack = audioTracks[currentEmotion as keyof typeof audioTracks];
    if (!audioRef.current) {
      audioRef.current = new Audio(newTrack);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.5;
    }
    if (audioRef.current.src !== newTrack) {
      audioRef.current.pause();
      audioRef.current.src = newTrack;
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentEmotion, isMuted]);

  const toggleAudio = () => {
    if (isMuted) {
      setIsMuted(false);
      if (audioRef.current) audioRef.current.play();
    } else {
      setIsMuted(true);
      if (audioRef.current) audioRef.current.pause();
    }
  };

  const getBackgroundPosition = (emotion: string) => {
    switch (emotion) {
      case 'ira': return '0% 100%';
      case 'tristeza': return '100% 100%';
      case 'amor': return '100% 0%';
      default: return '0% 0%';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F0EEE9]">
      
      {/* ZONA DE CAPTURA (Lo que saldrá en la foto) */}
      <div ref={captureRef} className="absolute inset-0 w-full h-full">
        {/* Fondo Animado */}
        <div 
          className="absolute inset-0 state-mega-gradient transition-all duration-[2000ms] ease-in-out"
          style={{ backgroundPosition: getBackgroundPosition(currentEmotion), backgroundSize: '200% 200%' }}
        />

        {/* Tarjeta Central */}
        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl p-10 rounded-[30px] border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl bg-white/30 transition-all duration-500">
            <div className="flex flex-col items-center justify-center relative">
              <h1 className="text-5xl font-serif text-gray-800 mb-8 text-center tracking-wide">
                CromaVerso
              </h1>
              <div className="w-full">
                <TextEditor text={text} setText={setText} />
              </div>
              {/* Marca de agua pequeña */}
              <div className="absolute bottom-[-25px] right-0 opacity-0 md:opacity-0 print:opacity-60 text-[10px] text-gray-700 font-serif tracking-widest">
                HECHO EN CROMAVERSO
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* FIN ZONA CAPTURA */}

      {/* --- CONTROLES DE UI (No salen en la foto) --- */}
      
      {/* Botón Audio */}
      <button 
        onClick={toggleAudio}
        className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all shadow-sm text-gray-700 font-medium text-sm flex items-center gap-2"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Botón Descargar Imagen (Con icono de cámara) */}
      <button 
        onClick={handleDownloadImage}
        className="fixed top-6 left-24 z-50 p-3 rounded-full bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all shadow-sm text-gray-700 font-medium text-sm flex items-center gap-2 group"
        title="Descargar imagen HD"
      >
        <span className="group-hover:scale-110 transition-transform">📷</span>
        <span className="hidden md:inline">Guardar Imagen</span>
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        text={text}
        setText={setText}
        currentEmotion={currentEmotion}
        onSave={handleSave}
        savedWritings={savedWritings}
        onLoad={handleLoad}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;