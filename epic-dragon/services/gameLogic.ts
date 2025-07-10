
import { Player, Monster, Item, Spell, ItemType, SpellDamageType, PlayerClassType, ElementalType, Buff, BuffType, MonsterAbility } from '../types';
import { ITEMS, SPELLS, XP_PER_LEVEL_BASE, XP_LEVEL_MULTIPLIER } from '../constants'; // Added XP constants

export interface DamageCalculationResult {
  damage: number;
  isCrit: boolean;
  isEvaded: boolean;
  elementalEffect: 'weakness' | 'resistance' | 'none';
  buffApplied?: Buff | null;
  resistedByManaShield?: number;
}

// --- Monster Stat Getters (incorporating buffs) ---
export const getMonsterTotalDefense = (monster: Monster): number => {
    let totalDefense = monster.physicalDefense;
    monster.activeBuffs?.forEach(buff => {
        if (buff.type === 'defense_boost' && !buff.isDebuff) totalDefense += buff.value;
        if (buff.type === 'defense_reduction' && buff.isDebuff) totalDefense -= buff.value;
    });
    return Math.max(0, totalDefense);
};

export const getMonsterTotalSpellDefense = (monster: Monster): number => {
    let totalSpellDefense = monster.spellDefense;
    // Similar to physical defense, can add buffs/debuffs affecting spell defense later
    // monster.activeBuffs?.forEach(buff => { ... });
    return Math.max(0, totalSpellDefense);
};

export const getMonsterTotalEvasion = (monster: Monster): number => {
    let totalEvasion = 0; // Base monster evasion, could be a stat on Monster type
    monster.activeBuffs?.forEach(buff => {
        if (buff.type === 'evasion_boost' && !buff.isDebuff) totalEvasion += buff.value;
        // Could add evasion_reduction for monsters if needed
    });
    return Math.max(0, Math.min(1, totalEvasion));
}


// --- Player Stat Getters (incorporating accessories and buffs/debuffs) ---
export const getPlayerMaxHp = (player: Player): number => {
    let totalMaxHp = player.maxHp;
    player.equippedAccessories.forEach(acc => {
        if (acc?.statBonuses?.maxHp) totalMaxHp += acc.statBonuses.maxHp;
    });
    return totalMaxHp;
};

export const getPlayerMaxMp = (player: Player): number => {
    let totalMaxMp = player.maxMp;
    player.equippedAccessories.forEach(acc => {
        if (acc?.statBonuses?.maxMp) totalMaxMp += acc.statBonuses.maxMp;
    });
    return totalMaxMp;
};

export const getPlayerTotalAttack = (player: Player): number => {
    let totalAttack = player.baseAttack + (player.equippedWeapon?.effectValue || 0);
    player.equippedAccessories.forEach(acc => {
        if (acc?.statBonuses?.physicalDamage) totalAttack += acc.statBonuses.physicalDamage;
        if (acc?.statBonuses?.allDamage) totalAttack += acc.statBonuses.allDamage;
    });
    player.activeBuffs.forEach(buff => {
        if (buff.type === 'attack_boost' && !buff.isDebuff) totalAttack += buff.value;
        if (buff.type === 'attack_reduction' && buff.isDebuff) totalAttack -= buff.value;
    });
    return Math.max(0, totalAttack);
};

export const getPlayerTotalSpellDamageBonus = (player: Player): number => {
    let spellDamageBonus = 0;
     if (player.equippedWeapon?.statBonuses?.magicDamage) spellDamageBonus += player.equippedWeapon.statBonuses.magicDamage;
    player.equippedAccessories.forEach(acc => {
        if (acc?.statBonuses?.magicDamage) spellDamageBonus += acc.statBonuses.magicDamage;
        if (acc?.statBonuses?.spellDamage) spellDamageBonus += acc.statBonuses.spellDamage;
        if (acc?.statBonuses?.allDamage) spellDamageBonus += acc.statBonuses.allDamage;
    });
     player.activeBuffs.forEach(buff => {
        if (buff.type === 'attack_boost' && !buff.isDebuff) spellDamageBonus += buff.value; // Assuming attack_boost also boosts spell damage for simplicity
        if (buff.type === 'attack_reduction' && buff.isDebuff) spellDamageBonus -= buff.value; // And reduces it
    });
    return spellDamageBonus;
};

