import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas'; 
import TextEditor from './components/TextEditor';
import Sidebar from './components/Sidebar';

// TIPOS
export interface SavedWriting {
  id: string;
  title: string;
  content: string;
  date: string;
  emotion: string;
}

// 1. DICCIONARIO EMOCIONAL
const detectEmotion = (text: string) => {
  const recentText = text.slice(-60).toLowerCase(); 
  if (recentText.match(/ira|furia|odio|rabia|fuego|sangre|grito|ardor|guerra|golpe|infierno|maldit|quemar|destruir|matar|enemigo|colera|volcán|ceniza/)) return 'ira';
  if (recentText.match(/triste|pena|llanto|soledad|gris|dolor|adios|vacío|olvido|lágrima|frío|noche|nostalgia|melancolía|depre|ausencia|roto|perder|jamás|nunca|lejos|final/)) return 'tristeza';
  if (recentText.match(/amor|calma|paz|luz|suave|beso|cariño|te amo|corazón|abrazo|pasión|dulce|brillo|cielo|flor|vida|juntos|amar|feliz|alegría|sonrisa|sol|éxito|bailar/)) return 'amor';
  return 'neutral';
};

// 2. AUDIOS
const audioTracks = {
  neutral: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  ira: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3',
  tristeza: 'https://cdn.pixabay.com/download/audio/2021/11/23/audio_035a336ce6.mp3',
  amor: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_3b27568582.mp3'
};

