import React, { useState } from 'react';
import { Header } from './components/Header';
import { TextGenerator } from './components/TextGenerator';
import { ImageGenerator } from './components/ImageGenerator';
import { Footer } from './components/Footer';

type GeneratorMode = 'text' | 'image';

const App: React.FC = () => {
  const [mode, setMode] = useState<GeneratorMode>('text');

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        <Header />

        {/* Main Glass Container */}
        <div className="relative group">
          {/* Animated Border Gradient */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 rounded-xl opacity-75 blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-slow"></div>
          
          <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-xl border border-slate-800 shadow-2xl">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 bg-slate-950/50 rounded-t-xl p-1">
              <button
                onClick={() => setMode('text')}
                className={`flex-1 py-3 text-sm md:text-base font-bold tracking-wide uppercase transition-all duration-300 rounded-lg ${
                  mode === 'text'
                    ? 'bg-slate-800 text-cyan-400 shadow-inner shadow-cyan-500/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className="mr-2">&gt;_</span> Texto a ASCII
              </button>
              <button
                onClick={() => setMode('image')}
                className={`flex-1 py-3 text-sm md:text-base font-bold tracking-wide uppercase transition-all duration-300 rounded-lg ${
                  mode === 'image'
                    ? 'bg-slate-800 text-fuchsia-400 shadow-inner shadow-fuchsia-500/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                }`}
              >
                <span className="mr-2">@</span> Imagen a ASCII
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8">
                <div className="animate-fade-in">
                  {mode === 'text' && <TextGenerator />}
                  {mode === 'image' && <ImageGenerator />}
                </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </main>
  );
};

export default App;