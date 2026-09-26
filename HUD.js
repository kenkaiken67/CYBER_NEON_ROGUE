/**
 * Cyber Neon Rogue - HUD & UI Controller
 * Binds gameplay telemetry to the glassmorphic cyberpunk DOM interface.
 */

export class HUD {
  constructor() {
    // DOM elements
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

    // Modals
    this.startModal = document.getElementById('start-modal');
    this.upgradeModal = document.getElementById('upgrade-modal');
    this.upgradeCardsContainer = document.getElementById('upgrade-cards-container');
    this.gameoverModal = document.getElementById('gameover-modal');
    this.pauseModal = document.getElementById('pause-modal');

    // Game Over stats
    this.goTime = document.getElementById('go-time');
    this.goScore = document.getElementById('go-score');
    this.goKills = document.getElementById('go-kills');
    this.goLevel = document.getElementById('go-level');
    this.goHighscore = document.getElementById('go-highscore');

    // Weapons row
    this.weaponsRow = document.getElementById('weapons-row');

    // CRT Scanline element
    this.crtOverlay = document.querySelector('.crt-overlay');
  }

  update(player, waveManager, score, kills, activeBoss, weaponManager) {
    // Health & Shield
    const hpPercent = Math.max(0, (player.hp / player.maxHp) * 100);
    this.hpBar.style.width = `${hpPercent}%`;
    this.hpVal.textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;

    const shieldPercent = Math.max(0, (player.shield / player.maxShield) * 100);
    this.shieldBar.style.width = `${shieldPercent}%`;
    this.shieldVal.textContent = `${Math.ceil(player.shield)}/${player.maxShield}`;

    // Exp & Level
    const expPercent = Math.min(100, (player.exp / player.expToNextLevel) * 100);
    this.expBar.style.width = `${expPercent}%`;
    this.levelVal.textContent = `LVL ${player.level}`;

    // Timer & Wave
    this.timerVal.textContent = waveManager.formatTime();
    this.waveVal.textContent = `WAVE ${waveManager.currentWave}`;

    // Score & Kills
    this.scoreVal.textContent = score.toLocaleString();
    this.killsVal.textContent = kills.toLocaleString();

    // Dash status
    if (player.dashCooldownTimer <= 0) {
      this.dashIndicator.textContent = 'READY';
      this.dashIndicator.className = 'dash-indicator dash-ready';
    } else {
      this.dashIndicator.textContent = `${player.dashCooldownTimer.toFixed(1)}s`;
      this.dashIndicator.className = 'dash-indicator';
    }

    // Boss HUD
    if (activeBoss && activeBoss.alive) {
      this.bossHud.style.display = 'flex';
      const bossPercent = Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100);
      this.bossHpBar.style.width = `${bossPercent}%`;
    } else {
      this.bossHud.style.display = 'none';
    }

    // Update weapon icons
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
    if (isPaused) {
      this.pauseModal.classList.add('active');
    } else {
      this.pauseModal.classList.remove('active');
    }
  }

  toggleCRT() {
    if (this.crtOverlay) {
      this.crtOverlay.classList.toggle('disabled');
    }
  }
}