function App() {
  const [text, setText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  
  // Estado para el Fondo (Fotos Reales)
  const [aiBackgroundImage, setAiBackgroundImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);      
  const postcardRef = useRef<HTMLDivElement>(null);     

  const [savedWritings, setSavedWritings] = useState<SavedWriting[]>(() => {
    const saved = localStorage.getItem('cromaverso_library');
    return saved ? JSON.parse(saved) : [];
  });

  const currentEmotion = detectEmotion(text);

  // --- FUNCIÓN FINAL: BÚSQUEDA AMPLIA DE FOTOS ---
  const generateAiBackground = () => {
    if (!text.trim()) return alert("Escribe unas palabras para inspirar la fotografía.");
    
    setIsGenerating(true);
    
    // LISTAS DE PALABRAS CLAVE
    const keywordsList = {
        ira: ['fire', 'storm', 'volcano', 'explosion', 'red_smoke', 'lightning', 'abstract_red'],
        tristeza: ['rain', 'fog', 'lonely', 'grey', 'winter', 'storm_sea', 'sad_art'],
        amor: ['rose', 'sunset', 'couple', 'romantic', 'paris', 'flowers', 'heart', 'wedding'],
        neutral: ['calm', 'book', 'coffee', 'minimal', 'zen', 'clouds', 'nature', 'art']
    };

    // 1. Detectamos la emoción
    const emotionKey = (currentEmotion in keywordsList) ? currentEmotion : 'neutral';
    
    // 2. OBTENER TODAS LAS PALABRAS (Nueva estrategia)
    // En lugar de elegir una, las unimos todas con comas.
    // Esto le da al banco de imágenes muchas más opciones para elegir.
    const list = keywordsList[emotionKey as keyof typeof keywordsList];
    const allKeywords = list.join(','); // Ejemplo: "rain,fog,lonely,grey..."

    // 3. Usamos la hora para forzar una imagen nueva
    const seed = Date.now();

    // URL FINAL (Usando el grupo de palabras)
    const imageUrl = `https://loremflickr.com/1280/720/${allKeywords}?lock=${seed}`;
    
    // Precarga
    const img = new Image();
    img.src = imageUrl;
    
    img.onload = () => {
        setAiBackgroundImage(imageUrl);
        setIsGenerating(false);
    };

    img.onerror = () => {
        console.error("Error cargando foto");
        // Si falla, un último intento con arte genérico
        const backupUrl = `https://loremflickr.com/1280/720/abstract,art?lock=${seed+1}`;
        setAiBackgroundImage(backupUrl);
        setIsGenerating(false);
    };
  };

  const clearAiBackground = () => {
    setAiBackgroundImage(null);
  };
  // ----------------------------------------

  const handleDownloadFull = async () => {
    if (!captureRef.current) return;
    const textarea = captureRef.current.querySelector('textarea');
    const cardElement = captureRef.current.querySelector('.backdrop-blur-2xl') as HTMLElement;
    const textContainer = textarea?.parentElement;
    const originalPlaceholder = textarea?.placeholder;
    const originalCardStyles = cardElement ? { ...cardElement.style } : null;

    let tempTextDiv: HTMLDivElement | null = null;
    if (textarea && textContainer) {
        tempTextDiv = document.createElement('div');
        const computedStyle = window.getComputedStyle(textarea);
        tempTextDiv.style.cssText = `
            font-family: ${computedStyle.fontFamily};
            font-size: ${computedStyle.fontSize};
            line-height: ${computedStyle.lineHeight};
            color: ${computedStyle.color};
            text-align: ${computedStyle.textAlign};
            white-space: pre-wrap;
            word-break: break-word;
            padding: ${computedStyle.padding};
            width: 100%;
        `;
        tempTextDiv.innerText = text; 
        textarea.style.display = 'none';
        textContainer.appendChild(tempTextDiv);
    }
    if (textarea) textarea.placeholder = ""; 
    if (cardElement) {
        cardElement.style.backgroundColor = "rgba(255, 255, 255, 0.95)"; 
        cardElement.style.boxShadow = "none";
        cardElement.style.height = 'auto';
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      const canvas = await html2canvas(captureRef.current, {
        scale: 2, 
        backgroundColor: null,
        useCORS: true, 
        height: captureRef.current.scrollHeight + 50,
        windowHeight: captureRef.current.scrollHeight + 50,
        onclone: (clonedDoc) => {
             const clonedCard = clonedDoc.querySelector('.backdrop-blur-2xl') as HTMLElement;
             if(clonedCard) clonedCard.style.height = 'auto';
        }
      });
      const link = document.createElement('a');
      link.download = `CromaVerso-Doc-${currentEmotion}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { console.error(e); alert("Error al guardar documento."); } 
    finally {
      if (textarea && originalPlaceholder) textarea.placeholder = originalPlaceholder;
      if (cardElement && originalCardStyles) {
          cardElement.style.backgroundColor = originalCardStyles.backgroundColor || '';
          cardElement.style.boxShadow = originalCardStyles.boxShadow || '';
          cardElement.style.height = originalCardStyles.height || '';
      }
      if (textarea && tempTextDiv && textContainer) {
        textarea.style.display = '';
        textContainer.removeChild(tempTextDiv);
      }
    }
  };

  const handleDownloadPostcard = async () => {
    if (!postcardRef.current) return;
    postcardRef.current.style.display = 'flex';
    try {
      const canvas = await html2canvas(postcardRef.current, {
        scale: 3, 
        backgroundColor: null, 
        useCORS: true 
      });
      const link = document.createElement('a');
      link.download = `CromaVerso-Postal-${currentEmotion}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) { console.error(e); alert("Error creando postal."); }
    finally {
      postcardRef.current.style.display = 'none';
    }
  };

  const handleSave = () => {
    if (!text.trim()) return alert("El lienzo está vacío.");
    const title = prompt("¿Título?") || "Sin título";
    const newWriting = { id: Date.now().toString(), title, content: text, date: new Date().toLocaleDateString(), emotion: currentEmotion };
    const updated = [newWriting, ...savedWritings];
    setSavedWritings(updated);
    localStorage.setItem('cromaverso_library', JSON.stringify(updated));
  };
  const handleLoad = (w: SavedWriting) => { if (text.length > 10 && !window.confirm("¿Reemplazar?")) return; setText(w.content); };
  const handleDelete = (id: string) => { if (!window.confirm("¿Borrar?")) return; setSavedWritings(savedWritings.filter(w => w.id !== id)); };

  useEffect(() => {
    if (isMuted) return;
    const newTrack = audioTracks[currentEmotion as keyof typeof audioTracks];
    if (!audioRef.current) { audioRef.current = new Audio(newTrack); audioRef.current.loop = true; audioRef.current.volume = 0.5; }
    if (audioRef.current.src !== newTrack) { audioRef.current.pause(); audioRef.current.src = newTrack; audioRef.current.play().catch(()=>{}); }
    else if (audioRef.current.paused) { audioRef.current.play().catch(()=>{}); }
  }, [currentEmotion, isMuted]);

  const toggleAudio = () => setIsMuted(!isMuted);
  const getBackgroundPosition = (emotion: string) => {
    switch (emotion) { case 'ira': return '0% 100%'; case 'tristeza': return '100% 100%'; case 'amor': return '100% 0%'; default: return '0% 0%'; }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F0EEE9]">
      
      {/* 1. ZONA VISIBLE (Editor) */}
      <div ref={captureRef} className="absolute inset-0 w-full h-full">
        
        {/* FONDO INTELIGENTE (FOTO) */}
        {aiBackgroundImage ? (
            <div 
                className="absolute inset-0 transition-all duration-1000 ease-in-out bg-cover bg-center"
                style={{ backgroundImage: `url(${aiBackgroundImage})` }}
            >
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            </div>
        ) : (
            <div 
            className="absolute inset-0 state-mega-gradient transition-all duration-[2000ms] ease-in-out"
            style={{ backgroundPosition: getBackgroundPosition(currentEmotion), backgroundSize: '200% 200%' }}
            />
        )}

        <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-4xl p-10 rounded-[30px] border border-white/50 shadow-sm backdrop-blur-2xl bg-white/10 transition-all duration-500">
            <div className="flex flex-col items-center justify-center relative">
              <h1 className="text-5xl font-serif text-gray-800 mb-8 text-center tracking-wide">CromaVerso</h1>
              <div className="w-full"><TextEditor text={text} setText={setText} /></div>
              <div className="absolute bottom-[-20px] right-0 opacity-0 md:opacity-0 print:opacity-60 text-[10px] text-gray-700 font-serif tracking-widest">HECHO EN CROMAVERSO</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ZONA OCULTA (PLANTILLA POSTAL) */}
      <div 
        ref={postcardRef}
        className="fixed top-0 left-0 hidden flex-col items-center justify-center p-12 text-center"
        style={{ width: '1080px', height: '1350px', zIndex: -10 }}
      >
         {aiBackgroundImage ? (
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${aiBackgroundImage})` }}>
                 {/* Capa oscura un poco más fuerte en la postal para que se lea bien el texto */}
                 <div className="absolute inset-0 bg-black/50"></div>
            </div>
         ) : (
            <div className="absolute inset-0 state-mega-gradient" 
                style={{ backgroundPosition: getBackgroundPosition(currentEmotion), backgroundSize: '200% 200%' }} 
            />
         )}
         
         <div className="relative z-10 p-16 border-2 border-white/30 rounded-3xl backdrop-blur-sm bg-white/5 flex flex-col items-center justify-center h-full w-full">
            <h2 className="text-6xl font-serif text-white mb-12 drop-shadow-xl">CromaVerso</h2>
            <div className="text-4xl text-white font-serif leading-relaxed italic max-h-[800px] overflow-hidden text-ellipsis px-8 drop-shadow-lg">
                "{text.length > 400 ? text.slice(0, 400) + '...' : text}"
            </div>
            <div className="mt-12 text-2xl text-white/90 font-medium tracking-widest uppercase flex items-center gap-3">
                <span className="h-[1px] w-10 bg-white/60"></span>
                {currentEmotion}
                <span className="h-[1px] w-10 bg-white/60"></span>
            </div>
         </div>
      </div>

      {/* --- BOTONES --- */}
      <button onClick={toggleAudio} className="fixed top-6 left-6 z-50 p-3 rounded-full bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all shadow-sm text-gray-700 font-medium text-sm flex items-center gap-2">
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* BOTÓN FOTO REAL (BÚSQUEDA AMPLIA) */}
      <button 
        onClick={aiBackgroundImage ? clearAiBackground : generateAiBackground}
        className={`fixed top-6 left-20 z-50 p-3 rounded-full backdrop-blur-md transition-all shadow-sm font-medium text-sm flex items-center gap-2 group ${
            isGenerating ? 'bg-indigo-200 animate-pulse cursor-wait' : 'bg-white/40 hover:bg-white/60 text-gray-700'
        }`}
        title="Cambiar fondo por Fotografía"
        disabled={isGenerating}
      >
        {isGenerating ? '📷 Buscando...' : (aiBackgroundImage ? '❌ Quitar Foto' : '📷 Fondo Real')}
      </button>

      <button onClick={handleDownloadFull} className="fixed top-6 left-52 z-50 p-3 rounded-full bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all shadow-sm text-gray-700 font-medium text-sm flex items-center gap-2 group" title="Guardar Documento">
        <span>📄</span>
      </button>

      <button onClick={handleDownloadPostcard} className="fixed top-6 left-64 z-50 p-3 rounded-full bg-indigo-100/80 backdrop-blur-md hover:bg-indigo-200 transition-all shadow-sm text-indigo-900 font-medium text-sm flex items-center gap-2 group" title="Crear Postal">
        <span className="group-hover:scale-110 transition-transform">🎨 Postal</span>
      </button>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} text={text} setText={setText} currentEmotion={currentEmotion} onSave={handleSave} savedWritings={savedWritings} onLoad={handleLoad} onDelete={handleDelete} />
    </div>
  );
}

export default App;