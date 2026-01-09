import React, { useState } from 'react';
import { BookOpen, Sparkles, X, Save, Trash2, FileText, Copy } from 'lucide-react';
import { SavedWriting } from '../App';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  text: string;
  setText: (v: string) => void;
  currentEmotion: string;
  onSave: () => void;
  savedWritings: SavedWriting[];
  onLoad: (w: SavedWriting) => void;
  onDelete: (id: string) => void;
}

// --- BASE DE DATOS DE INSPIRACIÓN (TESAURO) ---
const emotionalThesaurus: Record<string, string[]> = {
  ira: [
    "Furia", "Cólera", "Rabia", "Indignación", "Arrebato", "Frenesí", 
    "Rencor", "Hostilidad", "Violencia", "Ardor", "Hiel", "Virulencia",
    "Estallido", "Bilis", "Encono", "Exasperación", "Impetu", "Irascibilidad"
  ],
  tristeza: [
    "Melancolía", "Pesadumbre", "Desolación", "Congoja", "Nostalgia", 
    "Abatimiento", "Languidez", "Aflicción", "Duelo", "Quebranto", 
    "Taciturno", "Sombrio", "Desamparo", "Vacío", "Pena", "Luto"
  ],
  amor: [
    "Pasión", "Ternura", "Devoción", "Embeleso", "Fascinación", 
    "Idilio", "Romance", "Afecto", "Cariño", "Adoración", 
    "Fervor", "Apego", "Encanto", "Dulzura", "Estima", "Querer"
  ],
  neutral: [
    "Calma", "Equilibrio", "Serenidad", "Paz", "Sosiego", 
    "Armonía", "Quietud", "Claridad", "Reflexión", "Contemplación",
    "Estabilidad", "Mesura", "Temple", "Plenitud", "Silencio"
  ]
};

