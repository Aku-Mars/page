
import React from 'react';
import { Stage, Monster } from '../types';
import Button from './Button';
import PixelArtImage from './PixelArtImage';
import TypewriterText from './TypewriterText';

interface StageScreenProps {
  stage: Stage;
  onEncounterMonster: (monster: Monster) => void;
  onReturnToVillage: () => void;
  isLoading: boolean;
  potentialMonster: Monster | null; // Monster that will be encountered
}

const StageScreen: React.FC<StageScreenProps> = ({ stage, onEncounterMonster, onReturnToVillage, isLoading, potentialMonster }) => {
  const handleExplore = () => {
    if (potentialMonster) {
      onEncounterMonster(potentialMonster);
    } else {
      // This case should ideally not happen if logic is correct, but good to handle
      console.warn("No potential monster to encounter, returning to village.");
      onReturnToVillage(); 
    }
  };
  
  return (
    <div className="p-4 flex flex-col items-center">
      <PixelArtImage 
        src={stage.terrainArtUrl} 
        alt={stage.name} 
        className="mb-4 pixel-border border-stone-600 w-auto max-w-2xl" 
        height={350} 
      />
      <h2 className="text-2xl text-yellow-400 mb-2 text-shadow-pixel">{stage.name} (Stage {stage.id})</h2>
      <TypewriterText text={stage.description} className="text-sm text-gray-300 mb-6 text-center max-w-lg" />

      {isLoading && <p className="text-orange-400 my-4">Venturing forth...</p>}
      
      {!isLoading && (
        <div className="my-4 w-full max-w-md text-center">
          {potentialMonster ? (
            <p className="text-red-400 mb-3">You sense danger! A {potentialMonster.name} lurks nearby!</p>
          ) : (
            <p className="text-green-400 mb-3">This area seems clear for now. You can return to the village.</p>
          )}
           <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full">
            {potentialMonster && (
                <Button onClick={handleExplore} className="w-full sm:w-auto">Engage Enemy</Button>
            )}
            <Button onClick={onReturnToVillage} variant="secondary" className="w-full sm:w-auto">
                Return to Village
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StageScreen;
