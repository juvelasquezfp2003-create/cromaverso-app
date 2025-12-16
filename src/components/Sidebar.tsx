import { useState } from 'react';
import type { SavedWriting } from '../App'; // Importamos el tipo si es necesario, o lo redefinimos aquí

// Re-definición simple para evitar errores de importación si TS se queja
interface WritingItem {
  id: string;
  title: string;
  content: string;
  date: string;
  emotion: string;
}

const synonymDatabase: any = {
  ira: {
    directos: ['Enojo', 'Furia', 'Cólera', 'Rabia', 'Irritación', 'Indignación'],
    poeticos: ['Fuego en las venas', 'Tormenta ciega', 'Hiel', 'Volcán dormido', 'Ceniza ardiente']
  },
  tristeza: {
    directos: ['Pena', 'Melancolía', 'Depresión', 'Abatimiento', 'Pesar', 'Desconsuelo'],
    poeticos: ['Gris eterno', 'Invierno del alma', 'Lluvia silenciosa', 'Naufragio', 'Eco vacío']
  },
  amor: {
    directos: ['Cariño', 'Afecto', 'Pasión', 'Ternura', 'Adoración', 'Devoción'],
    poeticos: ['Luz de mañana', 'Refugio', 'Latido compartido', 'Dulce abismo', 'Sol de mis días']
  },
  neutral: {
    directos: ['Calma', 'Quietud', 'Silencio', 'Paz', 'Equilibrio'],
    poeticos: ['Lienzo en blanco', 'Susurro del viento', 'Aguas quietas', 'Espera sutil']
  }
};

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  text: string;
  setText: (text: string) => void;
  currentEmotion: string;
  // NUEVAS PROPS PARA BIBLIOTECA
  onSave: () => void;
  savedWritings: WritingItem[];
  onLoad: (writing: WritingItem) => void;
  onDelete: (id: string) => void;
}