export const getPlayerTotalDefense = (player: Player): number => {
    let totalDefense = player.baseDefense + (player.equippedArmor?.effectValue || 0);
    player.equippedAccessories.forEach(acc => {
        if (acc?.statBonuses?.physicalDefense) totalDefense += acc.statBonuses.physicalDefense;
    });
    player.activeBuffs.forEach(buff => {
        if (buff.type === 'defense_boost' && !buff.isDebuff) totalDefense += buff.value;
        if (buff.type === 'defense_reduction' && buff.isDebuff) totalDefense -= buff.value;
    });
    return Math.max(0, totalDefense);
};

export const getPlayerTotalSpellDefense = (player: Player): number => {
    let totalSpellDefense = 0;
    if(player.equippedArmor?.statBonuses?.spellDefense) totalSpellDefense += player.equippedArmor.statBonuses.spellDefense;

    player.equippedAccessories.forEach(acc => {
        if (acc?.statBonuses?.spellDefense) totalSpellDefense += acc.statBonuses.spellDefense;
    });
    // Add spell defense from buffs/debuffs if any (e.g. a generic 'magic_resistance_boost' buff)
    // player.activeBuffs.forEach(buff => { ... });
    return Math.max(0, totalSpellDefense);
};

export const getPlayerTotalCritChance = (player: Player, temporaryCritBoost: number = 0): number => {
    let totalCrit = player.baseCritChance + temporaryCritBoost;
    player.equippedAccessories.forEach(acc => {
        if (acc?.statBonuses?.critChance) totalCrit += acc.statBonuses.critChance;
    });
    player.activeBuffs.forEach(buff => {
        if (buff.type === 'crit_chance_reduction' && buff.isDebuff) totalCrit -= buff.value;
    });
    return Math.max(0, Math.min(1, totalCrit));
};

export const getPlayerTotalEvasion = (player: Player): number => {
    let totalEvasion = 0; // Base evasion
    player.equippedAccessories.forEach(acc => {
        if (acc?.statBonuses?.evasion) totalEvasion += acc.statBonuses.evasion;
    });
    player.activeBuffs.forEach(buff => {
        if (buff.type === 'evasion_boost' && !buff.isDebuff) totalEvasion += buff.value;
        if (buff.type === 'evasion_reduction_player' && buff.isDebuff) totalEvasion -= buff.value;
    });
    return Math.max(0, Math.min(1, totalEvasion));
};


