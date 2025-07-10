
import { PlayerClassType, Item, Spell, Monster, Stage, ShopItem, ItemType, SpellDamageType, ElementalType, Buff, MonsterAbility } from './types';

export const GAME_TITLE = "Pixel Realms: Dragon Knight's Fury";
export const LEADERBOARD_MAX_ENTRIES = 10;
export const REST_TIME_PENALTY_SECONDS = 120; // 2 minutes penalty for resting
export const SHOP_REFRESH_MAX_ITEMS = 10;
export const SHOP_REFRESH_COST = 50;
export const XP_PER_LEVEL_BASE = 100; // Added for gameLogic
export const XP_LEVEL_MULTIPLIER = 1.5; // Added for gameLogic
export const INITIAL_GOLD = 50; // Added for App.tsx
export const VILLAGE_NAME = "Windfall Village"; // Added for App.tsx & VillageScreen
export const MAGE_MESSAGES = ["The shadows stir... be wary.", "Seek strength in unity, or find it within.", "Not all that glitters is gold, but gold helps."]; // Added for App.tsx

export const PLAYER_CLASSES = [
  { 
    type: PlayerClassType.KNIGHT, 
    description: "A stalwart warrior, excelling in defense and melee combat. Starts with higher HP and defense.",
    baseStats: { hp: 120, mp: 30, attack: 12, defense: 10 },
    baseCritChance: 0.12, 
    initialWeaponId: 'basic_sword',
    initialArmorId: 'leather_armor',
    initialSpells: ['power_strike', 'guard_up'], 
  },
  { 
    type: PlayerClassType.MAGE, 
    description: "A master of arcane arts, wielding powerful spells. Starts with higher MP and access to offensive magic.",
    baseStats: { hp: 80, mp: 80, attack: 6, defense: 4 },
    baseCritChance: 0.05, 
    initialWeaponId: 'wooden_staff',
    initialArmorId: 'cloth_robes',
    initialSpells: ['fireball', 'mana_shield_spell'], 
  },
  { 
    type: PlayerClassType.ROGUE, 
    description: "A swift and cunning fighter, relying on agility and critical strikes. Starts with higher evasion.", // Removed (concept)
    baseStats: { hp: 90, mp: 50, attack: 10, defense: 6 },
    baseCritChance: 0.20, 
    initialWeaponId: 'iron_dagger',
    initialArmorId: 'leather_jerkin',
    initialSpells: ['quick_stab', 'evasive_maneuver'], 
  },
];

