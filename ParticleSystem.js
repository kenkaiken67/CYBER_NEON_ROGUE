/**
 * Cyber Neon Rogue - Particle & Visual Effects Engine
 * Renders high-performance glowing particles, shockwaves, dash trails, and floating combat text.
 */

export class ParticleSystem {
  constructor() {
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.trails = [];
  }

  // Neon spark explosion
  spawnSparks(x, y, color = '#00f3ff', count = 12, speed = 4) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = (Math.random() * 0.7 + 0.3) * speed;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        size: Math.random() * 3 + 2,
        color,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        type: 'spark'
      });
    }
  }

  // Shockwave ring (used for explosions, nova, boss stomps)
  spawnShockwave(x, y, maxRadius = 80, color = '#00f3ff', duration = 0.4) {
    this.shockwaves.push({
      x,
      y,
      radius: 5,
      maxRadius,
      color,
      life: 1.0,
      decay: 1.0 / (duration * 60)
    });
  }

  // Dash ghost after-image
  spawnDashTrail(x, y, radius, angle, color = '#00f3ff') {
    this.trails.push({
      x,
      y,
      radius,
      angle,
      color,
      life: 0.6,
      decay: 0.05
    });
  }

  // Floating combat text (damage numbers, crits, level up banners)
  spawnFloatingText(x, y, text, color = '#fff', isCrit = false) {
    this.floatingTexts.push({
      x: x + (Math.random() * 20 - 10),
      y: y - 10,
      vy: isCrit ? -2.2 : -1.4,
      text,
      color,
      isCrit,
      size: isCrit ? 20 : 14,
      life: 1.0,
      decay: isCrit ? 0.018 : 0.025
    });
  }

  update(dt) {
    // Update sparks
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life -= p.decay;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.12;
      sw.life -= sw.decay;
      if (sw.life <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update trails
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const tr = this.trails[i];
      tr.life -= tr.decay;
      if (tr.life <= 0) {
        this.trails.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= ft.decay;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  render(ctx, camera) {
    ctx.save();

    // Render Trails
    for (const tr of this.trails) {
      const screen = camera.worldToScreen(tr.x, tr.y);
      ctx.save();
      ctx.globalAlpha = tr.life * 0.5;
      ctx.strokeStyle = tr.color;
      ctx.lineWidth = 3;
      ctx.shadowColor = tr.color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, tr.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Render Shockwaves
    for (const sw of this.shockwaves) {
      const screen = camera.worldToScreen(sw.x, sw.y);
      ctx.save();
      ctx.globalAlpha = sw.life;
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 3 * sw.life + 1;
      ctx.shadowColor = sw.color;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Render Sparks
    for (const p of this.particles) {
      const screen = camera.worldToScreen(p.x, p.y);
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Render Floating Combat Text
    for (const ft of this.floatingTexts) {
      const screen = camera.worldToScreen(ft.x, ft.y);
      ctx.save();
      ctx.globalAlpha = ft.life;
      ctx.font = `bold ${ft.size}px 'Orbitron', monospace`;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = ft.isCrit ? 15 : 6;
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, screen.x, screen.y);
      ctx.restore();
    }

    ctx.restore();
  }

  clear() {
    this.particles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.trails = [];
  }
}
