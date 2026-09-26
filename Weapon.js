/**
 * Cyber Neon Rogue - Weapons & Arsenal Engine
 * Implements:
 * 1. Pulse Blaster (Primary plasma projectiles with spread & pierce)
 * 2. Orbital Glaives (Revolving cyber blades slicing swarms)
 * 3. Tesla Arc (Chaining lightning shock)
 * 4. Quantum Mines (Stationary vortex explosives)
 * 5. Photon Beam (Periodic piercing laser sweep)
 */

import { sound } from '../audio/SoundEngine.js';

export class WeaponManager {
  constructor() {
    this.projectiles = [];
    this.mines = [];
    this.laserBeam = null; // Active beam state

    // Registered weapons & levels
    this.weapons = {
      blaster: {
        unlocked: true,
        level: 1,
        name: 'Pulse Blaster',
        icon: '⚡',
        cooldown: 0.32,
        timer: 0,
        damage: 18,
        projectileCount: 1,
        pierce: 1,
        speed: 700
      },
      orbital: {
        unlocked: false,
        level: 0,
        name: 'Orbital Glaives',
        icon: '🌀',
        count: 2,
        radius: 75,
        angle: 0,
        rotationSpeed: 3.5,
        damage: 14,
        hitCooldown: 0.25,
        enemyHitTimers: new Map()
      },
      tesla: {
        unlocked: false,
        level: 0,
        name: 'Tesla Arc',
        icon: '⚡',
        cooldown: 1.8,
        timer: 0,
        chains: 3,
        damage: 35,
        range: 220
      },
      mines: {
        unlocked: false,
        level: 0,
        name: 'Quantum Mines',
        icon: '💣',
        cooldown: 3.0,
        timer: 0,
        damage: 80,
        radius: 90
      }
    };
  }

  unlockWeapon(key) {
    if (this.weapons[key]) {
      this.weapons[key].unlocked = true;
      this.weapons[key].level = 1;
    }
  }

  upgradeWeapon(key) {
    const w = this.weapons[key];
    if (!w) return;

    if (!w.unlocked) {
      w.unlocked = true;
      w.level = 1;
      return;
    }

    w.level++;
    if (key === 'blaster') {
      w.damage += 6;
      w.cooldown = Math.max(0.12, w.cooldown * 0.88);
      if (w.level % 2 === 0) w.projectileCount++;
      if (w.level >= 4) w.pierce = 2;
    } else if (key === 'orbital') {
      w.count++;
      w.damage += 6;
      w.rotationSpeed += 0.5;
      w.radius += 8;
    } else if (key === 'tesla') {
      w.chains += 1;
      w.damage += 14;
      w.cooldown = Math.max(0.8, w.cooldown * 0.85);
    } else if (key === 'mines') {
      w.damage += 30;
      w.radius += 18;
      w.cooldown = Math.max(1.4, w.cooldown * 0.82);
    }
  }