export const ITEMS: Record<string, Item> = {
  // Weapons
  'basic_sword': { id: 'basic_sword', name: 'Basic Sword', description: 'A simple but reliable sword.', type: ItemType.WEAPON, effectValue: 5, price: 50, icon: '🗡️', tier: 1 },
  'wooden_staff': { id: 'wooden_staff', name: 'Wooden Staff', description: 'A sturdy staff, good for channeling mana.', type: ItemType.WEAPON, effectValue: 3, price: 40, icon: '🪄', tier: 1, statBonuses: {magicDamage: 2} },
  'iron_dagger': { id: 'iron_dagger', name: 'Iron Dagger', description: 'A sharp dagger, quick in nimble hands.', type: ItemType.WEAPON, effectValue: 4, price: 45, icon: '🔪', tier: 1 },
  'steel_longsword': { id: 'steel_longsword', name: 'Steel Longsword', description: 'A well-crafted longsword.', type: ItemType.WEAPON, effectValue: 10, price: 200, icon: '⚔️', tier: 2 },
  'enchanted_grimoire': {id: 'enchanted_grimoire', name: 'Enchanted Grimoire', description: 'Boosts magical power.', type: ItemType.WEAPON, effectValue: 8, price: 250, icon: '📖', tier: 2, statBonuses: { magicDamage: 5, spellDamage: 3 }}, 
  'obsidian_blade': { id: 'obsidian_blade', name: 'Obsidian Blade', description: 'Attack +20. Imbued with fire.', type: ItemType.WEAPON, effectValue: 20, price: 700, icon: '🗡️🔥', tier: 3, weaponElementalType: ElementalType.FIRE },
  'dragonfang_blade': { id: 'dragonfang_blade', name: 'Dragonfang Blade', description: 'A legendary blade, pulsing with draconic energy.', type: ItemType.WEAPON, effectValue: 35, price: 2000, icon: '🐲⚔️', tier: 5, statBonuses: {allDamage: 5} },
  'shadow_infused_stiletto': { id: 'shadow_infused_stiletto', name: 'Shadow Stiletto', description: 'Dagger humming with shadow energy. Higher crit.', type: ItemType.WEAPON, effectValue: 15, price: 650, icon: '👤🔪', tier: 3, statBonuses: {critChance: 0.05}, requiredPlayerClass: [PlayerClassType.ROGUE]},
  'runic_longbow': { id: 'runic_longbow', name: 'Runic Longbow', description: 'A longbow etched with glowing runes. Favored by agile mages or sharp-eyed rogues.', type: ItemType.WEAPON, effectValue: 12, price: 800, icon: '🏹✨', tier: 3, weaponElementalType: ElementalType.ARCANE, statBonuses: { critChance: 0.03, magicDamage: 5 }, requiredPlayerClass: [PlayerClassType.ROGUE, PlayerClassType.MAGE] },
  'warhammer_of_smiting': { id: 'warhammer_of_smiting', name: 'Warhammer of Smiting', description: 'A heavy warhammer blessed by a forgotten deity. Crushes foes with holy might.', type: ItemType.WEAPON, effectValue: 25, price: 950, icon: '🔨🌟', tier: 4, weaponElementalType: ElementalType.HOLY, statBonuses: { physicalDamage: 5}, requiredPlayerClass: [PlayerClassType.KNIGHT] },
  'crystal_wand': { id: 'crystal_wand', name: 'Crystal Wand', description: 'A wand crafted from a large, pure crystal. Amplifies magical energies.', type: ItemType.WEAPON, effectValue: 5, price: 750, icon: '💎🪄', tier: 3, statBonuses: { spellDamage: 10, maxMp: 15, magicDamage: 3 }, requiredPlayerClass: [PlayerClassType.MAGE] },

  // Armor
  'leather_armor': { id: 'leather_armor', name: 'Leather Armor', description: 'Basic protection made from cured hides.', type: ItemType.ARMOR, effectValue: 3, price: 60, icon: '🛡️', tier: 1 },
  'cloth_robes': { id: 'cloth_robes', name: 'Cloth Robes', description: 'Simple robes offering minimal protection.', type: ItemType.ARMOR, effectValue: 1, price: 30, icon: '🥋', tier: 1, statBonuses: {maxMp: 5} },
  'leather_jerkin': { id: 'leather_jerkin', name: 'Leather Jerkin', description: 'Light armor favored by scouts.', type: ItemType.ARMOR, effectValue: 2, price: 50, icon: '🧥', tier: 1 },
  'chainmail_vest': { id: 'chainmail_vest', name: 'Chainmail Vest', description: 'Provides good protection against cuts.', type: ItemType.ARMOR, effectValue: 7, price: 220, icon: '🛡️⛓️', tier: 2 },
  'living_bark_armor': { id: 'living_bark_armor', name: 'Living Bark Armor', description: 'Armor imbued with forest spirit. DEF +8.', type: ItemType.ARMOR, effectValue: 8, price: 300, icon: '🌳🛡️', tier: 2, statBonuses: {spellDefense: 3} },
  'wraith_cloak': { id: 'wraith_cloak', name: 'Wraith Cloak', description: 'Ethereal cloak. DEF +5, SpellDEF +5.', type: ItemType.ARMOR, effectValue: 5, price: 400, icon: '👻🧥', tier: 3, statBonuses: {spellDefense: 5} },
  'heatforged_gauntlets': { id: 'heatforged_gauntlets', name: 'Heatforged Gauntlets', description: 'Resilient gauntlets. DEF +10.', type: ItemType.ARMOR, effectValue: 10, price: 500, icon: '🔥🧤', tier: 3 },
  'titans_crown': { id: 'titans_crown', name: 'Titan\'s Crown', description: 'Crown of an ice titan. DEF +7.', type: ItemType.ARMOR, effectValue: 7, price: 800, icon: '👑❄️', tier: 4, statBonuses: {spellDefense: 5, maxMp: 10} }, 
  'aetharions_shield': { id: 'aetharions_shield', name: 'Aetharion\'s Scaled Shield', description: 'Shield of the Dragon Knight. DEF +25.', type: ItemType.ARMOR, effectValue: 25, price: 1800, icon: '🐲🛡️', tier: 5, statBonuses: {physicalDefense: 10, spellDefense: 10} },

  // Potions (Player Buff/Heal)
  'health_potion_s': { id: 'health_potion_s', name: 'Health Potion (S)', description: 'Restores 30 HP.', type: ItemType.POTION, effectValue: 30, price: 25, icon: '🧪❤️', tier: 1 },
  'mana_potion_s': { id: 'mana_potion_s', name: 'Mana Potion (S)', description: 'Restores 20 MP.', type: ItemType.POTION, effectValue: 20, price: 30, icon: '💧✨', tier: 1 },
  'health_potion_m': { id: 'health_potion_m', name: 'Health Potion (M)', description: 'Restores 75 HP.', type: ItemType.POTION, effectValue: 75, price: 70, icon: '🧪❤️➕', tier: 2 },
  'mana_potion_m': { id: 'mana_potion_m', name: 'Mana Potion (M)', description: 'Restores 50 MP.', type: ItemType.POTION, effectValue: 50, price: 80, icon: '💧✨➕', tier: 2 },
  'health_potion_l': { id: 'health_potion_l', name: 'Health Potion (L)', description: 'Restores 150 HP.', type: ItemType.POTION, effectValue: 150, price: 150, icon: '🧪❤️💪', tier: 3 },
  'mana_potion_l': { id: 'mana_potion_l', name: 'Mana Potion (L)', description: 'Restores 100 MP.', type: ItemType.POTION, effectValue: 100, price: 170, icon: '💧✨💪', tier: 3 },
  'health_potion_xl': { id: 'health_potion_xl', name: 'Health Potion (XL)', description: 'Restores 300 HP.', type: ItemType.POTION, effectValue: 300, price: 320, icon: '🧪❤️🌟', tier: 4 },
  'mana_potion_xl': { id: 'mana_potion_xl', name: 'Mana Potion (XL)', description: 'Restores 200 MP.', type: ItemType.POTION, effectValue: 200, price: 350, icon: '💧✨🌟', tier: 4 },
  
  'fireproof_potion': { 
    id: 'fireproof_potion', name: 'Fireproof Potion', 
    description: 'Grants 50% fire resistance for 3 turns.', 
    type: ItemType.POTION, 
    price: 150, icon: '🧪🔥🛡️', tier: 3,
    buff: { type: 'fire_resistance', value: 0.5, duration: 3, element: ElementalType.FIRE, description: 'Grants Fire Resistance.' }
  },
  'elixir_of_iron_skin': {
    id: 'elixir_of_iron_skin', name: 'Elixir of Iron Skin',
    description: 'Increases Physical Defense by 5 for 3 turns.',
    type: ItemType.POTION, price: 180, icon: '🧪🛡️💪', tier: 3,
    buff: { type: 'defense_boost', value: 5, duration: 3, description: 'Boosts Physical Defense.' }
  },
  'sharpening_stone_item': {
    id: 'sharpening_stone_item', name: 'Sharpening Stone',
    description: 'Temporarily increases physical attack power by 5 for 3 turns.',
    type: ItemType.POTION, price: 120, icon: '砥石', tier: 2, 
    buff: { type: 'attack_boost', value: 5, duration: 3, description: 'Physical Attack Boosted!' }
  },

  // Offensive Potions
  'flask_of_holy_water': { id: 'flask_of_holy_water', name: 'Flask of Holy Water', description: 'Hurl to deal Holy damage to an enemy.', type: ItemType.OFFENSIVE_POTION, offensivePotionEffect: { damage: 30, elementType: ElementalType.HOLY }, price: 75, icon: '💦✨', tier: 2 },
  'fire_bomb': { id: 'fire_bomb', name: 'Fire Bomb', description: 'Explodes dealing Fire damage to an enemy.', type: ItemType.OFFENSIVE_POTION, offensivePotionEffect: { damage: 40, elementType: ElementalType.FIRE }, price: 100, icon: '💣🔥', tier: 2 },

  // Accessories
  'ring_of_precision': { id: 'ring_of_precision', name: 'Ring of Precision', description: 'Increases critical hit chance.', type: ItemType.ACCESSORY, statBonuses: { critChance: 0.05 }, price: 300, icon: '🎯💍', tier: 2 },
  'amulet_of_power': { id: 'amulet_of_power', name: 'Amulet of Power', description: 'Boosts physical and magic damage.', type: ItemType.ACCESSORY, statBonuses: { physicalDamage: 3, magicDamage: 3 }, price: 450, icon: '💪🧿', tier: 3 },
  'forbidden_tome_acc': { id: 'forbidden_tome_acc', name: 'Forbidden Tome', description: 'A dark tome that enhances magical might. (Mage Only)', type: ItemType.ACCESSORY, statBonuses: { magicDamage: 8, spellDamage: 5 }, price: 600, icon: '📕✨', tier: 3, requiredPlayerClass: [PlayerClassType.MAGE] },
  'warriors_bracer': { id: 'warriors_bracer', name: 'Warrior\'s Bracer', description: 'Strengthens the wearer. (Knight/Rogue)', type: ItemType.ACCESSORY, statBonuses: { maxHp: 20, physicalDamage: 2 }, price: 350, icon: '🛡️💪', tier: 2, requiredPlayerClass: [PlayerClassType.KNIGHT, PlayerClassType.ROGUE] },
  'ring_of_vitality': { id: 'ring_of_vitality', name: 'Ring of Vitality', description: 'Significantly increases maximum HP.', type: ItemType.ACCESSORY, statBonuses: { maxHp: 30 }, price: 250, icon: '❤️💍', tier: 2 },
  'verdant_ring': { id: 'verdant_ring', name: 'Verdant Ring', description: 'A ring humming with life energy. Increases HP and MP slightly.', type: ItemType.ACCESSORY, statBonuses: {maxHp: 10, maxMp: 5}, price: 250, icon: '🍃💍', tier: 2 },
  'shadow_cloak_acc': { id: 'shadow_cloak_acc', name: 'Shadow Cloak Pin', description: 'A cloak pin that helps blend into shadows. (Rogue Only)', type: ItemType.ACCESSORY, statBonuses: { evasion: 0.05, critChance: 0.02 }, price: 700, icon: '👤🧥', tier: 3, requiredPlayerClass: [PlayerClassType.ROGUE]},
  'boots_of_swiftness': { id: 'boots_of_swiftness', name: 'Boots of Swiftness', description: 'Enchanted boots that make the wearer more agile.', type: ItemType.ACCESSORY, statBonuses: { evasion: 0.07 }, price: 400, icon: '👟💨', tier: 2 },
  'scholars_pendant': { id: 'scholars_pendant', name: 'Scholar\'s Pendant', description: 'A pendant that aids in mana control and spell potency.', type: ItemType.ACCESSORY, statBonuses: { maxMp: 15, spellDamage: 4 }, price: 550, icon: '🎓📿', tier: 3 },
  'bracers_of_might': { id: 'bracers_of_might', name: 'Bracers of Might', description: 'Heavy bracers that significantly boost physical attack.', type: ItemType.ACCESSORY, statBonuses: { physicalDamage: 6 }, price: 600, icon: '💪🔩', tier: 3 },

  // Misc & Quest Items
  'forest_token': { id: 'forest_token', name: 'Forest Token', description: 'A token of passage from the Elder Treant.', type: ItemType.MISC, price: 10, icon: '🌱📜', tier: 1 }, 
  'soul_gem': { id: 'soul_gem', name: 'Soul Gem', description: 'A gem containing captured soul essence.', type: ItemType.ACCESSORY, statBonuses: {magicDamage: 2, spellDamage: 3, maxMp: 10}, price: 350, icon: '💎👻', tier: 3 },
  'frozen_heart': { id: 'frozen_heart', name: 'Frozen Heart', description: 'The icy core of a powerful being.', type: ItemType.ACCESSORY, statBonuses: {maxMp: 15, spellDamage: 2, spellDefense: 3}, price: 600, icon: '🧊💙', tier: 4 },
  'essence_of_dragon': { id: 'essence_of_dragon', name: 'Essence of the Dragon', description: 'Potent essence to empower abilities.', type: ItemType.MISC, price: 1000, icon: '🧬🐲', tier: 5 },
  'gold_pouch_s': { id: 'gold_pouch_s', name: 'Small Gold Pouch', description: 'Contains a small amount of gold.', type: ItemType.GOLD_DROP_ONLY, price: 0, icon: '💰', tier: 0},
  'shadow_monarch_crest': { id: 'shadow_monarch_crest', name: 'Shadow Monarch\'s Crest', description: 'A fragment of pure shadow power. Grants immense all-around bonuses.', type: ItemType.ACCESSORY, statBonuses: { maxHp: 50, maxMp: 25, physicalDamage: 10, magicDamage: 10, spellDamage: 10, critChance: 0.05, physicalDefense: 5, spellDefense: 5 }, price: 10000, icon: '👑🌑', tier: 6 },
  'scroll_of_town_portal': { id: 'scroll_of_town_portal', name: 'Scroll of Town Portal', description: 'Instantly teleports you to Windfall Village. Consumed on use.', type: ItemType.SCROLL, price: 200, icon: '📜🏘️', tier: 2},

  // Spell Books
  'sb_minor_heal': { id: 'sb_minor_heal', name: 'Spell Book: Minor Heal', description: 'Teaches Minor Heal.', type: ItemType.SPELL_BOOK, teachesSpellId: 'minor_heal', price: 100, icon: '📖💖', tier: 1, requiredPlayerClass: [PlayerClassType.MAGE, PlayerClassType.KNIGHT] },
  'sb_shield_bash': { id: 'sb_shield_bash', name: 'Spell Book: Shield Bash', description: 'Teaches Shield Bash.', type: ItemType.SPELL_BOOK, teachesSpellId: 'shield_bash', price: 150, icon: '📖🛡️', tier: 1, requiredPlayerClass: [PlayerClassType.KNIGHT] },
  'sb_ice_lance': { id: 'sb_ice_lance', name: 'Spell Book: Ice Lance', description: 'Teaches Ice Lance.', type: ItemType.SPELL_BOOK, teachesSpellId: 'ice_lance', price: 180, icon: '📖❄️', tier: 2, requiredPlayerClass: [PlayerClassType.MAGE] },
  'sb_poison_shiv': { id: 'sb_poison_shiv', name: 'Spell Book: Poison Shiv', description: 'Teaches Poison Shiv.', type: ItemType.SPELL_BOOK, teachesSpellId: 'poison_shiv', price: 160, icon: '📖🔪', tier: 2, requiredPlayerClass: [PlayerClassType.ROGUE] },
  'sb_meditate': { id: 'sb_meditate', name: 'Spell Book: Meditate', description: 'Teaches Meditate.', type: ItemType.SPELL_BOOK, teachesSpellId: 'meditate', price: 200, icon: '📖🧘', tier: 2, requiredPlayerClass: [PlayerClassType.MAGE] },
  'sb_holy_strike': { id: 'sb_holy_strike', name: 'Spell Book: Holy Strike', description: 'Teaches Holy Strike.', type: ItemType.SPELL_BOOK, teachesSpellId: 'holy_strike', price: 250, icon: '📖✨', tier: 3, requiredPlayerClass: [PlayerClassType.KNIGHT] },
  'sb_lightning_bolt': { id: 'sb_lightning_bolt', name: 'Spell Book: Lightning Bolt', description: 'Teaches Lightning Bolt.', type: ItemType.SPELL_BOOK, teachesSpellId: 'lightning_bolt', price: 220, icon: '📖⚡', tier: 2, requiredPlayerClass: [PlayerClassType.MAGE] },
  'sb_righteous_smite': { id: 'sb_righteous_smite', name: 'Spell Book: Righteous Smite', description: 'Teaches Righteous Smite (Holy).', type: ItemType.SPELL_BOOK, teachesSpellId: 'righteous_smite', price: 280, icon: '📖🌟', tier: 3, requiredPlayerClass: [PlayerClassType.KNIGHT] },
  'sb_heavy_blow': { id: 'sb_heavy_blow', name: 'Spell Book: Heavy Blow', description: 'Teaches Heavy Blow (Physical).', type: ItemType.SPELL_BOOK, teachesSpellId: 'heavy_blow', price: 260, icon: '📖🔨', tier: 2, requiredPlayerClass: [PlayerClassType.KNIGHT] },
  'sb_stone_blast': { id: 'sb_stone_blast', name: 'Spell Book: Stone Blast', description: 'Teaches Stone Blast (Earth).', type: ItemType.SPELL_BOOK, teachesSpellId: 'stone_blast', price: 300, icon: '📖🧱', tier: 3, requiredPlayerClass: [PlayerClassType.MAGE] },
  'sb_arcane_barrage': { id: 'sb_arcane_barrage', name: 'Spell Book: Arcane Barrage', description: 'Teaches Arcane Barrage.', type: ItemType.SPELL_BOOK, teachesSpellId: 'arcane_barrage', price: 350, icon: '📖🌀', tier: 3, requiredPlayerClass: [PlayerClassType.MAGE] },
  'sb_shadow_strike': { id: 'sb_shadow_strike', name: 'Spell Book: Shadow Strike', description: 'Teaches Shadow Strike.', type: ItemType.SPELL_BOOK, teachesSpellId: 'shadow_strike', price: 320, icon: '📖👤', tier: 3, requiredPlayerClass: [PlayerClassType.ROGUE] },
  'sb_vipers_bite': { id: 'sb_vipers_bite', name: 'Spell Book: Viper\'s Bite', description: 'Teaches Viper\'s Bite (Poison).', type: ItemType.SPELL_BOOK, teachesSpellId: 'vipers_bite', price: 270, icon: '📖🐍', tier: 2, requiredPlayerClass: [PlayerClassType.ROGUE] }, 
  'sb_holy_blade': { id: 'sb_holy_blade', name: 'Spell Book: Holy Blade', description: 'Teaches Holy Blade (Knight, Holy/Phys).', type: ItemType.SPELL_BOOK, teachesSpellId: 'holy_blade', price: 200, icon: '📖✨🗡️', tier: 2, requiredPlayerClass: [PlayerClassType.KNIGHT] },
  'sb_flaming_cleave': { id: 'sb_flaming_cleave', name: 'Spell Book: Flaming Cleave', description: 'Teaches Flaming Cleave (Knight, Fire/Phys).', type: ItemType.SPELL_BOOK, teachesSpellId: 'flaming_cleave', price: 240, icon: '📖🔥⚔️', tier: 3, requiredPlayerClass: [PlayerClassType.KNIGHT] },
  'sb_venomous_strike': { id: 'sb_venomous_strike', name: 'Spell Book: Venomous Strike', description: 'Teaches Venomous Strike (Rogue, Poison/Phys).', type: ItemType.SPELL_BOOK, teachesSpellId: 'venomous_strike', price: 190, icon: '📖🐍🔪', tier: 2, requiredPlayerClass: [PlayerClassType.ROGUE] },
  'sb_shadowmancers_dagger': { id: 'sb_shadowmancers_dagger', name: 'Spell Book: Shadowmancer\'s Dagger', description: 'Teaches Shadowmancer\'s Dagger (Rogue, Shadow/Mag).', type: ItemType.SPELL_BOOK, teachesSpellId: 'shadowmancers_dagger', price: 310, icon: '📖👤🔮', tier: 3, requiredPlayerClass: [PlayerClassType.ROGUE] },
  'sb_earthquake_stomp': { id: 'sb_earthquake_stomp', name: 'Spell Book: Earthquake Stomp', description: 'Teaches Earthquake Stomp (Knight, Phys/Earth).', type: ItemType.SPELL_BOOK, teachesSpellId: 'earthquake_stomp', price: 400, icon: '📖🌍🔨', tier: 4, requiredPlayerClass: [PlayerClassType.KNIGHT] },
  'sb_chain_lightning': { id: 'sb_chain_lightning', name: 'Spell Book: Chain Lightning', description: 'Teaches Chain Lightning (Mage, Lightning).', type: ItemType.SPELL_BOOK, teachesSpellId: 'chain_lightning', price: 420, icon: '📖🔗⚡', tier: 4, requiredPlayerClass: [PlayerClassType.MAGE] },
  'sb_crippling_shot': { id: 'sb_crippling_shot', name: 'Spell Book: Crippling Shot', description: 'Teaches Crippling Shot (Rogue, Phys/Shadow, Debuff).', type: ItemType.SPELL_BOOK, teachesSpellId: 'crippling_shot', price: 380, icon: '📖🎯⛓️', tier: 3, requiredPlayerClass: [PlayerClassType.ROGUE] },
};

