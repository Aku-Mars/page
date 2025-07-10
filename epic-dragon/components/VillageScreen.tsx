import React from 'react';
import { Player } from '../types';
import Button from './Button';
import PixelArtImage from './PixelArtImage';
import TypewriterText from './TypewriterText';
import { VILLAGE_NAME, REST_TIME_PENALTY_SECONDS } from '../constants';

interface VillageScreenProps {
  player: Player;
  onVisitShop: () => void;
  onVisitMage: () => void;
  onEmbarkAdventure: () => void;
  onRest: () => void; 
  onViewLeaderboard: () => void; 
  onLogout: () => void;
  lastMessage?: string | null;
}

const VillageScreen: React.FC<VillageScreenProps> = ({ 
    player, 
    onVisitShop, 
    onVisitMage, 
    onEmbarkAdventure, 
    onRest,
    onViewLeaderboard,
    onLogout,
    lastMessage 
}) => {
  const villageDescription = `You are in ${VILLAGE_NAME}, a small but resilient village nestled at the edge of the wilds. The air is filled with the scent of woodsmoke and the distant sounds of the blacksmith's hammer. What will you do, ${player.name}?`;
  
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <PixelArtImage 
        src="images/stages/village_overview.png" 
        alt={`Village of ${VILLAGE_NAME}`} 
        className="mb-4 pixel-border border-stone-600 max-w-full" 
        width={600} 
        height={300} 
      />
      <h2 className="text-2xl text-yellow-400 mb-2 text-shadow-pixel">Welcome to {VILLAGE_NAME}</h2>
      <TypewriterText text={villageDescription} className="text-sm text-gray-300 mb-4 text-center max-w-lg" />
      <p className="text-xs text-amber-300 mb-4">Current Game Time: {formatTime(player.elapsedTime)}</p>

      {lastMessage && (
        <div className="my-4 p-3 bg-stone-700 pixel-border border-yellow-500 text-yellow-300 text-xs max-w-md text-center">
          <TypewriterText text={lastMessage} speed={20} />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl md:max-w-2xl mb-3">
        <Button onClick={onVisitShop} className="w-full p-3 flex flex-col items-center justify-center text-center text-sm">
          <span role="img" aria-label="Shop Icon" className="text-lg mb-1">🛍️</span> Visit Shop
        </Button>
        <Button onClick={onVisitMage} className="w-full p-3 flex flex-col items-center justify-center text-center text-sm">
          <span role="img" aria-label="Mage Icon" className="text-lg mb-1">🧙</span> Talk to Old Mage
        </Button>
        <Button 
          onClick={onRest} 
          className="w-full p-3 flex flex-col items-center justify-center text-center text-sm" 
          variant="secondary"
          title={`Restores HP/MP. Adds ${REST_TIME_PENALTY_SECONDS / 60} min to leaderboard time.`}
          aria-label={`Rest to restore health and mana, adds ${REST_TIME_PENALTY_SECONDS / 60} minutes to time`}
        >
          <span role="img" aria-label="Rest Icon" className="text-lg mb-1">🛌</span> Rest (Adds Time)
        </Button>
        <Button onClick={onViewLeaderboard} className="w-full p-3 flex flex-col items-center justify-center text-center text-sm">
            <span role="img" aria-label="Leaderboard Icon" className="text-lg mb-1">🏆</span> View Leaderboard
        </Button>
      </div>
      <Button 
          onClick={onEmbarkAdventure} 
          className="w-full max-w-xl md:max-w-2xl p-4 md:p-5 text-sm md:text-base flex flex-col items-center justify-center text-center" 
          variant="primary"
      >
        <span role="img" aria-label="Adventure Icon" className="text-lg mb-1">⚔️</span> Go on Adventure
      </Button>
      <Button 
        onClick={onLogout} 
        variant="danger" 
        className="w-full max-w-xl md:max-w-2xl p-3 mt-3 text-sm"
        aria-label="Logout of the game"
      >
        <span role="img" aria-label="Logout Icon" className="text-lg mr-1">🚪</span> Logout
      </Button>
    </div>
  );
};

export default VillageScreen;