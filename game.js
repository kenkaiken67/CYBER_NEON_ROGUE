/**
 * CYBER NEON ROGUE // OVERDRIVE ARCADE
 * Standalone Offline Game Engine
 * 100% Zero-Dependency • Web Audio Synthesizer • Procedural Vector Graphics
 */

(() => {
  'use strict';

  // ==========================================
  // 1. SOUND ENGINE (PROCEDURAL WEB AUDIO)
  // ==========================================
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.sfxGain = null;
      this.musicGain = null;
      this.muted = false;
      this.bgmPlaying = false;
      this.bgmInterval = null;
      this.noteStep = 0;
      this.pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
    }

    init() {
      if (this.ctx) return;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();

      this.sfxGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0.22, this.ctx.currentTime);

      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    ensureContext() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 1, this.ctx.currentTime);
      }
      return this.muted;
    }

    playShoot(frequency = 700, duration = 0.12) {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    }

    playExplosion(isLarge = false) {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const duration = isLarge ? 0.45 : 0.25;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isLarge ? 400 : 800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(isLarge ? 0.6 : 0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
      noise.stop(this.ctx.currentTime + duration);
    }

    playHit() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    }

    playDash() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const duration = 0.2;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + duration);
      filter.Q.value = 3;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
      noise.stop(this.ctx.currentTime + duration);
    }

    playPickup(pitchIndex = 0) {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const note = this.pentatonic[pitchIndex % this.pentatonic.length];
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(note * 1.5, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    }

    playLevelUp() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      const chord = [392.00, 523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.06);
        gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + idx * 0.06 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(this.ctx.currentTime + idx * 0.06);
        osc.stop(this.ctx.currentTime + 0.85);
      });
    }

    playBossAlert() {
      if (this.muted) return;
      this.ensureContext();
      if (!this.ctx) return;

      for (let i = 0; i < 3; i++) {
        const startTime = this.ctx.currentTime + i * 0.25;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, startTime);
        osc.frequency.linearRampToValueAtTime(440, startTime + 0.12);
        osc.frequency.linearRampToValueAtTime(220, startTime + 0.22);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.linearRampToValueAtTime(0.01, startTime + 0.23);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(startTime);
        osc.stop(startTime + 0.24);
      }
    }

    startBGM() {
      if (this.bgmPlaying) return;
      this.ensureContext();
      if (!this.ctx) return;

      this.bgmPlaying = true;
      this.noteStep = 0;

      const bassLine = [
        65.41, 65.41, 65.41, 65.41,
        77.78, 77.78, 77.78, 77.78,
        58.27, 58.27, 58.27, 58.27,
        65.41, 65.41, 87.31, 98.00
      ];

      const leadArp = [
        261.63, 311.13, 392.00, 523.25,
        311.13, 392.00, 523.25, 622.25,
        233.08, 293.66, 349.23, 466.16,
        261.63, 392.00, 523.25, 783.99
      ];

      this.bgmInterval = setInterval(() => {
        if (!this.bgmPlaying || this.muted) return;

        const time = this.ctx.currentTime;
        const bassFreq = bassLine[this.noteStep % bassLine.length];
        const leadFreq = leadArp[this.noteStep % leadArp.length];

        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, time);
        bassGain.gain.setValueAtTime(0.18, time);
        bassGain.gain.exponentialRampToValueAtTime(0.01, time + 0.18);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(time);
        bassOsc.stop(time + 0.18);

        if (this.noteStep % 2 === 0) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = 'triangle';
          leadOsc.frequency.setValueAtTime(leadFreq, time);
          leadGain.gain.setValueAtTime(0.09, time);
          leadGain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

          leadOsc.connect(leadGain);
          leadGain.connect(this.musicGain);
          leadOsc.start(time);
          leadOsc.stop(time + 0.22);
        }

        this.noteStep++;
      }, 140);
    }

    stopBGM() {
      this.bgmPlaying = false;
      if (this.bgmInterval) {
        clearInterval(this.bgmInterval);
        this.bgmInterval = null;
      }
    }
  }

  const sound = new SoundEngine();

  // ==========================================
  // 2. PARTICLE & VFX SYSTEM
  // ==========================================
  class ParticleSystem {
    constructor() {
      this.particles = [];
      this.shockwaves = [];
      this.floatingTexts = [];
      this.trails = [];
    }

    spawnSparks(x, y, color = '#00f3ff', count = 12, speed = 4) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = (Math.random() * 0.7 + 0.3) * speed;
        this.particles.push({
          x, y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          size: Math.random() * 3 + 2,
          color,
          life: 1.0,
          decay: Math.random() * 0.03 + 0.02
        });
      }
    }

    spawnShockwave(x, y, maxRadius = 80, color = '#00f3ff', duration = 0.4) {
      this.shockwaves.push({
        x, y,
        radius: 5,
        maxRadius,
        color,
        life: 1.0,
        decay: 1.0 / (duration * 60)
      });
    }

    spawnDashTrail(x, y, radius, angle, color = '#00f3ff') {
      this.trails.push({
        x, y, radius, angle, color,
        life: 0.6,
        decay: 0.05
      });
    }

    spawnFloatingText(x, y, text, color = '#fff', isCrit = false) {
      this.floatingTexts.push({
        x: x + (Math.random() * 20 - 10),
        y: y - 10,
        vy: isCrit ? -2.2 : -1.4,
        text, color, isCrit,
        size: isCrit ? 20 : 14,
        life: 1.0,
        decay: isCrit ? 0.018 : 0.025
      });
    }

    update(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.life -= p.decay;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      for (let i = this.shockwaves.length - 1; i >= 0; i--) {
        const sw = this.shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.12;
        sw.life -= sw.decay;
        if (sw.life <= 0) this.shockwaves.splice(i, 1);
      }

      for (let i = this.trails.length - 1; i >= 0; i--) {
        const tr = this.trails[i];
        tr.life -= tr.decay;
        if (tr.life <= 0) this.trails.splice(i, 1);
      }

      for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
        const ft = this.floatingTexts[i];
        ft.y += ft.vy;
        ft.life -= ft.decay;
        if (ft.life <= 0) this.floatingTexts.splice(i, 1);
      }
    }

    render(ctx, camera) {
      ctx.save();
      // Trails
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

      // Shockwaves
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

      // Sparks
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

      // Floating Texts
      for (const ft of this.floatingTexts) {
        const screen = camera.worldToScreen(ft.x, ft.y);
        ctx.save();
        ctx.globalAlpha = ft.life;
        ctx.font = `bold ${ft.size}px 'Orbitron', 'Segoe UI', monospace`;
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

  // ==========================================
  // 3. CAMERA & CYBER GRID
  // ==========================================
  class Camera {
    constructor(viewportWidth, viewportHeight) {
      this.x = 0;
      this.y = 0;
      this.targetX = 0;
      this.targetY = 0;
      this.viewportWidth = viewportWidth;
      this.viewportHeight = viewportHeight;
      this.lerpSpeed = 0.08;
      this.shakeIntensity = 0;
      this.shakeDecay = 0.9;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      this.arenaSize = 2500;
    }

    resize(w, h) {
      this.viewportWidth = w;
      this.viewportHeight = h;
    }

    follow(targetX, targetY) {
      this.targetX = targetX;
      this.targetY = targetY;
    }

    addShake(amount) {
      this.shakeIntensity = Math.min(this.shakeIntensity + amount, 28);
    }

    update() {
      this.x += (this.targetX - this.x) * this.lerpSpeed;
      this.y += (this.targetY - this.y) * this.lerpSpeed;

      if (this.shakeIntensity > 0.1) {
        this.shakeOffsetX = (Math.random() * 2 - 1) * this.shakeIntensity;
        this.shakeOffsetY = (Math.random() * 2 - 1) * this.shakeIntensity;
        this.shakeIntensity *= this.shakeDecay;
      } else {
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
        this.shakeIntensity = 0;
      }
    }

    worldToScreen(wx, wy) {
      return {
        x: wx - this.x + this.viewportWidth / 2 + this.shakeOffsetX,
        y: wy - this.y + this.viewportHeight / 2 + this.shakeOffsetY
      };
    }

    screenToWorld(sx, sy) {
      return {
        x: sx + this.x - this.viewportWidth / 2 - this.shakeOffsetX,
        y: sy + this.y - this.viewportHeight / 2 - this.shakeOffsetY
      };
    }

    renderBackground(ctx) {
      const halfW = this.viewportWidth / 2;
      const halfH = this.viewportHeight / 2;
      const gridSize = 80;

      const startX = -((this.x - halfW - this.shakeOffsetX) % gridSize);
      const startY = -((this.y - halfH - this.shakeOffsetY) % gridSize);

      ctx.save();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.07)';

      ctx.beginPath();
      for (let x = startX - gridSize; x < this.viewportWidth + gridSize; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.viewportHeight);
      }
      for (let y = startY - gridSize; y < this.viewportHeight + gridSize; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(this.viewportWidth, y);
      }
      ctx.stroke();

      const topLeft = this.worldToScreen(-this.arenaSize, -this.arenaSize);
      const boundsSize = this.arenaSize * 2;

      ctx.strokeStyle = 'rgba(255, 0, 127, 0.6)';
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ff007f';
      ctx.shadowBlur = 15;
      ctx.strokeRect(topLeft.x, topLeft.y, boundsSize, boundsSize);
      ctx.restore();
    }
  }

  // ==========================================
  // 4. INPUT HANDLER (KEYBOARD, MOUSE & TOUCH)
  // ==========================================
  class Input {
    constructor(canvas) {
      this.canvas = canvas;
      this.moveX = 0;
      this.moveY = 0;
      this.mouseX = 0;
      this.mouseY = 0;
      this.isMouseDown = false;
      this.dashPressed = false;
      this.pausePressed = false;
      this.muteToggle = false;
      this.crtToggle = false;
      this.keys = {};

      this.touchJoystick = {
        active: false,
        identifier: null,
        startX: 0,
        startY: 0,
        maxRadius: 45
      };

      this.initListeners();
    }

    initListeners() {
      window.addEventListener('keydown', (e) => {
        this.keys[e.code] = true;
        if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') this.dashPressed = true;
        if (e.code === 'KeyP' || e.code === 'Escape') this.pausePressed = true;
        if (e.code === 'KeyM') this.muteToggle = true;
        if (e.code === 'KeyC') this.crtToggle = true;
      });

      window.addEventListener('keyup', (e) => {
        this.keys[e.code] = false;
      });

      window.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
      });

      window.addEventListener('mousedown', (e) => {
        if (e.button === 0) this.isMouseDown = true;
      });

      window.addEventListener('mouseup', (e) => {
        if (e.button === 0) this.isMouseDown = false;
      });

      const touchZone = document.getElementById('touch-zone-left');
      const joystickKnob = document.getElementById('joystick-knob');
      const touchDashBtn = document.getElementById('touch-dash-btn');

      if (touchZone && joystickKnob) {
        touchZone.addEventListener('touchstart', (e) => {
          e.preventDefault();
          const touch = e.changedTouches[0];
          const rect = touchZone.getBoundingClientRect();
          this.touchJoystick.active = true;
          this.touchJoystick.identifier = touch.identifier;
          this.touchJoystick.startX = rect.left + rect.width / 2;
          this.touchJoystick.startY = rect.top + rect.height / 2;
          this.handleJoystickMove(touch.clientX, touch.clientY, joystickKnob);
        }, { passive: false });

        touchZone.addEventListener('touchmove', (e) => {
          e.preventDefault();
          for (let i = 0; i < e.changedTouches.length; i++) {
            const touch = e.changedTouches[i];
            if (touch.identifier === this.touchJoystick.identifier) {
              this.handleJoystickMove(touch.clientX, touch.clientY, joystickKnob);
              break;
            }
          }
        }, { passive: false });

        const resetJoystick = (e) => {
          e.preventDefault();
          this.touchJoystick.active = false;
          this.touchJoystick.identifier = null;
          this.moveX = 0;
          this.moveY = 0;
          joystickKnob.style.transform = 'translate(0px, 0px)';
        };

        touchZone.addEventListener('touchend', resetJoystick, { passive: false });
        touchZone.addEventListener('touchcancel', resetJoystick, { passive: false });
      }

      if (touchDashBtn) {
        touchDashBtn.addEventListener('touchstart', (e) => {
          e.preventDefault();
          this.dashPressed = true;
        }, { passive: false });
      }
    }

    handleJoystickMove(clientX, clientY, knob) {
      const dx = clientX - this.touchJoystick.startX;
      const dy = clientY - this.touchJoystick.startY;
      const dist = Math.hypot(dx, dy);
      const max = this.touchJoystick.maxRadius;

      let clampedX = dx;
      let clampedY = dy;
      if (dist > max) {
        clampedX = (dx / dist) * max;
        clampedY = (dy / dist) * max;
      }

      knob.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
      this.moveX = clampedX / max;
      this.moveY = clampedY / max;
    }

    update() {
      if (!this.touchJoystick.active) {
        let x = 0, y = 0;
        if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

        const len = Math.hypot(x, y);
        if (len > 0) {
          this.moveX = x / len;
          this.moveY = y / len;
        } else {
          this.moveX = 0;
          this.moveY = 0;
        }
      }
    }

    consumeDash() {
      const val = this.dashPressed;
      this.dashPressed = false;
      return val;
    }

    consumePause() {
      const val = this.pausePressed;
      this.pausePressed = false;
      return val;
    }

    consumeMute() {
      const val = this.muteToggle;
      this.muteToggle = false;
      return val;
    }

    consumeCrt() {
      const val = this.crtToggle;
      this.crtToggle = false;
      return val;
    }
  }

  // ==========================================
  // 5. PLAYER ENTITY
  // ==========================================
  class Player {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.radius = 16;
      this.angle = 0;

      this.maxHp = 100;
      this.hp = 100;
      this.maxShield = 50;
      this.shield = 50;
      this.shieldRechargeDelay = 3.5;
      this.shieldTimer = 0;
      this.shieldRegenRate = 18;

      this.baseSpeed = 240;
      this.speedMult = 1.0;
      this.isDashing = false;
      this.dashTimer = 0;
      this.dashDuration = 0.18;
      this.dashSpeed = 750;
      this.dashCooldown = 2.2;
      this.dashCooldownTimer = 0;
      this.dashDirX = 0;
      this.dashDirY = 0;

      this.invulnerableTimer = 0;
      this.level = 1;
      this.exp = 0;
      this.expToNextLevel = 25;
      this.magnetRadius = 140;

      this.damageMult = 1.0;
      this.fireRateMult = 1.0;
      this.projectileSpeedMult = 1.0;
      this.critChance = 0.08;
      this.critMultiplier = 2.0;

      this.shieldPulse = 0;
      this.trailSpawnTimer = 0;
    }

    update(dt, input, camera, particleSystem, arenaSize) {
      if (this.dashCooldownTimer > 0) this.dashCooldownTimer -= dt;
      if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;

      if (this.isDashing) {
        this.dashTimer -= dt;
        this.vx = this.dashDirX * this.dashSpeed;
        this.vy = this.dashDirY * this.dashSpeed;

        this.trailSpawnTimer += dt;
        if (this.trailSpawnTimer > 0.03) {
          this.trailSpawnTimer = 0;
          particleSystem.spawnDashTrail(this.x, this.y, this.radius, this.angle, '#00f3ff');
        }

        if (this.dashTimer <= 0) this.isDashing = false;
      } else {
        const moveSpeed = this.baseSpeed * this.speedMult;
        this.vx = input.moveX * moveSpeed;
        this.vy = input.moveY * moveSpeed;

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

      this.x += this.vx * dt;
      this.y += this.vy * dt;

      const limit = arenaSize - this.radius;
      this.x = Math.max(-limit, Math.min(limit, this.x));
      this.y = Math.max(-limit, Math.min(limit, this.y));

      const worldMouse = camera.screenToWorld(input.mouseX, input.mouseY);
      this.angle = Math.atan2(worldMouse.y - this.y, worldMouse.x - this.x);

      if (this.shieldTimer > 0) {
        this.shieldTimer -= dt;
      } else if (this.shield < this.maxShield) {
        this.shield = Math.min(this.maxShield, this.shield + this.shieldRegenRate * dt);
      }

      this.shieldPulse += dt * 3;
    }

    takeDamage(amount, camera, particleSystem) {
      if (this.isDashing || this.invulnerableTimer > 0) return 0;

      this.invulnerableTimer = 0.25;
      this.shieldTimer = this.shieldRechargeDelay;
      camera.addShake(7);

      let actualDamage = amount;
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

      if (this.invulnerableTimer > 0 && Math.floor(Date.now() / 50) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

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

      ctx.rotate(this.angle);

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

      ctx.fillStyle = '#0d1117';
      ctx.strokeStyle = '#00f3ff';
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(this.radius + 4, 0);
      ctx.lineTo(-this.radius + 2, -this.radius + 2);
      ctx.lineTo(-this.radius / 2, 0);
      ctx.lineTo(-this.radius + 2, this.radius - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = this.isDashing ? '#ff007f' : '#00ff66';
      ctx.shadowColor = this.isDashing ? '#ff007f' : '#00ff66';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  // ==========================================
  // 6. ENEMY ENTITY
  // ==========================================
  class Enemy {
    constructor(x, y, type = 'scout', difficultyScale = 1.0) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.angle = 0;
      this.alive = true;
      this.isBoss = false;

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
      if (this.hitFlash > 0) this.hitFlash -= dt;

      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy);
      this.angle = Math.atan2(dy, dx);

      if (this.type === 'phantom') {
        this.phaseTimer += dt;
        if (this.phaseTimer > 3.0) {
          this.phaseTimer = 0;
          this.x += Math.cos(this.angle) * 120;
          this.y += Math.sin(this.angle) * 120;
          particleSystem.spawnSparks(this.x, this.y, '#9d00ff', 10, 4);
        }
      } else if (this.type === 'boss') {
        this.attackTimer += dt;
        this.bulletRingTimer += dt;
        if (this.bulletRingTimer >= 3.2) {
          this.bulletRingTimer = 0;
          this.fireBulletRing(enemyBullets, 12);
          sound.playShoot(350, 0.2);
          particleSystem.spawnShockwave(this.x, this.y, 65, '#ff007f', 0.3);
        }
      }

      if (dist > 5) {
        this.x += (dx / dist) * this.speed * dt;
        this.y += (dy / dist) * this.speed * dt;
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

      particleSystem.spawnFloatingText(this.x, this.y, Math.round(amount), isCrit ? '#ffe600' : '#00f3ff', isCrit);
      particleSystem.spawnSparks(this.x, this.y, this.color, isCrit ? 10 : 4, 3);

      if (this.hp <= 0) {
        this.alive = false;
        sound.playExplosion(this.isBoss);
        particleSystem.spawnShockwave(this.x, this.y, this.radius * 2.5, this.color, 0.3);
        particleSystem.spawnSparks(this.x, this.y, this.color, this.isBoss ? 40 : 16, 5);
        return true;
      }
      return false;
    }

    render(ctx, camera) {
      if (!this.alive) return;
      const screen = camera.worldToScreen(this.x, this.y);

      ctx.save();
      ctx.translate(screen.x, screen.y);

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
          ctx.beginPath();
          ctx.moveTo(this.radius + 4, 0);
          ctx.lineTo(0, -this.radius);
          ctx.lineTo(-this.radius, 0);
          ctx.lineTo(0, this.radius);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ff00ff';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'juggernaut':
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

          ctx.beginPath();
          ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
          ctx.stroke();
          break;

        case 'boss':
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

          ctx.fillStyle = '#ff0033';
          ctx.beginPath();
          ctx.arc(0, 0, 16, 0, Math.PI * 2);
          ctx.fill();
          break;
      }

      ctx.restore();

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

  // ==========================================
  // 7. WEAPON MANAGER & ARSENAL
  // ==========================================
  class WeaponManager {
    constructor() {
      this.projectiles = [];
      this.mines = [];
      this.teslaArcs = null;

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
      // 1. Blaster
      const blaster = this.weapons.blaster;
      if (blaster.unlocked) {
        blaster.timer -= dt;
        const effectiveCooldown = blaster.cooldown / player.fireRateMult;
        if (blaster.timer <= 0) {
          blaster.timer = effectiveCooldown;
          this.fireBlaster(player, enemies, camera);
        }
      }

      // 2. Orbital
      const orbital = this.weapons.orbital;
      if (orbital.unlocked) {
        orbital.angle += orbital.rotationSpeed * dt;
        for (const [enemy, timer] of orbital.enemyHitTimers.entries()) {
          const newTimer = timer - dt;
          if (newTimer <= 0) orbital.enemyHitTimers.delete(enemy);
          else orbital.enemyHitTimers.set(enemy, newTimer);
        }

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

      // 3. Tesla
      const tesla = this.weapons.tesla;
      if (tesla.unlocked) {
        tesla.timer -= dt;
        if (tesla.timer <= 0) {
          tesla.timer = tesla.cooldown / player.fireRateMult;
          this.fireTesla(player, enemies, particleSystem);
        }
      }

      // 4. Mines
      const mines = this.weapons.mines;
      if (mines.unlocked) {
        mines.timer -= dt;
        if (mines.timer <= 0) {
          mines.timer = mines.cooldown;
          this.dropMine(player);
        }
      }

      // Projectiles loop
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;

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

      // Mines loop
      for (let i = this.mines.length - 1; i >= 0; i--) {
        const m = this.mines[i];
        m.pulse += dt * 4;

        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          const dist = Math.hypot(enemy.x - m.x, enemy.y - m.y);
          if (dist < enemy.radius + 20) {
            this.detonateMine(m, enemies, camera, particleSystem, player);
            this.mines.splice(i, 1);
            break;
          }
        }
      }
    }

    fireBlaster(player, enemies, camera) {
      const blaster = this.weapons.blaster;
      sound.playShoot(800, 0.1);
      camera.addShake(1.5);

      const count = blaster.projectileCount;
      const spread = 0.14;
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

      const orbital = this.weapons.orbital;
      if (orbital.unlocked) {
        for (let i = 0; i < orbital.count; i++) {
          const bAngle = orbital.angle + (i * Math.PI * 2) / orbital.count;
          const bladeX = player.x + Math.cos(bAngle) * orbital.radius;
          const bladeY = player.y + Math.sin(bAngle) * orbital.radius;
          const screen = camera.worldToScreen(bladeX, bladeY);

          ctx.save();
          ctx.translate(screen.x, screen.y);
          ctx.rotate(bAngle * 3);
          ctx.strokeStyle = '#00f3ff';
          ctx.shadowColor = '#00f3ff';
          ctx.shadowBlur = 15;
          ctx.lineWidth = 2.5;
          ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';

          ctx.beginPath();
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
          const midX = (p1.x + p2.x) / 2 + (Math.random() * 24 - 12);
          const midY = (p1.y + p2.y) / 2 + (Math.random() * 24 - 12);
          ctx.lineTo(midX, midY);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      for (const m of this.mines) {
        const screen = camera.worldToScreen(m.x, m.y);
        const pulseSize = Math.sin(m.pulse) * 3;

        ctx.save();
        ctx.translate(screen.x, screen.y);
        ctx.strokeStyle = 'rgba(255, 230, 0, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
        ctx.stroke();

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

  // ==========================================
  // 8. DROPS & PICKUPS
  // ==========================================
  class Drop {
    constructor(x, y, type = 'exp', value = 10) {
      this.x = x;
      this.y = y;
      this.vx = 0;
      this.vy = 0;
      this.type = type;
      this.value = value;
      this.radius = type === 'exp' ? 6 : 10;
      this.collected = false;
      this.pulse = Math.random() * Math.PI * 2;
      this.beingMagnetPulled = false;

      if (type === 'exp') {
        if (value >= 50) this.color = '#ffe600';
        else if (value >= 20) this.color = '#9d00ff';
        else this.color = '#00f3ff';
      } else if (type === 'health') {
        this.color = '#00ff66';
      } else if (type === 'magnet') {
        this.color = '#ff007f';
      }
    }

    update(dt, player, allDrops, particleSystem) {
      if (this.collected) return;
      this.pulse += dt * 4;

      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const dist = Math.hypot(dx, dy);

      const magnetRange = this.beingMagnetPulled ? 99999 : player.magnetRadius;

      if (dist < magnetRange) {
        const pullSpeed = 450 + (1 - dist / Math.max(magnetRange, 1)) * 350;
        this.vx = (dx / dist) * pullSpeed;
        this.vy = (dy / dist) * pullSpeed;
        this.x += this.vx * dt;
        this.y += this.vy * dt;
      }

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
          sound.playLevelUp();
          particleSystem.spawnShockwave(player.x, player.y, 350, '#ff007f', 0.5);
          for (const drop of allDrops) {
            if (drop.type === 'exp') drop.beingMagnetPulled = true;
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
        ctx.beginPath();
        ctx.moveTo(0, -this.radius - pulseSize);
        ctx.lineTo(this.radius + pulseSize, 0);
        ctx.moveTo(0, this.radius + pulseSize);
        ctx.lineTo(-this.radius - pulseSize, 0);
        ctx.closePath();
        ctx.fill();
      } else if (this.type === 'health') {
        ctx.fillRect(-2.5, -8, 5, 16);
        ctx.fillRect(-8, -2.5, 16, 5);
      } else if (this.type === 'magnet') {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius + pulseSize, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ==========================================
  // 9. UPGRADE CATALOG & SYSTEM
  // ==========================================
  const UPGRADE_CATALOG = [
    {
      id: 'wpn_orbital',
      name: 'Orbital Glaives',
      tier: 'epic',
      icon: '🌀',
      desc: 'Unlocks/Upgrades rotating cybernetic blades that continuously slice surrounding enemies.',
      canApply: () => true,
      apply: (p, wm) => wm.upgradeWeapon('orbital')
    },
    {
      id: 'wpn_tesla',
      name: 'Tesla Arc Generator',
      tier: 'epic',
      icon: '⚡',
      desc: 'Unlocks/Upgrades electric discharge that arcs across multiple hostile drones.',
      canApply: () => true,
      apply: (p, wm) => wm.upgradeWeapon('tesla')
    },
    {
      id: 'wpn_mines',
      name: 'Quantum Mines',
      tier: 'rare',
      icon: '💣',
      desc: 'Deploys proximity mines that trigger devastating explosive shockwaves.',
      canApply: () => true,
      apply: (p, wm) => wm.upgradeWeapon('mines')
    },
    {
      id: 'blaster_overclock',
      name: 'Blaster Overclock',
      tier: 'rare',
      icon: '🔫',
      desc: 'Upgrades Pulse Blaster damage, fire rate, and adds extra projectiles.',
      canApply: () => true,
      apply: (p, wm) => wm.upgradeWeapon('blaster')
    },
    {
      id: 'plasma_infusion',
      name: 'Plasma Infusion',
      tier: 'common',
      icon: '🔥',
      desc: 'Increases all weapon damage by +20%.',
      canApply: () => true,
      apply: (p) => { p.damageMult += 0.20; }
    },
    {
      id: 'rapid_fire_chip',
      name: 'Overdrive Clock',
      tier: 'rare',
      icon: '⏱️',
      desc: 'Increases weapon fire rate & attack speed by +18%.',
      canApply: () => true,
      apply: (p) => { p.fireRateMult += 0.18; }
    },
    {
      id: 'crit_matrix',
      name: 'Critical Matrix',
      tier: 'rare',
      icon: '🎯',
      desc: 'Increases critical strike chance by +12% and multiplier to 2.5x.',
      canApply: () => true,
      apply: (p) => {
        p.critChance += 0.12;
        p.critMultiplier = Math.max(p.critMultiplier, 2.5);
      }
    },
    {
      id: 'hyper_velocity',
      name: 'Hyper-Velocity Rails',
      tier: 'common',
      icon: '🚀',
      desc: 'Increases projectile travel velocity by +25%.',
      canApply: () => true,
      apply: (p) => { p.projectileSpeedMult += 0.25; }
    },
    {
      id: 'nanite_armor',
      name: 'Reinforced Plating',
      tier: 'common',
      icon: '🛡️',
      desc: 'Increases Maximum HP by +35 and restores 35 HP.',
      canApply: () => true,
      apply: (p) => {
        p.maxHp += 35;
        p.hp += 35;
      }
    },
    {
      id: 'forcefield_capacitor',
      name: 'Forcefield Overload',
      tier: 'rare',
      icon: '🌐',
      desc: 'Increases Shield capacity by +30 and accelerates recharge.',
      canApply: () => true,
      apply: (p) => {
        p.maxShield += 30;
        p.shield += 30;
        p.shieldRegenRate += 8;
      }
    },
    {
      id: 'quick_dash',
      name: 'Ionic Thrusters',
      tier: 'rare',
      icon: '💨',
      desc: 'Reduces Dash cooldown by 25% and grants extra movement speed (+15%).',
      canApply: () => true,
      apply: (p) => {
        p.dashCooldown = Math.max(0.8, p.dashCooldown * 0.75);
        p.speedMult += 0.15;
      }
    },
    {
      id: 'cyber_magnet',
      name: 'Graviton Siphon',
      tier: 'common',
      icon: '🧲',
      desc: 'Expands XP & item attraction radius by +60%.',
      canApply: () => true,
      apply: (p) => { p.magnetRadius += 85; }
    },
    {
      id: 'adrenaline_rush',
      name: 'Cyber Adrenaline',
      tier: 'legendary',
      icon: '⚡',
      desc: 'Increases Movement Speed (+20%), Damage (+25%), and Fire Rate (+15%).',
      canApply: () => true,
      apply: (p) => {
        p.speedMult += 0.20;
        p.damageMult += 0.25;
        p.fireRateMult += 0.15;
      }
    },
    {
      id: 'emergency_reboot',
      name: 'Emergency Nanite Surge',
      tier: 'legendary',
      icon: '💖',
      desc: 'Fully repairs all HP & Shields to maximum instantly and grants +50 Max HP.',
      canApply: () => true,
      apply: (p) => {
        p.maxHp += 50;
        p.hp = p.maxHp;
        p.shield = p.maxShield;
      }
    }
  ];

  class UpgradeSystem {
    constructor() {
      this.catalog = UPGRADE_CATALOG;
    }

    getRandomChoices(count = 3, player, weaponManager) {
      const available = this.catalog.filter(u => u.canApply(player, weaponManager));
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    }
  }

  // ==========================================
  // 10. WAVE & ENCOUNTER DIRECTOR
  // ==========================================
  class WaveManager {
    constructor() {
      this.gameTime = 0;
      this.currentWave = 1;
      this.spawnTimer = 0;
      this.spawnInterval = 1.0;
      this.bossActive = false;
      this.nextBossTime = 120;
    }

    update(dt, player, enemies, camera, particleSystem, onBossSpawn) {
      this.gameTime += dt;
      const minutes = this.gameTime / 60;
      const difficultyScale = 1.0 + minutes * 0.45;
      this.currentWave = Math.floor(minutes) + 1;
      this.spawnInterval = Math.max(0.28, 1.1 - minutes * 0.15);

      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnRegularEnemy(player, enemies, camera, difficultyScale);
      }

      if (this.gameTime >= this.nextBossTime && !this.bossActive) {
        this.bossActive = true;
        this.nextBossTime += 180;
        this.spawnBoss(player, enemies, camera, difficultyScale, onBossSpawn);
      }
    }

    getSpawnCoordinates(player, camera) {
      const angle = Math.random() * Math.PI * 2;
      const minDistance = Math.hypot(camera.viewportWidth, camera.viewportHeight) * 0.65;
      const spawnDist = minDistance + Math.random() * 200;
      return {
        x: player.x + Math.cos(angle) * spawnDist,
        y: player.y + Math.sin(angle) * spawnDist
      };
    }

    spawnRegularEnemy(player, enemies, camera, difficultyScale) {
      const pos = this.getSpawnCoordinates(player, camera);
      const rand = Math.random();
      let type = 'scout';
      if (this.gameTime > 60 && rand < 0.25) type = 'phantom';
      else if (this.gameTime > 120 && rand < 0.18) type = 'juggernaut';

      enemies.push(new Enemy(pos.x, pos.y, type, difficultyScale));
    }

    spawnBoss(player, enemies, camera, difficultyScale, onBossSpawn) {
      sound.playBossAlert();
      camera.addShake(15);
      const pos = this.getSpawnCoordinates(player, camera);
      const boss = new Enemy(pos.x, pos.y, 'boss', difficultyScale * 1.2);
      enemies.push(boss);
      if (onBossSpawn) onBossSpawn(boss);
    }

    formatTime() {
      const totalSec = Math.floor(this.gameTime);
      const mins = Math.floor(totalSec / 60);
      const secs = totalSec % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  }

  // ==========================================
  // 11. HUD & UI BINDER
  // ==========================================
  class HUD {
    constructor() {
      this.hpBar = document.getElementById('hp-bar');
      this.hpVal = document.getElementById('hp-val');
      this.shieldBar = document.getElementById('shield-bar');
      this.shieldVal = document.getElementById('shield-val');
      this.expBar = document.getElementById('exp-bar');
      this.levelVal = document.getElementById('level-val');

      this.timerVal = document.getElementById('timer-val');
      this.waveVal = document.getElementById('wave-val');
      this.scoreVal = document.getElementById('score-val');
      this.killsVal = document.getElementById('kills-val');

      this.dashIndicator = document.getElementById('dash-indicator');
      this.bossHud = document.getElementById('boss-hud');
      this.bossHpBar = document.getElementById('boss-hp-bar');

      this.startModal = document.getElementById('start-modal');
      this.upgradeModal = document.getElementById('upgrade-modal');
      this.upgradeCardsContainer = document.getElementById('upgrade-cards-container');
      this.gameoverModal = document.getElementById('gameover-modal');
      this.pauseModal = document.getElementById('pause-modal');

      this.goTime = document.getElementById('go-time');
      this.goScore = document.getElementById('go-score');
      this.goKills = document.getElementById('go-kills');
      this.goLevel = document.getElementById('go-level');
      this.goHighscore = document.getElementById('go-highscore');

      this.weaponsRow = document.getElementById('weapons-row');
      this.crtOverlay = document.querySelector('.crt-overlay');
    }

    update(player, waveManager, score, kills, activeBoss, weaponManager) {
      const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
      this.hpBar.style.width = `${hpPercent}%`;
      this.hpVal.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;

      const shieldPercent = Math.max(0, (player.shield / player.maxShield) * 100);
      this.shieldBar.style.width = `${shieldPercent}%`;
      this.shieldVal.textContent = `${Math.ceil(player.shield)}/${player.maxShield}`;

      const expPercent = Math.min(100, (player.exp / player.expToNextLevel) * 100);
      this.expBar.style.width = `${expPercent}%`;
      this.levelVal.textContent = `LVL ${player.level}`;

      this.timerVal.textContent = waveManager.formatTime();
      this.waveVal.textContent = `WAVE ${waveManager.currentWave}`;
      this.scoreVal.textContent = score.toLocaleString();
      this.killsVal.textContent = kills.toLocaleString();

      if (player.dashCooldownTimer <= 0) {
        this.dashIndicator.textContent = 'READY';
        this.dashIndicator.className = 'dash-indicator dash-ready';
      } else {
        this.dashIndicator.textContent = `${player.dashCooldownTimer.toFixed(1)}s`;
        this.dashIndicator.className = 'dash-indicator';
      }

      if (activeBoss && activeBoss.alive) {
        this.bossHud.style.display = 'flex';
        const bossPercent = Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100);
        this.bossHpBar.style.width = `${bossPercent}%`;
      } else {
        this.bossHud.style.display = 'none';
      }

      this.renderWeaponSlots(weaponManager);
    }

    renderWeaponSlots(wm) {
      if (!this.weaponsRow) return;
      this.weaponsRow.innerHTML = '';
      for (const [key, w] of Object.entries(wm.weapons)) {
        if (w.unlocked) {
          const slot = document.createElement('div');
          slot.className = 'weapon-slot';
          slot.innerHTML = `
            <span class="icon">${w.icon}</span>
            <span class="weapon-level">v${w.level}</span>
          `;
          this.weaponsRow.appendChild(slot);
        }
      }
    }

    showUpgradeModal(choices, onSelect) {
      this.upgradeCardsContainer.innerHTML = '';
      choices.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
          <span class="card-tier ${upgrade.tier}">${upgrade.tier}</span>
          <div class="card-icon">${upgrade.icon}</div>
          <div class="card-title">${upgrade.name}</div>
          <div class="card-desc">${upgrade.desc}</div>
          <button class="neon-btn" style="padding: 0.5rem 1.2rem; font-size: 0.85rem; width: 100%;">SELECT</button>
        `;
        card.addEventListener('click', () => {
          this.hideUpgradeModal();
          onSelect(upgrade);
        });
        this.upgradeCardsContainer.appendChild(card);
      });
      this.upgradeModal.classList.add('active');
    }

    hideUpgradeModal() {
      this.upgradeModal.classList.remove('active');
    }

    showGameOver(stats) {
      const storedBest = parseInt(localStorage.getItem('cyber_neon_highscore') || '0', 10);
      const newBest = Math.max(storedBest, stats.score);
      localStorage.setItem('cyber_neon_highscore', newBest.toString());

      this.goTime.textContent = stats.time;
      this.goScore.textContent = stats.score.toLocaleString();
      this.goKills.textContent = stats.kills.toLocaleString();
      this.goLevel.textContent = stats.level.toString();
      this.goHighscore.textContent = newBest.toLocaleString();

      this.gameoverModal.classList.add('active');
    }

    hideGameOver() {
      this.gameoverModal.classList.remove('active');
    }

    showStartModal() {
      this.startModal.classList.add('active');
    }

    hideStartModal() {
      this.startModal.classList.remove('active');
    }

    togglePause(isPaused) {
      if (isPaused) this.pauseModal.classList.add('active');
      else this.pauseModal.classList.remove('active');
    }

    toggleCRT() {
      if (this.crtOverlay) {
        this.crtOverlay.classList.toggle('disabled');
      }
    }
  }

  // ==========================================
  // 12. MASTER GAME LOOP
  // ==========================================
  const GameState = {
    START: 'START',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    UPGRADE: 'UPGRADE',
    GAMEOVER: 'GAMEOVER'
  };

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.state = GameState.START;

      this.lastTime = 0;
      this.score = 0;
      this.kills = 0;
      this.arenaSize = 2400;

      this.camera = new Camera(canvas.width, canvas.height);
      this.input = new Input(canvas);
      this.particles = new ParticleSystem();
      this.upgrades = new UpgradeSystem();
      this.waveManager = new WaveManager();
      this.hud = new HUD();

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

      if (this.input.consumePause()) {
        if (this.state === GameState.PLAYING) {
          this.state = GameState.PAUSED;
          this.hud.togglePause(true);
        } else if (this.state === GameState.PAUSED) {
          this.state = GameState.PLAYING;
          this.hud.togglePause(false);
        }
      }

      if (this.input.consumeMute()) sound.toggleMute();
      if (this.input.consumeCrt()) this.hud.toggleCRT();

      if (this.state === GameState.PLAYING) {
        this.input.update();

        this.player.update(dt, this.input, this.camera, this.particles, this.arenaSize);
        this.camera.follow(this.player.x, this.player.y);
        this.camera.update();

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

        if (this.player.exp >= this.player.expToNextLevel) {
          this.player.addExp(0, () => this.triggerLevelUp());
        }

        this.weaponManager.update(dt, this.player, this.enemies, this.camera, this.particles);

        this.waveManager.update(
          dt, this.player, this.enemies, this.camera, this.particles,
          (boss) => this.handleBossSpawn(boss)
        );

        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const enemy = this.enemies[i];
          enemy.update(dt, this.player, this.enemyBullets, this.particles);

          const distToPlayer = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
          if (distToPlayer < this.player.radius + enemy.radius) {
            this.player.takeDamage(enemy.damage * dt * 2.5, this.camera, this.particles);
          }

          if (!enemy.alive) {
            this.kills++;
            this.score += enemy.scoreValue;
            this.drops.push(new Drop(enemy.x, enemy.y, 'exp', enemy.expValue));

            const dropRoll = Math.random();
            if (dropRoll < 0.035) this.drops.push(new Drop(enemy.x + 10, enemy.y, 'health'));
            else if (dropRoll < 0.05) this.drops.push(new Drop(enemy.x - 10, enemy.y, 'magnet'));

            if (enemy === this.activeBoss) {
              this.activeBoss = null;
              this.waveManager.bossActive = false;
              this.score += 10000;
              for (let k = 0; k < 6; k++) {
                this.drops.push(new Drop(enemy.x + (Math.random()*60-30), enemy.y + (Math.random()*60-30), 'exp', 50));
              }
              this.drops.push(new Drop(enemy.x, enemy.y, 'health'));
              this.drops.push(new Drop(enemy.x, enemy.y, 'magnet'));
            }

            this.enemies.splice(i, 1);
          }
        }

        for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
          const b = this.enemyBullets[i];
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.life -= dt;

          const dist = Math.hypot(this.player.x - b.x, this.player.y - b.y);
          if (dist < this.player.radius + b.radius) {
            this.player.takeDamage(b.damage, this.camera, this.particles);
            this.particles.spawnSparks(b.x, b.y, b.color, 6, 2);
            this.enemyBullets.splice(i, 1);
            continue;
          }

          if (b.life <= 0) this.enemyBullets.splice(i, 1);
        }

        for (let i = this.drops.length - 1; i >= 0; i--) {
          const drop = this.drops[i];
          drop.update(dt, this.player, this.drops, this.particles);
          if (drop.collected) this.drops.splice(i, 1);
        }

        this.particles.update(dt);
        this.hud.update(this.player, this.waveManager, this.score, this.kills, this.activeBoss, this.weaponManager);
      } else {
        this.particles.update(dt * 0.5);
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.camera.renderBackground(this.ctx);

      for (const drop of this.drops) drop.render(this.ctx, this.camera);

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

      if (this.weaponManager && this.player) {
        this.weaponManager.render(this.ctx, this.camera, this.player);
      }

      for (const enemy of this.enemies) enemy.render(this.ctx, this.camera);

      if (this.player) this.player.render(this.ctx, this.camera);

      this.particles.render(this.ctx, this.camera);

      if (this.player && this.state === GameState.PLAYING) {
        this.renderMinimap();
      }
    }

    renderMinimap() {
      const size = 110;
      const margin = 20;
      const x = this.canvas.width - size - margin;
      const y = this.canvas.height - size - margin - 60;
      const range = 1800;

      this.ctx.save();
      this.ctx.translate(x, y);

      this.ctx.fillStyle = 'rgba(10, 15, 25, 0.75)';
      this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.strokeStyle = 'rgba(0, 243, 255, 0.15)';
      this.ctx.beginPath();
      this.ctx.moveTo(size / 2, 0);
      this.ctx.lineTo(size / 2, size);
      this.ctx.moveTo(0, size / 2);
      this.ctx.lineTo(size, size / 2);
      this.ctx.stroke();

      const center = size / 2;
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

  // ==========================================
  // 13. DOM BOOTSTRAP
  // ==========================================
  window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const game = new Game(canvas);

    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const toggleSoundBtn = document.getElementById('toggle-sound-btn');
    const toggleCrtBtn = document.getElementById('toggle-crt-btn');

    if (startBtn) startBtn.addEventListener('click', () => game.startNewGame());
    if (restartBtn) restartBtn.addEventListener('click', () => game.startNewGame());
    if (resumeBtn) resumeBtn.addEventListener('click', () => {
      game.state = GameState.PLAYING;
      game.hud.togglePause(false);
    });

    if (toggleSoundBtn) {
      toggleSoundBtn.addEventListener('click', () => {
        const isMuted = sound.toggleMute();
        toggleSoundBtn.textContent = isMuted ? '🔇 SOUND: OFF' : '🔊 SOUND: ON';
      });
    }

    if (toggleCrtBtn) {
      toggleCrtBtn.addEventListener('click', () => game.hud.toggleCRT());
    }

    game.run();
  });
})();