export const SPELLS: Record<string, Spell> = {
  // Initial Spells
  'power_strike': { id: 'power_strike', name: 'Power Strike', description: 'A strong physical attack.', mpCost: 10, damage: 5, damageType: 'physical', elementalType: ElementalType.PHYSICAL, classRestriction: [PlayerClassType.KNIGHT], icon: '💥' },
  'fireball': { id: 'fireball', name: 'Fireball', description: 'Hurls a ball of fire.', mpCost: 15, damage: 20, damageType: 'magical', elementalType: ElementalType.FIRE, classRestriction: [PlayerClassType.MAGE], icon: '🔥' },
  'quick_stab': { id: 'quick_stab', name: 'Quick Stab', description: 'A fast, precise stab.', mpCost: 8, damage: 3, damageType: 'physical', elementalType: ElementalType.PHYSICAL, classRestriction: [PlayerClassType.ROGUE], icon: '💨' },
  'guard_up': {
    id: 'guard_up', name: 'Guard Up', description: 'Temporarily increases your physical defense by 3 for 3 turns.', mpCost: 10, damageType: 'buff', elementalType: ElementalType.NONE, classRestriction: [PlayerClassType.KNIGHT], icon: '🛡️⬆️',
    buff: { type: 'defense_boost', value: 3, duration: 3, description: 'Increases Physical Defense.' }, targetSelf: true,
  },
  'mana_shield_spell': {
    id: 'mana_shield_spell', name: 'Mana Shield', description: 'Absorbs up to 20 damage using MP instead of HP. Lasts 3 turns or until broken.', mpCost: 25, damageType: 'buff', elementalType: ElementalType.ARCANE, classRestriction: [PlayerClassType.MAGE], icon: '🔮🛡️',
    buff: { type: 'mana_shield', value: 20, duration: 3, description: 'Mana Shield active.' }, targetSelf: true,
  },
  'evasive_maneuver': {
    id: 'evasive_maneuver', name: 'Evasive Maneuver', description: 'Increases evasion by 10% for 2 turns.', mpCost: 15, damageType: 'buff', elementalType: ElementalType.NONE, classRestriction: [PlayerClassType.ROGUE], icon: '🌬️💃',
    buff: { type: 'evasion_boost', value: 0.10, duration: 2, description: 'Evasion Boosted.' }, targetSelf: true,
  },
  
  // Learnable Spells (Tier 1-2)
  'minor_heal': { id: 'minor_heal', name: 'Minor Heal', description: 'Slightly restores HP.', mpCost: 10, healAmount: 25, damageType: 'healing', elementalType: ElementalType.HOLY, classRestriction: [PlayerClassType.MAGE, PlayerClassType.KNIGHT], icon: '💖', targetSelf: true },
  'ice_lance': {id: 'ice_lance', name: 'Ice Lance', description: 'Pierces foe with an ice shard.', mpCost: 20, damage: 30, damageType: 'magical', elementalType: ElementalType.ICE, classRestriction: [PlayerClassType.MAGE], icon: '❄️'},
  'shield_bash': { id: 'shield_bash', name: 'Shield Bash', description: 'Slams with your shield.', mpCost: 12, damage: 8, damageType: 'physical', elementalType: ElementalType.PHYSICAL, classRestriction: [PlayerClassType.KNIGHT], icon: '🛡️👊' },
  'poison_shiv': { id: 'poison_shiv', name: 'Poison Shiv', description: 'Stab with a poisoned blade.', mpCost: 15, damage: 6, damageType: 'physical', elementalType: ElementalType.POISON, classRestriction: [PlayerClassType.ROGUE], icon: '🔪☠️' }, 
  'meditate': { id: 'meditate', name: 'Meditate', description: 'Focus to restore 30 MP.', mpCost: 0, healAmount: 30, damageType: 'utility', elementalType: ElementalType.ARCANE, classRestriction: [PlayerClassType.MAGE], icon: '🧘✨', targetSelf: true }, 
  'lightning_bolt': {id: 'lightning_bolt', name: 'Lightning Bolt', description: 'Calls down lightning.', mpCost: 22, damage: 32, damageType: 'magical', elementalType: ElementalType.LIGHTNING, classRestriction: [PlayerClassType.MAGE], icon: '⚡'},
  
  // More Learnable Spells (Tier 2-3)
  'holy_strike': { id: 'holy_strike', name: 'Holy Strike', description: 'Infuses weapon with holy energy.', mpCost: 25, damage: 35, damageType: 'magical', elementalType: ElementalType.HOLY, classRestriction: [PlayerClassType.KNIGHT], icon: '✨⚔️' },
  'righteous_smite': { id: 'righteous_smite', name: 'Righteous Smite', description: 'A powerful holy magical attack.', mpCost: 30, damage: 45, damageType: 'magical', elementalType: ElementalType.HOLY, classRestriction: [PlayerClassType.KNIGHT], icon: '🌟⚔️' },
  'heavy_blow': { id: 'heavy_blow', name: 'Heavy Blow', description: 'A crushing physical blow.', mpCost: 18, damage: 12, damageType: 'physical', elementalType: ElementalType.PHYSICAL, classRestriction: [PlayerClassType.KNIGHT], icon: '🔨💥' },
  'stone_blast': { id: 'stone_blast', name: 'Stone Blast', description: 'Hurls a chunk of rock.', mpCost: 28, damage: 40, damageType: 'magical', elementalType: ElementalType.EARTH, classRestriction: [PlayerClassType.MAGE], icon: '🧱☄️' },
  'arcane_barrage': { id: 'arcane_barrage', name: 'Arcane Barrage', description: 'Unleashes a volley of arcane missiles.', mpCost: 35, damage: 50, damageType: 'magical', elementalType: ElementalType.ARCANE, classRestriction: [PlayerClassType.MAGE], icon: '🌀✨' },
  'shadow_strike': { id: 'shadow_strike', name: 'Shadow Strike', description: 'Strike from the shadows. Higher crit chance.', mpCost: 20, damage: 10, damageType: 'physical', elementalType: ElementalType.SHADOW, classRestriction: [PlayerClassType.ROGUE], icon: '👤🗡️', increasedCritChance: 0.25 },
  'vipers_bite': { id: 'vipers_bite', name: 'Viper\'s Bite', description: 'A swift, venomous strike.', mpCost: 22, damage: 15, damageType: 'physical', elementalType: ElementalType.POISON, classRestriction: [PlayerClassType.ROGUE], icon: '🐍🩸' }, 
  'holy_blade': { id: 'holy_blade', name: 'Holy Blade', description: 'A physical strike imbued with Holy power.', mpCost: 15, damage: 10, damageType: 'physical', elementalType: ElementalType.HOLY, classRestriction: [PlayerClassType.KNIGHT], icon: '✨🗡️'},
  'flaming_cleave': { id: 'flaming_cleave', name: 'Flaming Cleave', description: 'A sweeping attack imbued with Fire.', mpCost: 20, damage: 12, damageType: 'physical', elementalType: ElementalType.FIRE, classRestriction: [PlayerClassType.KNIGHT], icon: '🔥⚔️'},
  'venomous_strike': { id: 'venomous_strike', name: 'Venomous Strike', description: 'A quick jab dealing Poison damage.', mpCost: 12, damage: 7, damageType: 'physical', elementalType: ElementalType.POISON, classRestriction: [PlayerClassType.ROGUE], icon: '🐍🔪'},
  'shadowmancers_dagger': { id: 'shadowmancers_dagger', name: 'Shadowmancer\'s Dagger', description: 'Magical attack using a shadow-infused dagger.', mpCost: 18, damage: 9, damageType: 'magical', elementalType: ElementalType.SHADOW, classRestriction: [PlayerClassType.ROGUE], icon: '👤🔮'},

  // New T4+ Spells
  'earthquake_stomp': { id: 'earthquake_stomp', name: 'Earthquake Stomp', description: 'Slams the ground, dealing Physical and Earth damage.', mpCost: 30, damage: 25, damageType: 'physical', elementalType: ElementalType.EARTH, classRestriction: [PlayerClassType.KNIGHT], icon: '🌍🔨'},
  'chain_lightning': { id: 'chain_lightning', name: 'Chain Lightning', description: 'Unleashes a bolt of lightning that strikes the foe.', mpCost: 38, damage: 55, damageType: 'magical', elementalType: ElementalType.LIGHTNING, classRestriction: [PlayerClassType.MAGE], icon: '🔗⚡'},
  'crippling_shot': { 
    id: 'crippling_shot', name: 'Crippling Shot', 
    description: 'A precise shot that deals damage and weakens the target\'s attack for 2 turns.', 
    mpCost: 25, damage: 18, damageType: 'physical', elementalType: ElementalType.SHADOW, 
    classRestriction: [PlayerClassType.ROGUE], icon: '🎯⛓️',
    buffToApplyToTarget: { type: 'attack_reduction', value: 5, duration: 2, description: 'Target Attack Reduced!', isDebuff: true }
  },
};

