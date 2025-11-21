import React from 'react';

export const Header: React.FC = () => (
  <header className="text-center mb-10">
    <div className="inline-block relative">
      <h1 className="text-6xl md:text-8xl font-pixel text-white mb-2 tracking-wider glitch-hover cursor-default select-none">
        NEXUS<span className="text-cyan-400">.ASCII</span>
      </h1>
      <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
    </div>
    
    <p className="mt-6 text-lg text-slate-400 font-mono max-w-2xl mx-auto border-l-2 border-cyan-500 pl-4 text-left md:text-center md:border-l-0 md:pl-0">
      <span className="text-cyan-500 font-bold">&gt; SYSTEM READY:</span> Transforma texto e imágenes en arte para terminales. 
      Optimizado para <span className="text-white bg-slate-800 px-1 rounded">GitHub READMEs</span> y documentación técnica.
    </p>
  </header>
);