  update(dt, player, enemies, camera, particleSystem) {
    // 1. Update Pulse Blaster
    const blaster = this.weapons.blaster;
    if (blaster.unlocked) {
      blaster.timer -= dt;
      const effectiveCooldown = blaster.cooldown / player.fireRateMult;
      if (blaster.timer <= 0) {
        blaster.timer = effectiveCooldown;
        this.fireBlaster(player, enemies, camera, particleSystem);
      }
    }

    // 2. Update Orbital Glaives
    const orbital = this.weapons.orbital;
    if (orbital.unlocked) {
      orbital.angle += orbital.rotationSpeed * dt;

      // Update hit cooldowns for enemies
      for (const [enemy, timer] of orbital.enemyHitTimers.entries()) {
        const newTimer = timer - dt;
        if (newTimer <= 0) {
          orbital.enemyHitTimers.delete(enemy);
        } else {
          orbital.enemyHitTimers.set(enemy, newTimer);
        }
      }

      // Check collision between orbital blades and enemies
      for (let i = 0; i < orbital.count; i++) {
        const bAngle = orbital.angle + (i * Math.PI * 2) / orbital.count;
        const bladeX = player.x + Math.cos(bAngle) * orbital.radius;
        const bladeY = player.y + Math.sin(bAngle) * orbital.radius;
        const bladeRadius = 14;

        for (const enemy of enemies) {
          if (!enemy.alive || orbital.enemyHitTimers.has(enemy)) continue;
          const dist = Math.hypot(enemy.x - bladeX, enemy.y - bladeY);
          if (dist < enemy.radius + bladeRadius) {
            orbital.enemyHitTimers.set(enemy, orbital.hitCooldown);
            const isCrit = Math.random() < player.critChance;
            const dmg = orbital.damage * player.damageMult * (isCrit ? player.critMultiplier : 1.0);
            enemy.takeDamage(dmg, particleSystem, isCrit);
            sound.playHit();
            particleSystem.spawnSparks(bladeX, bladeY, '#00f3ff', 5, 2);
          }
        }
      }
    }

    // 3. Update Tesla Arc
    const tesla = this.weapons.tesla;
    if (tesla.unlocked) {
      tesla.timer -= dt;
      if (tesla.timer <= 0) {
        tesla.timer = tesla.cooldown / player.fireRateMult;
        this.fireTesla(player, enemies, particleSystem);
      }
    }

    // 4. Update Quantum Mines
    const mines = this.weapons.mines;
    if (mines.unlocked) {
      mines.timer -= dt;
      if (mines.timer <= 0) {
        mines.timer = mines.cooldown;
        this.dropMine(player);
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Projectile vs Enemy collision
      let hit = false;
      for (const enemy of enemies) {
        if (!enemy.alive || p.hitList.has(enemy)) continue;
        const dist = Math.hypot(enemy.x - p.x, enemy.y - p.y);
        if (dist < enemy.radius + p.radius) {
          p.hitList.add(enemy);
          const isCrit = Math.random() < player.critChance;
          const dmg = p.damage * player.damageMult * (isCrit ? player.critMultiplier : 1.0);
          enemy.takeDamage(dmg, particleSystem, isCrit);
          particleSystem.spawnSparks(p.x, p.y, p.color, 6, 3);
          p.pierce--;
          if (p.pierce <= 0) {
            hit = true;
            break;
          }
        }
      }

      if (hit || p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update Mines
    for (let i = this.mines.length - 1; i >= 0; i--) {
      const m = this.mines[i];
      m.pulse += dt * 4;

      // Check for detonation
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        const dist = Math.hypot(enemy.x - m.x, enemy.y - m.y);
        if (dist < enemy.radius + 20) {
          // Detonate mine!
          this.detonateMine(m, enemies, camera, particleSystem, player);
          this.mines.splice(i, 1);
          break;
        }
      }
    }
  }

  fireBlaster(player, enemies, camera, particleSystem) {
    const blaster = this.weapons.blaster;
    sound.playShoot(800, 0.1);
    camera.addShake(1.5);

    // Spread angles if multiple projectiles
    const count = blaster.projectileCount;
    const spread = 0.14; // radians
    const startAngle = player.angle - ((count - 1) * spread) / 2;

    for (let i = 0; i < count; i++) {
      const ang = startAngle + i * spread;
      const speed = blaster.speed * player.projectileSpeedMult;
      this.projectiles.push({
        x: player.x + Math.cos(player.angle) * (player.radius + 6),
        y: player.y + Math.sin(player.angle) * (player.radius + 6),
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        radius: 5,
        damage: blaster.damage,
        pierce: blaster.pierce,
        hitList: new Set(),
        color: '#00f3ff',
        life: 2.0
      });
    }
  }

  fireTesla(player, enemies, particleSystem) {
    const tesla = this.weapons.tesla;
    // Find closest enemy within range
    const validEnemies = enemies.filter(e => e.alive && Math.hypot(e.x - player.x, e.y - player.y) <= tesla.range);
    if (validEnemies.length === 0) return;

    validEnemies.sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y));

    sound.playShoot(1200, 0.15);
    const chained = [];
    let currentSource = player;

    for (let i = 0; i < Math.min(tesla.chains, validEnemies.length); i++) {
      const target = validEnemies[i];
      chained.push({ x1: currentSource.x, y1: currentSource.y, x2: target.x, y2: target.y });
      const isCrit = Math.random() < player.critChance;
      const dmg = tesla.damage * player.damageMult * (isCrit ? player.critMultiplier : 1.0);
      target.takeDamage(dmg, particleSystem, isCrit);
      particleSystem.spawnSparks(target.x, target.y, '#9d00ff', 8, 4);
      currentSource = target;
    }

    // Spawn visual arcs
    this.teslaArcs = chained;
    setTimeout(() => { this.teslaArcs = null; }, 120);
  }