export const BASE_SHOP_ITEMS: ShopItem[] = [
  ITEMS['health_potion_s'], ITEMS['mana_potion_s'], ITEMS['health_potion_m'], ITEMS['mana_potion_m'],
  ITEMS['health_potion_l'], ITEMS['mana_potion_l'], ITEMS['health_potion_xl'], ITEMS['mana_potion_xl'],
  ITEMS['fireproof_potion'], ITEMS['elixir_of_iron_skin'], ITEMS['sharpening_stone_item'],
  ITEMS['flask_of_holy_water'], ITEMS['fire_bomb'],
  ITEMS['basic_sword'], ITEMS['wooden_staff'], ITEMS['iron_dagger'], ITEMS['steel_longsword'], ITEMS['enchanted_grimoire'],
  ITEMS['runic_longbow'], ITEMS['warhammer_of_smiting'], ITEMS['crystal_wand'],
  ITEMS['leather_armor'], ITEMS['cloth_robes'], ITEMS['leather_jerkin'], ITEMS['chainmail_vest'],
  ITEMS['ring_of_precision'], ITEMS['amulet_of_power'], ITEMS['ring_of_vitality'],
  ITEMS['boots_of_swiftness'], ITEMS['scholars_pendant'], ITEMS['bracers_of_might'],
  ITEMS['scroll_of_town_portal'],
  ITEMS['sb_minor_heal'], ITEMS['sb_shield_bash'], ITEMS['sb_ice_lance'], ITEMS['sb_poison_shiv'], ITEMS['sb_meditate'],
  ITEMS['sb_lightning_bolt'], ITEMS['sb_righteous_smite'], ITEMS['sb_heavy_blow'], ITEMS['sb_stone_blast'],
  ITEMS['sb_arcane_barrage'], ITEMS['sb_shadow_strike'], ITEMS['sb_vipers_bite'],
  ITEMS['sb_holy_blade'], ITEMS['sb_flaming_cleave'], ITEMS['sb_venomous_strike'], ITEMS['sb_shadowmancers_dagger'],
  ITEMS['sb_earthquake_stomp'], ITEMS['sb_chain_lightning'], ITEMS['sb_crippling_shot'],
].filter(Boolean) as ShopItem[];


