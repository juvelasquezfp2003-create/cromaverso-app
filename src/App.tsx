import { useState, useEffect, useRef } from 'react';
import TextEditor from './components/TextEditor';
import Sidebar from './components/Sidebar';

// DEFINICIÓN DE UN ESCRITO
export interface SavedWriting {
  id: string;
  title: string;
  content: string;
  date: string;
  emotion: string;
}

// DICCIONARIO DE EMOCIONES (Rápido - 60 caracteres)
const detectEmotion = (text: string) => {
  const recentText = text.slice(-60).toLowerCase(); 
  if (recentText.match(/ira|furia|odio|rabia|fuego|sangre|grito|ardor|guerra|golpe|infierno|maldit|quemar|destruir|matar|enemigo|colera|volcán|ceniza/)) return 'ira';
  if (recentText.match(/triste|pena|llanto|soledad|gris|dolor|adios|vacío|olvido|lágrima|frío|noche|nostalgia|melancolía|depre|ausencia|roto|perder|jamás|nunca|lejos|final/)) return 'tristeza';
  if (recentText.match(/amor|calma|paz|luz|suave|beso|cariño|te amo|corazón|abrazo|pasión|dulce|brillo|cielo|flor|vida|juntos|amar|feliz|alegría|sonrisa|sol|éxito|bailar/)) return 'amor';
  return 'neutral';
};

// LINKS DE AUDIO
const audioTracks = {
  neutral: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  ira: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
  tristeza: 'https://cdn.pixabay.com/download/audio/2021/11/23/audio_035a336ce6.mp3',
  amor: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_3b27568582.mp3'
};

function App() {
  const [text, setText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // ESTADO DE LA BIBLIOTECA (Carga desde LocalStorage al iniciar)
  const [savedWritings, setSavedWritings] = useState<SavedWriting[]>(() => {
    const saved = localStorage.getItem('cromaverso_library');
    return saved ? JSON.parse(saved) : [];
  });

  // ESTADOS DE AUDIO
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentEmotion = detectEmotion(text);

  // --- FUNCIONES DE LA BIBLIOTECA ---

  const handleSave = () => {
    if (!text.trim()) return alert("El lienzo está vacío. Escribe algo primero.");
    
    const title = prompt("¿Qué título le pondrás a esta obra?") || "Sin título";
    const newWriting: SavedWriting = {
      id: Date.now().toString(),
      title,
      content: text,
      date: new Date().toLocaleDateString(),
      emotion: currentEmotion
    };

    const updatedLibrary = [newWriting, ...savedWritings];
    setSavedWritings(updatedLibrary);
    localStorage.setItem('cromaverso_library', JSON.stringify(updatedLibrary));
    alert("¡Guardado en tu biblioteca!");
  };

  const handleLoad = (writing: SavedWriting) => {
    if (text.length > 10) {
      if (!window.confirm("¿Reemplazar tu texto actual? Asegúrate de haber guardado.")) return;
    }
    setText(writing.content);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("¿Seguro que quieres borrar esta obra?")) return;
    const updatedLibrary = savedWritings.filter(w => w.id !== id);
    setSavedWritings(updatedLibrary);
    localStorage.setItem('cromaverso_library', JSON.stringify(updatedLibrary));
  };

  // --- FIN FUNCIONES BIBLIOTECA ---

  // EFECTO DE AUDIO
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
      audioRef.current.play().catch(e => console.log("Click para audio"));
    } else if (audioRef.current.paused) {
      audioRef.current.play().catch(e => console.log("Click para audio"));
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

  // CONFIGURACIÓN VIDRIO
  const glassOpacity = "bg-white/30"; 
  const glassBlur = "backdrop-blur-xl"; 

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F0EEE9]">
      <div 
        className="absolute inset-0 state-mega-gradient transition-all duration-[2000ms] ease-in-out"
        style={{ backgroundPosition: getBackgroundPosition(currentEmotion), backgroundSize: '200% 200%' }}
      />

      <button 
        onClick={toggleAudio}
        className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all shadow-sm text-gray-700 font-medium text-sm flex items-center gap-2"
      >
        {isMuted ? '🔇 Activar Sonido' : '🔊 Sonido Activado'}
      </button>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-4xl p-10 rounded-[30px] border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-2xl ${glassOpacity} ${glassBlur}`}>
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-5xl font-serif text-gray-800 mb-8 text-center tracking-wide">
              CromaVerso
            </h1>
            <div className="w-full">
              <TextEditor text={text} setText={setText} />
            </div>
          </div>
        </div>
      </div>

      {/* Pasamos las nuevas funciones a la Barra Lateral */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        text={text}
        setText={setText}
        currentEmotion={currentEmotion}
        // PROPS NUEVAS PARA GUARDADO
        onSave={handleSave}
        savedWritings={savedWritings}
        onLoad={handleLoad}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default App;