export const calculateDamage = (
  attacker: Player | Monster,
  defender: Player | Monster,
  baseAttackPower: number,
  attackCritChance: number,
  attackElementalType: ElementalType,
  damageType: SpellDamageType | 'physical_basic' | 'offensive_potion_effect' | 'monster_ability',
  isPlayerAttacking: boolean
): DamageCalculationResult => {
  let damage = baseAttackPower;
  let isCrit = false;
  let elementalEffect: 'weakness' | 'resistance' | 'none' = 'none';
  let isEvaded = false;
  let resistedByManaShield = 0;

  // 0. Evasion Check
  const defenderEvasion = isPlayerAttacking ? getMonsterTotalEvasion(defender as Monster) : getPlayerTotalEvasion(defender as Player);
  if (Math.random() < defenderEvasion) {
      isEvaded = true;
      return { damage: 0, isCrit, isEvaded, elementalEffect, resistedByManaShield };
  }

  // 1. Critical Hit Check
  if (damageType !== 'offensive_potion_effect' && Math.random() < attackCritChance) {
    isCrit = true;
    damage *= 1.5; // Standard crit multiplier
  }

  // 2. Elemental Weaknesses/Resistances for Defender
  let defenderWeaknesses: ElementalType[] = [];
  let defenderResistances: ElementalType[] = [];

  if ('spriteUrl' in defender) { 
    const monsterDefender = defender as Monster;
    defenderWeaknesses = monsterDefender.weaknesses || [];
    defenderResistances = monsterDefender.resistances || [];
  }

  if (defenderWeaknesses.includes(attackElementalType)) {
    damage *= 1.5;
    elementalEffect = 'weakness';
  } else if (defenderResistances.includes(attackElementalType)) {
    damage *= 0.5;
    elementalEffect = 'resistance';
  }

  if (defender.activeBuffs) {
    defender.activeBuffs.forEach(buff => {
        if (buff.element === attackElementalType && buff.type.includes('_resistance') && !buff.isDebuff) {
            damage *= (1 - buff.value); // value is percentage, e.g., 0.5 for 50%
            elementalEffect = 'resistance'; // Can stack with innate resistance
        }
    });
  }

  damage = Math.floor(damage);

  // 3. Apply Defense
  let defenseToUse = 0;
  const defenderPhysicalDefense = isPlayerAttacking ? getMonsterTotalDefense(defender as Monster) : getPlayerTotalDefense(defender as Player);
  const defenderSpellDefense = isPlayerAttacking ? getMonsterTotalSpellDefense(defender as Monster) : getPlayerTotalSpellDefense(defender as Player);

  if (damageType === 'physical' || damageType === 'physical_basic' || (damageType === 'monster_ability' && attackElementalType === ElementalType.PHYSICAL)) {
    defenseToUse = defenderPhysicalDefense;
  } else if (damageType === 'magical' ||
             (damageType === 'offensive_potion_effect' && [ElementalType.FIRE, ElementalType.ICE, ElementalType.LIGHTNING, ElementalType.HOLY, ElementalType.SHADOW, ElementalType.EARTH, ElementalType.ARCANE, ElementalType.POISON].includes(attackElementalType)) ||
             (damageType === 'monster_ability' && attackElementalType !== ElementalType.PHYSICAL)
            ) {
    defenseToUse = defenderSpellDefense;
  } else if (damageType === 'offensive_potion_effect' && attackElementalType === ElementalType.PHYSICAL) {
    defenseToUse = defenderPhysicalDefense;
  }
  
  let finalDamage = Math.max(1, Math.floor(damage - defenseToUse));

  // 4. Mana Shield Check (if defender is player)
  if (!isPlayerAttacking && 'mp' in defender) { // Defender is Player
    const defenderPlayer = defender as Player;
    const manaShieldBuff = defenderPlayer.activeBuffs.find(b => b.type === 'mana_shield' && !b.isDebuff);
    if (manaShieldBuff && manaShieldBuff.value > 0) {
        const damageToAbsorb = Math.min(finalDamage, manaShieldBuff.value);
        if (defenderPlayer.mp >= damageToAbsorb) { // Check if player has MP to fuel the shield
            finalDamage -= damageToAbsorb;
            resistedByManaShield = damageToAbsorb;
            // MP and buff value reduction will be handled in App.tsx after this call
        }
    }
  }

  return { damage: finalDamage, isCrit, isEvaded, elementalEffect, resistedByManaShield };
};

export const learnSpellFromBook = (player: Player, item: Item): { player: Player; message: string } => {
  if (item.type !== ItemType.SPELL_BOOK || !item.teachesSpellId) {
    return { player, message: "This is not a spell book." };
  }

  const spellToLearn = SPELLS[item.teachesSpellId];
  if (!spellToLearn) {
    return { player, message: "This spell book seems to be for a forgotten art." };
  }

  if (item.requiredPlayerClass && !item.requiredPlayerClass.includes(player.playerClass)) {
    return { player, message: `This spell book is not for your class (${player.playerClass}). Requires: ${item.requiredPlayerClass.join('/')}.` };
  }

  if (player.spells.some(s => s.id === spellToLearn.id)) {
    return { player, message: `You already know the spell: ${spellToLearn.name}.` };
  }

  let newPlayer = { ...player };
  newPlayer.spells = [...newPlayer.spells, spellToLearn];

  const itemIndex = newPlayer.inventory.findIndex(invItem => invItem.id === item.id);
  if (itemIndex > -1) {
    newPlayer.inventory = [...newPlayer.inventory.slice(0, itemIndex), ...newPlayer.inventory.slice(itemIndex + 1)];
  }

  return { player: newPlayer, message: `You learned ${spellToLearn.name}!` };
};


