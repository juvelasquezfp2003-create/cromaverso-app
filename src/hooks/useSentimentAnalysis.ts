import { useEffect, useState } from 'react';

const sentimentKeywords = {
  anger: ['fuego', 'odio', 'rabia', 'grito', 'furia', 'ira', 'cólera', 'violencia', 'destrucción', 'maldito', 'enfado', 'rencor', 'venganza', 'desprecio'],
  sadness: ['llanto', 'pena', 'soledad', 'gris', 'triste', 'tristeza', 'llorar', 'lágrima', 'melancolía', 'dolor', 'pérdida', 'vacío', 'desconsuelo', 'desolado', 'abandonado'],
  love: ['beso', 'paz', 'suave', 'luz', 'amor', 'cariño', 'ternura', 'abrazo', 'corazón', 'pasión', 'afecto', 'dulce', 'romance', 'anhelo'],
  calm: ['calma', 'paz', 'tranquilo', 'sereno', 'silencio', 'suave', 'relajado', 'quieto', 'apacible', 'sosiego', 'equilibrio', 'armonía', 'reposo', 'descanso'],
  joy: ['feliz', 'alegría', 'contento', 'emocionado', 'maravilloso', 'hermoso', 'risa', 'sonrisa', 'celebrar', 'éxito', 'victoria', 'brillante', 'sol', 'esperanza']
};

const overlayColors = {
  anger: '#8B3A3A',
  sadness: '#5A7BA0',
  love: '#FFB3D9',
  calm: '#A8D8A8',
  joy: '#FFE680',
  default: 'rgba(255, 195, 160, 0.1)'
};

export function useSentimentAnalysis(text: string) {
  const [overlayColor, setOverlayColor] = useState(overlayColors.default);

  useEffect(() => {
    if (!text) {
      setOverlayColor(overlayColors.default);
      return;
    }

    const textLower = text.toLowerCase();
    const scores: Record<string, number> = {
      anger: 0,
      sadness: 0,
      love: 0,
      calm: 0,
      joy: 0
    };

    Object.entries(sentimentKeywords).forEach(([sentiment, keywords]) => {
      keywords.forEach(keyword => {
        const matches = textLower.match(new RegExp(`\\b${keyword}\\b`, 'g'));
        if (matches) {
          scores[sentiment] += matches.length;
        }
      });
    });

    const dominantSentiment = Object.entries(scores).reduce((prev, current) =>
      current[1] > prev[1] ? current : prev
    );

    if (dominantSentiment[1] > 0) {
      setOverlayColor(overlayColors[dominantSentiment[0] as keyof typeof overlayColors]);
    } else {
      setOverlayColor(overlayColors.default);
    }
  }, [text]);

  return overlayColor;
}
