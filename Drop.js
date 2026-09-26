/**
 * Cyber Neon Rogue - Pickups & Drop Engine
 * Manages Cyber Core (XP orbs), Nanite Repair Kits, and Overcharge Magnets.
 */

import { sound } from '../audio/SoundEngine.js';

export class Drop {
  constructor(x, y, type = 'exp', value = 10) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.type = type; // 'exp', 'health', 'magnet'
    this.value = value;
    this.radius = type === 'exp' ? 6 : 10;
    this.collected = false;
    this.pulse = Math.random() * Math.PI * 2;

    if (type === 'exp') {
      if (value >= 50) this.color = '#ffe600'; // Gold
      else if (value >= 20) this.color = '#9d00ff'; // Purple
      else this.color = '#00f3ff'; // Cyan
    } else if (type === 'health') {
      this.color = '#00ff66'; // Lime
    } else if (type === 'magnet') {
      this.color = '#ff007f'; // Magenta
    }
  }

  update(dt, player, allDrops, particleSystem) {
    if (this.collected) return;

    this.pulse += dt * 4;

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    // Magnet attraction
    const magnetRange = this.beingMagnetPulled ? 99999 : player.magnetRadius;

    if (dist < magnetRange) {
      const pullSpeed = 450 + (1 - dist / Math.max(magnetRange, 1)) * 350;
      this.vx = (dx / dist) * pullSpeed;
      this.vy = (dy / dist) * pullSpeed;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }

    // Check collision with player
    if (dist < player.radius + this.radius) {
      this.collected = true;

      if (this.type === 'exp') {
        sound.playPickup(Math.floor(this.value / 10));
        player.addExp(this.value, null);
        particleSystem.spawnSparks(this.x, this.y, this.color, 4, 2);
      } else if (this.type === 'health') {
        player.heal(35, particleSystem);
        sound.playPickup(4);
      } else if (this.type === 'magnet') {
        // Trigger screen-wide magnet pull
        sound.playLevelUp();
        particleSystem.spawnShockwave(player.x, player.y, 350, '#ff007f', 0.5);
        for (const drop of allDrops) {
          if (drop.type === 'exp') {
            drop.beingMagnetPulled = true;
          }
        }
      }
    }
  }

  render(ctx, camera) {
    if (this.collected) return;
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);

    const pulseSize = Math.sin(this.pulse) * 1.5;

    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    if (this.type === 'exp') {
      // Diamond shaped cyber core
      ctx.beginPath();
      ctx.moveTo(0, -this.radius - pulseSize);
      ctx.lineTo(this.radius + pulseSize, 0);
      ctx.moveTo(0, this.radius + pulseSize);
      ctx.lineTo(-this.radius - pulseSize, 0);
      ctx.closePath();
      ctx.fill();
    } else if (this.type === 'health') {
      // Glowing green health cross
      ctx.fillRect(-2.5, -8, 5, 16);
      ctx.fillRect(-8, -2.5, 16, 5);
    } else if (this.type === 'magnet') {
      // Glowing horseshoe magnet / ring
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + pulseSize, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