export const MONSTERS: Record<string, Monster> = {
  // Stage 1-4 Monsters (Windfall Outskirts)
  'forest_wolf': { 
    id: 'forest_wolf', name: 'Forest Wolf', hp: 40, maxHp: 40, attack: 8, physicalDefense: 2, spellDefense: 1, 
    resistances: [], weaknesses: [ElementalType.FIRE], 
    drops: [{ itemId: 'health_potion_s', chance: 0.1 }], goldDrop: {min: 2, max: 6}, xpYield: 12,
    spriteUrl: 'images/monsters/forest_wolf.png',
    spritePrompt: "A fierce forest wolf with grey fur and sharp teeth, standing in a menacing pose, pixel-art style, green forest background.",
    abilities: [{name: 'Ferocious Bite', type: 'attack', power: 10, elementalType: ElementalType.PHYSICAL, description: 'A quick, strong bite.'}],
    activeBuffs: [],
  },
  'wild_boar': {
    id: 'wild_boar', name: 'Wild Boar', hp: 55, maxHp: 55, attack: 10, physicalDefense: 3, spellDefense: 1, 
    resistances: [], weaknesses: [ElementalType.ICE], 
    drops: [], goldDrop: {min: 3, max: 8}, xpYield: 15,
    spriteUrl: 'images/monsters/wild_boar.png',
    spritePrompt: "A large wild boar with brown fur, tusks, and angry red eyes, charging, pixel-art style, muddy forest floor background.",
    abilities: [{name: 'Charge', type: 'attack', power: 12, elementalType: ElementalType.PHYSICAL, description: 'Charges recklessly.'}],
    activeBuffs: [],
  },
  'slime': {
    id: 'slime', name: 'Slime', hp: 30, maxHp: 30, attack: 6, physicalDefense: 0, spellDefense: 1, 
    resistances: [ElementalType.PHYSICAL], weaknesses: [ElementalType.FIRE, ElementalType.ICE], 
    drops: [{ itemId: 'mana_potion_s', chance: 0.05 }], goldDrop: {min: 1, max: 4}, xpYield: 8,
    spriteUrl: 'images/monsters/slime.png',
    spritePrompt: "A green, gooey slime monster, slightly translucent, with simple eyes, bouncing, pixel-art style, cave or forest background.",
    abilities: [{name: 'Sticky Goo', type: 'attack', power: 7, elementalType: ElementalType.PHYSICAL, description: 'Hurls sticky goo.'}],
    activeBuffs: [],
  },
  'bandit_recruit': { 
    id: 'bandit_recruit', name: 'Bandit Recruit', hp: 45, maxHp: 45, attack: 9, physicalDefense: 2, spellDefense: 0,
    resistances: [], weaknesses: [ElementalType.HOLY], 
    drops: [{ itemId: 'iron_dagger', chance: 0.05 }, { itemId: 'gold_pouch_s', chance: 0.2, customValue: {min: 5, max: 10} }],
    goldDrop: {min: 5, max: 10}, xpYield: 18,
    spriteUrl: 'images/monsters/bandit_recruit.png',
    spritePrompt: "A scruffy bandit recruit wearing leather rags, wielding a small dagger, looking shifty, pixel-art style, forest path background.",
    abilities: [{name: 'Shiv', type: 'attack', power: 9, elementalType: ElementalType.PHYSICAL, description: 'A clumsy stab with a shiv.'}],
    activeBuffs: [],
  },
  // Stage 5 Boss (Elder Treant)
  'elder_treant': { 
    id: 'elder_treant', name: 'Elder Treant', hp: 300, maxHp: 300, attack: 18, physicalDefense: 7, spellDefense: 10, 
    resistances: [ElementalType.EARTH, ElementalType.POISON], 
    weaknesses: [ElementalType.FIRE, ElementalType.ARCANE, ElementalType.LIGHTNING], 
    drops: [
      { itemId: 'living_bark_armor', chance: 0.22 }, 
      { itemId: 'verdant_ring', chance: 0.20 }, 
      { itemId: 'forest_token', chance: 1.0 },
      { itemId: 'sb_minor_heal', chance: 0.25},
      { itemId: 'sb_heavy_blow', chance: 0.20 }, 
      { itemId: 'sb_flaming_cleave', chance: 0.15}
    ], 
    goldDrop: {min: 50, max: 75}, xpYield: 100,
    spriteUrl: 'images/monsters/elder_treant.png',
    spritePrompt: "Ancient tree boss with glowing green eyes and giant gnarled roots, bark like armor, in a dense enchanted forest, fantasy pixel-art.",
    abilities: [
      {name: 'Root Snare', type: 'attack', power: 20, elementalType: ElementalType.EARTH, description: 'Entangling roots lash out.'},
      {name: 'Bark Shield', type: 'buff', description: 'Hardens its bark, increasing its defense.', 
       buffToApply: { type: 'defense_boost', value: 5, duration: 2, description: 'Elder Treant\'s Bark Shield active.', isDebuff: false}, targetSelf: true }
    ],
    activeBuffs: [],
  },
    // Stage 6-9 Monsters (Shadowed Woods)
  'shadow_raven': {
    id: 'shadow_raven', name: 'Shadow Raven', hp: 60, maxHp: 60, attack: 14, physicalDefense: 3, spellDefense: 7,
    resistances: [ElementalType.SHADOW], weaknesses: [ElementalType.HOLY, ElementalType.FIRE, ElementalType.LIGHTNING], 
    drops: [{ itemId: 'mana_potion_s', chance: 0.1 }], goldDrop: {min: 8, max: 15}, xpYield: 25,
    spriteUrl: 'images/monsters/shadow_raven.png',
    spritePrompt: "A dark raven made of shadows, with glowing red eyes, perched on a twisted branch, pixel-art style, foggy dark forest background.",
    abilities: [{name: 'Shadow Peck', type: 'attack', power: 15, elementalType: ElementalType.SHADOW, description: 'A swift peck shrouded in darkness.'}],
    activeBuffs: [],
  },
  'cursed_deer': {
    id: 'cursed_deer', name: 'Cursed Deer', hp: 75, maxHp: 75, attack: 16, physicalDefense: 4, spellDefense: 4, 
    resistances: [ElementalType.SHADOW], weaknesses: [ElementalType.HOLY, ElementalType.FIRE], 
    drops: [], goldDrop: {min: 10, max: 18}, xpYield: 30,
    spriteUrl: 'images/monsters/cursed_deer.png',
    spritePrompt: "A deer with mangy fur, glowing purple eyes, and antlers that look like dead branches, surrounded by faint dark aura, pixel-art style, gloomy forest.",
    abilities: [{name: 'Spectral Gore', type: 'attack', power: 18, elementalType: ElementalType.SHADOW, description: 'Gores with shadowy antlers.'}],
    activeBuffs: [],
  },
   'ghostly_child': {
    id: 'ghostly_child', name: 'Ghostly Child', hp: 65, maxHp: 65, attack: 12, physicalDefense: 1, spellDefense: 10, 
    resistances: [ElementalType.SHADOW, ElementalType.ICE], weaknesses: [ElementalType.HOLY, ElementalType.FIRE, ElementalType.ARCANE], 
    drops: [{ itemId: 'soul_gem', chance: 0.03 }], goldDrop: {min: 12, max: 20}, xpYield: 35,
    spriteUrl: 'images/monsters/ghostly_child.png',
    spritePrompt: "A small, translucent ghostly child with sad eyes, faintly glowing, pixel-art style, dark woods or graveyard background.",
    abilities: [{name: 'Ethereal Touch', type: 'attack', power: 15, elementalType: ElementalType.ICE, description: 'A chilling touch.'}],
    activeBuffs: [],
  },
  'bone_hound': {
    id: 'bone_hound', name: 'Bone Hound', hp: 85, maxHp: 85, attack: 18, physicalDefense: 6, spellDefense: 3, 
    resistances: [ElementalType.SHADOW, ElementalType.PHYSICAL], weaknesses: [ElementalType.HOLY, ElementalType.FIRE, ElementalType.EARTH], 
    drops: [{itemId: 'health_potion_m', chance: 0.08}], goldDrop: {min: 15, max: 25}, xpYield: 40,
    spriteUrl: 'images/monsters/bone_hound.png',
    spritePrompt: "A skeletal dog with glowing red eyes, sharp bone teeth, pixel-art style, graveyard or haunted forest background.",
    abilities: [
        {name: 'Bone-Chilling Howl', type: 'debuff', description: 'A terrifying howl that might reduce player\'s attack.', 
         buffToApply: { type: 'attack_reduction', value: 3, duration: 2, description: 'Attack reduced by fear!', isDebuff: true}, targetSelf: false},
        {name: 'Savage Gnaw', type: 'attack', power: 20, elementalType: ElementalType.PHYSICAL, description: 'A vicious bite with sharp bone teeth.'}
    ],
    activeBuffs: [],
  },
  // Stage 10 Boss (Wraith of Hollowgrove)
  'wraith_of_hollowgrove': {
    id: 'wraith_of_hollowgrove', name: 'Wraith of Hollowgrove', hp: 450, maxHp: 450, attack: 25, physicalDefense: 5, spellDefense: 15,
    resistances: [ElementalType.SHADOW, ElementalType.ICE, ElementalType.POISON], weaknesses: [ElementalType.HOLY, ElementalType.FIRE, ElementalType.ARCANE],
    drops: [
        {itemId: 'wraith_cloak', chance: 0.25}, 
        {itemId: 'soul_gem', chance: 0.30}, 
        {itemId: 'sb_shadow_strike', chance: 0.20},
        {itemId: 'sb_vipers_bite', chance: 0.20},
        {itemId: 'sb_arcane_barrage', chance: 0.15},
    ],
    goldDrop: {min: 100, max: 150}, xpYield: 250,
    spriteUrl: 'images/monsters/wraith_of_hollowgrove.png',
    spritePrompt: "A terrifying wraith boss, translucent and ghostly green/blue, with tattered cloak and glowing eyes, holding a spectral scythe, in a haunted grove, fantasy pixel-art.",
    abilities: [
        {name: 'Soul Drain', type: 'attack', power: 30, elementalType: ElementalType.SHADOW, description: 'Drains a portion of life force.'}, // Could add healing to wraith
        {name: 'Fear Wave', type: 'debuff', description: 'Unleashes a wave of terror, reducing player\'s attack.', 
         buffToApply: { type: 'attack_reduction', value: 4, duration: 2, description: 'Attack reduced by Fear Wave!', isDebuff: true}, targetSelf: false}
    ],
    activeBuffs: [],
  },
  // Stage 11-14 Monsters (Volcanic Path)
  'fire_elemental': {
    id: 'fire_elemental', name: 'Fire Elemental', hp: 100, maxHp: 100, attack: 22, physicalDefense: 4, spellDefense: 12,
    resistances: [ElementalType.FIRE], weaknesses: [ElementalType.ICE, ElementalType.WATER /* if added */, ElementalType.EARTH],
    drops: [{itemId: 'fire_bomb', chance: 0.15}], goldDrop: {min: 20, max: 35}, xpYield: 60,
    spriteUrl: 'images/monsters/fire_elemental.png',
    spritePrompt: "A swirling vortex of fire shaped like a humanoid figure, with glowing embers for eyes, pixel-art style, volcanic landscape background.",
    abilities: [{name: 'Incinerate', type: 'attack', power: 25, elementalType: ElementalType.FIRE, description: 'Engulfs the target in flames.'}],
    activeBuffs: [],
  },
  'magma_turtle': {
    id: 'magma_turtle', name: 'Magma Turtle', hp: 150, maxHp: 150, attack: 18, physicalDefense: 15, spellDefense: 8,
    resistances: [ElementalType.FIRE, ElementalType.PHYSICAL], weaknesses: [ElementalType.ICE, ElementalType.EARTH],
    drops: [], goldDrop: {min: 25, max: 40}, xpYield: 70,
    spriteUrl: 'images/monsters/magma_turtle.png',
    spritePrompt: "A large turtle with a shell made of cooling magma, cracks glowing with lava, pixel-art style, rocky volcanic area.",
    abilities: [
        {name: 'Magma Spit', type: 'attack', power: 20, elementalType: ElementalType.FIRE, description: 'Spits a glob of molten rock.'},
        {name: 'Shell Defense', type: 'buff', description: 'Retreats into its super-hardened shell.', 
         buffToApply: {type: 'defense_boost', value: 10, duration: 1, description: 'Magma Turtle uses Shell Defense!', isDebuff: false}, targetSelf: true}
    ],
    activeBuffs: [],
  },
  'obsidian_gargoyle': {
    id: 'obsidian_gargoyle', name: 'Obsidian Gargoyle', hp: 120, maxHp: 120, attack: 24, physicalDefense: 10, spellDefense: 6,
    resistances: [ElementalType.FIRE, ElementalType.SHADOW], weaknesses: [ElementalType.HOLY, ElementalType.EARTH],
    drops: [{itemId: 'obsidian_blade', chance: 0.02}], goldDrop: {min: 30, max: 50}, xpYield: 80,
    spriteUrl: 'images/monsters/obsidian_gargoyle.png',
    spritePrompt: "A fearsome gargoyle statue carved from black obsidian, with glowing red eyes, animated and ready to strike, pixel-art style, volcanic crag background.",
    abilities: [{name: 'Stone Claw', type: 'attack', power: 28, elementalType: ElementalType.PHYSICAL, description: 'Slashes with razor-sharp obsidian claws.'}],
    activeBuffs: [],
  },
  // Stage 15 Boss (Molten Golem)
  'molten_golem': {
    id: 'molten_golem', name: 'Molten Golem', hp: 700, maxHp: 700, attack: 35, physicalDefense: 20, spellDefense: 10,
    resistances: [ElementalType.FIRE, ElementalType.PHYSICAL], weaknesses: [ElementalType.ICE, ElementalType.EARTH, ElementalType.HOLY],
    drops: [
        {itemId: 'heatforged_gauntlets', chance: 0.30}, 
        {itemId: 'obsidian_blade', chance: 0.15}, 
        {itemId: 'fireproof_potion', chance: 0.25},
        {itemId: 'sb_flaming_cleave', chance: 0.20}
    ],
    goldDrop: {min: 200, max: 300}, xpYield: 500,
    spriteUrl: 'images/monsters/molten_golem.png',
    spritePrompt: "A colossal golem boss made of molten rock and obsidian, with lava flowing in its cracks, radiating intense heat, in a volcanic caldera, fantasy pixel-art.",
    abilities: [
        {name: 'Magma Slam', type: 'attack', power: 40, elementalType: ElementalType.FIRE, description: 'Slams down with immense force, causing a fiery explosion.'},
        {name: 'Volcanic Fury', type: 'special', power: 50, elementalType: ElementalType.FIRE, description: 'Erupts with concentrated fire, a very strong attack.'}
    ],
    activeBuffs: [],
  },
  // Stage 16-19 Monsters (Frozen Peaks)
  'ice_wraith': {
    id: 'ice_wraith', name: 'Ice Wraith', hp: 130, maxHp: 130, attack: 28, physicalDefense: 6, spellDefense: 18,
    resistances: [ElementalType.ICE, ElementalType.SHADOW], weaknesses: [ElementalType.FIRE, ElementalType.HOLY],
    drops: [{itemId: 'mana_potion_m', chance: 0.12}], goldDrop: {min: 35, max: 55}, xpYield: 100,
    spriteUrl: 'images/monsters/ice_wraith.png',
    spritePrompt: "A spectral figure made of swirling snow and ice, with glowing blue eyes and sharp icicle claws, pixel-art style, frozen mountain peak background.",
    abilities: [{name: 'Frost Shard', type: 'attack', power: 30, elementalType: ElementalType.ICE, description: 'Launches a sharp shard of magical ice.'}],
    activeBuffs: [],
  },
  'frost_wolf': {
    id: 'frost_wolf', name: 'Frost Wolf', hp: 160, maxHp: 160, attack: 30, physicalDefense: 12, spellDefense: 8,
    resistances: [ElementalType.ICE], weaknesses: [ElementalType.FIRE, ElementalType.LIGHTNING],
    drops: [{itemId: 'health_potion_l', chance: 0.05}], goldDrop: {min: 40, max: 60}, xpYield: 110,
    spriteUrl: 'images/monsters/frost_wolf.png',
    spritePrompt: "A large wolf with thick white fur covered in icicles, glowing blue eyes, and breath that mists in the cold, pixel-art style, snowy mountain pass.",
    abilities: [{name: 'Frozen Bite', type: 'attack', power: 33, elementalType: ElementalType.ICE, description: 'A powerful bite that chills to the bone.'}],
    activeBuffs: [],
  },
  'crystal_guardian': {
    id: 'crystal_guardian', name: 'Crystal Guardian', hp: 200, maxHp: 200, attack: 25, physicalDefense: 18, spellDefense: 18,
    resistances: [ElementalType.ICE, ElementalType.ARCANE], weaknesses: [ElementalType.FIRE, ElementalType.EARTH, ElementalType.SHADOW],
    drops: [{itemId: 'frozen_heart', chance: 0.03}, {itemId: 'crystal_wand', chance: 0.02}], goldDrop: {min: 50, max: 75}, xpYield: 130,
    spriteUrl: 'images/monsters/crystal_guardian.png',
    spritePrompt: "A golem-like creature made of jagged blue and white ice crystals, animated and glowing faintly, pixel-art style, ice cave interior.",
    abilities: [
        {name: 'Ice Beam', type: 'attack', power: 35, elementalType: ElementalType.ICE, description: 'Fires a concentrated beam of freezing energy.'},
        {name: 'Reflective Shield', type: 'buff', description: 'Its crystalline body reflects some magic.', 
         buffToApply: {type: 'defense_boost', value: 8, duration: 2, description: 'Crystal Guardian shimmers defensively!', isDebuff: false}, targetSelf: true} // Simulating spell defense boost
    ],
    activeBuffs: [],
  },
  // Stage 20 Boss (Icebound Titan)
  'icebound_titan': {
    id: 'icebound_titan', name: 'Icebound Titan', hp: 1000, maxHp: 1000, attack: 45, physicalDefense: 25, spellDefense: 30,
    resistances: [ElementalType.ICE, ElementalType.PHYSICAL], weaknesses: [ElementalType.FIRE, ElementalType.HOLY, ElementalType.LIGHTNING],
    drops: [
        {itemId: 'titans_crown', chance: 0.30}, 
        {itemId: 'frozen_heart', chance: 0.20}, 
        {itemId: 'sb_ice_lance', chance: 0.25},
        {itemId: 'health_potion_xl', chance: 0.30},
    ],
    goldDrop: {min: 300, max: 450}, xpYield: 800,
    spriteUrl: 'images/monsters/icebound_titan.png',
    spritePrompt: "A colossal frost giant or titan boss, skin like blue ice, wearing primitive armor made of ice and rock, wielding a giant icicle club, in a vast ice cavern, fantasy pixel-art.",
    abilities: [
        {name: 'Glacier Slam', type: 'attack', power: 50, elementalType: ElementalType.ICE, description: 'Slams its massive club, causing an icy shockwave.'},
        {name: 'Blizzard Howl', type: 'debuff', description: 'Unleashes a blinding blizzard, reducing player evasion and crit chance.', 
         buffToApply: { type: 'evasion_reduction_player', value: 0.15, duration: 2, description: 'Evasion reduced by Blizzard!', isDebuff: true}, targetSelf: false} 
        // Note: Crit chance reduction for Blizzard Howl is handled in App.tsx monsterAttack logic for this specific ability
    ],
    activeBuffs: [],
  },
  // Stage 21-24 Monsters (Dragon's Peak Ascent)
  'dragon_whelp': {
    id: 'dragon_whelp', name: 'Dragon Whelp', hp: 200, maxHp: 200, attack: 38, physicalDefense: 15, spellDefense: 15,
    resistances: [ElementalType.FIRE], weaknesses: [ElementalType.ICE, ElementalType.ARCANE],
    drops: [{itemId: 'mana_potion_l', chance: 0.10}, {itemId: 'health_potion_l', chance: 0.10}], goldDrop: {min: 60, max: 90}, xpYield: 150,
    spriteUrl: 'images/monsters/dragon_whelp.png',
    spritePrompt: "A small, aggressive red dragon whelp with developing wings and sharp claws, breathing a puff of smoke, pixel-art style, rocky mountain terrain.",
    abilities: [{name: 'Fiery Breath', type: 'attack', power: 40, elementalType: ElementalType.FIRE, description: 'Breathes a cone of searing flames.'}],
    activeBuffs: [],
  },
  'armored_knight_captain': {
    id: 'armored_knight_captain', name: 'Armored Knight Captain', hp: 250, maxHp: 250, attack: 42, physicalDefense: 25, spellDefense: 10,
    resistances: [ElementalType.PHYSICAL], weaknesses: [ElementalType.LIGHTNING, ElementalType.HOLY],
    drops: [{itemId: 'steel_longsword', chance: 0.05}, {itemId: 'chainmail_vest', chance: 0.07}], goldDrop: {min: 70, max: 100}, xpYield: 180,
    spriteUrl: 'images/monsters/armored_knight_captain.png',
    spritePrompt: "A heavily armored knight captain with a plume on their helmet, wielding a large broadsword and shield, looking imposing, pixel-art style, castle ramparts or mountain path.",
    abilities: [
        {name: 'Shield Wall', type: 'buff', description: 'Raises shield, bolstering defense.', 
         buffToApply: { type: 'defense_boost', value: 10, duration: 1, description: 'Knight Captain uses Shield Wall!', isDebuff: false}, targetSelf: true},
        {name: 'Commander\'s Strike', type: 'attack', power: 45, elementalType: ElementalType.PHYSICAL, description: 'A well-aimed, powerful strike.'}
    ],
    activeBuffs: [],
  },
  'shadow_assassin': {
    id: 'shadow_assassin', name: 'Shadow Assassin', hp: 180, maxHp: 180, attack: 45, physicalDefense: 10, spellDefense: 20,
    resistances: [ElementalType.SHADOW, ElementalType.POISON], weaknesses: [ElementalType.HOLY, ElementalType.FIRE, ElementalType.LIGHTNING],
    drops: [{itemId: 'shadow_infused_stiletto', chance: 0.03}, {itemId: 'poison_shiv', chance: 0.10}], goldDrop: {min: 80, max: 120}, xpYield: 200,
    spriteUrl: 'images/monsters/shadow_assassin.png',
    spritePrompt: "A nimble assassin cloaked in dark shadows, wielding twin daggers dripping with poison, with glowing red eyes, pixel-art style, dark alley or mountain pass at night.",
    abilities: [
        {name: 'Twin Strike', type: 'attack', power: 25, elementalType: ElementalType.PHYSICAL, description: 'A rapid double attack with daggers.'}, // Simulates two hits by being slightly weaker than single strong one
        {name: 'Poisoned Blade', type: 'attack', power: 20, elementalType: ElementalType.POISON, description: 'Stabs with a venom-coated dagger.'}
    ],
    activeBuffs: [],
  },
  // Stage 25 Boss (Dragon Knight Aetharion)
  'dragon_knight_aetharion': {
    id: 'dragon_knight_aetharion', name: 'Dragon Knight Aetharion', hp: 1500, maxHp: 1500, attack: 60, physicalDefense: 35, spellDefense: 35,
    resistances: [ElementalType.FIRE, ElementalType.PHYSICAL], weaknesses: [ElementalType.ICE, ElementalType.HOLY, ElementalType.ARCANE],
    drops: [
        {itemId: 'dragonfang_blade', chance: 0.35}, 
        {itemId: 'aetharions_shield', chance: 0.35},
        {itemId: 'essence_of_dragon', chance: 1.0},
        {itemId: 'health_potion_xl', chance: 0.50},
        {itemId: 'mana_potion_xl', chance: 0.50},
    ],
    goldDrop: {min: 500, max: 750}, xpYield: 2000,
    spriteUrl: 'images/monsters/dragon_knight_aetharion.png',
    spritePrompt: "A formidable Dragon Knight boss, clad in black and red dragon-scale armor, wielding a massive flaming sword, with dragon wings, atop a volcanic peak, fantasy pixel-art.",
    abilities: [
        {name: 'Inferno Blade', type: 'attack', power: 70, elementalType: ElementalType.FIRE, description: 'A devastating swing with his flaming greatsword.'},
        {name: 'Dragon\'s Roar', type: 'special', power: 60, elementalType: ElementalType.FIRE, description: 'Unleashes a powerful fiery roar that shakes the mountain.'}, // Area effect implied
        {name: 'Wing Buffet', type: 'attack', power: 50, elementalType: ElementalType.PHYSICAL, description: 'Knocks back with powerful wing gusts.'}
    ],
    activeBuffs: [],
  },
  // Stage 26 - Secret Boss (Shadow Monarch)
  'shadow_monarch': {
    id: 'shadow_monarch', name: 'Shadow Monarch', hp: 2000, maxHp: 2000, attack: 70, physicalDefense: 40, spellDefense: 40,
    resistances: [ElementalType.SHADOW, ElementalType.DARKNESS /* if added */, ElementalType.POISON], 
    weaknesses: [ElementalType.HOLY, ElementalType.LIGHT, ElementalType.ARCANE], // Light as a conceptual counter to shadow
    drops: [
        {itemId: 'shadow_monarch_crest', chance: 1.0},
        {itemId: 'forbidden_tome_acc', chance: 0.3},
        {itemId: 'shadow_cloak_acc', chance: 0.3},
    ],
    goldDrop: {min: 1000, max: 1500}, xpYield: 5000,
    spriteUrl: 'images/monsters/shadow_monarch.png',
    spritePrompt: "An ultimate secret boss, the Shadow Monarch, a tall, imposing figure made of pure darkness, wearing a jagged crown of shadows, eyes glowing with malevolent purple energy, wielding a staff of obsidian that pulses with dark power, in a realm of swirling shadows and broken reality, epic fantasy pixel-art.",
    abilities: [
        {name: 'Oblivion Strike', type: 'attack', power: 80, elementalType: ElementalType.SHADOW, description: 'A devastating blow that threatens to erase existence.'},
        {name: 'Dimensional Shift', type: 'buff', description: 'The Monarch briefly fades into shadows, becoming harder to hit.', 
         buffToApply: {type: 'evasion_boost', value: 0.25, duration: 1, description: 'Shadow Monarch uses Dimensional Shift!', isDebuff: false}, targetSelf: true},
        {name: 'Shadow Nova', type: 'special', power: 90, elementalType: ElementalType.SHADOW, description: 'An explosion of pure shadow energy that consumes all light.'}
    ],
    activeBuffs: [],
  }
};

