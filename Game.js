/**
 * Cyber Neon Rogue - Master Game Loop & State Manager
 */

import { Camera } from './Camera.js';
import { Input } from './Input.js';
import { Player } from '../entities/Player.js';
import { WeaponManager } from '../entities/Weapon.js';
import { Drop } from '../entities/Drop.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { UpgradeSystem } from '../systems/UpgradeSystem.js';
import { WaveManager } from '../systems/WaveManager.js';
import { HUD } from '../ui/HUD.js';
import { sound } from '../audio/SoundEngine.js';

export const GameState = {
  START: 'START',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  UPGRADE: 'UPGRADE',
  GAMEOVER: 'GAMEOVER'
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = GameState.START;

    this.lastTime = 0;
    this.score = 0;
    this.kills = 0;
    this.arenaSize = 2400;

    // Subsystems
    this.camera = new Camera(canvas.width, canvas.height);
    this.input = new Input(canvas);
    this.particles = new ParticleSystem();
    this.upgrades = new UpgradeSystem();
    this.waveManager = new WaveManager();
    this.hud = new HUD();

    // Game Entities
    this.player = null;
    this.weaponManager = null;
    this.enemies = [];
    this.enemyBullets = [];
    this.drops = [];
    this.activeBoss = null;

    this.initResize();
    this.hud.showStartModal();
  }

  initResize() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.camera.resize(this.canvas.width, this.canvas.height);
    };
    window.addEventListener('resize', resize);
    resize();
  }

  startNewGame() {
    this.score = 0;
    this.kills = 0;
    this.enemies = [];
    this.enemyBullets = [];
    this.drops = [];
    this.activeBoss = null;

    this.player = new Player(0, 0);
    this.weaponManager = new WeaponManager();
    this.particles.clear();
    this.waveManager = new WaveManager();

    this.hud.hideStartModal();
    this.hud.hideGameOver();
    this.hud.togglePause(false);

    sound.ensureContext();
    sound.startBGM();

    this.state = GameState.PLAYING;
    this.lastTime = performance.now();
  }

  triggerLevelUp() {
    this.state = GameState.UPGRADE;
    const choices = this.upgrades.getRandomChoices(3, this.player, this.weaponManager);
    this.hud.showUpgradeModal(choices, (selectedUpgrade) => {
      selectedUpgrade.apply(this.player, this.weaponManager);
      this.particles.spawnShockwave(this.player.x, this.player.y, 160, '#00ff66', 0.4);
      this.state = GameState.PLAYING;
      this.lastTime = performance.now();
    });
  }

  handleBossSpawn(boss) {
    this.activeBoss = boss;
    this.particles.spawnShockwave(boss.x, boss.y, 250, '#ff007f', 0.6);
  }

  update(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    // Check system hotkeys (Pause, Mute, CRT)
    if (this.input.consumePause()) {
      if (this.state === GameState.PLAYING) {
        this.state = GameState.PAUSED;
        this.hud.togglePause(true);
      } else if (this.state === GameState.PAUSED) {
        this.state = GameState.PLAYING;
        this.hud.togglePause(false);
      }
    }

    if (this.input.consumeMute()) {
      sound.toggleMute();
    }

    if (this.input.consumeCrt()) {
      this.hud.toggleCRT();
    }

    // Only update gameplay if actively PLAYING
    if (this.state === GameState.PLAYING) {
      this.input.update();

      // 1. Update Player
      this.player.update(dt, this.input, this.camera, this.particles, this.arenaSize);
      this.camera.follow(this.player.x, this.player.y);
      this.camera.update();

      // Check Player Death
      if (this.player.hp <= 0) {
        this.state = GameState.GAMEOVER;
        sound.stopBGM();
        sound.playExplosion(true);
        this.hud.showGameOver({
          time: this.waveManager.formatTime(),
          score: this.score,
          kills: this.kills,
          level: this.player.level
        });
        return;
      }

      // Check Player Level Up
      if (this.player.exp >= this.player.expToNextLevel) {
        this.player.addExp(0, () => this.triggerLevelUp());
      }

      // 2. Update Weapons
      this.weaponManager.update(dt, this.player, this.enemies, this.camera, this.particles);

      // 3. Update Wave Director
      this.waveManager.update(
        dt, 
        this.player, 
        this.enemies, 
        this.camera, 
        this.particles, 
        (boss) => this.handleBossSpawn(boss)
      );

      // 4. Update Enemies
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        enemy.update(dt, this.player, this.enemyBullets, this.particles);

        // Check melee collision with player
        const distToPlayer = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
        if (distToPlayer < this.player.radius + enemy.radius) {
          this.player.takeDamage(enemy.damage * dt * 2.5, this.camera, this.particles);
        }

        // Clean up dead enemies & spawn drops
        if (!enemy.alive) {
          this.kills++;
          this.score += enemy.scoreValue;

          // Drop EXP Gem
          this.drops.push(new Drop(enemy.x, enemy.y, 'exp', enemy.expValue));

          // Rare drop chances (Health kit 3.5%, Magnet 1.5%)
          const dropRoll = Math.random();
          if (dropRoll < 0.035) {
            this.drops.push(new Drop(enemy.x + 10, enemy.y, 'health'));
          } else if (dropRoll < 0.05) {
            this.drops.push(new Drop(enemy.x - 10, enemy.y, 'magnet'));
          }

          if (enemy === this.activeBoss) {
            this.activeBoss = null;
            this.waveManager.bossActive = false;
            this.score += 10000;
            // Drop super loot cluster
            for (let k = 0; k < 6; k++) {
              this.drops.push(new Drop(enemy.x + (Math.random()*60-30), enemy.y + (Math.random()*60-30), 'exp', 50));
            }
            this.drops.push(new Drop(enemy.x, enemy.y, 'health'));
            this.drops.push(new Drop(enemy.x, enemy.y, 'magnet'));
          }

          this.enemies.splice(i, 1);
        }
      }

      // 5. Update Enemy Bullets
      for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
        const b = this.enemyBullets[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.life -= dt;

        // Collision with player
        const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
        if (dist < this.player.radius + b.radius) {
          this.player.takeDamage(b.damage, this.camera, this.particles);
          this.particles.spawnSparks(b.x, b.y, b.color, 6, 2);
          this.enemyBullets.splice(i, 1);
          continue;
        }

        if (b.life <= 0) {
          this.enemyBullets.splice(i, 1);
        }
      }

      // 6. Update Drops
      for (let i = this.drops.length - 1; i >= 0; i--) {
        const drop = this.drops[i];
        drop.update(dt, this.player, this.drops, this.particles);
        if (drop.collected) {
          this.drops.splice(i, 1);
        }
      }

      // 7. Update Particles & VFX
      this.particles.update(dt);

      // 8. Update HUD telemetry
      this.hud.update(
        this.player, 
        this.waveManager, 
        this.score, 
        this.kills, 
        this.activeBoss, 
        this.weaponManager
      );
    } else {
      // In menus / pause, still update particles slightly for nice background motion
      this.particles.update(dt * 0.5);
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Cyber Grid Background
    this.camera.renderBackground(this.ctx);

    // 2. Drops / Pickups
    for (const drop of this.drops) {
      drop.render(this.ctx, this.camera);
    }

    // 3. Enemy Bullets
    for (const b of this.enemyBullets) {
      const scr = this.camera.worldToScreen(b.x, b.y);
      this.ctx.save();
      this.ctx.fillStyle = b.color;
      this.ctx.shadowColor = b.color;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(scr.x, scr.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 4. Weapons & Projectiles
    if (this.weaponManager && this.player) {
      this.weaponManager.render(this.ctx, this.camera, this.player);
    }

    // 5. Enemies
    for (const enemy of this.enemies) {
      enemy.render(this.ctx, this.camera);
    }

    // 6. Player
    if (this.player) {
      this.player.render(this.ctx, this.camera);
    }

    // 7. Particle Effects & Floating Text
    this.particles.render(this.ctx, this.camera);

    // 8. Minimap Radar (Rendered in bottom right)
    if (this.player && this.state === GameState.PLAYING) {
      this.renderMinimap();
    }
  }

  renderMinimap() {
    const size = 110;
    const margin = 20;
    const x = this.canvas.width - size - margin;
    const y = this.canvas.height - size - margin - 60;
    const range = 1800; // Radar range

    this.ctx.save();
    this.ctx.translate(x, y);

    // Radar border & background
    this.ctx.fillStyle = 'rgba(10, 15, 25, 0.75)';
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    this.ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Radar sweep crosshair
    this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
    this.ctx.beginPath();
    this.ctx.moveTo(size / 2, 0);
    this.ctx.lineTo(size / 2, size);
    this.ctx.moveTo(0, size / 2);
    this.ctx.lineTo(size, size / 2);
    this.ctx.stroke();

    // Radar blips
    const center = size / 2;

    // Enemies blip (red dots)
    for (const e of this.enemies) {
      const dx = (e.x - this.player.x) / range * (size / 2);
      const dy = (e.y - this.player.y) / range * (size / 2);
      if (Math.hypot(dx, dy) < size / 2) {
        this.ctx.fillStyle = e.isBoss ? '#ff007f' : '#ff0055';
        this.ctx.beginPath();
        this.ctx.arc(center + dx, center + dy, e.isBoss ? 4 : 2, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    // Player blip (cyan dot in center)
    this.ctx.fillStyle = '#00f3ff';
    this.ctx.shadowColor = '#00f3ff';
    this.ctx.shadowBlur = 6;
    this.ctx.beginPath();
    this.ctx.arc(center, center, 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  run() {
    const loop = (timestamp) => {
      this.update(timestamp);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
