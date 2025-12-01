import React from 'react';
import { GameSettings } from '../types';
import Button from './Button';
import { Crosshair, Zap, Settings, Trophy, MousePointer2 } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  settings: GameSettings;
  setSettings: (s: GameSettings) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, settings, setSettings }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-4 space-y-8 animate-in fade-in zoom-in duration-500 overflow-y-auto">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block p-4 rounded-full bg-cyan-900/30 mb-2 border border-cyan-500/30">
          <Crosshair className="w-12 h-12 md:w-16 md:h-16 text-cyan-400" />
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
          AIMER GAMER
        </h1>
        <p className="text-slate-400 text-lg md:text-xl font-mono tracking-wide">
          PRO REFLEX TRAINING
        </p>
      </div>

      {/* Main Actions */}
      <div className="flex flex-col w-full max-w-xs gap-4">
        <Button onClick={onStart} size="lg" className="w-full text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-1">
          <Zap className="w-5 h-5 mr-2" />
          QUICK PLAY
        </Button>
      </div>

      {/* Quick Settings */}
      <div className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
        <div className="flex items-center gap-2 mb-6 text-slate-300 border-b border-slate-700/50 pb-2">
          <Settings className="w-5 h-5" />
          <h2 className="font-bold tracking-wide text-sm uppercase">Configuration</h2>
        </div>
        
        <div className="space-y-6">
          {/* Difficulty */}
          <div>
            <label className="flex justify-between text-xs font-mono text-slate-400 mb-2 uppercase">
              <span>Difficulty</span>
              <span className="text-cyan-400">{settings.difficulty}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['EASY', 'MEDIUM', 'HARD'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setSettings({ ...settings, difficulty: level })}
                  className={`py-2 px-1 text-xs font-bold rounded border transition-all ${
                    settings.difficulty === level 
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' 
                      : 'bg-slate-700/50 border-transparent text-slate-500 hover:bg-slate-700'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Slider */}
          <div>
             <label className="flex justify-between text-xs font-mono text-slate-400 mb-2 uppercase">
              <span>Duration</span>
              <span className="text-cyan-400">{settings.duration}s</span>
            </label>
            <input
              type="range"
              min="30"
              max="120"
              step="30"
              value={settings.duration}
              onChange={(e) => setSettings({...settings, duration: Number(e.target.value)})}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
            />
          </div>

          {/* Target Size Slider */}
          <div>
             <label className="flex justify-between text-xs font-mono text-slate-400 mb-2 uppercase">
              <span className="flex items-center gap-1"><MousePointer2 className="w-3 h-3"/> Target Size (Radius)</span>
              <span className="text-cyan-400">{settings.targetSize}px</span>
            </label>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={settings.targetSize}
              onChange={(e) => setSettings({...settings, targetSize: Number(e.target.value)})}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
            />
          </div>
        </div>
      </div>

      <div className="text-slate-600 text-xs font-mono flex items-center gap-2">
        <Trophy className="w-3 h-3" />
        <span>BEST SCORE (LOCAL): --</span>
      </div>

    </div>
  );
};

export default MainMenu;