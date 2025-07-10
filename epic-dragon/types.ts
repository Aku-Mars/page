
export enum PlayerClassType {
  KNIGHT = 'Knight',
  MAGE = 'Mage',
  ROGUE = 'Rogue',
}

export enum ItemType {
  WEAPON = 'Weapon',
  ARMOR = 'Armor',
  POTION = 'Potion', // Consumable for player buffs/healing
  MISC = 'Miscellaneous',
  GOLD_DROP_ONLY = 'GoldDropOnly', // Special type for gold pouches
  SPELL_BOOK = 'SpellBook',
  OFFENSIVE_POTION = 'OffensivePotion', // Consumable to damage enemies
  ACCESSORY = 'Accessory', // Equippable for stat bonuses
  SCROLL = 'Scroll', // Consumable for special effects like teleport
}

export enum ElementalType {
  PHYSICAL = 'Physical',
  FIRE = 'Fire',
  ICE = 'Ice',
  LIGHTNING = 'Lightning',
  HOLY = 'Holy',
  SHADOW = 'Shadow',
  EARTH = 'Earth',
  ARCANE = 'Arcane',
  POISON = 'Poison',
  WATER = 'Water', // Added
  LIGHT = 'Light', // Added
  DARKNESS = 'Darkness', // Added
  NONE = 'None', // For buffs or effects without specific elemental damage
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: ItemType;
  effectValue?: number; // For weapons, armor, normal potions
  price: number;
  icon?: string;
  tier?: number;
  teachesSpellId?: string;
  requiredPlayerClass?: PlayerClassType[];
  offensivePotionEffect?: { // For offensive potions
    damage: number;
    elementType: ElementalType;
  };
  statBonuses?: Partial<Record<'critChance' | 'physicalDamage' | 'magicDamage' | 'maxHp' | 'maxMp' | 'allDamage' | 'spellDamage' | 'physicalDefense' | 'spellDefense' | 'evasion', number>>; // For accessories
  weaponElementalType?: ElementalType; // For weapons that deal a specific elemental type on basic attack
  slotType?: 'accessory'; // Optional, ItemType.ACCESSORY implies this
  buff?: Buff; // For potions that grant temporary buffs
}

export type SpellDamageType = 'magical' | 'physical' | 'healing' | 'utility' | 'buff' | 'debuff';

export interface Spell {
  id: string;
  name: string;
  description: string;
  mpCost: number;
  damage?: number;
  healAmount?: number;
  effect?: string;
  damageType: SpellDamageType;
  elementalType: ElementalType;
  classRestriction?: PlayerClassType[];
  icon?: string;
  buff?: Buff; // Spells can also grant buffs (to self)
  duration?: number; // For spells that have effects over time (e.g. DoT, HoT, buffs)
  targetSelf?: boolean; // For spells that target the caster (like buffs)
  increasedCritChance?: number; // For spells like Shadow Strike
  buffToApplyToTarget?: Buff; // For spells that debuff the target
}

export type BuffType =
  'fire_resistance' | 'ice_resistance' | 'lightning_resistance' |
  'defense_boost' | 'attack_boost' | 'evasion_boost' | 'mana_shield' |
  'attack_reduction' | 'defense_reduction' | 'evasion_reduction_player' | 'crit_chance_reduction'; // Player targeted debuffs

export interface Buff {
  type: BuffType;
  value: number; // e.g., 0.5 for 50% resistance, or flat defense amount, or flat attack reduction
  duration: number; // in combat turns
  element?: ElementalType; // e.g. for resistance buffs
  description: string;
  isDebuff?: boolean; // True if it's a negative effect
}

export interface MonsterAbility {
    name: string;
    type: 'attack' | 'debuff' | 'special' | 'buff'; // 'special' can be a stronger attack or unique effect
    power?: number; // Base power for 'attack' or 'special'
    elementalType?: ElementalType; // For 'attack' or 'special'
    buffToApply?: Buff; // For 'debuff' (on player) or 'buff' (on self)
    description: string;
    targetSelf?: boolean; // If true, ability targets the monster itself (e.g. self-buff)
}

export interface Monster {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  physicalDefense: number;
  spellDefense: number;
  resistances: ElementalType[];
  weaknesses: ElementalType[];
  drops: { itemId: string; chance: number; customValue?: { min: number; max: number }; }[];
  goldDrop: { min: number; max: number };
  xpYield: number;
  spriteUrl: string;
  spritePrompt: string;
  abilities?: MonsterAbility[];
  activeBuffs: Buff[]; // Monsters can now have buffs/debuffs - Made non-optional
}

export interface Stage {
  id: number;
  name: string;
  description: string;
  terrainArtUrl: string;
  terrainArtPrompt: string;
  monsters: string[];
  boss?: string;
  itemFinds?: { itemId: string; chance: number }[];
}

export interface Player {
  name: string;
  password?: string; // For local auth simplicity. In production, use a hash.
  playerClass: PlayerClassType;
  level: number;
  xp: number;
  xpToNextLevel: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  baseAttack: number;
  baseDefense: number;
  baseCritChance: number;
  gold: number;
  inventory: Item[];
  equippedWeapon: Item | null;
  equippedArmor: Item | null;
  equippedAccessories: (Item | null)[]; // Array for 5 accessory slots
  spells: Spell[];
  currentStageId: number;
  maxStageReached: number;
  elapsedTime: number; // Time in seconds for leaderboard
  activeBuffs: Buff[]; // For temporary buffs/debuffs
}

export enum GamePhase {
  AUTH = 'Auth',
  LOGIN_CHOICE = 'LoginChoice', // Added for continue/restart option
  CHARACTER_CREATION = 'CharacterCreation',
  // IMAGE_GENERATION_TOOL = 'ImageGenerationTool', // Removed
  VILLAGE = 'Village',
  SHOP = 'Shop',
  MAGE_INTERACTION = 'MageInteraction', // Could be part of Village or a dedicated screen
  STAGE_SELECT = 'StageSelect',
  EXPLORING = 'Exploring',
  COMBAT = 'Combat',
  COMBAT_VICTORY = 'CombatVictory',
  GAME_OVER = 'GameOver',
  VICTORY = 'Victory',
  SECRET_BOSS_INTRO = 'SecretBossIntro',
  SECRET_BOSS_COMBAT = 'SecretBossCombat', // Not directly used as a phase, combat handles it
  LEADERBOARD = 'Leaderboard',
}

export interface ShopItem extends Item {
  stock?: number;
}

export interface CombatOutcomeDetails {
  defeatedMonsterName: string;
  xpGained: number;
  goldGained: number;
  itemsFound: Item[];
  leveledUp: boolean;
  levelUpMessage?: string;
  isBossDefeat: boolean;
  isFinalBossDefeat: boolean;
  isSecretBossDefeat?: boolean;
  defeatedStageId: number; // ID of the stage where the boss was defeated
  playerMaxStageReachedBeforeThisVictory: number; // Player's maxStageReached before this specific victory
}

export interface LeaderboardEntry {
  username: string;
  time: number; // in seconds
  playerClass: PlayerClassType;
  level: number;
  date: string; // ISO string
}

export interface FloatingNumber {
  id: string;
  text: string;
  type: 'damage' | 'heal' | 'resist' | 'buff' | 'debuff' | 'xp' | 'gold' | 'evade' | 'crit' | 'spell_indicator';
  x: number;
  y: number;
  timestamp: number;
  dynamicColor?: string; // For spell names or other dynamically colored text
}