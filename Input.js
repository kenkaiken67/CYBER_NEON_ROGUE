/**
 * Cyber Neon Rogue - Input Handler
 * Supports Keyboard (WASD/Arrows), Mouse Aiming & Shooting,
 * and Mobile Multi-Touch Virtual Controls.
 */

export class Input {
  constructor(canvas) {
    this.canvas = canvas;

    // Movement axes (-1 to 1)
    this.moveX = 0;
    this.moveY = 0;

    // Mouse aiming & shooting
    this.mouseX = 0;
    this.mouseY = 0;
    this.isMouseDown = false;
    this.autoFire = true; // Enabled by default for smooth rogue-survivor experience

    // Actions
    this.dashPressed = false;
    this.pausePressed = false;
    this.muteToggle = false;
    this.crtToggle = false;

    // Key states
    this.keys = {};

    // Touch virtual joystick
    this.touchJoystick = {
      active: false,
      identifier: null,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      maxRadius: 45
    };

    this.initListeners();
  }

  initListeners() {
    // Keyboard
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;

      if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        this.dashPressed = true;
      }
      if (e.code === 'KeyP' || e.code === 'Escape') {
        this.pausePressed = true;
      }
      if (e.code === 'KeyM') {
        this.muteToggle = true;
      }
      if (e.code === 'KeyC') {
        this.crtToggle = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.isMouseDown = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.isMouseDown = false;
      }
    });

    // Touch Virtual Joystick on Left Screen
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
    // If not using touch joystick, read keyboard inputs
    if (!this.touchJoystick.active) {
      let x = 0;
      let y = 0;

      if (this.keys['KeyW'] || this.keys['ArrowUp']) y -= 1;
      if (this.keys['KeyS'] || this.keys['ArrowDown']) y += 1;
      if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
      if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;

      // Normalize diagonal movement
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

  // Consume one-shot action flags
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
