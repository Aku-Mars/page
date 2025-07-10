
import React, { useState } from 'react';
import { PlayerClassType, GamePhase } from '../types';
import { PLAYER_CLASSES, GAME_TITLE } from '../constants';
import Button from './Button';
import TypewriterText from './TypewriterText';

interface CharacterCreationScreenProps {
  onCharacterCreate: (name: string, playerClass: PlayerClassType) => void;
  // onToggleImageTool: () => void; // Removed
}

const CharacterCreationScreen: React.FC<CharacterCreationScreenProps> = ({ onCharacterCreate }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<PlayerClassType | null>(null);
  const [introFinished, setIntroFinished] = useState(false);
  const [nameSubmitted, setNameSubmitted] = useState(false); // New state for flow control

  const welcomeMessage = `Welcome, adventurer, to ${GAME_TITLE}!\nA land of peril and untold riches awaits.`;
  const namePrompt = "\nBut first, who are you? Tell me your name, brave one:";
  const introTextCombined = welcomeMessage + namePrompt;


  const handleNameSubmit = () => {
    if (name.trim() !== '') {
      setNameSubmitted(true);
    }
  };

  const handleClassSelect = (playerClass: PlayerClassType) => {
    setSelectedClass(playerClass);
  };

  const handleFinalize = () => {
    if (name.trim() !== '' && selectedClass && nameSubmitted) {
      onCharacterCreate(name.trim(), selectedClass);
    }
  };
  
  // const isDevMode = process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dev');


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-900 text-gray-200">
      <div className="w-full max-w-2xl md:max-w-3xl bg-stone-800 p-6 md:p-8 pixel-border border-stone-600 shadow-2xl">
        <h1 className="text-3xl md:text-4xl text-yellow-400 mb-6 text-center text-shadow-pixel">{GAME_TITLE}</h1>
        
        {!nameSubmitted && (
            <div className="text-center mb-6">
                <TypewriterText 
                    text={introTextCombined} 
                    speed={30} 
                    className="text-lg whitespace-pre-line" 
                    onFinished={() => setIntroFinished(true)} 
                />
            </div>
        )}

        {introFinished && !nameSubmitted && (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name here..."
              className="w-full p-3 bg-stone-700 border border-stone-500 text-gray-200 focus:outline-none focus:border-yellow-400 mb-6 text-center text-lg"
              maxLength={20}
              autoFocus
            />
            <div className="text-center">
                <Button onClick={handleNameSubmit} disabled={name.trim() === ''}>Continue</Button>
            </div>
          </>
        )}

        {nameSubmitted && (
             <>
                <TypewriterText text={`Greetings, ${name}. Now, choose your path:`} className="text-lg mb-6 text-center" key={name} />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {PLAYER_CLASSES.map((pClass) => (
                    <div
                    key={pClass.type}
                    onClick={() => handleClassSelect(pClass.type)}
                    className={`p-5 md:p-6 pixel-border cursor-pointer transition-all duration-200 
                                ${selectedClass === pClass.type ? 'border-yellow-400 bg-stone-700' : 'border-stone-600 hover:border-yellow-300 hover:bg-stone-700/50'}`}
                    >
                    <h3 className="text-xl text-orange-400 mb-2 text-shadow-pixel">{pClass.type}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed min-h-[60px]">{pClass.description.replace(`Crit Chance: ${Math.round(pClass.baseCritChance * 100)}%`, '')}</p>
                    <p className="mt-2 text-teal-300 text-xs">Crit Chance: {Math.round(pClass.baseCritChance * 100)}%</p>
                    </div>
                ))}
                </div>
                <div className="text-center">
                <Button onClick={handleFinalize} disabled={!selectedClass}>Embark on Adventure!</Button>
                </div>
            </>
        )}
      </div>
       <footer className="mt-8 text-xs text-stone-500">A solo adventure like you've never experienced before.</footer>
       {/* {isDevMode && (
          <Button onClick={onToggleImageTool} variant="secondary" className="mt-4">
            DEV: Generate Images
          </Button>
        )} */}
    </div>
  );
};

export default CharacterCreationScreen;