export const applyPotion = (player: Player, item: Item): { player: Player; message: string, buffApplied?: Buff } => {
  if (item.type !== ItemType.POTION) {
    return { player, message: "This item cannot be used like that right now." };
  }

  let newPlayer = { ...player };
  let message = "";
  let buffApplied: Buff | undefined = undefined;

  if (item.effectValue && item.effectValue > 0) { 
    if (item.name.toLowerCase().includes('health')) {
        const actualHeal = Math.min(item.effectValue, getPlayerMaxHp(newPlayer) - newPlayer.hp);
        newPlayer.hp += actualHeal;
        message = `Used ${item.name}. Restored ${actualHeal} HP.`;
    } else if (item.name.toLowerCase().includes('mana')) {
        const actualRestore = Math.min(item.effectValue, getPlayerMaxMp(newPlayer) - newPlayer.mp);
        newPlayer.mp += actualRestore;
        message = `Used ${item.name}. Restored ${actualRestore} MP.`;
    } else {
        message = `${item.name} has an unknown direct effect value.`;
    }
  }

  if (item.buff) {
    newPlayer.activeBuffs = newPlayer.activeBuffs.filter(b => b.type !== item.buff!.type);
    newPlayer.activeBuffs.push({...item.buff}); 
    buffApplied = item.buff;
    message += (message ? " " : `Used ${item.name}. `) + `${item.buff.description}`;
  }

  if (!message) { 
     return { player, message: `${item.name} had no discernible effect.` };
  }

  const itemIndex = newPlayer.inventory.findIndex(invItem => invItem.id === item.id);
  if (itemIndex > -1) {
    newPlayer.inventory = [...newPlayer.inventory.slice(0, itemIndex), ...newPlayer.inventory.slice(itemIndex + 1)];
  }

  return { player: newPlayer, message, buffApplied };
};

export const equipItem = (player: Player, itemToEquip: Item): { player: Player; message: string } => {
  let newPlayer = { ...player };
  let message = "";

  if (itemToEquip.type === ItemType.WEAPON) {
    if (newPlayer.equippedWeapon) {
       if (ITEMS[newPlayer.equippedWeapon.id]) {
         newPlayer.inventory = [...newPlayer.inventory, newPlayer.equippedWeapon];
       }
    }
    newPlayer.equippedWeapon = itemToEquip;
    message = `Equipped ${itemToEquip.name}.`;
  } else if (itemToEquip.type === ItemType.ARMOR) {
    if (newPlayer.equippedArmor) {
      if (ITEMS[newPlayer.equippedArmor.id]) {
        newPlayer.inventory = [...newPlayer.inventory, newPlayer.equippedArmor];
      }
    }
    newPlayer.equippedArmor = itemToEquip;
    message = `Equipped ${itemToEquip.name}.`;
  } else if (itemToEquip.type === ItemType.ACCESSORY) {
    const emptySlotIndex = newPlayer.equippedAccessories.findIndex(slot => slot === null);
    if (emptySlotIndex !== -1) {
      newPlayer.equippedAccessories[emptySlotIndex] = itemToEquip;
      message = `Equipped ${itemToEquip.name} in accessory slot ${emptySlotIndex + 1}.`;
    } else {
      return { player, message: "Accessory slots are full. Unequip an item first." };
    }
  } else {
    return { player, message: "Cannot equip this item type." };
  }

  const itemIndex = newPlayer.inventory.findIndex(invItem => invItem.id === itemToEquip.id);
  if (itemIndex > -1) {
    newPlayer.inventory = [...newPlayer.inventory.slice(0, itemIndex), ...newPlayer.inventory.slice(itemIndex + 1)];
  }

  return { player: newPlayer, message };
};

