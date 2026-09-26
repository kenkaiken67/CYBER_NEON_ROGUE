/**
 * Cyber Neon Rogue - Player Entity
 * Handles cyber operative stats, movement, dash with i-frames, shield regeneration,
 * experience points, and neon vector rendering.
 */

import { sound } from '../audio/SoundEngine.js';

export class Player {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 16;
    this.angle = 0;

    // Health & Shields
    this.maxHp = 100;
    this.hp = 100;
    this.maxShield = 50;
    this.shield = 50;
    this.shieldRechargeDelay = 3.5; // seconds before shield starts regenerating
    this.shieldTimer = 0;
    this.shieldRegenRate = 18; // shield points per second

    // Movement & Dash
    this.baseSpeed = 240; // px/sec
    this.speedMult = 1.0;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashDuration = 0.18;
    this.dashSpeed = 750;
    this.dashCooldown = 2.2;
    this.dashCooldownTimer = 0;
    this.dashDirX = 0;
    this.dashDirY = 0;

    // Invulnerability
    this.invulnerableTimer = 0;

    // Progression
    this.level = 1;
    this.exp = 0;
    this.expToNextLevel = 25;
    this.magnetRadius = 140;

    // Combat Multipliers
    this.damageMult = 1.0;
    this.fireRateMult = 1.0;
    this.projectileSpeedMult = 1.0;
    this.critChance = 0.08; // 8% base
    this.critMultiplier = 2.0;

    // Visual animation states
    this.shieldPulse = 0;
    this.trailSpawnTimer = 0;
  }

  update(dt, input, camera, particleSystem, arenaSize) {
    // 1. Dash cooldown & active dash logic
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= dt;
    }

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vx = this.dashDirX * this.dashSpeed;
      this.vy = this.dashDirY * this.dashSpeed;

      // Spawn dash ghost trails
      this.trailSpawnTimer += dt;
      if (this.trailSpawnTimer > 0.03) {
        this.trailSpawnTimer = 0;
        particleSystem.spawnDashTrail(this.x, this.y, this.radius, this.angle, '#00f3ff');
      }

      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    } else {
      // Normal movement
      const moveSpeed = this.baseSpeed * this.speedMult;
      this.vx = input.moveX * moveSpeed;
      this.vy = input.moveY * moveSpeed;

      // Check for Dash trigger
      if (input.consumeDash() && this.dashCooldownTimer <= 0 && (input.moveX !== 0 || input.moveY !== 0)) {
        this.isDashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldownTimer = this.dashCooldown;
        this.dashDirX = input.moveX;
        this.dashDirY = input.moveY;
        this.invulnerableTimer = this.dashDuration + 0.05;
        camera.addShake(4);
        sound.playDash();
        particleSystem.spawnShockwave(this.x, this.y, 45, '#00f3ff', 0.2);
      }
    }

    // Apply movement
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Arena boundary clamp
    const limit = arenaSize - this.radius;
    this.x = Math.max(-limit, Math.min(limit, this.x));
    this.y = Math.max(-limit, Math.min(limit, this.y));

    // Calculate facing angle towards mouse cursor in world coordinates
    const worldMouse = camera.screenToWorld(input.mouseX, input.mouseY);
    this.angle = Math.atan2(worldMouse.y - this.y, worldMouse.x - this.x);

    // Shield regeneration
    if (this.shieldTimer > 0) {
      this.shieldTimer -= dt;
    } else if (this.shield < this.maxShield) {
      this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * dt);
    }

    // Shield visual pulse
    this.shieldPulse += dt * 3;
  }

  takeDamage(amount, camera, particleSystem) {
    if (this.isDashing || this.invulnerableTimer > 0) return 0;

    this.invulnerableTimer = 0.25; // Brief grace period
    this.shieldTimer = this.shieldRechargeDelay;
    camera.addShake(7);

    let actualDamage = amount;
    // Shield absorbs first
    if (this.shield > 0) {
      if (this.shield >= amount) {
        this.shield -= amount;
        actualDamage = 0;
        sound.playHit();
      } else {
        actualDamage = amount - this.shield;
        this.shield = 0;
        sound.playHit();
        particleSystem.spawnFloatingText(this.x, this.y, 'SHIELD BROKEN', '#00f3ff');
        particleSystem.spawnShockwave(this.x, this.y, 40, '#00f3ff', 0.25);
      }
    }

    if (actualDamage > 0) {
      this.hp -= actualDamage;
      sound.playHit();
      particleSystem.spawnFloatingText(this.x, this.y, `-${Math.round(actualDamage)}`, '#ff0055');
      particleSystem.spawnSparks(this.x, this.y, '#ff0055', 8, 3);
    }

    return actualDamage;
  }

  heal(amount, particleSystem) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    particleSystem.spawnFloatingText(this.x, this.y, `+${Math.round(amount)} HP`, '#00ff66');
    particleSystem.spawnSparks(this.x, this.y, '#00ff66', 6, 2);
  }

  addExp(amount, onLevelUp) {
    this.exp += amount;
    if (this.exp >= this.expToNextLevel) {
      this.exp -= this.expToNextLevel;
      this.level++;
      this.expToNextLevel = Math.round(this.expToNextLevel * 1.35 + 15);
      sound.playLevelUp();
      if (onLevelUp) onLevelUp(this.level);
    }
  }

  render(ctx, camera) {
    const screen = camera.worldToScreen(this.x, this.y);

    ctx.save();
    ctx.translate(screen.x, screen.y);

    // If invulnerable, flicker
    if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Shield Aura if active
    if (this.shield > 0) {
      const shieldRatio = this.shield / this.maxShield;
      const pulseSize = Math.sin(this.shieldPulse) * 2;
      ctx.strokeStyle = `rgba(0, 243, 255, ${0.4 + shieldRatio * 0.4})`;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 7 + pulseSize, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Rotate player to facing angle
    ctx.rotate(this.angle);

    // Thruster engine flare at back
    if (this.vx !== 0 || this.vy !== 0 || this.isDashing) {
      ctx.fillStyle = this.isDashing ? '#ff007f' : '#00f3ff';
      ctx.shadowColor = this.isDashing ? '#ff007f' : '#00f3ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(-this.radius - 2, -6);
      ctx.lineTo(-this.radius - (this.isDashing ? 18 : 10) - Math.random() * 4, 0);
      ctx.lineTo(-this.radius - 2, 6);
      ctx.closePath();
      ctx.fill();
    }

    // Cyber Ship / Drone Body (Geometric arrowhead cockpit)
    ctx.fillStyle = '#0d1117';
    ctx.strokeStyle = '#00f3ff';
    ctx.shadowColor = '#00f3ff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(this.radius + 4, 0);       // Nose
    ctx.lineTo(-this.radius + 2, -this.radius + 2); // Left wing
    ctx.lineTo(-this.radius / 2, 0);       // Inner indent
    ctx.lineTo(-this.radius + 2, this.radius - 2);  // Right wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Cyber Core
    ctx.fillStyle = this.isDashing ? '#ff007f' : '#00ff66';
    ctx.shadowColor = this.isDashing ? '#ff007f' : '#00ff66';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
