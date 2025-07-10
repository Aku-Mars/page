
import React, { useState, useEffect, useCallback } from 'react';
import {
  Player, PlayerClassType, GamePhase, Item, Monster, Spell, Stage as StageType, ItemType, CombatOutcomeDetails, ShopItem, ElementalType, LeaderboardEntry, Buff, FloatingNumber, MonsterAbility
} from './types';
import {
  PLAYER_CLASSES, ITEMS, SPELLS, MONSTERS, STAGES, INITIAL_GOLD, XP_PER_LEVEL_BASE, XP_LEVEL_MULTIPLIER, BASE_SHOP_ITEMS, MAGE_MESSAGES, VILLAGE_NAME, GENERAL_LOOT_POOL_IDS, GAME_TITLE, LEADERBOARD_MAX_ENTRIES, REST_TIME_PENALTY_SECONDS, SHOP_REFRESH_MAX_ITEMS, SHOP_REFRESH_COST
} from './constants';
import * as SoundManager from './soundManager'; // Import sound manager

import AuthScreen from './components/AuthScreen';
import CharacterCreationScreen from './components/CharacterCreationScreen';
import VillageScreen from './components/VillageScreen';
import ShopScreen from './components/ShopScreen';
import StageScreen from './components/StageScreen';
import CombatScreen from './components/CombatScreen';
import CombatVictoryScreen from './components/CombatVictoryScreen';
// import ImageGenerationTool from './components/ImageGenerationTool'; // Removed
import LeaderboardScreen from './components/LeaderboardScreen';
import Modal from './components/Modal';
import GameUI from './components/GameUI';
import TypewriterText from './components/TypewriterText';
import Button from './components/Button';
import PixelArtImage from './components/PixelArtImage';
import {
    calculateDamage, applyPotion, equipItem, unequipAccessory as unequipAccessoryLogic,
    checkLevelUp, getPlayerTotalAttack, getPlayerTotalDefense, getPlayerTotalCritChance,
    getPlayerMaxHp, getPlayerMaxMp, getPlayerTotalSpellDamageBonus, getPlayerTotalSpellDefense,
    castSpell, learnSpellFromBook, DamageCalculationResult, tickBuffs, getPlayerTotalEvasion,
    getMonsterTotalDefense, getMonsterTotalSpellDefense, getMonsterTotalEvasion
} from './services/gameLogic';

// --- LocalStorage Utility ---
const saveData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};
const loadData = <T,>(key: string): T | null => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T : null;
  } catch (err) { 
    console.error("Error loading from localStorage:", err);
    return null;
  }
};

