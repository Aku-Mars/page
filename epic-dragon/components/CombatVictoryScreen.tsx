
import React, { useState, useEffect, useCallback } from 'react';
import { Player, CombatOutcomeDetails } from '../types';
import Button from './Button';
import TypewriterText from './TypewriterText';
import { STAGES } from '../constants'; // Import STAGES to check if next stage exists

interface CombatVictoryScreenProps {
  player: Player;
  outcome: CombatOutcomeDetails;
  onContinue: (outcome: CombatOutcomeDetails) => void; 
  onReturnToVillage: () => void; 
  onProceedToNextStage: () => void; 
}

const CombatVictoryScreen: React.FC<CombatVictoryScreenProps> = ({ 
    player, outcome, onContinue, onReturnToVillage, onProceedToNextStage 
}) => {
  
  const [allMessages, setAllMessages] = useState<string[]>([]);
  const [showActions, setShowActions] = useState(false);
  const [finishedTypewriters, setFinishedTypewriters] = useState(0);

  useEffect(() => {
    const messages = [
      `You defeated the ${outcome.defeatedMonsterName}!`,
      `Gained ${outcome.xpGained} XP.`,
      `Received ${outcome.goldGained} Gold.`,
      ...(outcome.itemsFound.length > 0 
        ? [`Found: ${outcome.itemsFound.map(item => item.name).join(', ')}.`] 
        : []),
      ...(outcome.leveledUp && outcome.levelUpMessage ? [outcome.levelUpMessage] : [])
    ].filter(Boolean); 
    setAllMessages(messages);
    setShowActions(false);    
    setFinishedTypewriters(0); 
  }, [outcome]);

  const handleOneTypewriterFinished = useCallback(() => {
    setFinishedTypewriters(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (allMessages.length > 0 && finishedTypewriters === allMessages.length) {
      setShowActions(true);
    }
  }, [finishedTypewriters, allMessages.length]);

  const canProceedToNextNumericalStage =
    outcome.isBossDefeat &&
    !outcome.isFinalBossDefeat && // Don't show if final boss (handled by onContinue special logic)
    !outcome.isSecretBossDefeat && // Don't show if secret boss
    outcome.defeatedStageId > 0 &&
    STAGES.some(s => s.id === outcome.defeatedStageId + 1); // Check if next stage exists

  return (
    <div className="p-4 md:p-8 flex flex-col items-center justify-center text-center h-full bg-stone-800">
      <p className="text-yellow-400 text-4xl mb-4">🏆</p> 
      <h2 className="text-3xl text-green-500 mb-6 text-shadow-pixel">Victory!</h2>
      
      <div className="mb-8 min-h-[100px] w-full max-w-md bg-stone-700 p-4 pixel-border border-green-600 space-y-2">
        {allMessages.map((message, index) => (
          <TypewriterText 
            key={index} 
            text={message} 
            speed={25}
            className="text-md text-gray-200"
            onFinished={handleOneTypewriterFinished} 
          />
        ))}
      </div>

      {showActions && (
        <div className="space-y-3 md:space-y-0 md:space-x-4 flex flex-col md:flex-row">
          {outcome.isFinalBossDefeat || outcome.isSecretBossDefeat ? (
            // Special handling for final/secret boss will be in onContinue
            <Button onClick={() => onContinue(outcome)} className="w-full md:w-auto">Claim Ultimate Victory!</Button>
          ) : outcome.isBossDefeat ? (
            <>
              <Button onClick={onReturnToVillage} variant="secondary" className="w-full md:w-auto">Return to Village</Button>
              {canProceedToNextNumericalStage && (
                <Button onClick={onProceedToNextStage} className="w-full md:w-auto">Proceed to Next Stage</Button>
              )}
            </>
          ) : ( // Normal monster defeat
            <Button onClick={() => onContinue(outcome)} className="w-full md:w-auto">Continue Exploring</Button>
          )}
        </div>
      )}

      <div className="mt-8 text-xs text-stone-400">
        <p>Current Gold: {player.gold}</p>
        <p>Current XP: {player.xp} / {player.xpToNextLevel}</p>
      </div>
    </div>
  );
};

export default CombatVictoryScreen;
