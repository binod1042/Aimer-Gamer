import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import ResultsScreen from './components/ResultsScreen';
import Button from './components/Button';
import { GameState, GameSettings, GameStats, DEFAULT_SETTINGS } from './types';
import { Activity, Pause, Play, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  
  // Live HUD state
  const [currentScore, setCurrentScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setGameStats(null);
    setCurrentScore(0);
    setTimeLeft(settings.duration);
  };

  const endGame = (stats: GameStats) => {
    setGameStats(stats);
    setGameState(GameState.FINISHED);
  };

  const togglePause = () => {
    if (gameState === GameState.PLAYING) {
      setGameState(GameState.PAUSED);
    } else if (gameState === GameState.PAUSED) {
      setGameState(GameState.PLAYING);
    }
  };

  const quitGame = () => {
    setGameState(GameState.MENU);
  };

  const updateHud = (score: number, time: number) => {
    setCurrentScore(score);
    setTimeLeft(Math.ceil(time));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden relative selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(15,23,42,0),rgba(2,6,23,1))]"></div>
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900/30 to-transparent"></div>
      </div>

      <main className="relative z-10 w-full h-full">
        {gameState === GameState.MENU && (
          <MainMenu 
            onStart={startGame} 
            settings={settings} 
            setSettings={setSettings} 
          />
        )}

        {/* Game Canvas stays mounted during PAUSE to preserve state */}
        {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
          <div className="w-full h-screen relative">
            <GameCanvas 
              settings={settings} 
              gameState={gameState} 
              onGameEnd={endGame}
              onUpdateStats={updateHud}
            />
            
            {/* HUD Overlay */}
            <div className="absolute top-0 left-0 w-full p-4 md:p-8 flex justify-between items-start pointer-events-none">
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Score</span>
                <span className="text-4xl font-mono font-bold text-white tabular-nums">{currentScore.toLocaleString()}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className={`text-2xl font-black tabular-nums transition-colors duration-300 ${timeLeft <= 10 ? 'text-red-500 scale-110' : 'text-cyan-400'}`}>
                  {timeLeft}
                </div>
                <div className="h-1 w-24 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-linear ${timeLeft <= 10 ? 'bg-red-500' : 'bg-cyan-500'}`} 
                    style={{ width: `${(timeLeft / settings.duration) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-4 items-start pointer-events-auto">
                <div className="flex flex-col items-end pointer-events-none">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">FPS</span>
                  <span className="text-sm font-mono text-green-400 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> 60
                  </span>
                </div>
                
                <button 
                  onClick={togglePause}
                  className="p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700/50 backdrop-blur-sm transition-all"
                  aria-label="Pause Game"
                >
                  <Pause className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Pause Menu Overlay */}
            {gameState === GameState.PAUSED && (
               <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center animate-in fade-in duration-200">
                 <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4">
                   <h2 className="text-3xl font-black text-white tracking-widest">PAUSED</h2>
                   <div className="flex flex-col w-full gap-3">
                     <Button onClick={togglePause} size="lg" className="w-full">
                       <Play className="w-4 h-4 mr-2" /> RESUME
                     </Button>
                     <Button onClick={quitGame} variant="secondary" className="w-full">
                       <LogOut className="w-4 h-4 mr-2" /> QUIT TO MENU
                     </Button>
                   </div>
                 </div>
               </div>
            )}
            
            {/* Mobile Touch Hint */}
            <div className="absolute bottom-8 left-0 w-full text-center pointer-events-none md:hidden opacity-50 animate-pulse">
              <span className="text-xs text-slate-500 uppercase tracking-widest">Tap targets quickly</span>
            </div>
          </div>
        )}

        {gameState === GameState.FINISHED && gameStats && (
          <ResultsScreen 
            stats={gameStats} 
            onRestart={startGame} 
            onHome={() => setGameState(GameState.MENU)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;