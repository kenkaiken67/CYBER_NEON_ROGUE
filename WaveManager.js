/**
 * Cyber Neon Rogue - Dynamic Wave & Encounter Director
 * Controls difficulty scaling, enemy swarm pacing, elite spawns, and Apex Boss encounters.
 */

import { Enemy } from '../entities/Enemy.js';
import { sound } from '../audio/SoundEngine.js';

export class WaveManager {
  constructor() {
    this.gameTime = 0; // seconds
    this.currentWave = 1;
    this.spawnTimer = 0;
    this.spawnInterval = 1.0; // drops over time
    this.bossActive = false;
    this.bossDefeatedCount = 0;
    this.nextBossTime = 120; // First boss spawns at 2 minutes
  }

  update(dt, player, enemies, camera, particleSystem, onBossSpawn) {
    this.gameTime += dt;

    // Difficulty multiplier based on elapsed minutes
    const minutes = this.gameTime / 60;
    const difficultyScale = 1.0 + minutes * 0.45;
    this.currentWave = Math.floor(minutes) + 1;

    // Adjust spawn interval (spawns faster as time passes)
    this.spawnInterval = Math.max(0.28, 1.1 - minutes * 0.15);

    this.spawnTimer += dt;
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnRegularEnemy(player, enemies, camera, difficultyScale);
    }

    // Boss spawn check
    if (this.gameTime >= this.nextBossTime && !this.bossActive) {
      this.bossActive = true;
      this.nextBossTime += 180; // Next boss 3 minutes later
      this.spawnBoss(player, enemies, camera, difficultyScale, onBossSpawn);
    }
  }

  getSpawnCoordinates(player, camera) {
    // Spawn in a perimeter ring outside the viewport
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
    if (this.gameTime > 60 && rand < 0.25) {
      type = 'phantom';
    } else if (this.gameTime > 120 && rand < 0.18) {
      type = 'juggernaut';
    }

    enemies.push(new Enemy(pos.x, pos.y, type, difficultyScale));
  }

  spawnBoss(player, enemies, camera, difficultyScale, onBossSpawn) {
    sound.playBossAlert();
    camera.addShake(15);

    const pos = this.getSpawnCoordinates(player, camera);
    const boss = new Enemy(pos.x, pos.y, 'boss', difficultyScale * 1.2);
    enemies.push(boss);

    if (onBossSpawn) {
      onBossSpawn(boss);
    }
  }

  formatTime() {
    const totalSec = Math.floor(this.gameTime);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
