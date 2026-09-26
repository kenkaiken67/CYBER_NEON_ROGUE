/**
 * Cyber Neon Rogue - Smooth Dynamic Camera & Cyber Grid Renderer
 */

export class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.lerpSpeed = 0.08;

    // Screen shake
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    // Arena boundary size
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
    // Smooth lerp follow
    this.x += (this.targetX - this.x) * this.lerpSpeed;
    this.y += (this.targetY - this.y) * this.lerpSpeed;

    // Screen shake update
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

  // Draw cybernetic infinite neon grid & arena bounds
  renderBackground(ctx) {
    const halfW = this.viewportWidth / 2;
    const halfH = this.viewportHeight / 2;
    const gridSize = 80;

    // Calculate grid offsets based on camera position
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

    // Render Outer Arena Perimeter Warning Fence
    const topLeft = this.worldToScreen(-this.arenaSize, -this.arenaSize);
    const boundsSize = this.arenaSize * 2;

    ctx.strokeStyle = 'rgba(255, 0, 127, 0.6)';
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 15;
    ctx.strokeRect(topLeft.x, topLeft.y, boundsSize, boundsSize);

    // Hazard stripes at perimeter corners
    ctx.fillStyle = 'rgba(255, 0, 127, 0.15)';
    ctx.fillRect(topLeft.x, topLeft.y, boundsSize, boundsSize);

    ctx.restore();
  }
}