export const unequipAccessory = (player: Player, slotIndex: number): { player: Player; message: string } => {
  let newPlayer = { ...player };
  if (slotIndex < 0 || slotIndex >= newPlayer.equippedAccessories.length) {
    return { player, message: "Invalid accessory slot." };
  }

  const itemToUnequip = newPlayer.equippedAccessories[slotIndex];
  if (!itemToUnequip) {
    return { player, message: "No accessory equipped in that slot." };
  }

  newPlayer.inventory = [...newPlayer.inventory, itemToUnequip];
  newPlayer.equippedAccessories[slotIndex] = null;

  return { player: newPlayer, message: `Unequipped ${itemToUnequip.name} from slot ${slotIndex + 1}.` };
};


export const checkLevelUp = (player: Player): { player: Player; leveledUp: boolean; message?: string } => {
  let newPlayer = { ...player };
  let leveledUp = false;
  let message: string | undefined;

  if (newPlayer.xp >= newPlayer.xpToNextLevel) {
    leveledUp = true;
    newPlayer.level += 1;
    newPlayer.xp -= newPlayer.xpToNextLevel;
    newPlayer.xpToNextLevel = Math.floor(XP_PER_LEVEL_BASE * Math.pow(XP_LEVEL_MULTIPLIER, newPlayer.level -1));

    newPlayer.baseAttack += 1 + Math.floor(newPlayer.level * 0.5);
    newPlayer.baseDefense += 1 + Math.floor(newPlayer.level * 0.4);

    const hpGain = 10 + Math.floor(newPlayer.level * 1.5);
    const mpGain = 5 + Math.floor(newPlayer.level * 1.2);
    newPlayer.maxHp = newPlayer.maxHp + hpGain; 
    newPlayer.maxMp = newPlayer.maxMp + mpGain; 

    newPlayer.hp = getPlayerMaxHp(newPlayer); 
    newPlayer.mp = getPlayerMaxMp(newPlayer); 

    message = `LEVEL UP! You are now Level ${newPlayer.level}! Stats increased. HP/MP restored.`;
  }
  return { player: newPlayer, leveledUp, message };
};


