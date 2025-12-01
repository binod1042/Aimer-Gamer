import React, { useRef, useEffect, useCallback } from 'react';
import { GameSettings, GameState, Target, Particle, GameStats } from '../types';
import { audioService } from '../services/audioService';

interface GameCanvasProps {
  settings: GameSettings;
  gameState: GameState;
  onGameEnd: (stats: GameStats) => void;
  onUpdateStats: (score: number, timeLeft: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ settings, gameState, onGameEnd, onUpdateStats }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const prevGameState = useRef<GameState>(GameState.MENU);
  
  // Game State Refs (Mutable for performance in game loop)
  const targetsRef = useRef<Target[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scoreRef = useRef(0);
  const clicksRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0); // Missed clicks
  const expiredRef = useRef(0); // Targets faded
  const reactionTimesRef = useRef<number[]>([]);
  const reactionHistoryRef = useRef<{time: number, value: number}[]>([]);
  const lastSpawnTimeRef = useRef(0);
  const targetIdCounter = useRef(0);
  const lastTickTimeRef = useRef(0); // For timer sound

  // Initialize/Reset Game
  const initGame = useCallback(() => {
    targetsRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    clicksRef.current = 0;
    hitsRef.current = 0;
    missesRef.current = 0;
    expiredRef.current = 0;
    reactionTimesRef.current = [];
    reactionHistoryRef.current = [];
    lastSpawnTimeRef.current = 0;
    targetIdCounter.current = 0;
    lastTickTimeRef.current = settings.duration;
    startTimeRef.current = performance.now();
    audioService.playStart();
  }, [settings.duration]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      if (prevGameState.current === GameState.PAUSED) {
        // RESUME LOGIC: Shift time references by the duration of the pause
        const now = performance.now();
        const pauseDuration = now - pauseStartTimeRef.current;
        startTimeRef.current += pauseDuration;
        lastSpawnTimeRef.current += pauseDuration; // Ensure spawn timer doesn't trigger instantly
        // Shift existing targets so they don't expire instantly
        targetsRef.current.forEach(t => t.createdAt += pauseDuration);
        
        // Note: Particles are frame-based (life -= 0.05), so they freeze naturally when loop stops. No shift needed.
      } else {
        // NEW GAME
        initGame();
      }
      requestRef.current = requestAnimationFrame(animate);
    } else if (gameState === GameState.PAUSED) {
      // PAUSE LOGIC
      cancelAnimationFrame(requestRef.current);
      pauseStartTimeRef.current = performance.now();
    } else {
      cancelAnimationFrame(requestRef.current);
    }

    prevGameState.current = gameState;
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, initGame]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        // Use dpr for crisp rendering on retina displays
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const spawnTarget = (width: number, height: number, now: number) => {
    const radius = settings.targetSize;
    const padding = radius + 20; // Keep away from edges
    
    // Simple random position
    const x = padding + Math.random() * (width - padding * 2);
    const y = padding + Math.random() * (height - padding * 2);

    targetsRef.current.push({
      id: targetIdCounter.current++,
      x,
      y,
      radius: 0, // Animate in
      maxRadius: radius,
      createdAt: now,
      lifetime: settings.difficulty === 'HARD' ? 1500 : (settings.difficulty === 'MEDIUM' ? 2000 : 3000)
    });
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = 2 + Math.random() * 2;
      particlesRef.current.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color
      });
    }
  };

  const animate = (time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Logic update
    const rect = canvas.getBoundingClientRect();
    const elapsedTime = (time - startTimeRef.current) / 1000;
    const timeLeft = Math.max(0, settings.duration - elapsedTime);
    
    // Timer Sound (last 5 seconds)
    const ceilTime = Math.ceil(timeLeft);
    if (ceilTime <= 5 && ceilTime > 0 && ceilTime !== lastTickTimeRef.current) {
      audioService.playTick();
      lastTickTimeRef.current = ceilTime;
    }

    // Check Game Over
    if (timeLeft <= 0) {
      audioService.playGameOver();
      const totalHits = hitsRef.current;
      const totalMisses = missesRef.current;
      const totalExpired = expiredRef.current;
      const totalClicks = clicksRef.current;
      
      const accuracy = totalClicks > 0 ? (totalHits / totalClicks) * 100 : 0;
      const avgReaction = reactionTimesRef.current.length > 0 
        ? reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length 
        : 0;

      onGameEnd({
        score: scoreRef.current,
        totalTargets: targetIdCounter.current,
        clickedTargets: totalHits,
        missedClicks: totalMisses,
        targetsExpired: totalExpired,
        accuracy,
        avgReactionTime: avgReaction,
        reactionTimeHistory: reactionHistoryRef.current
      });
      return;
    }

    // Update stats HUD
    onUpdateStats(scoreRef.current, timeLeft);

    // Spawning
    if (time - lastSpawnTimeRef.current > settings.spawnRate) {
      spawnTarget(rect.width, rect.height, time);
      lastSpawnTimeRef.current = time;
    }

    // Update Targets
    targetsRef.current.forEach(t => {
      // Grow animation
      if (t.radius < t.maxRadius) {
        t.radius += (t.maxRadius - t.radius) * 0.1;
      }
    });

    // Remove expired targets
    const initialCount = targetsRef.current.length;
    targetsRef.current = targetsRef.current.filter(t => time - t.createdAt < t.lifetime);
    if (targetsRef.current.length < initialCount) {
      expiredRef.current += (initialCount - targetsRef.current.length);
      audioService.playMiss(); // Play dull sound for expired targets too? Optional.
    }

    // Update Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // Rendering
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw Targets
    targetsRef.current.forEach(t => {
      const lifePercent = (time - t.createdAt) / t.lifetime;
      // Fade out near end
      const alpha = lifePercent > 0.8 ? 1 - (lifePercent - 0.8) * 5 : 1;
      
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`; // Cyan
      ctx.fill();
      
      // Inner circle
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
      ctx.fill();

      // Ring indicating time left
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius + 2, 0, Math.PI * 2 * (1 - lifePercent));
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Prevent interaction if paused
    if (gameState !== GameState.PLAYING) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    clicksRef.current++;

    // Hit detection (Iterate backwards to hit top-most if overlap)
    let hitIndex = -1;
    for (let i = targetsRef.current.length - 1; i >= 0; i--) {
      const t = targetsRef.current[i];
      const dist = Math.sqrt((x - t.x) ** 2 + (y - t.y) ** 2);
      if (dist <= t.radius) {
        hitIndex = i;
        break;
      }
    }

    if (hitIndex !== -1) {
      // Hit!
      const target = targetsRef.current[hitIndex];
      const reactionTime = performance.now() - target.createdAt;
      
      hitsRef.current++;
      scoreRef.current += Math.max(10, Math.floor(1000 - reactionTime)); // Score based on speed
      reactionTimesRef.current.push(reactionTime);
      reactionHistoryRef.current.push({
        time: Math.floor((performance.now() - startTimeRef.current)/1000),
        value: reactionTime
      });

      // Visual feedback
      createExplosion(target.x, target.y, '#06b6d4');
      audioService.playHit();
      
      // Remove target
      targetsRef.current.splice(hitIndex, 1);
    } else {
      // Miss
      missesRef.current++;
      scoreRef.current = Math.max(0, scoreRef.current - 50); // Penalty
      createExplosion(x, y, '#ef4444'); // Red explosion
      audioService.playMiss();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block touch-none cursor-crosshair active:cursor-crosshair"
      onPointerDown={handlePointerDown}
    />
  );
};

export default GameCanvas;