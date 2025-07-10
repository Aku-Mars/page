
import React from 'react';
import { Player, Item, ItemType, ElementalType } from '../types';
import Button from './Button';
import { ITEMS, SPELLS } from '../constants'; 

interface InventoryPanelProps {
  player: Player;
  onUseItem: (item: Item) => void;
  onEquipItem: (item: Item) => void;
  onUnequipAccessory: (slotIndex: number) => void; // New prop
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ player, onUseItem, onEquipItem, onUnequipAccessory }) => {
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
  }

  const getAccessoryBonusString = (item: Item) => {
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
            return `+${value} ${key}`;
        })
        .join(', ');
  }

  return (
    <div className="p-3 bg-stone-800 pixel-border border-stone-600 text-xs">
      <h3 className="text-lg text-yellow-400 mb-2 text-shadow-pixel">Inventory</h3>
      {player.inventory.length === 0 ? (
        <p className="text-gray-400">Your backpack is empty.</p>
      ) : (
        <ul className="space-y-1 max-h-32 overflow-y-auto pr-1 mb-2">
          {player.inventory.map((item, index) => {
            const itemDetails = ITEMS[item.id]; 
            if (!itemDetails) return null;

            const canLearnSpell = itemDetails.type === ItemType.SPELL_BOOK &&
                                  itemDetails.teachesSpellId && SPELLS[itemDetails.teachesSpellId] &&
                                  (!itemDetails.requiredPlayerClass || itemDetails.requiredPlayerClass.includes(player.playerClass)) &&
                                  !player.spells.some(s => s.id === itemDetails.teachesSpellId);

            return (
            <li key={`${item.id}-${index}`} className="flex justify-between items-center bg-stone-700 p-1 rounded">
              <span className="text-gray-300">
                {itemDetails.icon || ''} {itemDetails.name} 
                {itemDetails.type === ItemType.WEAPON && ` (+${itemDetails.effectValue || 0} ATK)`}
                {itemDetails.type === ItemType.ARMOR && ` (+${itemDetails.effectValue || 0} DEF)`}
                {itemDetails.type === ItemType.ACCESSORY && ` (${getAccessoryBonusString(itemDetails)})`}
              </span>
              <div className="space-x-1">
                {(itemDetails.type === ItemType.POTION || itemDetails.type === ItemType.OFFENSIVE_POTION) && (
                  <Button onClick={() => onUseItem(itemDetails)} className="text-xs p-1" variant="secondary">Use</Button>
                )}
                {itemDetails.type === ItemType.SPELL_BOOK && (
                  <Button 
                    onClick={() => onUseItem(itemDetails)} 
                    className="text-xs p-1" 
                    variant="secondary"
                    disabled={!canLearnSpell}
                  >
                    {canLearnSpell ? 'Learn' : (player.spells.some(s => s.id === itemDetails.teachesSpellId) ? 'Known' : 'Cannot Learn')}
                  </Button>
                )}
                {((itemDetails.type === ItemType.WEAPON || itemDetails.type === ItemType.ARMOR || itemDetails.type === ItemType.ACCESSORY)) && (
                  player.equippedWeapon?.id !== itemDetails.id && 
                  player.equippedArmor?.id !== itemDetails.id &&
                  !player.equippedAccessories.some(acc => acc?.id === itemDetails.id) &&
                  <Button onClick={() => onEquipItem(itemDetails)} className="text-xs p-1" variant="secondary">Equip</Button>
                )}
              </div>
            </li>
          )})}
        </ul>
      )}

      <div className="mt-2 mb-2">
        <h4 className="text-sm text-orange-400">Equipped Accessories:</h4>
        <ul className="space-y-1 max-h-20 overflow-y-auto pr-1">
            {player.equippedAccessories.map((accessory, index) => (
                <li key={`equipped-acc-${index}`} className="flex justify-between items-center bg-stone-700 p-1 rounded">
                    <span className="text-gray-300">
                        Slot {index + 1}: {accessory ? `${accessory.icon || ''} ${accessory.name}` : 'Empty'}
                    </span>
                    {accessory && (
                        <Button onClick={() => onUnequipAccessory(index)} className="text-xs p-1" variant="danger">Unequip</Button>
                    )}
                </li>
            ))}
        </ul>
      </div>
      
      <div className="mt-1">
        <h4 className="text-sm text-orange-400">Spells Known:</h4>
        {player.spells.length === 0 ? <p className="text-gray-400">No spells known.</p> : (
          <ul className="space-y-1 max-h-20 overflow-y-auto pr-1">
            {player.spells.map(spell => (
              <li key={spell.id} className={`text-purple-300 ${getElementalColor(spell.elementalType)}`} title={spell.description}>
                {spell.icon || ''} {spell.name} ({spell.mpCost} MP)
                {spell.damageType === 'magical' && spell.damage && ` [${spell.damage} Mag Dmg - ${spell.elementalType}]`}
                {spell.damageType === 'physical' && spell.damage && ` [+${spell.damage} Phys Dmg - ${spell.elementalType}]`}
                {spell.damageType === 'healing' && spell.healAmount && ` [${spell.healAmount} Heal]`}
                 {spell.damageType === 'utility' && ` [Utility - ${spell.elementalType}]`}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default InventoryPanel;