export const STAGES: Stage[] = [
  { id: 1, name: "Windfall Outskirts", description: "The grassy fields just outside Windfall Village. Mostly safe, but strange creatures have been spotted.", terrainArtUrl: "images/stages/01_windfall_outskirts_deepwoods_entry.png", terrainArtPrompt: "The entry point to a deep forest from the outskirts of Windfall, with a path leading into denser woods, pixel-art landscape.", monsters: ['forest_wolf', 'slime'], itemFinds: [{itemId: 'health_potion_s', chance: 0.02}] },
  { id: 2, name: "Whispering Woods Path", description: "A narrow path winding through the ancient Whispering Woods. Shadows dance between the trees.", terrainArtUrl: "images/stages/02_whispering_woods_path.png", terrainArtPrompt: "A narrow dirt path through a dense, slightly dark forest with tall trees and dappled sunlight, mysterious, pixel-art landscape.", monsters: ['forest_wolf', 'wild_boar'], itemFinds: [] },
  { id: 3, name: "Bandit's Hideout Approach", description: "The forest grows thicker here, and signs of a rough camp are visible. Bandits are known to prowl this area.", terrainArtUrl: "images/stages/03_bandit_hideout_approach.png", terrainArtPrompt: "A dense part of a forest with a rough, hidden campsite, makeshift tents and a campfire, signs of recent activity, pixel-art landscape.", monsters: ['bandit_recruit', 'wild_boar'], itemFinds: [{itemId: 'iron_dagger', chance: 0.01}] },
  { id: 4, name: "Deepwood Glade", description: "A sun-dappled glade deep within the woods. Despite its beauty, an unnerving silence hangs in the air.", terrainArtUrl: "images/stages/04_deepwood_glade.png", terrainArtPrompt: "A beautiful, sunlit forest glade with wildflowers and ancient trees, serene but slightly eerie, pixel-art landscape.", monsters: ['wild_boar', 'slime', 'forest_wolf'], itemFinds: [{itemId: 'mana_potion_s', chance: 0.02}]},
  { id: 5, name: "Heart of the Forest", description: "The oldest part of the Whispering Woods, where the ancient Elder Treant is said to reside.", terrainArtUrl: "images/stages/05_elder_treant_grove.png", terrainArtPrompt: "The heart of an ancient, mystical forest with massive, gnarled trees, glowing flora, and a sacred, ancient atmosphere, pixel-art landscape.", monsters: [], boss: 'elder_treant', itemFinds: [] },
  { id: 6, name: "Shadowed Copse", description: "The trees here are unnaturally dark, and the air is cold. Ravens with shadowy wings circle overhead.", terrainArtUrl: "images/stages/06_shadowed_woods_misty_path.png", terrainArtPrompt: "A dark, spooky copse of trees with twisted branches and very little light, ravens perched, pixel-art landscape.", monsters: ['shadow_raven', 'cursed_deer'], itemFinds: [] },
  { id: 7, name: "Haunted Thicket", description: "Locals avoid this part of the woods, whispering tales of lost souls and spectral figures.", terrainArtUrl: "images/stages/07_haunted_thicket.png", terrainArtPrompt: "A dense, haunted thicket with gnarled trees, fog, and faint glowing lights, eerie and unsettling, pixel-art landscape.", monsters: ['ghostly_child', 'cursed_deer'], itemFinds: [{itemId: 'soul_gem', chance: 0.005}]},
  { id: 8, name: "Forgotten Graveyard Edge", description: "An old, overgrown graveyard lies adjacent to these woods. The ground is cold, and unsettling sounds echo.", terrainArtUrl: "images/stages/08_forgotten_graveyard_edge.png", terrainArtPrompt: "The edge of an old, overgrown graveyard with crumbling tombstones and twisted trees, under a gloomy sky, pixel-art landscape.", monsters: ['bone_hound', 'ghostly_child'], itemFinds: [] },
  { id: 9, name: "Hollowgrove Crypt Entrance", description: "A crumbling stone entrance leads into the earth. A powerful undead presence can be felt from within.", terrainArtUrl: "images/stages/09_hollowgrove_crypt_entrance.png", terrainArtPrompt: "A crumbling stone crypt entrance half-buried in the earth, with dead trees and an ominous glow from within, pixel-art landscape.", monsters: ['bone_hound', 'shadow_raven'], itemFinds: []},
  { id: 10, name: "Hollowgrove Crypt", description: "The final resting place of ancient nobles, now patrolled by the fearsome Wraith of Hollowgrove.", terrainArtUrl: "images/stages/10_hollowgrove_cemetery.png", terrainArtPrompt: "The dark, stone interior of an ancient crypt with cobwebs, broken sarcophagi, and an eerie green glow, pixel-art landscape.", monsters: [], boss: 'wraith_of_hollowgrove', itemFinds: [] },
  { id: 11, name: "Ashfall Pass Base", description: "The foothills of a volcanic mountain range. The air is warm and smells of sulfur.", terrainArtUrl: "images/stages/11_ember_caves_entrance.png", terrainArtPrompt: "The base of a volcanic mountain with black rock, sparse burnt vegetation, and a red-tinged sky, pixel-art landscape.", monsters: ['fire_elemental', 'magma_turtle'], itemFinds: [] },
  { id: 12, name: "Scorched Trail", description: "A path winding upwards, littered with obsidian shards and heated by geothermal vents.", terrainArtUrl: "images/stages/12_scorched_trail.png", terrainArtPrompt: "A narrow, winding trail up a volcano, with scorched earth, obsidian shards, and steam vents, pixel-art landscape.", monsters: ['fire_elemental', 'obsidian_gargoyle'], itemFinds: [{itemId: 'fire_bomb', chance: 0.01}]},
  { id: 13, name: "Lavaflow Riverbank", description: "A river of molten lava flows nearby, casting an ominous glow on the jagged rocks.", terrainArtUrl: "images/stages/13_lavaflow_riverbank.png", terrainArtPrompt: "The bank of a flowing lava river with glowing molten rock, jagged obsidian formations, and a dark red sky, pixel-art landscape.", monsters: ['magma_turtle', 'obsidian_gargoyle'], itemFinds: [] },
  { id: 14, name: "Volcano's Maw Approach", description: "The ground trembles, and the heat is intense. The caldera of the volcano looms ahead.", terrainArtUrl: "images/stages/14_volcanos_maw_approach.png", terrainArtPrompt: "The approach to a volcano caldera, with steep cliffs of volcanic rock, smoke rising, and a fiery glow from above, pixel-art landscape.", monsters: ['fire_elemental', 'obsidian_gargoyle'], itemFinds: []},
  { id: 15, name: "The Molten Core", description: "Inside the volcano's caldera, where the Molten Golem guards ancient secrets.", terrainArtUrl: "images/stages/15_molten_golem_core.png", terrainArtPrompt: "The inside of a volcano caldera with a lake of lava, stalactites of obsidian, and intense heat, pixel-art landscape.", monsters: [], boss: 'molten_golem', itemFinds: [] },
  { id: 16, name: "Frozen Pass Lower Slopes", description: "The ascent into the icy mountains begins. A biting wind howls through the crags.", terrainArtUrl: "images/stages/16_azure_peaks_cliff_path.png", terrainArtPrompt: "The lower slopes of a snow-covered mountain pass with icy rocks, sparse pine trees, and falling snow, pixel-art landscape.", monsters: ['ice_wraith', 'frost_wolf'], itemFinds: [] },
  { id: 17, name: "Glacier's Edge", description: "A vast, ancient glacier stretches out, its surface slick and treacherous.", terrainArtUrl: "images/stages/17_glaciers_edge.png", terrainArtPrompt: "The edge of a massive glacier with blue ice cliffs, crevasses, and a snowy landscape under a cold sky, pixel-art landscape.", monsters: ['frost_wolf', 'crystal_guardian'], itemFinds: [{itemId: 'mana_potion_m', chance: 0.01}]},
  { id: 18, name: "Icewind Dale", description: "A valley perpetually swept by freezing winds, where strange ice formations guard secrets.", terrainArtUrl: "images/stages/18_icewind_dale.png", terrainArtPrompt: "A desolate, snowy valley with sharp ice formations, howling wind effects, and a pale sun, pixel-art landscape.", monsters: ['ice_wraith', 'crystal_guardian'], itemFinds: [] },
  { id: 19, name: "Titan's Peak Foothills", description: "The final ascent to the lair of the Icebound Titan. The air is thin, and the cold, unbearable.", terrainArtUrl: "images/stages/19_titans_peak_foothills.png", terrainArtPrompt: "The treacherous, snow-covered foothills leading up to a massive ice mountain peak, blizzards and steep cliffs, pixel-art landscape.", monsters: ['frost_wolf', 'crystal_guardian'], itemFinds: []},
  { id: 20, name: "Cavern of the Icebound Titan", description: "A colossal ice cavern, the throne room of the mighty Icebound Titan.", terrainArtUrl: "images/stages/20_icebound_titan_glacier.png", terrainArtPrompt: "A vast ice cavern with giant icicles, frozen waterfalls, and a throne made of ice, majestic and cold, pixel-art landscape.", monsters: [], boss: 'icebound_titan', itemFinds: [] },
  { id: 21, name: "Dragon's Tooth Pass", description: "Jagged peaks like dragon's teeth line this treacherous mountain path leading to the Dragon Knight's lair.", terrainArtUrl: "images/stages/21_ruins_of_vorthar_battlefield.png", terrainArtPrompt: "A treacherous mountain pass with sharp, jagged peaks resembling teeth, a narrow path, and stormy skies, pixel-art landscape.", monsters: ['dragon_whelp', 'armored_knight_captain'], itemFinds: [] },
  { id: 22, name: "Aerie Approach", description: "High cliffs where drakes and lesser dragons make their nests. The wind carries distant roars.", terrainArtUrl: "images/stages/22_aerie_approach.png", terrainArtPrompt: "High, rocky cliffs with dragon nests visible, a swirling cloudy sky, and distant flying silhouettes, pixel-art landscape.", monsters: ['dragon_whelp', 'shadow_assassin'], itemFinds: [{itemId: 'health_potion_l', chance: 0.01}]},
  { id: 23, name: "Knight's Watchtower Ruins", description: "The ruins of an ancient watchtower, now claimed by the Dragon Knight's forces.", terrainArtUrl: "images/stages/23_knights_watchtower_ruins.png", terrainArtPrompt: "The crumbling ruins of a stone watchtower on a mountain path, banners tattered, signs of battle, pixel-art landscape.", monsters: ['armored_knight_captain', 'shadow_assassin'], itemFinds: [] },
  { id: 24, name: "Dragon Knight's Gate", description: "The heavily fortified gate leading to Aetharion's inner sanctum. Elite guards patrol this final chokepoint.", terrainArtUrl: "images/stages/24_dragon_knights_gate.png", terrainArtPrompt: "A massive, fortified gate built into a mountainside, with draconic symbols, guarded by elite soldiers, imposing, pixel-art landscape.", monsters: ['armored_knight_captain', 'dragon_whelp', 'shadow_assassin'], itemFinds: []},
  { id: 25, name: "Aetharion's Sanctum", description: "The volcanic peak where the Dragon Knight Aetharion awaits his challengers.", terrainArtUrl: "images/stages/25_aetharion_throne_room.png", terrainArtPrompt: "The summit of a volcanic peak, with a clearing surrounded by molten rock, a dark sky, and the imposing figure of a Dragon Knight, epic, pixel-art landscape.", monsters: [], boss: 'dragon_knight_aetharion', itemFinds: [] },
  { id: 26, name: "Shadow Realm (Secret)", description: "A tear in reality, a realm of pure darkness where the Shadow Monarch reigns.", terrainArtUrl: "images/stages/26_shadow_realm.png", terrainArtPrompt: "A chaotic realm of swirling shadows, broken floating islands, and a malevolent purple-black sky, home to an ultimate evil, surreal horror pixel-art.", monsters: [], boss: 'shadow_monarch', itemFinds: [] }
];

export const GENERAL_LOOT_POOL_IDS: string[] = [ // For non-boss monster random drops
    'health_potion_s', 'mana_potion_s', 'health_potion_m', 'mana_potion_m',
    'basic_sword', 'iron_dagger', 'wooden_staff',
    'leather_armor', 'cloth_robes', 'leather_jerkin',
    'ring_of_vitality', 'scroll_of_town_portal', 'fire_bomb'
];