  dropMine(player) {
    this.mines.push({
      x: player.x,
      y: player.y,
      pulse: 0,
      radius: this.weapons.mines.radius,
      damage: this.weapons.mines.damage
    });
  }

  detonateMine(m, enemies, camera, particleSystem, player) {
    sound.playExplosion(true);
    camera.addShake(8);
    particleSystem.spawnShockwave(m.x, m.y, m.radius, '#ffe600', 0.4);
    particleSystem.spawnSparks(m.x, m.y, '#ffe600', 25, 6);

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dist = Math.hypot(enemy.x - m.x, enemy.y - m.y);
      if (dist <= m.radius) {
        const isCrit = Math.random() < player.critChance;
        const dmg = m.damage * player.damageMult * (isCrit ? player.critMultiplier : 1.0);
        enemy.takeDamage(dmg, particleSystem, isCrit);
      }
    }
  }

  render(ctx, camera, player) {
    // 1. Render Projectiles
    for (const p of this.projectiles) {
      const screen = camera.worldToScreen(p.x, p.y);
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Render Orbital Glaives
    const orbital = this.weapons.orbital;
    if (orbital.unlocked) {
      for (let i = 0; i < orbital.count; i++) {
        const bAngle = orbital.angle + (i * Math.PI * 2) / orbital.count;
        const bladeX = player.x + Math.cos(bAngle) * orbital.radius;
        const bladeY = player.y + Math.sin(bAngle) * orbital.radius;
        const screen = camera.worldToScreen(bladeX, bladeY);

        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.rotate(bAngle * 3); // High spin

        ctx.strokeStyle = '#00f3ff';
        ctx.shadowColor = '#00f3ff';
        ctx.shadowBlur = 15;
        ctx.lineWidth = 2.5;
        ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';

        ctx.beginPath();
        // 3-pointed throwing star / glaive
        for (let p = 0; p < 3; p++) {
          const a = (p * Math.PI * 2) / 3;
          const px = Math.cos(a) * 14;
          const py = Math.sin(a) * 14;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }

    // 3. Render Tesla Lightning Arcs
    if (this.teslaArcs) {
      ctx.save();
      ctx.strokeStyle = '#d070ff';
      ctx.shadowColor = '#9d00ff';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;

      for (const arc of this.teslaArcs) {
        const p1 = camera.worldToScreen(arc.x1, arc.y1);
        const p2 = camera.worldToScreen(arc.x2, arc.y2);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);

        // Jagged lightning segment
        const midX = (p1.x + p2.x) / 2 + (Math.random() * 24 - 12);
        const midY = (p1.y + p2.y) / 2 + (Math.random() * 24 - 12);
        ctx.lineTo(midX, midY);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. Render Quantum Mines
    for (const m of this.mines) {
      const screen = camera.worldToScreen(m.x, m.y);
      const pulseSize = Math.sin(m.pulse) * 3;

      ctx.save();
      ctx.translate(screen.x, screen.y);

      // Warning circle
      ctx.strokeStyle = 'rgba(255, 230, 0, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Core mine
      ctx.fillStyle = '#ffe600';
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 8 + pulseSize, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }
}