function Sidebar({ isOpen, setIsOpen, text, setText, currentEmotion, onSave, savedWritings, onLoad, onDelete }: SidebarProps) {
  const [suggestions, setSuggestions] = useState<{directos: string[], poeticos: string[]} | null>(null);
  const [metaphor, setMetaphor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Ahora tenemos 3 pestañas: Sinónimos, Metáfora, y Biblioteca
  const [activeTab, setActiveTab] = useState<'synonyms' | 'metaphor' | 'library' | null>(null);

  const handleSynonyms = () => {
    setActiveTab('synonyms');
    setLoading(true);
    setSuggestions(null); 
    setTimeout(() => {
      const key = currentEmotion || 'neutral';
      const data = synonymDatabase[key] || synonymDatabase['neutral'];
      setSuggestions(data);
      setLoading(false);
    }, 600);
  };

  const handleMetaphor = () => {
    setActiveTab('metaphor');
    setLoading(true);
    setMetaphor(null);
    setTimeout(() => {
      const metaphors: any = {
        ira: "'Tu silencio fue la chispa que incendió mi bosque de calma.'",
        tristeza: "'Llevo tu ausencia como un abrigo de plomo en verano.'",
        amor: "'Eres la coma que le da sentido a mi párrafo desordenado.'",
        neutral: "'El tiempo pasaba lento, como miel cayendo de una cuchara.'"
      };
      setMetaphor(metaphors[currentEmotion] || metaphors['neutral']);
      setLoading(false);
    }, 800);
  };

  const handleLibrary = () => {
    setActiveTab('library');
  };

  // Función para obtener un emoji según la emoción guardada
  const getEmotionEmoji = (emotion: string) => {
    switch(emotion) {
      case 'ira': return '🔴';
      case 'tristeza': return '🔵';
      case 'amor': return '🩷';
      default: return '⚪';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-6 right-6 z-[60] p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
          isOpen ? 'bg-white/80 text-gray-800' : 'bg-white/40 text-gray-800 hover:bg-white/60'
        }`}
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white/80 backdrop-blur-2xl border-l border-white/50 shadow-2xl z-[50] transition-transform duration-500 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        <div className="p-8 mt-16 flex flex-col h-full">
          <h2 className="text-3xl font-serif text-gray-800 mb-2">Musa IA</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tono actual: <span className="font-bold capitalize text-indigo-600">{currentEmotion}</span>
          </p>

          {/* BOTÓN GUARDAR GRANDE */}
          <button
            onClick={onSave}
            className="w-full mb-6 py-3 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all font-medium flex items-center justify-center gap-2"
          >
            💾 Guardar Progreso Actual
          </button>
          
          <div className="space-y-3 shrink-0">
            <div className="grid grid-cols-2 gap-2">
                <button
                onClick={handleSynonyms}
                className={`p-3 rounded-xl transition-all text-center text-sm font-medium border ${
                    activeTab === 'synonyms' ? 'bg-gray-800 text-white' : 'bg-white/50 hover:bg-white/80'
                }`}
                >
                📖 Tesauro
                </button>
                <button
                onClick={handleMetaphor}
                className={`p-3 rounded-xl transition-all text-center text-sm font-medium border ${
                    activeTab === 'metaphor' ? 'bg-gray-800 text-white' : 'bg-white/50 hover:bg-white/80'
                }`}
                >
                ✨ Metáfora
                </button>
            </div>
            
            <button
              onClick={handleLibrary}
              className={`w-full p-3 rounded-xl transition-all text-left font-medium border flex items-center justify-between ${
                activeTab === 'library' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white/50 text-gray-800 hover:bg-white/80'
              }`}
            >
              <span>📚 Mi Biblioteca</span>
              <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{savedWritings.length}</span>
            </button>
          </div>

          <div className="mt-8 flex-1">
            {loading && (
              <div className="flex items-center justify-center h-20 space-x-2 animate-pulse">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              </div>
            )}

            {/* SECCIÓN DE BIBLIOTECA */}
            {activeTab === 'library' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {savedWritings.length === 0 ? (
                  <p className="text-center text-gray-500 italic mt-10">Tu biblioteca está vacía.</p>
                ) : (
                  savedWritings.map((writing) => (
                    <div key={writing.id} className="bg-white/60 p-4 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-serif font-bold text-gray-800">{writing.title}</h3>
                            <span title={`Emoción: ${writing.emotion}`}>{getEmotionEmoji(writing.emotion)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{writing.date} • {writing.content.slice(0, 30)}...</p>
                        
                        <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => onLoad(writing)}
                                className="flex-1 bg-indigo-100 text-indigo-700 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-200"
                            >
                                Cargar
                            </button>
                            <button 
                                onClick={() => onDelete(writing.id)}
                                className="px-3 bg-red-100 text-red-600 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* (Aquí siguen las secciones de Sinónimos y Metáforas del código anterior, se mantienen igual si copias todo este bloque) */}
            {suggestions && activeTab === 'synonyms' && !loading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white/40 p-5 rounded-2xl border border-white/50">
                  <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-3">Funcionales</h3>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.directos.map((word:string, i:number) => (
                      <span key={i} className="px-3 py-1 bg-white/60 rounded-lg text-sm text-gray-700 border border-white/40 cursor-pointer hover:bg-white hover:shadow-sm transition-all">{word}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5 rounded-2xl border border-indigo-100/50">
                  <h3 className="text-xs font-bold tracking-wider text-indigo-400 uppercase mb-3">Poéticos</h3>
                  <ul className="space-y-3">
                    {suggestions.poeticos.map((phrase:string, i:number) => (
                      <li key={i} className="flex items-start text-gray-700 text-sm italic"><span className="mr-2 text-indigo-300">✦</span>{phrase}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {metaphor && activeTab === 'metaphor' && !loading && (
              <div className="mt-4 p-6 rounded-2xl bg-white/40 border border-white/50 text-gray-800 text-lg font-serif italic leading-relaxed shadow-sm animate-in zoom-in-95 duration-500">
                {metaphor}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;