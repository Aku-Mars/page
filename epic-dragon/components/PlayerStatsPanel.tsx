
import React from 'react';
import { Player, ItemType } from '../types';
import { ITEMS } from '../constants';
import { 
    getPlayerTotalAttack, 
    getPlayerTotalDefense, 
    getPlayerMaxHp, 
    getPlayerMaxMp, 
    getPlayerTotalCritChance,
    getPlayerTotalSpellDamageBonus,
    getPlayerTotalSpellDefense,
    getPlayerTotalEvasion
} from '../services/gameLogic';

interface PlayerStatsPanelProps {
  player: Player;
}

const PlayerStatsPanel: React.FC<PlayerStatsPanelProps> = ({ player }) => {
  const weapon = player.equippedWeapon ? ITEMS[player.equippedWeapon.id] : null;
  const armor = player.equippedArmor ? ITEMS[player.equippedArmor.id] : null;

  const totalAttack = getPlayerTotalAttack(player);
  const totalPhysicalDefense = getPlayerTotalDefense(player);
  const totalSpellDefense = getPlayerTotalSpellDefense(player);
  const totalCritChance = getPlayerTotalCritChance(player);
  const totalMaxHp = getPlayerMaxHp(player);
  const totalMaxMp = getPlayerMaxMp(player);
  const totalSpellDamageBonus = getPlayerTotalSpellDamageBonus(player);
  const totalEvasion = getPlayerTotalEvasion(player);

  const getAccessoryBonusString = (item: import('../types').Item) => {
    if (!item.statBonuses) return '';
    return Object.entries(item.statBonuses)
        .map(([key, value]) => {
            if (key === 'critChance') return `+${value*100}% Crit`;
            if (key === 'physicalDamage') return `+${value} Phys Dmg`;
            if (key === 'magicDamage') return `+${value} Mag Dmg`;
            if (key === 'spellDamage') return `+${value} Spell Dmg`;
            if (key === 'maxHp') return `+${value} Max HP`;
            if (key === 'maxMp') return `+${value} Max MP`;
            if (key === 'physicalDefense') return `+${value} Phys Def`;
            if (key === 'spellDefense') return `+${value} Spell Def`;
            if (key === 'allDamage') return `+${value} All Dmg`;
            if (key === 'evasion') return `+${value*100}% Evasion`;
            return `+${value} ${key}`;
        })
        .join(', ');
  }

  return (
    <div className="p-3 bg-stone-800 pixel-border border-stone-600 text-xs">
      <h3 className="text-lg text-yellow-400 mb-2 text-shadow-pixel">{player.name} - Lv. {player.level} {player.playerClass}</h3>
      
      {/* HP Bar */}
      <div className="mb-1">
        <div className="flex justify-between text-green-400">
          <span>HP:</span>
          <span>{player.hp} / {totalMaxHp}</span>
        </div>
        <div className="w-full bg-gray-600 h-3 mt-0.5 pixel-border border-gray-700">
          <div 
            className="bg-green-500 h-full health-bar-fill" 
            style={{ width: `${Math.max(0,(player.hp / totalMaxHp)) * 100}%` }}
            role="progressbar"
            aria-valuenow={player.hp}
            aria-valuemin={0}
            aria-valuemax={totalMaxHp}
            aria-label="Player Hit Points"
          ></div>
        </div>
      </div>

      {/* MP Bar */}
      <div className="mb-1">
        <div className="flex justify-between text-blue-400">
          <span>MP:</span>
          <span>{player.mp} / {totalMaxMp}</span>
        </div>
        <div className="w-full bg-gray-600 h-3 mt-0.5 pixel-border border-gray-700">
          <div 
            className="bg-blue-500 h-full mp-bar-fill" 
            style={{ width: `${Math.max(0,(player.mp / totalMaxMp)) * 100}%` }}
            role="progressbar"
            aria-valuenow={player.mp}
            aria-valuemin={0}
            aria-valuemax={totalMaxMp}
            aria-label="Player Mana Points"
          ></div>
        </div>
      </div>

      {/* XP Bar (Moved Here) */}
      <div className="mb-2">
        <div className="flex justify-between text-purple-400">
          <span>XP:</span>
          <span>{player.xp} / {player.xpToNextLevel}</span>
        </div>
        <div className="w-full bg-gray-600 h-3 mt-0.5 pixel-border border-gray-700">
          <div 
            className="bg-purple-500 h-full health-bar-fill" // Use health-bar-fill for transition
            style={{ width: `${Math.max(0,(player.xp / player.xpToNextLevel)) * 100}%` }}
            role="progressbar"
            aria-valuenow={player.xp}
            aria-valuemin={0}
            aria-valuemax={player.xpToNextLevel}
            aria-label="Player Experience Points"
          ></div>
        </div>
      </div>
      
      <p className="text-red-400">Attack: {totalAttack}</p>
      {totalSpellDamageBonus > 0 && <p className="text-purple-400">Spell Dmg Bonus: +{totalSpellDamageBonus}</p>}
      <p className="text-cyan-400">Phys Defense: {totalPhysicalDefense}</p>
      {totalSpellDefense > 0 && <p className="text-teal-400">Spell Defense: {totalSpellDefense}</p>}
      <p className="text-lime-400">Crit Chance: {Math.round(totalCritChance * 100)}%</p>
      {totalEvasion > 0 && <p className="text-indigo-400">Evasion: {Math.round(totalEvasion * 100)}%</p>}
      <p className="text-yellow-500">Gold: {player.gold}</p>
      
      <div className="mt-2">
        <h4 className="text-sm text-orange-400">Equipped:</h4>
        <p>Weapon: {weapon ? `${weapon.icon || ''} ${weapon.name} (+${weapon.effectValue || 0} ATK${weapon.statBonuses?.magicDamage ? `, +${weapon.statBonuses.magicDamage} MGC` : ''})` : 'None'}</p>
        <p>Armor: {armor ? `${armor.icon || ''} ${armor.name} (+${armor.effectValue || 0} DEF)` : 'None'}</p>
      </div>

      <div className="mt-2">
        <h4 className="text-sm text-orange-400">Accessories:</h4>
        {player.equippedAccessories.map((acc, index) => (
          <p key={`acc-${index}`} className="text-gray-300">
            Slot {index + 1}: {acc ? `${acc.icon || ''} ${acc.name} (${getAccessoryBonusString(acc)})` : 'Empty'}
          </p>
        ))}
        {player.equippedAccessories.every(acc => acc === null) && <p className="text-gray-400">No accessories equipped.</p>}
      </div>

      {player.activeBuffs.length > 0 && (
        <div className="mt-2">
            <h4 className="text-sm text-green-300">Active Buffs:</h4>
            <ul className="list-disc list-inside">
                {player.activeBuffs.map((buff, index) => (
                    <li key={index} className="text-xs text-green-200">
                        {buff.description} ({buff.duration} turns left)
                    </li>
                ))}
            </ul>
        </div>
      )}
    </div>
  );
};

export default PlayerStatsPanel;
