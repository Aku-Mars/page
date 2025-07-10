
import React from 'react';
import { Player, GamePhase, Item } from '../types'; // Added Item
import PlayerStatsPanel from './PlayerStatsPanel';
import InventoryPanel from './InventoryPanel';
import { GAME_TITLE } from '../constants';

interface GameUIProps {
  player: Player | null;
  gamePhase: GamePhase;
  children: React.ReactNode; 
  onUseItem: (item: Item) => void; 
  onEquipItem: (item: Item) => void; 
  onUnequipAccessory: (slotIndex: number) => void; // New prop
}

const GameUI: React.FC<GameUIProps> = ({ player, gamePhase, children, onUseItem, onEquipItem, onUnequipAccessory }) => {
  const showSidePanels = player && 
                         gamePhase !== GamePhase.CHARACTER_CREATION && 
                         gamePhase !== GamePhase.GAME_OVER && 
                         gamePhase !== GamePhase.VICTORY;
                         // gamePhase !== GamePhase.IMAGE_GENERATION_TOOL; // Removed

  return (
    <div className="min-h-screen flex flex-col bg-stone-900 text-gray-200">
      {/* Header removed */}
      <main className={`flex-grow flex ${showSidePanels ? 'flex-col md:flex-row' : ''} p-2 md:p-4 gap-2 md:gap-4`}>
        {showSidePanels && player && (
          <aside className="w-full md:w-1/4 lg:w-1/5 space-y-4 order-1 md:order-none">
            <PlayerStatsPanel player={player} />
            <InventoryPanel 
              player={player} 
              onUseItem={onUseItem} 
              onEquipItem={onEquipItem} 
              onUnequipAccessory={onUnequipAccessory} // Pass down
            />
          </aside>
        )}
        
        <section className={`flex-grow ${showSidePanels ? 'w-full md:w-3/4 lg:w-4/5' : 'w-full'} bg-stone-800/70 pixel-border border-stone-600 shadow-lg order-2 md:order-none`}>
          {children}
        </section>
      </main>
      
      <footer className="bg-stone-950 p-2 text-center text-xs text-stone-500 pixel-border border-t-2 border-stone-700">
        Pixel Realms RPG - That's Mars Imagine
      </footer>
    </div>
  );
};

export default GameUI;