export const castSpell = (player: Player, spell: Spell, targetMonster: Monster):
  { player: Player, targetMonster: Monster, damageDealt?: number, healingDone?: number, mpRestored?: number, message: string, buffAppliedToPlayer?: Buff, buffAppliedToMonster?: Buff, isCrit?: boolean, isEvaded?: boolean, resistedByManaShield?: number } => {

  let newPlayer = {...player, activeBuffs: [...player.activeBuffs]};
  let newTargetMonster = {...targetMonster, activeBuffs: [...(targetMonster.activeBuffs || [])]};
  let message = "";
  let buffAppliedToPlayer: Buff | undefined = undefined;
  let buffAppliedToMonster: Buff | undefined = undefined;
  let isCrit = false;

  if (spell.mpCost > 0 && newPlayer.mp < spell.mpCost) {
    return { player, targetMonster: newTargetMonster, message: "Not enough MP to cast " + spell.name + "!" };
  }

  if (spell.mpCost > 0) {
     newPlayer.mp -= spell.mpCost;
  }

  message = `${player.name} casts ${spell.name}. `;

  if ((spell.damageType === 'magical' || spell.damageType === 'physical') && spell.damage !== undefined) {
    let attackPower = spell.damage;
    if (spell.damageType === 'physical') {
      attackPower += getPlayerTotalAttack(player); 
    } else if (spell.damageType === 'magical') {
      attackPower += getPlayerTotalSpellDamageBonus(player); 
    }

    const critChance = getPlayerTotalCritChance(player, spell.increasedCritChance);
    const calcResult = calculateDamage(player, newTargetMonster, attackPower, critChance, spell.elementalType, spell.damageType, true);
    isCrit = calcResult.isCrit;

    if(calcResult.isEvaded) {
        message += `But ${targetMonster.name} evades it!`;
        return { player: newPlayer, targetMonster: newTargetMonster, message, isEvaded: true, isCrit };
    }

    newTargetMonster.hp = Math.max(0, newTargetMonster.hp - calcResult.damage);

    if (calcResult.isCrit) message += "CRITICAL HIT! ";
    message += `Deals ${calcResult.damage} ${spell.elementalType} damage to ${targetMonster.name}.`;
    if (calcResult.elementalEffect === 'weakness') message += " It's super effective!";
    if (calcResult.elementalEffect === 'resistance') message += " It's not very effective.";
    
    // Apply debuff from spell like Crippling Shot
    if (spell.buffToApplyToTarget) {
        const debuffToApply = {...spell.buffToApplyToTarget, isDebuff: true}; // Ensure isDebuff is true
        newTargetMonster.activeBuffs = newTargetMonster.activeBuffs.filter(b => b.type !== debuffToApply.type);
        newTargetMonster.activeBuffs.push(debuffToApply);
        buffAppliedToMonster = debuffToApply;
        message += ` ${targetMonster.name} is affected by ${debuffToApply.description}!`;
    }

    return { player: newPlayer, targetMonster: newTargetMonster, damageDealt: calcResult.damage, message, buffAppliedToMonster, isCrit, isEvaded: false };

  } else if (spell.damageType === 'healing' && spell.healAmount) {
    const actualHeal = Math.min(spell.healAmount, getPlayerMaxHp(newPlayer) - newPlayer.hp);
    newPlayer.hp += actualHeal;
    message += `Healing for ${actualHeal} HP.`;
    return { player: newPlayer, targetMonster: newTargetMonster, healingDone: actualHeal, message, isCrit };

  } else if (spell.damageType === 'utility' && spell.id === 'meditate' && spell.healAmount) { 
    const actualMpRestore = Math.min(spell.healAmount, getPlayerMaxMp(newPlayer) - newPlayer.mp);
    newPlayer.mp += actualMpRestore;
    message += `Restoring ${actualMpRestore} MP.`;
    return { player: newPlayer, targetMonster: newTargetMonster, mpRestored: actualMpRestore, message, isCrit };
  } else if (spell.damageType === 'buff' && spell.buff) {
      if(spell.targetSelf) {
        newPlayer.activeBuffs = newPlayer.activeBuffs.filter(b => b.type !== spell.buff!.type);
        newPlayer.activeBuffs.push({...spell.buff});
        buffAppliedToPlayer = spell.buff;
        message += `${spell.buff.description}`;
      } else if (spell.buffToApplyToTarget) { // For spells that buff another target (not player self)
        const buffToApply = {...spell.buffToApplyToTarget, isDebuff: spell.buffToApplyToTarget.isDebuff === undefined ? false : spell.buffToApplyToTarget.isDebuff };
        newTargetMonster.activeBuffs = newTargetMonster.activeBuffs.filter(b => b.type !== buffToApply.type);
        newTargetMonster.activeBuffs.push(buffToApply);
        buffAppliedToMonster = buffToApply;
        message += `${targetMonster.name} is affected by ${buffToApply.description}!`;
      } else {
        message += `The spell's buff target is unclear.`;
      }
    return { player: newPlayer, targetMonster: newTargetMonster, message, buffAppliedToPlayer, buffAppliedToMonster, isCrit };
  }

  return { player: newPlayer, targetMonster: newTargetMonster, message: message + `But its effect is not fully defined.`, isCrit };
};

export const tickBuffs = (target: Player | Monster, isPlayer: boolean): Player | Monster => {
    if (!target.activeBuffs || target.activeBuffs.length === 0) return target;

    const newBuffs = target.activeBuffs
        .map(buff => ({ ...buff, duration: buff.duration - 1 }))
        .filter(buff => buff.duration > 0);

    if (isPlayer) {
        return { ...target as Player, activeBuffs: newBuffs };
    } else {
        return { ...target as Monster, activeBuffs: newBuffs };
    }
};
