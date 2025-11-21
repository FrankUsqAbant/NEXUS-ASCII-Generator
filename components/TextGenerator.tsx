import React, { useState, useEffect, useCallback } from 'react';
import { AsciiOutput } from './AsciiOutput';
import figlet from '../utils/figlet';
import { useDebounce } from '../hooks/useDebounce';

const figletWithTypes = figlet as any;

// CDN Configuration
const FIGLET_CDN_BASE = 'https://unpkg.com/figlet@1.7.0/fonts/';

// Mapeo de fuentes: ID = Nombre de archivo en el CDN (sin .flf)
const fontStyles = [
  { id: 'Standard', name: 'Banner Clásico', isBlockStyle: false },
  { id: 'Doom', name: 'Doom Logo', isBlockStyle: false },
  { id: 'Cybermedium', name: 'Cyber Línea', isBlockStyle: false },
  { id: '3-D', name: 'Bloque 3D', isBlockStyle: true },
];

type BorderStyle = 'none' | 'simple' | 'double' | 'lines';

const borderStyles: { id: BorderStyle; name: string }[] = [
  { id: 'none', name: 'Sin Borde' },
  { id: 'simple', name: 'Simple ┌─┐' },
  { id: 'double', name: 'Doble ╔═╗' },
  { id: 'lines', name: 'Líneas ───' },
];

const applyBorder = (text: string | null, style: BorderStyle): string => {
  if (!text || style === 'none') return text || '';
  let lines = text.split('\n');
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
      lines.pop();
  }
  if (lines.length === 0) return '';
  
  const maxWidth = Math.max(...lines.map(line => line.length));
  const paddedLines = lines.map(line => line.padEnd(maxWidth));

  switch (style) {
    case 'simple':
      const top = '┌' + '─'.repeat(maxWidth + 2) + '┐';
      const bottom = '└' + '─'.repeat(maxWidth + 2) + '┘';
      return [top, ...paddedLines.map(l => `│ ${l} │`), bottom].join('\n');
    case 'double':
      const dTop = '╔' + '═'.repeat(maxWidth + 2) + '╗';
      const dBottom = '╚' + '═'.repeat(maxWidth + 2) + '╝';
      return [dTop, ...paddedLines.map(l => `║ ${l} ║`), dBottom].join('\n');
    case 'lines':
        const line = '─'.repeat(maxWidth);
        return [line, ...paddedLines, line].join('\n');
    default: return text;
  }
};

const toBlockArt = (text: string): string => {
  return text
    .replace(/#/g, '█')
    .replace(/[|/\\]/g, '▒')
    .replace(/_/g, '▒');
};

export const TextGenerator: React.FC = () => {
  const [inputText, setInputText] = useState('NEXUS');
  const [selectedBorder, setSelectedBorder] = useState<BorderStyle>('none');
  const [selectedFont, setSelectedFont] = useState<string>('Doom'); 
  const [outputText, setOutputText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const debouncedInputText = useDebounce(inputText, 500); // Aumentado debounce para dar tiempo al fetch

  // Función para descargar y parsear la fuente
  const loadFontFromCDN = async (fontName: string): Promise<void> => {
      // Si la fuente ya existe en memoria, no la descargamos de nuevo
      if (figletWithTypes.fonts[fontName]) {
          return;
      }

      try {
          const response = await fetch(`${FIGLET_CDN_BASE}${fontName}.flf`);
          if (!response.ok) {
              throw new Error(`Error CDN: ${response.statusText}`);
          }
          const fontData = await response.text();
          figletWithTypes.parseFont(fontName, fontData);
      } catch (err) {
          console.error(`Fallo al descargar fuente ${fontName}`, err);
          throw new Error(`No se pudo cargar la fuente ${fontName} desde el servidor.`);
      }
  };

  const generateAsciiArt = useCallback(async (text: string, border: BorderStyle, font: string) => {
    setIsGenerating(true);
    setError(null);
    
    if (!text) {
      setOutputText('');
      setIsGenerating(false);
      return;
    }

    try {
        // 1. Asegurar que la fuente está cargada (Lazy Loading)
        await loadFontFromCDN(font);

        // 2. Generar Texto
        const data = await new Promise<string>((resolve, reject) => {
            figletWithTypes.text(text, {
                font: font,
                width: 500, // Increased width to prevent premature wrapping
                whitespaceBreak: true
            }, (err: Error | null, result: string) => {
                if (err) reject(err);
                else resolve(result || '');
            });
        });

      // 3. Post-procesamiento
      let processedArt = data;
      const currentFontStyle = fontStyles.find(f => f.id === font);
      
      if (currentFontStyle?.isBlockStyle) {
        processedArt = toBlockArt(data);
      }
      
      const finalArt = applyBorder(processedArt, border);
      setOutputText(finalArt);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generando ASCII');
    } finally {
      setIsGenerating(false);
    }
  }, []);
  
  useEffect(() => {
    generateAsciiArt(debouncedInputText, selectedBorder, selectedFont);
  }, [debouncedInputText, selectedBorder, selectedFont, generateAsciiArt]);
  
  const currentFont = fontStyles.find(f => f.id === selectedFont);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700">
             <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                <span className="w-2 h-6 bg-cyan-500 mr-3 rounded-sm"></span>
                Parámetros
            </h2>

            <div className="space-y-5">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Input</label>
                    <input
                    type="text"
                    className="w-full bg-slate-900/80 border border-slate-600 rounded p-3 text-cyan-300 placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    placeholder="Escribe texto..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    maxLength={25}
                    />
                    <p className="text-[10px] text-slate-500 mt-1 text-right">{inputText.length}/25 caracteres</p>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipografía</label>
                    <div className="grid grid-cols-2 gap-2">
                    {fontStyles.map(({ id, name }) => (
                        <button
                        key={id}
                        onClick={() => setSelectedFont(id)}
                        className={`px-3 py-2 text-xs font-bold uppercase rounded border transition-all duration-200 ${
                            selectedFont === id
                            ? 'bg-cyan-900/30 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:border-slate-500'
                        }`}
                        >
                        {name}
                        </button>
                    ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Marco / Borde</label>
                    <div className="grid grid-cols-2 gap-2">
                    {borderStyles.map(({ id, name }) => (
                        <button
                        key={id}
                        onClick={() => setSelectedBorder(id)}
                        className={`px-3 py-2 text-xs font-bold uppercase rounded border transition-all duration-200 ${
                            selectedBorder === id
                            ? 'bg-purple-900/30 text-purple-400 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700 hover:border-slate-500'
                        }`}
                        >
                        {name}
                        </button>
                    ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
      
      {/* Output */}
      <div className="lg:col-span-8 min-w-0">
        <AsciiOutput 
          outputText={outputText} 
          error={error} 
          mode="text" 
          isBlockStyle={currentFont?.isBlockStyle} 
          isLoading={isGenerating} 
        />
      </div>
    </div>
  );
};