const App: React.FC = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.AUTH);
  const [currentStage, setCurrentStage] = useState<StageType | null>(null);
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [modal, setModal] = useState<{ title: string; message: string; actions?: { label: string, onClick: () => void, variant?: 'primary' | 'secondary' | 'danger' }[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastVillageMessage, setLastVillageMessage] = useState<string | null>(null);
  const [potentialNextMonster, setPotentialNextMonster] = useState<Monster | null>(null);
  const [combatOutcome, setCombatOutcome] = useState<CombatOutcomeDetails | null>(null);
  const [currentShopInventory, setCurrentShopInventory] = useState<ShopItem[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [floatingNumbers, setFloatingNumbers] = useState<FloatingNumber[]>([]);
  const [shakeMonster, setShakeMonster] = useState<boolean>(false);
  const [lastAttackWasCrit, setLastAttackWasCrit] = useState<boolean>(false);
  const [currentMonsterAbilityUsed, setCurrentMonsterAbilityUsed] = useState<MonsterAbility | null>(null);
  const [pendingStageTransitionId, setPendingStageTransitionId] = useState<number | null>(null);
  const [pendingLoginPlayer, setPendingLoginPlayer] = useState<Player | null>(null);


  // --- Auth & Player Data ---
  useEffect(() => {
    const loadedLeaderboard = loadData<LeaderboardEntry[]>('rpg_leaderboard');
    if (loadedLeaderboard) {
      setLeaderboardData(loadedLeaderboard);
    }
  }, []);

  const savePlayerData = useCallback((playerToSave: Player | null) => {
    if (playerToSave && currentUser) {
      saveData(`rpg_user_${currentUser}_player`, playerToSave);
    }
  }, [currentUser]);

  useEffect(() => {
      if (player && currentUser && gamePhase !== GamePhase.AUTH && gamePhase !== GamePhase.CHARACTER_CREATION && gamePhase !== GamePhase.LOGIN_CHOICE) {
        savePlayerData(player);
      }
  }, [player, currentUser, savePlayerData, gamePhase]);


  const handleRegister = (username: string, password?: string) => {
    setAuthErrorMessage(null);
    if (!username.trim() || !password?.trim()) {
        setAuthErrorMessage("Username and password cannot be empty.");
        return;
    }
    if (loadData(`rpg_user_${username}_player`)) {
      setAuthErrorMessage("Username already exists. Please choose another or login.");
      return;
    }
    saveData(`rpg_user_${username}_meta`, {password}); // In real app, hash password
    saveData(`rpg_user_${username}_player_initial_backup`, null); // Initial backup is set on first char creation
    setCurrentUser(username);
    setGamePhase(GamePhase.CHARACTER_CREATION);
  };

  const handleLogin = (username: string, password?: string) => {
    setAuthErrorMessage(null);
    const userMeta = loadData<{password: string}>(`rpg_user_${username}_meta`);
    if (userMeta && userMeta.password === password) {
      const loadedPlayer = loadData<Player>(`rpg_user_${username}_player`);
      setCurrentUser(username);
      if (loadedPlayer) {
        setPendingLoginPlayer(loadedPlayer); // Store for choice
        setGamePhase(GamePhase.LOGIN_CHOICE);
      } else {
        setGamePhase(GamePhase.CHARACTER_CREATION);
      }
    } else {
      setAuthErrorMessage("Invalid username or password.");
    }
  };

  const handleContinueAdventure = () => {
    if (pendingLoginPlayer) {
        setPlayer(pendingLoginPlayer);
        setGamePhase(GamePhase.VILLAGE);
        setLastVillageMessage(`Welcome back, ${pendingLoginPlayer.name}!`);
    } else {
        // Fallback if pendingLoginPlayer is null for some reason
        setGamePhase(GamePhase.AUTH);
        setAuthErrorMessage("Error loading character. Please login again.");
    }
    setPendingLoginPlayer(null);
    setModal(null);
  };

  const handleRestartGame = () => {
    if (currentUser) {
        // Clear existing player data for a true restart, initial_backup will be recreated.
        localStorage.removeItem(`rpg_user_${currentUser}_player`);
        setPlayer(null); // Clear current player state
        setGamePhase(GamePhase.CHARACTER_CREATION);
    } else {
        setGamePhase(GamePhase.AUTH); // Should not happen if currentUser is set
    }
    setPendingLoginPlayer(null);
    setModal(null);
  };


  const handleLogout = () => {
    if (player) savePlayerData(player);
    SoundManager.stopSong();
    setPlayer(null);
    setCurrentUser(null);
    setPendingLoginPlayer(null);
    setGamePhase(GamePhase.AUTH);
    setAuthErrorMessage(null);
    setModal(null);
  };

  // --- Music and Game Phase Management ---
  useEffect(() => {
    const villageMusicPhases = [
      GamePhase.VILLAGE,
      GamePhase.SHOP,
      GamePhase.LEADERBOARD,
      GamePhase.STAGE_SELECT,
      GamePhase.MAGE_INTERACTION
    ];

    if (villageMusicPhases.includes(gamePhase)) {
      if (SoundManager.getCurrentSongKey() !== 'VILLAGE') {
        SoundManager.playSong('VILLAGE');
      }
    } else if (gamePhase === GamePhase.COMBAT) {
      // Combat music is handled by initiateCombat, which should already stop previous songs.
    } else if (gamePhase === GamePhase.AUTH || gamePhase === GamePhase.CHARACTER_CREATION || gamePhase === GamePhase.LOGIN_CHOICE ) {
      // Explicitly stop music for these non-gameplay/setup phases
      if (SoundManager.getCurrentSongKey() === 'VILLAGE' || SoundManager.getCurrentSongKey() === 'BATTLE_BOSS' || SoundManager.getCurrentSongKey() === 'BATTLE_NORMAL') {
        SoundManager.stopSong();
      }
    }
    // Note: GameOver and Victory music handled within their respective modal effects or functions
  }, [gamePhase]);


  // --- Time Tracking ---
  useEffect(() => {
    let intervalId: number | undefined = undefined;
    if (player && currentUser && gamePhase !== GamePhase.AUTH && gamePhase !== GamePhase.CHARACTER_CREATION && gamePhase !== GamePhase.LOGIN_CHOICE && gamePhase !== GamePhase.VILLAGE && gamePhase !== GamePhase.SHOP && gamePhase !== GamePhase.MAGE_INTERACTION && gamePhase !== GamePhase.GAME_OVER && gamePhase !== GamePhase.VICTORY && gamePhase !== GamePhase.LEADERBOARD && gamePhase !== GamePhase.SECRET_BOSS_INTRO) {
      intervalId = window.setInterval(() => {
        setPlayer(p => p ? { ...p, elapsedTime: (p.elapsedTime || 0) + 1 } : null);
      }, 1000);
    }
    return () => {
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [player, gamePhase, currentUser]);

  // --- Leaderboard ---
  const addLeaderboardEntry = useCallback((entry: LeaderboardEntry) => {
    setLeaderboardData(prev => {
      const updated = [...prev, entry].sort((a,b) => a.time - b.time).slice(0, LEADERBOARD_MAX_ENTRIES);
      saveData('rpg_leaderboard', updated);
      return updated;
    });
  }, []);

  // --- Shop Inventory ---
  const refreshShopInventory = useCallback(() => {
    if (!player) return;
    if (player.gold >= SHOP_REFRESH_COST) {
        setPlayer(p => p ? {...p, gold: p.gold - SHOP_REFRESH_COST } : null);

        let availableItems = [...BASE_SHOP_ITEMS];
        const shuffled = availableItems.sort(() => 0.5 - Math.random());
        setCurrentShopInventory(shuffled.slice(0, SHOP_REFRESH_MAX_ITEMS));
    } else {
        // Message handled in ShopScreen
    }
  }, [player]);

  useEffect(() => {
    let availableItems = [...BASE_SHOP_ITEMS];
    const shuffled = availableItems.sort(() => 0.5 - Math.random());
    setCurrentShopInventory(shuffled.slice(0, SHOP_REFRESH_MAX_ITEMS));
  }, []);


  // --- Animations ---
const addFloatingNumber = useCallback((text: string, type: FloatingNumber['type'], onPlayerSide: boolean, dynamicColor?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    let x: number, y: number;

    if (onPlayerSide) { // Player's side (left)
        x = 25;
        switch (type) {
            case 'heal': y = 38; break;
            case 'buff': y = 35; break;
            case 'debuff': y = 39; break;
            case 'resist': y = 37; break;
            case 'crit': x = 20; y = 32; break;
            case 'damage': y = 33; break;
            case 'evade': y = 36; break;
            case 'xp': y = 34; break;
            case 'gold': y = 37; break; // Can be same as XP or slightly offset
            case 'spell_indicator': y = 36; break;
            default: y = 35; // Default y for player side
        }
    } else { // Monster's side (right)
        x = 68;
        switch (type) {
            case 'damage': y = 33; break;
            case 'crit': x = 70; y = 32; break;
            case 'evade': y = 36; break;
            case 'resist': y = 37; break;
            case 'buff': y = 35; break;
            case 'debuff': y = 39; break;
            case 'spell_indicator': y = 36; break;
            default: y = 33; // Default y for monster side
        }
    }

    setFloatingNumbers(prev => [...prev, { id, text, type, x, y, timestamp: Date.now(), dynamicColor }]);
    setTimeout(() => {
      setFloatingNumbers(prev => prev.filter(fn => fn.id !== id));
    }, 1400);
}, []);


  const triggerMonsterShake = useCallback((isCritical: boolean = false) => {
    setLastAttackWasCrit(isCritical);
    setShakeMonster(true);
    setTimeout(() => setShakeMonster(false), isCritical ? 400 : 300);
  }, []);


  const addCombatLog = useCallback((message: string) => {
    setCombatLog(prev => [message, ...prev.slice(0, 29)]);
  }, []);

  const initializePlayer = useCallback((nameFromInput: string, playerClassType: PlayerClassType) => { // nameFromInput is the one from char creation screen
    if (!currentUser) {
        console.error("Cannot initialize player without a current user.");
        setGamePhase(GamePhase.AUTH);
        return;
    }
    const classData = PLAYER_CLASSES.find(pc => pc.type === playerClassType);
    if (!classData) return;

    const initialPlayerSpells = classData.initialSpells.map(id => SPELLS[id]).filter(Boolean) as Spell[];

    const newPlayer: Player = {
      name: currentUser, // Use the logged-in username as the core identifier
      playerClass: playerClassType,
      level: 1,
      xp: 0,
      xpToNextLevel: XP_PER_LEVEL_BASE,
      hp: classData.baseStats.hp,
      maxHp: classData.baseStats.hp,
      mp: classData.baseStats.mp,
      maxMp: classData.baseStats.mp,
      baseAttack: classData.baseStats.attack,
      baseDefense: classData.baseStats.defense,
      baseCritChance: classData.baseCritChance,
      gold: INITIAL_GOLD,
      inventory: [],
      equippedWeapon: ITEMS[classData.initialWeaponId] || null,
      equippedArmor: ITEMS[classData.initialArmorId] || null,
      equippedAccessories: Array(5).fill(null),
      spells: initialPlayerSpells,
      currentStageId: 1,
      maxStageReached: 1,
      elapsedTime: 0,
      activeBuffs: [],
    };
    setPlayer(newPlayer);
    if(currentUser) saveData(`rpg_user_${currentUser}_player_initial_backup`, newPlayer); // Save this as the first "good" state
    setGamePhase(GamePhase.VILLAGE);
    setLastVillageMessage(`Welcome, ${newPlayer.name} the ${playerClassType}! Your adventure begins in ${VILLAGE_NAME}.`);
  }, [currentUser]);

  const startStage = useCallback((stageId: number) => {
    if (!player) return;
    const stage = STAGES.find(s => s.id === stageId);
    if (!stage) {
      console.error(`Stage ${stageId} not found!`);
      setGamePhase(GamePhase.VILLAGE);
      return;
    }

    setIsLoading(true);
    setCurrentStage(stage);

    let monsterToEncounter: Monster | null = null;
    if (stage.boss) {
        monsterToEncounter = MONSTERS[stage.boss];
    } else if (stage.monsters.length > 0) {
        const randomMonsterId = stage.monsters[Math.floor(Math.random() * stage.monsters.length)];
        monsterToEncounter = MONSTERS[randomMonsterId];
    }

    if (monsterToEncounter) {
        setPotentialNextMonster({...MONSTERS[monsterToEncounter.id]});
    } else {
        setPotentialNextMonster(null);
    }

    setGamePhase(GamePhase.EXPLORING);
    setTimeout(() => setIsLoading(false), 300);
  }, [player]);

  const initiateCombat = useCallback((monster: Monster) => {
    if (!player) return;
    const monsterData = MONSTERS[monster.id];
    if (!monsterData) {
        console.error("Monster data not found for ID:", monster.id);
        setGamePhase(GamePhase.EXPLORING); // Or back to village
        return;
    }

    SoundManager.stopSong(); // Stop village/previous music
    if (STAGES.find(s => s.boss === monster.id)) {
        SoundManager.playSong('BATTLE_BOSS');
    } else {
        SoundManager.playSong('BATTLE_NORMAL');
    }

    setCurrentMonster({ ...monsterData, hp: monsterData.maxHp, activeBuffs: [] }); // Fresh monster state
    setCombatLog([`You encounter a fearsome ${monsterData.name}!`]);
    setIsPlayerTurn(true);
    setFloatingNumbers([]); // Clear previous floating numbers
    setGamePhase(GamePhase.COMBAT);
  }, [player]);


  // useEffect for handling stage transitions after player state is updated
  useEffect(() => {
    if (pendingStageTransitionId !== null && player) {
        startStage(pendingStageTransitionId);
        setPendingStageTransitionId(null); // Reset the trigger
    }
  }, [pendingStageTransitionId, player, startStage]);


  const handleUseItem = useCallback((item: Item, inCombat: boolean = false) => {
    if (!player) return;

    let localPlayer = {...player};
    let localMonster = currentMonster ? {...currentMonster} : null;
    let turnShouldEnd = false;
    let messageToDisplay = "";

    try {
        if (item.type === ItemType.POTION) {
            const result = applyPotion(localPlayer, item);
            localPlayer = result.player;
            messageToDisplay = result.message;
            SoundManager.playSoundEffect('POTION_USE');
            if (result.buffApplied) {
                addFloatingNumber(`${result.buffApplied.description}`, 'buff', true);
            } else if (item.name.toLowerCase().includes('health') && item.effectValue) {
                const healedAmount = Math.min(item.effectValue, getPlayerMaxHp(localPlayer) - (player.hp < 0 ? 0 : player.hp));
                addFloatingNumber(`+${healedAmount} HP`, 'heal', true);
            } else if (item.name.toLowerCase().includes('mana') && item.effectValue) {
                const restoredAmount = Math.min(item.effectValue, getPlayerMaxMp(localPlayer) - (player.mp < 0 ? 0 : player.mp));
                addFloatingNumber(`+${restoredAmount} MP`, 'buff', true);
            }
            if (inCombat) turnShouldEnd = true;
        } else if (item.type === ItemType.SPELL_BOOK) {
            const result = learnSpellFromBook(localPlayer, item);
            localPlayer = result.player;
            messageToDisplay = result.message;
        } else if (item.type === ItemType.OFFENSIVE_POTION && inCombat && localMonster) {
            SoundManager.playSoundEffect('POTION_USE'); // Or a specific offensive potion sfx
            if (!item.offensivePotionEffect) {
                messageToDisplay = `${item.name} fizzles with no effect.`;
            } else {
                const { damage, elementType } = item.offensivePotionEffect;
                const calcResult = calculateDamage(localPlayer, localMonster, damage, 0, elementType, 'offensive_potion_effect', true);
                setLastAttackWasCrit(false);

                if (calcResult.isEvaded) {
                    messageToDisplay = `${localMonster.name} evades ${item.name}!`;
                    addFloatingNumber('Evade!', 'evade', false); // Monster side
                } else {
                    localMonster.hp = Math.max(0, localMonster.hp - calcResult.damage);
                    messageToDisplay = `${localPlayer.name} uses ${item.name}, dealing ${calcResult.damage} ${elementType} damage to ${localMonster.name}.`;
                    if (calcResult.elementalEffect === 'weakness') messageToDisplay += " It's super effective!";
                    if (calcResult.elementalEffect === 'resistance') messageToDisplay += " It's not very effective.";
                    addFloatingNumber(`-${calcResult.damage}`, 'damage', false); // Monster side
                    triggerMonsterShake(false);
                }
                const itemIndex = localPlayer.inventory.findIndex(invItem => invItem.id === item.id);
                if (itemIndex > -1) {
                    localPlayer.inventory = [...localPlayer.inventory.slice(0, itemIndex), ...localPlayer.inventory.slice(itemIndex + 1)];
                }
            }
            turnShouldEnd = true;
        } else if (item.type === ItemType.SCROLL && item.id === 'scroll_of_town_portal') {
            if (currentMonster?.id === 'dragon_knight_aetharion' || currentMonster?.id === 'shadow_monarch') {
                messageToDisplay = "A powerful force prevents the scroll from working here!";
            } else {
                SoundManager.playSoundEffect('SPELL_CAST'); // Similar to a spell
                const itemIndex = localPlayer.inventory.findIndex(invItem => invItem.id === item.id);
                if (itemIndex > -1) {
                    localPlayer.inventory = [...localPlayer.inventory.slice(0, itemIndex), ...localPlayer.inventory.slice(itemIndex + 1)];
                }
                setPlayer(localPlayer);
                messageToDisplay = `Used ${item.name}. Teleporting to ${VILLAGE_NAME}...`;
                 if (inCombat) addCombatLog(messageToDisplay); else setLastVillageMessage(messageToDisplay);
                setTimeout(() => {
                    setGamePhase(GamePhase.VILLAGE);
                    setCurrentMonster(null);
                    setCurrentStage(null);
                }, 300);
                return;
            }
        } else {
             messageToDisplay = inCombat ? "Cannot use this item in combat." : "This item cannot be used right now.";
        }

        if (messageToDisplay) {
            if (inCombat) addCombatLog(messageToDisplay); else setLastVillageMessage(messageToDisplay);
        }

        setPlayer(localPlayer);
        if (localMonster) {
            setCurrentMonster(localMonster);
        }

        if (inCombat && turnShouldEnd) {
            if (localPlayer.hp > 0 && (!localMonster || localMonster.hp > 0)) {
                if (localMonster) {
                     setCurrentMonster(tickBuffs(localMonster, false) as Monster);
                }
                setIsPlayerTurn(false);
            }
        }

    } catch (error) {
        console.error("Error in handleUseItem:", error);
        addCombatLog("An error occurred while using the item.");
    }
  }, [player, currentMonster, addCombatLog, addFloatingNumber, triggerMonsterShake, setLastVillageMessage, gamePhase]);

  const handleEquipItem = useCallback((item: Item) => {
    if (!player) return;
    const { player: newPlayer, message } = equipItem(player, item);
    setPlayer(newPlayer);
    setLastVillageMessage(message);
    if (message.startsWith("Equipped")) { // Play sound only on successful equip
        SoundManager.playSoundEffect('ITEM_EQUIP');
    }
  }, [player, setLastVillageMessage]);

  const handleUnequipAccessory = useCallback((slotIndex: number) => {
    if (!player) return;
    const {player: newPlayer, message} = unequipAccessoryLogic(player, slotIndex);
    setPlayer(newPlayer);
    setLastVillageMessage(message);
    if (message.startsWith("Unequipped")) { // Play sound only on successful unequip
        SoundManager.playSoundEffect('ITEM_EQUIP'); // Using same sound for unequip for simplicity
    }
  }, [player, setLastVillageMessage]);

  const getAttackDisplayColor = (elementalType: ElementalType | undefined): string => {
    if (!elementalType) return '#E0E0E0'; // Default
    switch (elementalType) {
        case ElementalType.PHYSICAL: return '#FFA500';
        case ElementalType.FIRE: return '#ff4d4d';
        case ElementalType.ICE: return '#87CEEB';
        case ElementalType.LIGHTNING: return '#FFDD00';
        case ElementalType.HOLY: return '#FFFACD';
        case ElementalType.SHADOW: return '#9370DB';
        case ElementalType.EARTH: return '#CD853F';
        case ElementalType.ARCANE: return '#FF00FF';
        case ElementalType.POISON: return '#32CD32';
        case ElementalType.WATER: return '#6495ED';
        default: return '#E0E0E0';
    }
  };


  const playerAttack = useCallback(() => {
    if (!player || !currentMonster || !isPlayerTurn) return;

    try {
        SoundManager.playSoundEffect('PLAYER_ATTACK');
        const attackPower = getPlayerTotalAttack(player);
        const critChance = getPlayerTotalCritChance(player);
        const weaponElemType = player.equippedWeapon?.weaponElementalType || ElementalType.PHYSICAL;
        const attackName = player.equippedWeapon?.name || "Basic Attack";
        const attackNameColor = getAttackDisplayColor(weaponElemType);

        addFloatingNumber(attackName, 'spell_indicator', true, attackNameColor); // Player's attack name on player side


        const calcResult = calculateDamage(player, currentMonster, attackPower, critChance, weaponElemType, 'physical_basic', true);
        setLastAttackWasCrit(calcResult.isCrit);

        let logMsg = "";
        let monsterCurrentHp = currentMonster.hp;
        let damageNumberColor: string | undefined = undefined;


        if (calcResult.isEvaded) {
            logMsg = `${currentMonster.name} evades ${player.name}'s attack!`;
            addFloatingNumber('Evade!', 'evade', false); // Monster side
        } else {
            monsterCurrentHp = Math.max(0, currentMonster.hp - calcResult.damage);
            logMsg = `${player.name} attacks with ${attackName}. `;
            if (calcResult.isCrit) {
                logMsg += "CRITICAL HIT! ";
                addFloatingNumber('CRIT!', 'crit', false, '#FFA500'); // Monster side for crit text itself
                damageNumberColor = '#FFA500';
            }
            logMsg += `Deals ${calcResult.damage} ${weaponElemType} damage to ${currentMonster.name}.`;
            if (calcResult.elementalEffect === 'weakness') logMsg += " It's super effective!";
            if (calcResult.elementalEffect === 'resistance') logMsg += " It's not very effective.";

            addFloatingNumber(`-${calcResult.damage}`, 'damage', false, damageNumberColor); // Monster side
            triggerMonsterShake(calcResult.isCrit);
        }
        addCombatLog(logMsg);

        let updatedMonster = { ...currentMonster, hp: monsterCurrentHp };
        updatedMonster = tickBuffs(updatedMonster, false) as Monster;
        setCurrentMonster(updatedMonster);

        setPlayer(prevPlayer => prevPlayer ? tickBuffs(prevPlayer, true) as Player : null);

        if (player.hp > 0 && updatedMonster.hp > 0) {
            setIsPlayerTurn(false);
        }

    } catch (error) {
        console.error("Error in playerAttack:", error);
        addCombatLog("An error occurred during your attack.");
    }
  }, [player, currentMonster, isPlayerTurn, addCombatLog, addFloatingNumber, triggerMonsterShake]);

  const getSpellDisplayColor = (spell: Spell): string => {
    if (spell.damageType === 'healing') return '#4dff4d';
    if (spell.damageType === 'buff' && spell.targetSelf) return '#FFD700';
    if (spell.damageType === 'utility') return '#AFEEEE';

    switch (spell.elementalType) {
        case ElementalType.PHYSICAL: return '#FFA500';
        case ElementalType.FIRE: return '#ff4d4d';
        case ElementalType.ICE: return '#87CEEB';
        case ElementalType.LIGHTNING: return '#FFDD00';
        case ElementalType.HOLY: return '#FFFACD';
        case ElementalType.SHADOW: return '#9370DB';
        case ElementalType.EARTH: return '#CD853F';
        case ElementalType.ARCANE: return '#FF00FF';
        case ElementalType.POISON: return '#32CD32';
        case ElementalType.WATER: return '#6495ED';
        default: return '#E0E0E0';
    }
  };

  const playerCastSpell = useCallback((spell: Spell) => {
    if (!player || !currentMonster || !isPlayerTurn) return;

    try {
        SoundManager.playSoundEffect('SPELL_CAST');
        const spellNameDisplayColor = getSpellDisplayColor(spell);
        addFloatingNumber(spell.name, 'spell_indicator', true, spellNameDisplayColor); // Player's spell name on player side


        const result = castSpell(player, spell, currentMonster);
        setLastAttackWasCrit(!!result.isCrit);

        if (result.message.includes("Not enough MP")) {
            addCombatLog(result.message);
            setPlayer(result.player);
            return;
        }
        addCombatLog(result.message);

        let damageTextDynamicColor: string | undefined = undefined;
        if (result.isCrit) {
            damageTextDynamicColor = '#FFA500';
        } else if (spell.damageType === 'magical' && result.damageDealt !== undefined && result.damageDealt > 0 && getMonsterTotalSpellDefense(currentMonster) > 0) {
            damageTextDynamicColor = '#87CEEB';
        }

        if (result.damageDealt) {
            if (result.isCrit) addFloatingNumber('CRIT!', 'crit', false, '#FFA500'); // Crit text on monster side
            addFloatingNumber(`-${result.damageDealt}`, 'damage', false, damageTextDynamicColor); // Damage on monster side
            triggerMonsterShake(!!result.isCrit);
        }

        if (result.healingDone) addFloatingNumber(`+${result.healingDone}`, 'heal', true); // Heal on player side
        if (result.mpRestored) addFloatingNumber(`+${result.mpRestored} MP`, 'buff', true); // MP restore on player side

        if (result.buffAppliedToPlayer) addFloatingNumber(`${result.buffAppliedToPlayer.description}`, 'buff', true); // Buff on player side
        if (result.buffAppliedToMonster) addFloatingNumber(`${result.buffAppliedToMonster.description}`, 'debuff', false); // Debuff on monster side

        if (result.isEvaded) addFloatingNumber('Evade!', 'evade', false); // Evade on monster side (monster evaded player)

        if (result.resistedByManaShield && result.resistedByManaShield > 0) {
            addFloatingNumber(`-${result.resistedByManaShield} (Shield)`, 'resist', true); // Resist on player side
            addFloatingNumber(`-${result.resistedByManaShield} MP`, 'debuff', true); // MP loss on player side
        }

        let updatedPlayer = result.player;
        let updatedMonster = result.targetMonster;

        if (result.resistedByManaShield && result.resistedByManaShield > 0) {
            const manaShieldBuffIndex = updatedPlayer.activeBuffs.findIndex(b => b.type === 'mana_shield');
            if (manaShieldBuffIndex !== -1) {
                const actualMpCost = Math.min(updatedPlayer.mp, result.resistedByManaShield);
                updatedPlayer.mp = Math.max(0, updatedPlayer.mp - actualMpCost);
                updatedPlayer.activeBuffs[manaShieldBuffIndex].value = Math.max(0, updatedPlayer.activeBuffs[manaShieldBuffIndex].value - actualMpCost);
                if (updatedPlayer.activeBuffs[manaShieldBuffIndex].value === 0) {
                    addCombatLog(`${updatedPlayer.name}'s Mana Shield breaks!`);
                    updatedPlayer.activeBuffs = updatedPlayer.activeBuffs.filter((_,idx) => idx !== manaShieldBuffIndex);
                }
            }
        }

        if (spell.damageType === 'magical' || spell.damageType === 'physical' || spell.damageType === 'debuff' || spell.buffToApplyToTarget) {
            updatedMonster = tickBuffs(updatedMonster, false) as Monster;
        }
        updatedPlayer = tickBuffs(updatedPlayer, true) as Player;

        setPlayer(updatedPlayer);
        setCurrentMonster(updatedMonster);

        if (updatedPlayer.hp > 0 && updatedMonster.hp > 0) {
            setIsPlayerTurn(false);
        }

    } catch (error) {
        console.error("Error in playerCastSpell:", error);
        addCombatLog("An error occurred while casting the spell.");
    }
  }, [player, currentMonster, isPlayerTurn, addCombatLog, addFloatingNumber, triggerMonsterShake]);

  const playerFlee = useCallback(() => {
    if (!player || !currentMonster || !isPlayerTurn) return;
    setLastAttackWasCrit(false);
    if (currentMonster.id === 'dragon_knight_aetharion' || currentMonster.id === 'shadow_monarch') {
        addCombatLog("You cannot flee from this battle!");
        return;
    }

    const fleeChance = 0.75;
    if (Math.random() < fleeChance) {
      addCombatLog("You successfully fled from combat!");
      setGamePhase(GamePhase.EXPLORING);
      // Village music will be handled by gamePhase useEffect
      setCurrentMonster(null);
      setPlayer(prevPlayer => prevPlayer ? tickBuffs(prevPlayer, true) as Player : null);
    } else {
      addCombatLog("You failed to flee!");
      setPlayer(prevPlayer => prevPlayer ? tickBuffs(prevPlayer, true) as Player : null);
      setCurrentMonster(prevMonster => prevMonster ? tickBuffs(prevMonster, false) as Monster : null);
      if (player && currentMonster && player.hp > 0 && currentMonster.hp > 0) {
        setIsPlayerTurn(false);
      }
    }
  }, [player, currentMonster, isPlayerTurn, addCombatLog]);

  const monsterAttack = useCallback(() => {
    if (!player || !currentMonster || isPlayerTurn) return;
    setLastAttackWasCrit(false);

    try {
        setCurrentMonsterAbilityUsed(null);
        let m = { ...currentMonster };
        let p = { ...player };

        let abilityToUse: MonsterAbility | null = null;
        if (m.abilities && m.abilities.length > 0) {
            abilityToUse = m.abilities[Math.floor(Math.random() * m.abilities.length)];
        }
        setCurrentMonsterAbilityUsed(abilityToUse);

        let playerTookDamage = false;
        let playerCurrentHp = p.hp;
        let playerCurrentMp = p.mp;
        let playerActiveBuffs = [...p.activeBuffs];
        let monsterActiveBuffs = [...m.activeBuffs];


        if (abilityToUse) {
            addCombatLog(`${m.name} uses ${abilityToUse.name}! (${abilityToUse.description})`);
            addFloatingNumber(abilityToUse.name, 'spell_indicator', false, '#FFCCCB'); // Monster ability name on monster side

            if (abilityToUse.type === 'attack' || abilityToUse.type === 'special') {
                const attackPower = abilityToUse.power || m.attack;
                const elementalType = abilityToUse.elementalType || ElementalType.PHYSICAL;
                const calcResult = calculateDamage(m, p, attackPower, 0, elementalType, 'monster_ability', false);

                if (calcResult.isEvaded) {
                    addCombatLog(`${p.name} evades ${m.name}'s ${abilityToUse.name}!`);
                    addFloatingNumber('Evade!', 'evade', true); // Player evades, on player side
                } else {
                    let logMsg = "";
                    if (calcResult.resistedByManaShield && calcResult.resistedByManaShield > 0) {
                        const manaShieldBuffIndex = playerActiveBuffs.findIndex(b => b.type === 'mana_shield');
                        if (manaShieldBuffIndex !== -1) {
                            const manaShieldBuff = {...playerActiveBuffs[manaShieldBuffIndex]};
                            const actualMpCost = Math.min(playerCurrentMp, calcResult.resistedByManaShield);
                            const actualShieldDamage = actualMpCost;

                            playerCurrentMp = Math.max(0, playerCurrentMp - actualMpCost);
                            manaShieldBuff.value = Math.max(0, manaShieldBuff.value - actualShieldDamage);

                            if (manaShieldBuff.value === 0) {
                                addCombatLog(`${p.name}'s Mana Shield breaks!`);
                                playerActiveBuffs = playerActiveBuffs.filter((_,idx) => idx !== manaShieldBuffIndex);
                            } else {
                                playerActiveBuffs[manaShieldBuffIndex] = manaShieldBuff;
                            }
                            addFloatingNumber(`-${actualShieldDamage} (Shield)`, 'resist', true); // Player side
                            addFloatingNumber(`-${actualMpCost} MP`, 'debuff', true); // Player side
                        }
                    }
                    playerCurrentHp = Math.max(0, playerCurrentHp - calcResult.damage);
                    if (calcResult.damage > 0) playerTookDamage = true;


                    if (calcResult.damage > 0 || (calcResult.resistedByManaShield && calcResult.resistedByManaShield > 0 && calcResult.damage === 0)) {
                       logMsg += `${m.name}'s ${abilityToUse.name} hits ${p.name}`;
                       if (calcResult.damage > 0) logMsg += ` for ${calcResult.damage} ${elementalType} damage`;
                       if (calcResult.resistedByManaShield && calcResult.resistedByManaShield > 0) logMsg += ` (absorbed ${calcResult.resistedByManaShield} by Mana Shield)`;
                       logMsg += `.`;
                    } else if (!calcResult.isEvaded) {
                       logMsg += `${m.name}'s ${abilityToUse.name} has no effect on ${p.name}.`;
                    }

                    if (calcResult.elementalEffect === 'weakness') logMsg += " It's super effective!";
                    if (calcResult.elementalEffect === 'resistance') logMsg += " It's not very effective.";
                    if (logMsg.trim()) addCombatLog(logMsg.trim());
                    if (calcResult.damage > 0) addFloatingNumber(`-${calcResult.damage}`, 'damage', true); // Player takes damage, on player side
                }
            } else if (abilityToUse.type === 'debuff' && abilityToUse.buffToApply) {
                const buff = {...abilityToUse.buffToApply, isDebuff: true};
                playerActiveBuffs = playerActiveBuffs.filter(b => b.type !== buff.type);
                playerActiveBuffs.push(buff);
                addFloatingNumber(`${buff.description}`, 'debuff', true); // Debuff on player, on player side

                if (abilityToUse.name === "Blizzard Howl") {
                    const critDebuff: Buff = {type: 'crit_chance_reduction', value: 0.15, duration: buff.duration, description: 'Crit chance reduced!', isDebuff: true};
                    playerActiveBuffs = playerActiveBuffs.filter(b => b.type !== critDebuff.type);
                    playerActiveBuffs.push(critDebuff);
                    addFloatingNumber('Crit Reduced!', 'debuff', true); // Player side
                }
            } else if (abilityToUse.type === 'buff' && abilityToUse.buffToApply && abilityToUse.targetSelf) {
                const buff = {...abilityToUse.buffToApply, isDebuff: false};
                monsterActiveBuffs = monsterActiveBuffs.filter(b => b.type !== buff.type);
                monsterActiveBuffs.push(buff);
                // Buff on monster, on monster side. Ability name already floated.
                addFloatingNumber(buff.description, 'buff', false);
            }
        } else {
            const calcResult = calculateDamage(m, p, m.attack, 0, ElementalType.PHYSICAL, 'monster_ability', false);
            if (calcResult.isEvaded) {
                addCombatLog(`${p.name} evades ${m.name}'s attack!`);
                addFloatingNumber('Evade!', 'evade', true); // Player side
            } else {
                 if (calcResult.resistedByManaShield && calcResult.resistedByManaShield > 0) {
                     const manaShieldBuffIndex = playerActiveBuffs.findIndex(b => b.type === 'mana_shield');
                        if (manaShieldBuffIndex !== -1) {
                            const manaShieldBuff = {...playerActiveBuffs[manaShieldBuffIndex]};
                            const actualMpCost = Math.min(playerCurrentMp, calcResult.resistedByManaShield);
                            const actualShieldDamage = actualMpCost;
                            playerCurrentMp = Math.max(0, playerCurrentMp - actualMpCost);
                            manaShieldBuff.value = Math.max(0, manaShieldBuff.value - actualShieldDamage);
                            if (manaShieldBuff.value === 0) {
                                addCombatLog(`${p.name}'s Mana Shield breaks!`);
                                playerActiveBuffs = playerActiveBuffs.filter((_,idx) => idx !== manaShieldBuffIndex);
                            } else {
                                playerActiveBuffs[manaShieldBuffIndex] = manaShieldBuff;
                            }
                            addFloatingNumber(`-${actualShieldDamage} (Shield)`, 'resist', true); // Player side
                             addFloatingNumber(`-${actualMpCost} MP`, 'debuff', true); // Player side
                        }
                }
                playerCurrentHp = Math.max(0, playerCurrentHp - calcResult.damage);
                if (calcResult.damage > 0) playerTookDamage = true;

                let logMsg = `${m.name} attacks. `;
                if (calcResult.damage > 0 || (calcResult.resistedByManaShield && calcResult.resistedByManaShield > 0 && calcResult.damage === 0)) {
                    logMsg += `Hits ${p.name}`;
                    if (calcResult.damage > 0) logMsg += ` for ${calcResult.damage} physical damage`;
                    if (calcResult.resistedByManaShield && calcResult.resistedByManaShield > 0) logMsg += ` (absorbed ${calcResult.resistedByManaShield} by Mana Shield)`;
                    logMsg += `.`;
                } else if (!calcResult.isEvaded) {
                     logMsg += `${m.name}'s attack has no effect on ${p.name}.`;
                }
                addCombatLog(logMsg);
                if (calcResult.damage > 0) addFloatingNumber(`-${calcResult.damage}`, 'damage', true); // Player side
            }
        }

        if (playerTookDamage) {
            SoundManager.playSoundEffect('PLAYER_HURT');
        }

        let finalPlayerState = { ...p, hp: playerCurrentHp, mp: playerCurrentMp, activeBuffs: playerActiveBuffs };
        finalPlayerState = tickBuffs(finalPlayerState, true) as Player;
        setPlayer(finalPlayerState);

        let finalMonsterState = { ...m, activeBuffs: monsterActiveBuffs };
        finalMonsterState = tickBuffs(finalMonsterState, false) as Monster;
        setCurrentMonster(finalMonsterState);

        if (finalPlayerState.hp > 0 && finalMonsterState.hp > 0) {
            setIsPlayerTurn(true);
        }

    } catch (error) {
        console.error("Error in monsterAttack:", error);
        addCombatLog("An error occurred during the monster's turn.");
    }
  }, [player, currentMonster, isPlayerTurn, addCombatLog, addFloatingNumber]);

  // Combat Outcome Check (Victory/Defeat)
  useEffect(() => {
    if (!currentMonster || gamePhase !== GamePhase.COMBAT) return;

    let outcomeProcessed = false;

    if (currentMonster.hp <= 0 && !outcomeProcessed) {
        outcomeProcessed = true;
        SoundManager.stopSong();
        addCombatLog(`${currentMonster.name} has been defeated!`);
        let xpGained = currentMonster.xpYield;
        let goldGained = Math.floor(Math.random() * (currentMonster.goldDrop.max - currentMonster.goldDrop.min + 1)) + currentMonster.goldDrop.min;
        let itemsFound: Item[] = [];
        currentMonster.drops.forEach(drop => {
            if (Math.random() < drop.chance) {
                const itemProto = ITEMS[drop.itemId];
                if (itemProto) {
                    if (itemProto.type === ItemType.GOLD_DROP_ONLY && drop.customValue) {
                        goldGained += Math.floor(Math.random() * (drop.customValue.max - drop.customValue.min + 1)) + drop.customValue.min;
                    } else if (itemProto.type !== ItemType.GOLD_DROP_ONLY) {
                        itemsFound.push({...itemProto});
                    }
                }
            }
        });
        if (!STAGES.find(s => s.boss === currentMonster!.id) && GENERAL_LOOT_POOL_IDS.length > 0) {
            if (Math.random() < 0.08) {
                const randomItemId = GENERAL_LOOT_POOL_IDS[Math.floor(Math.random() * GENERAL_LOOT_POOL_IDS.length)];
                const itemProto = ITEMS[randomItemId];
                if (itemProto && !itemsFound.some(fi => fi.id === itemProto.id)) {
                    itemsFound.push({...itemProto});
                    addCombatLog(`Bonus Find: ${itemProto.name}!`);
                }
            }
        }

        setPlayer(prevPlayer => {
            if (!prevPlayer) return null;

            let updatedPlayer = {...prevPlayer, gold: prevPlayer.gold + goldGained, xp: prevPlayer.xp + xpGained, inventory: [...prevPlayer.inventory, ...itemsFound]};
            const levelUpResult = checkLevelUp(updatedPlayer);
            updatedPlayer = levelUpResult.player;
            if (levelUpResult.leveledUp) {
                SoundManager.playSoundEffect('LEVEL_UP');
                addFloatingNumber('Level Up!', 'xp', true, '#AFEEEE'); // Player side
            }
            addFloatingNumber(`+${xpGained} XP`, 'xp', true, '#AFEEEE'); // Player side
            addFloatingNumber(`+${goldGained} G`, 'gold', true, '#FFDF00'); // Player side


            const defeatedMonsterIsBoss = STAGES.some(s => s.boss === currentMonster!.id);
            const stageOfDefeatedMonster = currentStage?.id || 0;
            const playerMaxStageReachedBeforeThisVictory = prevPlayer.maxStageReached;

            let newMaxStageReached = prevPlayer.maxStageReached;
            if (stageOfDefeatedMonster === playerMaxStageReachedBeforeThisVictory) {
                const completedStageIndexInArray = STAGES.findIndex(s => s.id === stageOfDefeatedMonster);
                if (completedStageIndexInArray !== -1 && completedStageIndexInArray < STAGES.length - 1) {
                    const nextStageObject = STAGES[completedStageIndexInArray + 1];
                    newMaxStageReached = nextStageObject.id;
                }
            }
            updatedPlayer.maxStageReached = newMaxStageReached;
            updatedPlayer.currentStageId = stageOfDefeatedMonster;

            const outcomeDetails: CombatOutcomeDetails = {
                defeatedMonsterName: currentMonster!.name, xpGained, goldGained, itemsFound,
                leveledUp: levelUpResult.leveledUp, levelUpMessage: levelUpResult.message,
                isBossDefeat: defeatedMonsterIsBoss,
                isFinalBossDefeat: currentMonster!.id === 'dragon_knight_aetharion',
                isSecretBossDefeat: currentMonster!.id === 'shadow_monarch',
                defeatedStageId: stageOfDefeatedMonster,
                playerMaxStageReachedBeforeThisVictory: playerMaxStageReachedBeforeThisVictory,
            };
            setCombatOutcome(outcomeDetails);
            setGamePhase(GamePhase.COMBAT_VICTORY);
            return updatedPlayer;
        });
        return;
    }

    if (player && player.hp <= 0 && !outcomeProcessed) {
        outcomeProcessed = true;
        SoundManager.stopSong();
        SoundManager.playSoundEffect('PLAYER_HURT');
        addCombatLog(`${player.name} has been defeated...`);
        setGamePhase(GamePhase.GAME_OVER);
        return;
    }

  }, [currentMonster?.hp, gamePhase, addCombatLog, currentMonster, currentStage, player, addFloatingNumber]);


  // Monster Turn Trigger
  useEffect(() => {
    if (gamePhase === GamePhase.COMBAT && !isPlayerTurn && player && player.hp > 0 && currentMonster && currentMonster.hp > 0) {
      const timeoutId = setTimeout(() => {
          monsterAttack();
      }, 300); // Monster attack delay set to 300ms
      return () => clearTimeout(timeoutId);
    }
  }, [isPlayerTurn, gamePhase, player, currentMonster, monsterAttack]);


  const handleCombatVictoryContinue = useCallback((outcome: CombatOutcomeDetails) => {
    if (!player) return;
    setCombatOutcome(null);
    // SoundManager.stopSong(); // Music handled by gamePhase useEffect


    if (outcome.isSecretBossDefeat) {
        setGamePhase(GamePhase.VICTORY);
        setLastVillageMessage(`The Shadow Monarch has been vanquished! You have truly saved the realms, ${player.name}!`);
         addLeaderboardEntry({
            username: player.name,
            time: player.elapsedTime,
            playerClass: player.playerClass,
            level: player.level,
            date: new Date().toISOString()
        });
        return;
    }

    if (outcome.isFinalBossDefeat) {
        if (!player.inventory.some(item => item.id === 'shadow_monarch_crest')) {
            setGamePhase(GamePhase.SECRET_BOSS_INTRO);
            return;
        } else {
            setGamePhase(GamePhase.VICTORY);
            setLastVillageMessage(`Aetharion falls again! Your legend is eternal, ${player.name}!`);
            addLeaderboardEntry({
                username: player.name,
                time: player.elapsedTime,
                playerClass: player.playerClass,
                level: player.level,
                date: new Date().toISOString()
            });
            return;
        }
    }

    let stageIdToTransitionTo: number;
    const newStageUnlocked = player.maxStageReached > outcome.playerMaxStageReachedBeforeThisVictory;

    if (newStageUnlocked) {
        stageIdToTransitionTo = player.maxStageReached;
    } else {
        stageIdToTransitionTo = outcome.defeatedStageId;
    }

    setPlayer(p => p ? {...p, currentStageId: stageIdToTransitionTo } : null);
    setPendingStageTransitionId(stageIdToTransitionTo);

}, [player, addLeaderboardEntry]);


const handleProceedToNextStageFromVictory = useCallback(() => {
    if (!player || !combatOutcome) {
        console.error("Player or combatOutcome is null in handleProceedToNextStageFromVictory.");
        setGamePhase(GamePhase.VILLAGE);
        if (combatOutcome) setCombatOutcome(null);
        return;
    }
    // SoundManager.stopSong(); // Music handled by gamePhase useEffect

    const defeatedStageActualId = combatOutcome.defeatedStageId;
    const defeatedStageIndex = STAGES.findIndex(s => s.id === defeatedStageActualId);
    let nextStageIdToEnter: number | null = null;

    if (defeatedStageIndex !== -1 && defeatedStageIndex < STAGES.length - 1) {
        nextStageIdToEnter = STAGES[defeatedStageIndex + 1].id;
    } else {
        console.warn("Could not determine next stage or already at last stage.");
        setGamePhase(GamePhase.VILLAGE);
        if (combatOutcome) setLastVillageMessage(`You return to ${VILLAGE_NAME}, having conquered stage ${defeatedStageActualId}.`);
        setCombatOutcome(null);
        return;
    }

    setPlayer(p => p ? {...p, currentStageId: nextStageIdToEnter } : null);
    setPendingStageTransitionId(nextStageIdToEnter);
    setCombatOutcome(null);
}, [player, combatOutcome]);


  const gameOver = useCallback(() => {
    if (!player || !currentUser) return;
    SoundManager.stopSong();
    setModal({
        title: "Game Over",
        message: `${player.name}, your journey has ended here. The realms mourn your fall. Would you like to try again?`,
        actions: [
            { label: "Restart from Village", onClick: () => {
                const initialPlayerState = loadData<Player>(`rpg_user_${currentUser}_player_initial_backup`);
                 if(initialPlayerState){
                    const freshPlayer = {...initialPlayerState,
                        hp: getPlayerMaxHp(initialPlayerState),
                        mp: getPlayerMaxMp(initialPlayerState),
                        activeBuffs: [],
                        elapsedTime: player.elapsedTime
                    };
                    setPlayer(freshPlayer);
                 } else {
                    handleLogout();
                    return;
                 }
                setGamePhase(GamePhase.VILLAGE);
                setLastVillageMessage("You awaken in the village, shaken but alive.");
                setModal(null);
            }},
            { label: "Logout", onClick: () => {
                handleLogout();
                setModal(null);
            }}
        ]
    });
  }, [player, currentUser, handleLogout]);

  const gameVictory = useCallback(() => {
     if (!player || !currentUser) return;
     SoundManager.stopSong();
    setModal({
        title: "Congratulations!",
        message: `Victory! ${player.name}, you have defeated the ultimate evil and saved ${GAME_TITLE}! Your legend will be sung for ages. Your final time: ${formatTime(player.elapsedTime)}.`,
        actions: [
            { label: "View Leaderboard", onClick: () => {
                setGamePhase(GamePhase.LEADERBOARD);
                setModal(null);
            }},
            { label: "Logout", onClick: () => {
                handleLogout();
                setModal(null);
            }}
        ]
    });
    addLeaderboardEntry({
        username: currentUser,
        time: player.elapsedTime,
        playerClass: player.playerClass,
        level: player.level,
        date: new Date().toISOString()
    });
  }, [player, currentUser, handleLogout, addLeaderboardEntry]);

  const handleRestInVillage = () => {
    if (!player) return;

    const currentMaxHp = getPlayerMaxHp(player);
    const currentMaxMp = getPlayerMaxMp(player);

    const hpToRestore = Math.floor(currentMaxHp * 0.25);
    const mpToRestore = Math.floor(currentMaxMp * 0.25);

    const newPlayer = {
        ...player,
        hp: Math.min(currentMaxHp, player.hp + hpToRestore),
        mp: Math.min(currentMaxMp, player.mp + mpToRestore),
        activeBuffs: [],
        elapsedTime: player.elapsedTime + REST_TIME_PENALTY_SECONDS
    };
    setPlayer(newPlayer);
    setLastVillageMessage(`You feel somewhat refreshed. (Restored up to 25% HP/MP. Time increased by ${REST_TIME_PENALTY_SECONDS / 60}m)`);
  };

  useEffect(() => {
    if (gamePhase === GamePhase.GAME_OVER && player && !modal) {
      gameOver();
    }
    if (gamePhase === GamePhase.VICTORY && player && !modal) {
      gameVictory();
    }
    if (gamePhase === GamePhase.LOGIN_CHOICE && pendingLoginPlayer && !modal) {
        setModal({
            title: `Welcome Back, ${pendingLoginPlayer.name}!`,
            message: "Would you like to continue your previous adventure or start anew?",
            actions: [
                { label: "Continue Adventure", onClick: handleContinueAdventure, variant: 'primary' },
                { label: "Restart Game", onClick: handleRestartGame, variant: 'danger' }
            ]
        });
    }
  }, [gamePhase, player, modal, currentUser, gameOver, gameVictory, pendingLoginPlayer, handleContinueAdventure, handleRestartGame]);

  const handleStageSelection = (selectedStageId: number) => {
    if (!player) return;
    setPlayer(p => p ? {...p, currentStageId: selectedStageId } : null);
    setPendingStageTransitionId(selectedStageId);
  };

  const renderContent = () => {
    if (isLoading) { // Removed: && gamePhase !== GamePhase.IMAGE_GENERATION_TOOL
      return <div className="flex justify-center items-center h-full"><TypewriterText text="Loading..." className="text-xl text-yellow-400"/></div>;
    }

    switch (gamePhase) {
      case GamePhase.AUTH:
        return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} errorMessage={authErrorMessage} />;
      case GamePhase.LOGIN_CHOICE:
        return <div className="flex justify-center items-center h-full"><TypewriterText text="Loading options..." className="text-xl text-yellow-400"/></div>;
      case GamePhase.CHARACTER_CREATION:
        return <CharacterCreationScreen onCharacterCreate={initializePlayer} />;
      case GamePhase.VILLAGE:
        if (!player) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} errorMessage={authErrorMessage} />;
        return <VillageScreen
                    player={player}
                    onVisitShop={() => { setLastVillageMessage(null); setGamePhase(GamePhase.SHOP);}}
                    onVisitMage={() => {
                        setLastVillageMessage(MAGE_MESSAGES[Math.floor(Math.random() * MAGE_MESSAGES.length)]);
                    }}
                    onEmbarkAdventure={() => {
                        if (player.maxStageReached >= STAGES[STAGES.length -1 ].id && player.currentStageId === STAGES[STAGES.length -1].id && player.inventory.some(i => i.id === 'shadow_monarch_crest')) {
                             setLastVillageMessage("You've conquered all known lands! Perhaps rest or seek new challenges elsewhere?");
                             return;
                        }
                        // SoundManager.stopSong(); // Music handled by gamePhase useEffect
                        setGamePhase(GamePhase.STAGE_SELECT);
                        setLastVillageMessage(null);
                    }}
                    onRest={handleRestInVillage}
                    onViewLeaderboard={() => setGamePhase(GamePhase.LEADERBOARD)}
                    onLogout={handleLogout}
                    lastMessage={lastVillageMessage}
                />;
      case GamePhase.SHOP:
        if (!player) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} errorMessage={authErrorMessage} />;
        return <ShopScreen
                  player={player}
                  shopInventory={currentShopInventory}
                  onBuyItem={(item) => {
                    const itemDetails = ITEMS[item.id];
                    if(player.gold >= itemDetails.price) {
                        setPlayer(p => p ? ({...p!, gold: p!.gold - itemDetails.price, inventory: [...p!.inventory, itemDetails]}) : null);
                    }
                  }}
                  onSellItem={(item, sellPrice) => {
                    setPlayer(p => {
                        if(!p) return null;
                        const itemIndex = p.inventory.findIndex(invItem => invItem.id === item.id);
                        if (itemIndex > -1) {
                            const newInventory = [...p.inventory];
                            newInventory.splice(itemIndex, 1);
                            return {...p, gold: p.gold + sellPrice, inventory: newInventory};
                        }
                        return p;
                    });
                  }}
                  onExitShop={() => setGamePhase(GamePhase.VILLAGE)}
                  onRefreshShop={refreshShopInventory}
                />;
      case GamePhase.STAGE_SELECT:
        if (!player) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} errorMessage={authErrorMessage} />;
        const secretBossStageEntry = STAGES[STAGES.length - 1];
        return (
          <div className="p-4 text-center">
            <h2 className="text-2xl text-yellow-400 mb-4 text-shadow-pixel">Select Your Destination</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[70vh] overflow-y-auto pr-2">
              {STAGES.filter(stage =>
                  stage.id <= player.maxStageReached &&
                  (stage.id !== secretBossStageEntry.id || player.inventory.some(i => i.id === 'shadow_monarch_crest'))
              ).map(stage => (
                <Button
                  key={stage.id}
                  onClick={() => handleStageSelection(stage.id) }
                  className="p-3 h-24 flex flex-col justify-center items-center text-center"
                  variant={player.currentStageId === stage.id ? 'primary' : 'secondary'}
                >
                  <span className="block text-sm font-semibold">{stage.name}</span>
                  <span className="block text-xs text-gray-400">(Stage {stage.id})</span>
                </Button>
              ))}
            </div>
             <Button onClick={() => setGamePhase(GamePhase.VILLAGE)} className="mt-6">Back to Village</Button>
          </div>
        );
      case GamePhase.EXPLORING:
        if (!player || !currentStage) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} errorMessage={authErrorMessage} />;
        return <StageScreen
                  stage={currentStage}
                  onEncounterMonster={initiateCombat}
                  onReturnToVillage={() => {
                    setCurrentStage(null);
                    setPotentialNextMonster(null);
                    setGamePhase(GamePhase.VILLAGE);
                    setLastVillageMessage("You return to the safety of the village.");
                  }}
                  isLoading={isLoading}
                  potentialMonster={potentialNextMonster}
                />;
      case GamePhase.COMBAT:
        if (!player || !currentMonster) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} errorMessage={authErrorMessage} />;
        return <CombatScreen
                  player={player}
                  monster={currentMonster}
                  onPlayerAttack={playerAttack}
                  onPlayerCastSpell={playerCastSpell}
                  onPlayerUseItem={(item) => handleUseItem(item, true)}
                  onPlayerFlee={playerFlee}
                  combatLog={combatLog}
                  isPlayerTurn={isPlayerTurn}
                  floatingNumbers={floatingNumbers}
                  shakeMonster={shakeMonster}
                  lastAttackWasCrit={lastAttackWasCrit}
                />;
      case GamePhase.COMBAT_VICTORY:
        if (!player) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} errorMessage={authErrorMessage} />;
        if (!combatOutcome) {
            return <div className="flex justify-center items-center h-full"><TypewriterText text="Processing victory..." className="text-xl text-yellow-400"/></div>;
        }
        return <CombatVictoryScreen
                    player={player}
                    outcome={combatOutcome}
                    onContinue={handleCombatVictoryContinue}
                    onReturnToVillage={() => {
                        setGamePhase(GamePhase.VILLAGE);
                        if(combatOutcome) setLastVillageMessage(`You return to ${VILLAGE_NAME}, victorious over ${combatOutcome.defeatedMonsterName}.`);
                        setCombatOutcome(null);
                    }}
                    onProceedToNextStage={handleProceedToNextStageFromVictory}
                />;
      case GamePhase.SECRET_BOSS_INTRO:
        if (!player) return <AuthScreen onLogin={handleLogin} onRegister={handleRegister} errorMessage={authErrorMessage} />;
        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <TypewriterText text={`As Aetharion falls, a tear in reality appears. A chilling voice echoes, "You have meddled with powers beyond your comprehension. Now, face true despair!"`} className="text-xl text-purple-300 mb-6" speed={40} />
                <PixelArtImage src="images/stages/26_shadow_realm.png" alt="Shadow Realm Portal" className="w-64 h-auto mb-6 pixel-border border-purple-500" />
                <Button onClick={() => {
                    const secretBoss = MONSTERS['shadow_monarch'];
                    const secretStage = STAGES.find(s => s.boss === 'shadow_monarch');
                    if (secretBoss && secretStage) {
                        setPlayer(p => p ? {...p, currentStageId: secretStage.id, maxStageReached: Math.max(p.maxStageReached, secretStage.id) } : null);
                        setCurrentStage(secretStage);
                        initiateCombat({...secretBoss});
                    } else {
                        console.error("Secret boss or stage not found!");
                        setGamePhase(GamePhase.VILLAGE);
                    }
                }} className="text-lg">Enter the Shadow Realm</Button>
            </div>
        );
      case GamePhase.VICTORY:
        return <div className="p-8 text-center"><h1 className="text-3xl text-green-400">YOU ARE VICTORIOUS!</h1> <p className="my-4">{lastVillageMessage || `You have saved ${GAME_TITLE}!`}</p> <Button onClick={handleLogout}>Logout</Button></div>;
      case GamePhase.GAME_OVER:
        return <div className="p-8 text-center"><h1 className="text-3xl text-red-500">GAME OVER</h1> <p className="my-4">{lastVillageMessage || "Your journey ends here."}</p> <Button onClick={handleLogout}>Logout</Button></div>;
      // case GamePhase.IMAGE_GENERATION_TOOL: // Removed
        // return <ImageGenerationTool onExit={() => setGamePhase(currentUser && player ? GamePhase.VILLAGE : GamePhase.AUTH)} />;
      case GamePhase.LEADERBOARD:
        return <LeaderboardScreen leaderboardData={leaderboardData} onClose={() => setGamePhase(GamePhase.VILLAGE)} />;
      default:
        return <div>Unknown game phase.</div>;
    }
  };

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    let timeString = "";
    if (hours > 0) timeString += `${hours}h `;
    timeString += `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    return timeString.trim();
  };

  return (
    <GameUI
        player={player}
        gamePhase={gamePhase}
        onUseItem={(item) => handleUseItem(item, false)}
        onEquipItem={handleEquipItem}
        onUnequipAccessory={handleUnequipAccessory}
    >
      {modal && (
        <Modal
            title={modal.title}
            isOpen={true}
            actions={modal.actions}
            onClose={modal.actions && modal.actions.length > 0 ? undefined : () => setModal(null)}
        >
          <p>{modal.message}</p>
        </Modal>
      )}
      {renderContent()}
    </GameUI>
  );
};

export default App;