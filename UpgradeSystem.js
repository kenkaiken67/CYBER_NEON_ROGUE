/**
 * Cyber Neon Rogue - Augmentation & Upgrade System
 * Offers 15+ synergizing cyber upgrades across 4 rarity tiers.
 */

export const UPGRADE_CATALOG = [
  // 1. WEAPONS UNLOCK & BOOSTS
  {
    id: 'wpn_orbital',
    name: 'Orbital Glaives',
    category: 'weapon',
    tier: 'epic',
    icon: '🌀',
    desc: 'Unlocks/Upgrades rotating cybernetic blades that continuously slice surrounding enemies.',
    canApply: (p, wm) => true,
    apply: (p, wm) => wm.upgradeWeapon('orbital')
  },
  {
    id: 'wpn_tesla',
    name: 'Tesla Arc Generator',
    category: 'weapon',
    tier: 'epic',
    icon: '⚡',
    desc: 'Unlocks/Upgrades electric discharge that arcs across multiple hostile drones.',
    canApply: (p, wm) => true,
    apply: (p, wm) => wm.upgradeWeapon('tesla')
  },
  {
    id: 'wpn_mines',
    name: 'Quantum Mines',
    category: 'weapon',
    tier: 'rare',
    icon: '💣',
    desc: 'Deploys proximity mines that trigger devastating explosive shockwaves.',
    canApply: (p, wm) => true,
    apply: (p, wm) => wm.upgradeWeapon('mines')
  },
  {
    id: 'blaster_overclock',
    name: 'Blaster Overclock',
    category: 'weapon',
    tier: 'rare',
    icon: '🔫',
    desc: 'Upgrades Pulse Blaster damage, fire rate, and adds extra projectiles.',
    canApply: (p, wm) => true,
    apply: (p, wm) => wm.upgradeWeapon('blaster')
  },

  // 2. OFFENSIVE AUGMENTS
  {
    id: 'plasma_infusion',
    name: 'Plasma Infusion',
    category: 'offense',
    tier: 'common',
    icon: '🔥',
    desc: 'Increases all weapon damage by +20%.',
    canApply: () => true,
    apply: (p) => { p.damageMult += 0.20; }
  },
  {
    id: 'rapid_fire_chip',
    name: 'Overdrive Clock',
    category: 'offense',
    tier: 'rare',
    icon: '⏱️',
    desc: 'Increases weapon fire rate & ability attack speed by +18%.',
    canApply: () => true,
    apply: (p) => { p.fireRateMult += 0.18; }
  },
  {
    id: 'crit_matrix',
    name: 'Critical Matrix',
    category: 'offense',
    tier: 'rare',
    icon: '🎯',
    desc: 'Increases critical strike chance by +12% and critical multiplier to 2.5x.',
    canApply: () => true,
    apply: (p) => {
      p.critChance += 0.12;
      p.critMultiplier = Math.max(p.critMultiplier, 2.5);
    }
  },
  {
    id: 'hyper_velocity',
    name: 'Hyper-Velocity Rails',
    category: 'offense',
    tier: 'common',
    icon: '🚀',
    desc: 'Increases projectile travel velocity by +25%.',
    canApply: () => true,
    apply: (p) => { p.projectileSpeedMult += 0.25; }
  },

  // 3. DEFENSIVE & SURVIVABILITY
  {
    id: 'nanite_armor',
    name: 'Reinforced Plating',
    category: 'defense',
    tier: 'common',
    icon: '🛡️',
    desc: 'Increases Maximum HP by +35 and immediately restores 35 HP.',
    canApply: () => true,
    apply: (p) => {
      p.maxHp += 35;
      p.hp += 35;
    }
  },
  {
    id: 'forcefield_capacitor',
    name: 'Forcefield Overload',
    category: 'defense',
    tier: 'rare',
    icon: '🌐',
    desc: 'Increases Maximum Shield capacity by +30 and speeds up shield recharge rate.',
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
    category: 'utility',
    tier: 'rare',
    icon: '💨',
    desc: 'Reduces Dash cooldown by 25% and grants extra movement speed (+15%).',
    canApply: () => true,
    apply: (p) => {
      p.dashCooldown = Math.max(0.8, p.dashCooldown * 0.75);
      p.speedMult += 0.15;
    }
  },

  // 4. UTILITY & ECONOMY
  {
    id: 'cyber_magnet',
    name: 'Graviton Siphon',
    category: 'utility',
    tier: 'common',
    icon: '🧲',
    desc: 'Expands XP & item attraction radius by +60%.',
    canApply: () => true,
    apply: (p) => { p.magnetRadius += 85; }
  },
  {
    id: 'adrenaline_rush',
    name: 'Cyber Adrenaline',
    category: 'utility',
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
    category: 'defense',
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

export class UpgradeSystem {
  constructor() {
    this.catalog = UPGRADE_CATALOG;
  }

  getRandomChoices(count = 3, player, weaponManager) {
    const available = this.catalog.filter(u => u.canApply(player, weaponManager));
    // Shuffle
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }
}
