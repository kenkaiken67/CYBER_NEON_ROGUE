/**
 * Cyber Neon Rogue - Application Bootstrap Entrypoint
 */

import { Game, GameState } from './core/Game.js';
import { sound } from './audio/SoundEngine.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);

  // Button Listeners
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const resumeBtn = document.getElementById('resume-btn');
  const toggleSoundBtn = document.getElementById('toggle-sound-btn');
  const toggleCrtBtn = document.getElementById('toggle-crt-btn');

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      game.startNewGame();
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      game.startNewGame();
    });
  }

  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      game.state = GameState.PLAYING;
      game.hud.togglePause(false);
    });
  }

  if (toggleSoundBtn) {
    toggleSoundBtn.addEventListener('click', () => {
      const isMuted = sound.toggleMute();
      toggleSoundBtn.textContent = isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
    });
  }

  if (toggleCrtBtn) {
    toggleCrtBtn.addEventListener('click', () => {
      game.hud.toggleCRT();
    });
  }

  // Start the render loop
  game.run();
});
