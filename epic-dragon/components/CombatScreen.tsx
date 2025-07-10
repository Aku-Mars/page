
import React, { useState, useEffect } from 'react';
import { Player, Monster, Item, Spell, ItemType, ElementalType, FloatingNumber } from '../types';
import Button from './Button';
import PixelArtImage from './PixelArtImage';
import { ITEMS, SPELLS } from '../constants';

interface CombatScreenProps {
  player: Player;
  monster: Monster;
  onPlayerAttack: () => void;
  onPlayerCastSpell: (spell: Spell) => void;
  onPlayerUseItem: (item: Item) => void;
  onPlayerFlee: () => void;
  combatLog: string[];
  isPlayerTurn: boolean;
  floatingNumbers: FloatingNumber[];
  shakeMonster: boolean; 
  lastAttackWasCrit: boolean; // New prop for critical hit shake
}

const CombatScreen: React.FC<CombatScreenProps> = ({
  player,
  monster,
  onPlayerAttack,
  onPlayerCastSpell,
  onPlayerUseItem,
  onPlayerFlee,
  combatLog,
  isPlayerTurn,
  floatingNumbers,
  shakeMonster,
  lastAttackWasCrit, // Destructure new prop
}) => {
  const [selectedSpellId, setSelectedSpellId] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [showSpells, setShowSpells] = useState(false);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    setSelectedItemId(null);
    setSelectedSpellId(null);
    setShowItems(false);
    setShowSpells(false);
  }, [monster, isPlayerTurn]);

  const handleCastSpell = () => {
    if (selectedSpellId && isPlayerTurn) {
      const spellToCast = player.spells.find(s => s.id === selectedSpellId);
      if (spellToCast) {
        onPlayerCastSpell(spellToCast);
        setSelectedSpellId(null);
        setShowSpells(false);
      }
    }
  };

  const handleUseItem = () => {
    if (selectedItemId && isPlayerTurn) {
      const itemToUseDetails = ITEMS[selectedItemId];
      if (itemToUseDetails && (itemToUseDetails.type === ItemType.POTION || itemToUseDetails.type === ItemType.OFFENSIVE_POTION || itemToUseDetails.type === ItemType.SCROLL)) {
        onPlayerUseItem(itemToUseDetails);
        setSelectedItemId(null);
        setShowItems(false);
      }
    }
  };

  const playerUsableCombatItems = player.inventory.filter(item => {
    const details = ITEMS[item.id];
    return details && (details.type === ItemType.POTION || details.type === ItemType.OFFENSIVE_POTION || details.type === ItemType.SCROLL);
  });

  const getElementalColor = (type: ElementalType | undefined) => {
    if (!type) return 'text-gray-400';
    switch(type) {
        case ElementalType.FIRE: return 'text-red-400';
        case ElementalType.ICE: return 'text-blue-300';
        case ElementalType.LIGHTNING: return 'text-yellow-300';
        case ElementalType.HOLY: return 'text-yellow-200';
        case ElementalType.SHADOW: return 'text-purple-400';
        case ElementalType.EARTH: return 'text-amber-500';
        case ElementalType.ARCANE: return 'text-fuchsia-400';
        case ElementalType.POISON: return 'text-green-400';
        case ElementalType.PHYSICAL: return 'text-orange-300';
        default: return 'text-gray-400';
    }
  };

  const monsterImageContainerId = `monster-image-container-${monster.id}`;
  const currentShakeClass = shakeMonster ? (lastAttackWasCrit ? 'shake-animation-crit' : 'shake-animation') : '';

  return (
    <div className="p-4 flex flex-col items-center relative"> {/* Relative for floating numbers */}
      <h2 className="text-2xl text-red-500 mb-1 text-shadow-pixel">Combat! {player.name} vs {monster.name}</h2>
      <p className={`text-sm mb-3 ${isPlayerTurn ? 'text-green-400' : 'text-red-400'}`}>
        {isPlayerTurn ? "Your Turn!" : `${monster.name}'s Turn...`}
      </p>

      {/* Floating Numbers Container */}
      <div id="floating-number-area" className="absolute top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
        {floatingNumbers.map(fn => (
          <div
            key={fn.id}
            className={`floating-text ${fn.type}`}
            style={{
                left: `${fn.x}%`, 
                top: `${fn.y}%`,
                ...(fn.dynamicColor && { color: fn.dynamicColor }) // Apply dynamic color if present
            }}
            aria-live="polite"
          >
            {fn.text}
          </div>
        ))}
      </div>


      {/* Monster Display */}
      <div
        id={monsterImageContainerId}
        className={`mb-6 text-center pixel-border border-red-700 p-4 bg-stone-800/50 w-full max-w-md relative ${currentShakeClass}`}
      >
        <PixelArtImage src={monster.spriteUrl} alt={monster.name} className="mx-auto mb-2" height={250} />
        <h3 className="text-xl text-orange-400">{monster.name}</h3>
        <p className="text-sm text-red-400">HP: {monster.hp} / {monster.maxHp}</p>
        <div className="w-full bg-gray-600 h-3 mt-1 pixel-border border-gray-700">
          <div
            className="bg-red-500 h-full health-bar-fill"
            style={{ width: `${Math.max(0, (monster.hp / monster.maxHp)) * 100}%` }}
            role="progressbar"
            aria-valuenow={monster.hp}
            aria-valuemin={0}
            aria-valuemax={monster.maxHp}
            aria-label={`${monster.name} Hit Points`}
          ></div>
        </div>
        <div className="text-xs mt-1">
            {monster.resistances.length > 0 && <p className="text-yellow-500">Resists: {monster.resistances.join(', ')}</p>}
            {monster.weaknesses.length > 0 && <p className="text-green-400">Weak to: {monster.weaknesses.join(', ')}</p>}
            
        </div>
         {monster.activeBuffs && monster.activeBuffs.length > 0 && (
          <div className="text-xs mt-1">
            {monster.activeBuffs.map((buff, idx) => (
              <span key={idx} className={`${buff.isDebuff ? 'text-red-300' : 'text-sky-300'}`}> ({buff.description} {buff.duration}t)</span>
            ))}
          </div>
        )}
      </div>

      {/* Player Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 w-full max-w-lg">
        <Button onClick={onPlayerAttack} className="w-full" disabled={!isPlayerTurn}>Attack</Button>
        <Button onClick={() => { setShowSpells(!showSpells); setShowItems(false); }} className="w-full" disabled={player.spells.length === 0 || !isPlayerTurn}>Spell</Button>
        <Button onClick={() => { setShowItems(!showItems); setShowSpells(false); }} className="w-full" disabled={playerUsableCombatItems.length === 0 || !isPlayerTurn}>Item</Button>
        <Button onClick={onPlayerFlee} variant="secondary" className="w-full" disabled={!isPlayerTurn || monster.id === 'dragon_knight_aetharion' || monster.id === 'shadow_monarch'}>Flee</Button> {/* Cannot flee boss */}
      </div>

      {/* Spell Selection */}
      {showSpells && isPlayerTurn && (
        <div className="mb-4 p-3 bg-stone-700 pixel-border border-blue-500 w-full max-w-lg">
          <h4 className="text-md text-blue-300 mb-2">Choose Spell:</h4>
          <ul className="space-y-1 text-xs max-h-32 overflow-y-auto">
            {player.spells.map(spell => (
              <li key={spell.id}
                  onClick={() => setSelectedSpellId(spell.id)}
                  className={`p-1 cursor-pointer ${selectedSpellId === spell.id ? 'bg-blue-600' : 'hover:bg-blue-800'} ${getElementalColor(spell.elementalType)}`}
                  title={`Type: ${spell.elementalType}, Cost: ${spell.mpCost} MP. ${spell.description}`}
                  aria-selected={selectedSpellId === spell.id}>
                {spell.icon || ''} {spell.name} ({spell.mpCost} MP)
              </li>
            ))}
          </ul>
          {selectedSpellId && SPELLS[selectedSpellId] && player.mp >= SPELLS[selectedSpellId].mpCost && (
            <Button onClick={handleCastSpell} className="mt-2 text-xs">Cast {SPELLS[selectedSpellId].name}</Button>
          )}
          {selectedSpellId && SPELLS[selectedSpellId] && player.mp < SPELLS[selectedSpellId].mpCost && (
            <p className="text-red-400 text-xs mt-1">Not enough MP!</p>
          )}
        </div>
      )}

      {/* Item Selection */}
      {showItems && isPlayerTurn && (
        <div className="mb-4 p-3 bg-stone-700 pixel-border border-green-500 w-full max-w-lg">
          <h4 className="text-md text-green-300 mb-2">Choose Item:</h4>
          <ul className="space-y-1 text-xs max-h-32 overflow-y-auto">
            {playerUsableCombatItems.map(item => {
              const itemDetails = ITEMS[item.id];
              if (!itemDetails) return null;
              return (
              <li key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`p-1 cursor-pointer ${selectedItemId === item.id ? 'bg-green-600' : 'hover:bg-green-800'}`}
                  title={itemDetails.description}
                  aria-selected={selectedItemId === item.id}>
                {itemDetails.icon || ''} {itemDetails.name}
                {itemDetails.type === ItemType.OFFENSIVE_POTION && itemDetails.offensivePotionEffect && ` (Dmg: ${itemDetails.offensivePotionEffect.damage} ${itemDetails.offensivePotionEffect.elementType})`}
              </li>
            )})}
          </ul>
          {selectedItemId && ITEMS[selectedItemId] && (
            <Button onClick={handleUseItem} className="mt-2 text-xs">Use {ITEMS[selectedItemId].name}</Button>
          )}
        </div>
      )}

      {/* Combat Log */}
      <div className="w-full max-w-lg h-36 overflow-y-auto p-3 bg-stone-900 pixel-border border-gray-500 text-xs" role="log" aria-live="polite">
        {combatLog.map((log, index) => (
          <p key={index} className="mb-1 text-gray-300 whitespace-pre-wrap">{log}</p>
        ))}
      </div>
    </div>
  );
};

export default CombatScreen;