// --- BASE DE DATOS DE METÁFORAS (CHISPAZOS CREATIVOS) ---
// Frases incompletas o evocadoras para desbloquear al escritor
const metaphorSparks: Record<string, string[]> = {
  ira: [
    "Era un volcán dormido bajo la piel...",
    "Sabía a hierro y ceniza en la boca...",
    "Como un cristal rompiéndose en la garganta...",
    "El fuego no quemaba, solo consumía el aire...",
    "Un grito ahogado que rasgaba el silencio...",
    "La sangre golpeaba como un martillo en las sienes..."
  ],
  tristeza: [
    "Como un océano sin orillas ni fondo...",
    "Una lluvia invisible que mojaba el alma...",
    "El eco de un nombre en una casa vacía...",
    "Pesaba como una piedra en el fondo del río...",
    "Un invierno que se instaló en el pecho...",
    "Caminar sobre vidrios con los pies descalzos..."
  ],
  amor: [
    "Como si la gravedad hubiera dejado de existir...",
    "Un incendio suave que no quema, pero ilumina...",
    "El mapa de sus manos era mi único destino...",
    "Florecer en medio de la nieve...",
    "El tiempo se detuvo en sus pestañas...",
    "Como encontrar agua en el desierto..."
  ],
  neutral: [
    "El susurro del viento entre las hojas secas...",
    "Un lago en calma reflejando el cielo...",
    "El paso lento de las horas en la tarde...",
    "Como una hoja en blanco esperando tinta...",
    "El silencio era un huésped amable...",
    "Respirar el aire frío de la mañana..."
  ]
};

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, setIsOpen, text, setText, currentEmotion, 
  onSave, savedWritings, onLoad, onDelete 
}) => {
  const [activeTab, setActiveTab] = useState<'thesaurus' | 'metaphor' | 'library'>('library');
  const [generatedMetaphor, setGeneratedMetaphor] = useState<string | null>(null);

  // Función para insertar texto en el editor
  const handleInsertText = (textToInsert: string) => {
    setText(text + " " + textToInsert);
  };

  // Función para generar una metáfora nueva
  const generateNewMetaphor = () => {
    const list = metaphorSparks[currentEmotion] || metaphorSparks['neutral'];
    const random = list[Math.floor(Math.random() * list.length)];
    setGeneratedMetaphor(random);
  };

  return (
    <>
      {/* --- BOTÓN FLOTANTE PARA ABRIR --- */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-6 right-6 z-50 p-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition-transform text-gray-800"
        >
          <BookOpen size={20} />
        </button>
      )}

      {/* --- SIDEBAR --- */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 md:w-96 bg-white/90 backdrop-blur-xl shadow-2xl z-50 transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* CABECERA */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-serif text-gray-800">Musa IA</h2>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
              Tono actual: <span className={`font-bold ${
                currentEmotion === 'ira' ? 'text-red-500' :
                currentEmotion === 'tristeza' ? 'text-blue-500' :
                currentEmotion === 'amor' ? 'text-pink-500' : 'text-gray-500'
              }`}>{currentEmotion}</span>
            </p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* NAVEGACIÓN (TABS) */}
        <div className="flex p-2 gap-2 bg-gray-50/50">
          <button 
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'library' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            📚 Biblioteca
          </button>
          <button 
            onClick={() => setActiveTab('thesaurus')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'thesaurus' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            📖 Tesauro
          </button>
          <button 
            onClick={() => setActiveTab('metaphor')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'metaphor' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            ✨ Metáfora
          </button>
        </div>

        {/* CONTENIDO SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* --- TAB: BIBLIOTECA --- */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              <button 
                onClick={onSave}
                className="w-full py-3 bg-gray-900 text-white rounded-xl shadow-md hover:bg-black transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Save size={18} /> Guardar Progreso
              </button>
              
              <div className="mt-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Tus Escritos</h3>
                {savedWritings.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 italic">
                    No hay escritos guardados aún.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedWritings.map((w) => (
                      <div key={w.id} className="group p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all flex justify-between items-start">
                        <div onClick={() => onLoad(w)} className="cursor-pointer flex-1">
                          <h4 className="font-serif text-gray-800 font-medium group-hover:text-indigo-600 transition-colors">{w.title}</h4>
                          <p className="text-xs text-gray-400 mt-1">{w.date} • {w.emotion}</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(w.id); }}
                          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- TAB: TESAURO CONTEXTUAL --- */}
          {activeTab === 'thesaurus' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl mb-6">
                <p className="text-sm text-indigo-800 leading-relaxed">
                  Aquí tienes palabras de alto impacto relacionadas con tu emoción actual: <strong>{currentEmotion}</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(emotionalThesaurus[currentEmotion] || emotionalThesaurus['neutral']).map((word, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleInsertText(word)}
                    className="p-3 text-left bg-white border border-gray-100 rounded-lg hover:border-indigo-300 hover:shadow-sm hover:text-indigo-700 transition-all text-gray-600 text-sm font-medium flex justify-between group"
                    title="Clic para insertar"
                  >
                    {word}
                    <Copy size={14} className="opacity-0 group-hover:opacity-100 text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* --- TAB: METÁFORAS (CHISPAZOS) --- */}
          {activeTab === 'metaphor' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-amber-100 text-amber-600 rounded-full mb-4">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-lg font-serif text-gray-800">Desbloqueo Creativo</h3>
                <p className="text-sm text-gray-500 mt-2 px-4">
                  Genera una frase inicial basada en {currentEmotion} y termina la historia tú mismo.
                </p>
              </div>

              {/* TARJETA DE METÁFORA */}
              {generatedMetaphor ? (
                <div className="p-6 bg-white border-2 border-amber-100 rounded-2xl shadow-sm relative group">
                   <p className="font-serif text-xl text-gray-700 italic leading-relaxed">
                     "{generatedMetaphor}"
                   </p>
                   <button 
                    onClick={() => handleInsertText(generatedMetaphor)}
                    className="mt-4 text-xs font-bold text-amber-600 uppercase tracking-widest hover:text-amber-800 flex items-center gap-2"
                   >
                     <Copy size={14} /> Insertar en texto
                   </button>
                </div>
              ) : (
                <div className="p-10 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
                  Dale al botón para inspirarte
                </div>
              )}

              <button
                onClick={generateNewMetaphor}
                className="mt-8 w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all font-medium flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Generar Nueva Idea
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Sidebar;