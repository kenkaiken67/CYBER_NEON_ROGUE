/**
 * Cyber Neon Rogue - Enemy AI & Types
 * Defines drone archetypes: Scout, Glitch Phantom, Juggernaut Mech, and the Apex Boss.
 */

import { sound } from '../audio/SoundEngine.js';

export class Enemy {
  constructor(x, y, type = 'scout', difficultyScale = 1.0) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.angle = 0;
    this.alive = true;
    this.isBoss = false;

    // Config by archetype
    switch (type) {
      case 'scout':
        this.radius = 12;
        this.maxHp = 22 * difficultyScale;
        this.speed = 170 + Math.random() * 40;
        this.damage = 12;
        this.expValue = 8;
        this.color = '#ff0055';
        this.scoreValue = 100;
        break;

      case 'phantom':
        this.radius = 16;
        this.maxHp = 50 * difficultyScale;
        this.speed = 130;
        this.damage = 18;
        this.expValue = 20;
        this.color = '#9d00ff';
        this.scoreValue = 250;
        this.phaseTimer = 0;
        this.isPhased = false;
        break;

      case 'juggernaut':
        this.radius = 24;
        this.maxHp = 160 * difficultyScale;
        this.speed = 85;
        this.damage = 30;
        this.expValue = 60;
        this.color = '#ffe600';
        this.scoreValue = 600;
        break;

      case 'boss':
        this.isBoss = true;
        this.radius = 48;
        this.maxHp = 1200 * difficultyScale;
        this.speed = 70;
        this.damage = 40;
        this.expValue = 350;
        this.color = '#ff007f';
        this.scoreValue = 5000;
        this.attackTimer = 0;
        this.bulletRingTimer = 0;
        break;
    }

    this.hp = this.maxHp;
    this.hitFlash = 0;
  }

  update(dt, player, enemyBullets, particleSystem) {
    if (!this.alive) return;

    if (this.hitFlash > 0) {
      this.hitFlash -= dt;
    }

    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    this.angle = Math.atan2(dy, dx);

    // Type-specific behaviors
    if (this.type === 'phantom') {
      this.phaseTimer += dt;
      if (this.phaseTimer > 3.0) {
        this.phaseTimer = 0;
        // Blink/dash forward towards player
        this.x += Math.cos(this.angle) * 120;
        this.y += Math.sin(this.angle) * 120;
        particleSystem.spawnSparks(this.x, this.y, '#9d00ff', 10, 4);
      }
    } else if (this.type === 'boss') {
      this.attackTimer += dt;
      this.bulletRingTimer += dt;

      // Boss bullet ring attack every 3 seconds
      if (this.bulletRingTimer >= 3.2) {
        this.bulletRingTimer = 0;
        this.fireBulletRing(enemyBullets, 12);
        sound.playShoot(350, 0.2);
        particleSystem.spawnShockwave(this.x, this.y, 65, '#ff007f', 0.3);
      }
    }

    // Move towards player
    if (dist > 5) {
      const vx = (dx / dist) * this.speed;
      const vy = (dy / dist) * this.speed;
      this.x += vx * dt;
      this.y += vy * dt;
    }
  }

  fireBulletRing(bulletArray, count = 10) {
    const angleStep = (Math.PI * 2) / count;
    for (let i = 0; i < count; i++) {
      const bAngle = i * angleStep + this.angle;
      bulletArray.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(bAngle) * 180,
        vy: Math.sin(bAngle) * 180,
        radius: 6,
        damage: 15,
        color: '#ff007f',
        life: 5.0
      });
    }
  }

  takeDamage(amount, particleSystem, isCrit = false) {
    this.hp -= amount;
    this.hitFlash = 0.08;

    particleSystem.spawnFloatingText(
      this.x, 
      this.y, 
      Math.round(amount), 
      isCrit ? '#ffe600' : '#00f3ff', 
      isCrit
    );
    particleSystem.spawnSparks(this.x, this.y, this.color, isCrit ? 10 : 4, 3);

    if (this.hp <= 0) {
      this.alive = false;
      sound.playExplosion(this.isBoss);
      particleSystem.spawnShockwave(this.x, this.y, this.radius * 2.5, this.color, 0.3);
      particleSystem.spawnSparks(this.x, this.y, this.color, this.isBoss ? 40 : 16, 5);
      return true; // Enemy died
    }
    return false;
  }

  render(ctx, camera) {
    if (!this.alive) return;
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);

    // Hit flash white
    if (this.hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.rotate(this.angle);

    ctx.strokeStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = 'rgba(10, 10, 20, 0.85)';

    switch (this.type) {
      case 'scout':
        // Fast triangle drone
        ctx.beginPath();
        ctx.moveTo(this.radius + 3, 0);
        ctx.lineTo(-this.radius, -this.radius * 0.8);
        ctx.lineTo(-this.radius * 0.4, 0);
        ctx.lineTo(-this.radius, this.radius * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;

      case 'phantom':
        // Diamond shaped stealth drone
        ctx.beginPath();
        ctx.moveTo(this.radius + 4, 0);
        ctx.lineTo(0, -this.radius);
        ctx.lineTo(-this.radius, 0);
        ctx.lineTo(0, this.radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Pulsing eye
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case 'juggernaut':
        // Heavy Octagon
        ctx.beginPath();
        const sides = 8;
        for (let i = 0; i < sides; i++) {
          const a = (i * 2 * Math.PI) / sides;
          const px = Math.cos(a) * this.radius;
          const py = Math.sin(a) * this.radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Inner heavy armor plates
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
        ctx.stroke();
        break;

      case 'boss':
        // Massive Cyber Overlord Core
        ctx.beginPath();
        const bossSpikes = 12;
        for (let i = 0; i < bossSpikes; i++) {
          const a = (i * 2 * Math.PI) / bossSpikes;
          const r = i % 2 === 0 ? this.radius : this.radius * 0.7;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Core eye
        ctx.fillStyle = '#ff0033';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();

    // Health bar for high HP enemies (Juggernaut)
    if (this.type === 'juggernaut' && this.hp < this.maxHp) {
      const barW = 34;
      const barH = 4;
      const hpRatio = Math.max(0, this.hp / this.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(screen.x - barW / 2, screen.y - this.radius - 12, barW, barH);
      ctx.fillStyle = '#ffe600';
      ctx.fillRect(screen.x - barW / 2, screen.y - this.radius - 12, barW * hpRatio, barH);
    }
  }
}
