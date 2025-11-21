
import React, { useState, useEffect, useRef } from 'react';
import { DownloadIcon } from './DownloadIcon';
import { CodeIcon } from './CodeIcon';
import { PixelData } from '../utils/imageToAscii';

interface AsciiOutputProps {
  outputText: string;
  colorData?: PixelData[][] | null;
  error?: string | null;
  mode: 'text' | 'image';
  isBlockStyle?: boolean;
  isLoading?: boolean;
}

export const AsciiOutput: React.FC<AsciiOutputProps> = ({ outputText, colorData, error, mode, isBlockStyle, isLoading }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copiar Texto');
  const [downloadButtonText, setDownloadButtonText] = useState('PNG');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const useBlockStyle = mode === 'text' && isBlockStyle;
  const isColorMode = !!colorData;

  useEffect(() => {
    setCopyButtonText('Copiar Texto');
    setDownloadButtonText('Exportar PNG');
  }, [outputText, colorData]);

  // Canvas rendering logic for export
  useEffect(() => {
    const renderToCanvas = async () => {
        if (!outputText || error || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            // Configuration based on mode
            const fontSize = useBlockStyle ? 24 : (isColorMode ? 10 : 14); // Smaller font for colored images to look sharper
            const fontName = useBlockStyle ? 'VT323' : 'Courier New'; 
            const font = `${fontSize}px ${fontName}`;
            
            await document.fonts.load(font);
            ctx.font = font;

            const lines = outputText.split('\n');
            
            // Tight leading for color mode to resemble an image
            const lineHeightRatio = isColorMode ? 0.8 : 1.1;
            const charHeight = fontSize * lineHeightRatio; 
            const charWidth = ctx.measureText('M').width; 
            
            // Calculate dimensions
            let maxWidth = 0;
            lines.forEach(line => {
                const width = ctx.measureText(line).width;
                if (width > maxWidth) maxWidth = width;
            });

            const canvasWidth = maxWidth + 40;
            const canvasHeight = (lines.length * charHeight) + 40;
            
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            // Dark Theme Background
            ctx.fillStyle = '#0f172a'; 
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.textBaseline = 'top';
            ctx.font = font;

            if (isColorMode && colorData) {
                 colorData.forEach((row, y) => {
                    row.forEach((pixel, x) => {
                        ctx.fillStyle = pixel.color;
                        ctx.fillText(pixel.char, 20 + (x * charWidth), 20 + (y * charHeight));
                    });
                 });
            } else {
                // Text Color Monochrome
                ctx.fillStyle = '#22d3ee'; // Cyan-400
                if (mode === 'image') ctx.fillStyle = '#e2e8f0'; // Slate-200 for images

                lines.forEach((line, i) => {
                    ctx.fillText(line, 20, 20 + i * charHeight);
                });
            }

        } catch (e) {
            console.error("Render error", e);
        }
    };
    renderToCanvas();
  }, [outputText, colorData, error, useBlockStyle, mode, isColorMode]);


  const handleCopy = async () => {
    if (error || !outputText) return;
    try {
      await navigator.clipboard.writeText(outputText);
      setCopyButtonText('¡Copiado!');
      setTimeout(() => setCopyButtonText('Copiar Texto'), 2000);
    } catch (err) {
      setCopyButtonText('Error');
      setTimeout(() => setCopyButtonText('Copiar Texto'), 2000);
    }
  };

  const handleDownload = () => {
    if (error || !outputText || !canvasRef.current) return;
    
    setDownloadButtonText('Generando...');

    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) throw new Error("Canvas missing");

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `nexus-ascii-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setDownloadButtonText('Exportar PNG');
      } catch (e) {
        setDownloadButtonText('Error');
        setTimeout(() => setDownloadButtonText('Exportar PNG'), 2000);
      }
    }, 100);
  };
  
  // Dynamic font class selection
  const fontClass = useBlockStyle 
    ? 'font-pixel text-xl leading-none tracking-wide' 
    : 'font-mono text-[10px] md:text-xs leading-[1.1] tracking-tighter';
    
  // Specialized font class for color mode (smaller, tighter)
  const colorModeClass = 'font-mono text-[10px] leading-[0.8] tracking-tighter font-bold';

  return (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-end mb-3">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 animate-pulse ${isColorMode ? 'bg-fuchsia-500' : 'bg-emerald-500'}`}></span>
                Salida de Consola
            </h3>
            
            {!error && outputText && (
                <div className="flex space-x-2">
                    <button
                        onClick={handleCopy}
                        className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-200 rounded hover:bg-cyan-600 hover:text-white transition-colors"
                    >
                        <CodeIcon />
                        <span>{copyButtonText}</span>
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-200 rounded hover:bg-fuchsia-600 hover:text-white transition-colors"
                    >
                        <DownloadIcon />
                        <span>{downloadButtonText}</span>
                    </button>
                </div>
            )}
        </div>

        <div className="relative group flex-grow">
             {/* Decoration header for terminal */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-slate-800 rounded-t-lg flex items-center px-3 space-x-1.5 z-10 border border-slate-700 border-b-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                {isColorMode && <span className="ml-4 text-[10px] text-slate-500 font-mono">MODE: RGB_RENDER</span>}
            </div>

            <div className="bg-slate-950/90 rounded-lg border border-slate-700 pt-8 pb-4 px-4 h-[500px] relative shadow-inner overflow-hidden">
                <div className="h-full overflow-auto custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-cyan-500 font-mono space-y-2">
                            <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                            <span className="animate-pulse">PROCESANDO DATOS...</span>
                        </div>
                    ) : error ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-red-400 font-mono text-center p-4 border border-red-900/50 bg-red-900/10 rounded backdrop-blur-sm">
                                <div className="text-xl mb-2">⚠️ ERROR DE SISTEMA</div>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    ) : isColorMode && colorData ? (
                        <div className={`whitespace-pre inline-block min-w-full ${colorModeClass}`}>
                            {colorData.map((row, rowIndex) => (
                                <div key={rowIndex} className="block h-auto">
                                    {row.map((pixel, pixelIndex) => (
                                        <span key={pixelIndex} style={{ color: pixel.color }}>{pixel.char}</span>
                                    ))}
                                </div>
                            ))}
                        </div>
                    ) : outputText ? (
                         <pre className={`text-slate-300 whitespace-pre ${fontClass} selection:bg-fuchsia-500/30 inline-block min-w-full`}>
                            <code>{outputText}</code>
                        </pre>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600 font-mono text-sm opacity-50">
                            <span>Esperando entrada...</span>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Hidden canvas for export */}
            <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
        </div>
    </div>
  );
};
