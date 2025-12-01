import React, { useState } from 'react';
import { GameStats } from '../types';
import Button from './Button';
import { RefreshCw, Home, BrainCircuit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAiCoachingTips } from '../services/geminiService';

interface ResultsScreenProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ stats, onRestart, onHome }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleGetAiCoach = async () => {
    setLoadingAi(true);
    const tips = await getAiCoachingTips(stats);
    setAiAnalysis(tips);
    setLoadingAi(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-10 duration-500">
      
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">SESSION COMPLETE</h2>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 filter drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
          {stats.score.toLocaleString()}
        </div>
        <p className="text-slate-400 font-mono text-sm">FINAL SCORE</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <StatCard label="Accuracy" value={`${stats.accuracy.toFixed(1)}%`} subtext={`${stats.clickedTargets}/${stats.totalTargets} Hits`} />
        <StatCard label="Avg Reaction" value={`${Math.round(stats.avgReactionTime)}ms`} subtext="Speed" />
        <StatCard label="Misses" value={stats.missedClicks.toString()} subtext="Errors" />
        <StatCard label="Expired" value={stats.targetsExpired.toString()} subtext="Too Slow" />
      </div>

      {/* Charts */}
      <div className="w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 h-64">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Reaction Time History (ms)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={stats.reactionTimeHistory}>
            <XAxis dataKey="time" stroke="#475569" fontSize={10} tickFormatter={(val) => `${val}s`} />
            <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Coach Section */}
      <div className="w-full">
        {!aiAnalysis ? (
          <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-500/30 text-center">
            <BrainCircuit className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-indigo-100 mb-2">AI Performance Coach</h3>
            <p className="text-indigo-200/70 text-sm mb-6 max-w-md mx-auto">
              Get personalized analysis of your aim mechanics powered by Google Gemini.
            </p>
            <Button onClick={handleGetAiCoach} isLoading={loadingAi} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              ANALYZE PERFORMANCE
            </Button>
          </div>
        ) : (
          <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 animate-in fade-in zoom-in duration-300">
             <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-700">
               <BrainCircuit className="w-6 h-6 text-indigo-400" />
               <h3 className="font-bold text-indigo-100">Coach's Analysis</h3>
             </div>
             <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-line leading-relaxed">
               {aiAnalysis}
             </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 w-full md:w-auto">
        <Button onClick={onHome} variant="secondary" className="flex-1 md:flex-none">
          <Home className="w-4 h-4 mr-2" />
          MENU
        </Button>
        <Button onClick={onRestart} className="flex-1 md:flex-none">
          <RefreshCw className="w-4 h-4 mr-2" />
          PLAY AGAIN
        </Button>
      </div>

    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; subtext?: string }> = ({ label, value, subtext }) => (
  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 text-center">
    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {subtext && <div className="text-slate-600 text-xs mt-1">{subtext}</div>}
  </div>
);

export default ResultsScreen;