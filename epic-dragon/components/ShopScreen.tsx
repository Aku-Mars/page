
import React, { useState } from 'react';
import { Player, Item, ShopItem, ItemType } from '../types';
import Button from './Button';
import { ITEMS, SPELLS, SHOP_REFRESH_COST } from '../constants'; // Added SPELLS and SHOP_REFRESH_COST
import TypewriterText from './TypewriterText';

interface ShopScreenProps {
  player: Player;
  shopInventory: ShopItem[];
  onBuyItem: (item: Item) => void;
  onSellItem: (item: Item, sellPrice: number) => void;
  onExitShop: () => void;
  onRefreshShop: () => void; // New prop
}

const ShopScreen: React.FC<ShopScreenProps> = ({ player, shopInventory, onBuyItem, onSellItem, onExitShop, onRefreshShop }) => {
  const [message, setMessage] = useState<string | null>("Welcome to 'The Wandering Peddler'! What can I get for you?");
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  const handleBuy = (shopItem: ShopItem) => {
    const itemDetails = ITEMS[shopItem.id];
    if (!itemDetails) {
        setMessage("Sorry, that item is a figment of imagination.");
        return;
    }

    const isSpellBook = itemDetails.type === ItemType.SPELL_BOOK;
    let canBuy = player.gold >= itemDetails.price;
    let purchaseBlockedReason = "";

    if (isSpellBook) {
        const spell = itemDetails.teachesSpellId ? SPELLS[itemDetails.teachesSpellId] : null;
        if (spell) {
            if (itemDetails.requiredPlayerClass && !itemDetails.requiredPlayerClass.includes(player.playerClass)) {
                canBuy = false;
                purchaseBlockedReason = "Your class cannot learn this spell.";
            } else if (player.spells.some(s => s.id === spell.id)) {
                canBuy = false;
                purchaseBlockedReason = "You already know this spell.";
            }
        }
    }
    
    if (player.gold < itemDetails.price && canBuy) { // Check gold last if not blocked by other reasons
        canBuy = false;
        purchaseBlockedReason = "Not enough gold, friend!";
    }


    if (canBuy) {
      onBuyItem(itemDetails);
      setMessage(`You bought ${itemDetails.name} for ${itemDetails.price} gold.`);
    } else {
      setMessage(purchaseBlockedReason || "Cannot purchase this item.");
    }
  };

  const handleSell = (item: Item) => {
    const itemDetails = ITEMS[item.id];
    if (!itemDetails) {
        setMessage("I don't recognize that item.");
        return;
    }
    const sellMultiplier = (itemDetails.type === ItemType.SPELL_BOOK || itemDetails.type === ItemType.SCROLL) ? 0.3 : 0.5;
    const sellPrice = Math.floor(itemDetails.price * sellMultiplier); 
    onSellItem(item, sellPrice);
    setMessage(`You sold ${itemDetails.name} for ${sellPrice} gold.`);
  };

  const handleRefreshStock = () => {
    if (player.gold >= SHOP_REFRESH_COST) {
        onRefreshShop();
        setMessage(`The peddler shuffles their wares. (Cost: ${SHOP_REFRESH_COST}G)`);
    } else {
        setMessage(`You need ${SHOP_REFRESH_COST} gold to refresh the stock.`);
    }
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl text-yellow-400 text-shadow-pixel">The Wandering Peddler - Shop</h2>
        <Button onClick={onExitShop} variant="secondary">Leave Shop</Button>
      </div>

      <div className="min-h-[40px] text-sm text-yellow-300 bg-stone-700 p-2 mb-4 pixel-border border-yellow-500">
        {message ? <TypewriterText text={message} speed={20} onFinished={() => setTimeout(() => setMessage(null), 3000)} /> : <div className="h-[20px]"></div>}
      </div>
      
      <p className="mb-4 text-green-400">Your Gold: {player.gold} G</p>

      <div className="mb-4 flex space-x-2">
        <Button onClick={() => setTab('buy')} variant={tab === 'buy' ? 'primary' : 'secondary'}>Buy Items</Button>
        <Button onClick={() => setTab('sell')} variant={tab === 'sell' ? 'primary' : 'secondary'}>Sell Items</Button>
        {tab === 'buy' && (
            <Button onClick={handleRefreshStock} variant="secondary" title={`Cost: ${SHOP_REFRESH_COST} Gold`}>Refresh Stock ({SHOP_REFRESH_COST}G)</Button>
        )}
      </div>

      {tab === 'buy' && (
        <div>
          <h3 className="text-xl text-orange-400 mb-2">Items for Sale:</h3>
          {shopInventory.length === 0 && <p className="text-gray-400">The peddler seems to be out of interesting wares for now.</p>}
          <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {shopInventory.map((shopItem) => {
              const itemDetails = ITEMS[shopItem.id];
              if (!itemDetails) return null;
              
              const isSpellBook = itemDetails.type === ItemType.SPELL_BOOK;
              let cannotBuyReason = "";
              let isDisabled = player.gold < itemDetails.price;

              if (player.gold < itemDetails.price) {
                cannotBuyReason = "(Not enough gold)";
              }

              if (isSpellBook) {
                  const spell = itemDetails.teachesSpellId ? SPELLS[itemDetails.teachesSpellId] : null;
                  if (spell) {
                      if (itemDetails.requiredPlayerClass && !itemDetails.requiredPlayerClass.includes(player.playerClass)) {
                          isDisabled = true;
                          cannotBuyReason = `(Class: ${itemDetails.requiredPlayerClass.join('/')} only)`;
                      } else if (player.spells.some(s => s.id === spell.id)) {
                          isDisabled = true;
                          cannotBuyReason = "(Already Known)";
                      }
                  }
              }

              return (
              <li key={itemDetails.id} className="flex justify-between items-center bg-stone-700 p-2 pixel-border border-stone-600">
                <div>
                  <p className="text-gray-200">{itemDetails.icon || ''} {itemDetails.name} - {itemDetails.price}G
                    {cannotBuyReason && <span className="text-xs text-yellow-500 ml-1">{cannotBuyReason}</span>}
                  </p>
                  <p className="text-xs text-gray-400">{itemDetails.description}</p>
                </div>
                <Button 
                    onClick={() => handleBuy(itemDetails)} 
                    disabled={isDisabled}
                >
                    Buy
                </Button>
              </li>
            )})}
          </ul>
        </div>
      )}

      {tab === 'sell' && (
        <div>
          <h3 className="text-xl text-orange-400 mb-2">Your Items to Sell:</h3>
          {player.inventory.filter(item => item.type !== ItemType.MISC && item.type !== ItemType.GOLD_DROP_ONLY).length === 0 ? (
            <p className="text-gray-400">You have nothing of value to sell.</p>
          ) : (
            <ul className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {player.inventory.filter(item => item.type !== ItemType.MISC && item.type !== ItemType.GOLD_DROP_ONLY).map((item, index) => {
                 const itemDetails = ITEMS[item.id];
                 if (!itemDetails) return null;
                 const sellMultiplier = (itemDetails.type === ItemType.SPELL_BOOK || itemDetails.type === ItemType.SCROLL) ? 0.3 : 0.5;
                 const sellPrice = Math.floor(itemDetails.price * sellMultiplier);
                 return (
                <li key={`${itemDetails.id}-${index}`} className="flex justify-between items-center bg-stone-700 p-2 pixel-border border-stone-600">
                  <div>
                    <p className="text-gray-200">{itemDetails.icon || ''} {itemDetails.name}</p>
                    <p className="text-xs text-gray-400">Sell Price: {sellPrice}G</p>
                  </div>
                  <Button onClick={() => handleSell(itemDetails)} variant="secondary">Sell</Button>
                </li>
              )})}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopScreen;