
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AsciiOutput } from './AsciiOutput';
import { imageToAscii, AsciiResult, PixelData } from '../utils/imageToAscii';

export const ImageGenerator: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [outputText, setOutputText] = useState('');
    const [colorData, setColorData] = useState<PixelData[][] | null>(null);
    
    const [error, setError] = useState<string | null>(null);
    const [asciiWidth, setAsciiWidth] = useState(80); 
    const [invert, setInvert] = useState(false); 
    const [colorMode, setColorMode] = useState(false);
    const [charSet, setCharSet] = useState<'standard' | 'code'>('standard');
    
    const [fileName, setFileName] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const processImage = useCallback((src: string, width: number, shouldInvert: boolean, useColor: boolean, cSet: 'standard' | 'code') => {
        setOutputText('');
        setColorData(null);
        setError(null);
        const img = new Image();
        img.onload = () => {
            const canvas = canvasRef.current;
            const context = canvas?.getContext('2d', { willReadFrequently: true });
            if (!context || !canvas) {
                setError('Error de sistema: Contexto Canvas no disponible.');
                return;
            }
            try {
                const result: AsciiResult = imageToAscii(img, context, width, shouldInvert, useColor, cSet);
                setOutputText(result.text);
                setColorData(result.colorData);
            } catch (err) {
                setError('Error de procesamiento de imagen.');
                console.error(err);
            }
        };
        img.onerror = () => {
            setError('Error al cargar la imagen.');
        };
        img.src = src;
    }, []);

    useEffect(() => {
        if (imageSrc) {
            processImage(imageSrc, asciiWidth, invert, colorMode, charSet);
        }
    }, [imageSrc, asciiWidth, invert, colorMode, charSet, processImage]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
             setError("El archivo es demasiado grande (Máx 5MB)");
             return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            setImageSrc(result);
        };
        reader.onerror = () => setError('Error al leer el archivo.');
        reader.readAsDataURL(file);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Panel - 4 Columns */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-slate-800/50 p-5 rounded-lg border border-slate-700">
                    <h2 className="text-xl font-bold mb-4 text-white flex items-center">
                        <span className="w-2 h-6 bg-fuchsia-500 mr-3 rounded-sm"></span>
                        Configuración
                    </h2>
                    
                    <div className="space-y-6">
                        {/* Upload Area */}
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Archivo Fuente
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-lg hover:border-fuchsia-500/50 hover:bg-slate-800 transition-all group cursor-pointer relative">
                                <input 
                                    id="imageUpload" 
                                    name="imageUpload" 
                                    type="file" 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                    accept="image/*" 
                                    onChange={handleImageUpload} 
                                />
                                <div className="space-y-1 text-center pointer-events-none">
                                    <svg className="mx-auto h-10 w-10 text-slate-500 group-hover:text-fuchsia-400 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <p className="text-sm text-slate-400 group-hover:text-white">
                                        {fileName ? (
                                            <span className="text-fuchsia-400 font-mono">{fileName}</span>
                                        ) : (
                                            <span>Click o arrastra imagen</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Resolution Slider */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <label htmlFor="asciiWidth" className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    Resolución (Ancho)
                                </label>
                                <span className="text-xs font-mono text-fuchsia-400 bg-fuchsia-500/10 px-2 rounded">
                                    {asciiWidth} chars
                                </span>
                            </div>
                            <input
                                id="asciiWidth"
                                type="range"
                                min="20"
                                max="150" 
                                step="2"
                                value={asciiWidth}
                                onChange={(e) => setAsciiWidth(Number(e.target.value))}
                                disabled={!imageSrc}
                                className="w-full"
                            />
                        </div>

                        {/* Estilo de Caracteres */}
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Estilo de Símbolos</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setCharSet('standard')}
                                    className={`px-3 py-2 text-xs font-bold uppercase rounded border transition-all duration-200 ${
                                        charSet === 'standard'
                                        ? 'bg-slate-700 text-white border-slate-500'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    Estándar (@#%)
                                </button>
                                <button
                                    onClick={() => setCharSet('code')}
                                    className={`px-3 py-2 text-xs font-bold uppercase rounded border transition-all duration-200 ${
                                        charSet === 'code'
                                        ? 'bg-fuchsia-900/30 text-fuchsia-400 border-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.2)]'
                                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                    }`}
                                >
                                    Código ({`{/}`})
                                </button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3">
                            {/* Color Mode Toggle */}
                            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
                                <label htmlFor="colorToggle" className="text-sm text-slate-300 font-medium cursor-pointer select-none">
                                    <span className="flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 mr-2"></span>
                                        Modo Color
                                    </span>
                                    <p className="text-[10px] text-slate-500 ml-4">Colores originales de la imagen</p>
                                </label>
                                <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                                    <input 
                                        type="checkbox" 
                                        name="colorToggle" 
                                        id="colorToggle" 
                                        checked={colorMode}
                                        onChange={(e) => setColorMode(e.target.checked)}
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-slate-700 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-blue-500"
                                    />
                                    <label htmlFor="colorToggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-700 cursor-pointer"></label>
                                </div>
                            </div>

                             {/* Invert Toggle */}
                            <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded border border-slate-700">
                                <label htmlFor="invertToggle" className="text-sm text-slate-300 font-medium cursor-pointer select-none">
                                    Invertir brillo
                                    <p className="text-[10px] text-slate-500">Útil para fondo oscuro</p>
                                </label>
                                <div className="relative inline-block w-10 h-5 align-middle select-none transition duration-200 ease-in">
                                    <input 
                                        type="checkbox" 
                                        name="invertToggle" 
                                        id="invertToggle" 
                                        checked={invert}
                                        onChange={(e) => setInvert(e.target.checked)}
                                        className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-slate-700 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-5 checked:border-fuchsia-500"
                                    />
                                    <label htmlFor="invertToggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-700 cursor-pointer"></label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <canvas ref={canvasRef} className="hidden" aria-hidden="true"></canvas>
            </div>

            {/* Output Panel - 8 Columns */}
            <div className="lg:col-span-8 min-w-0">
                {imageSrc ? (
                    <AsciiOutput 
                        outputText={outputText} 
                        colorData={colorData}
                        error={error} 
                        mode="image" 
                    />
                ) : (
                    <div className="h-full min-h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/20 text-slate-500">
                        <div className="animate-pulse text-6xl opacity-20">?</div>
                        <p className="mt-4 font-mono text-sm">Sube una imagen para empezar...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
