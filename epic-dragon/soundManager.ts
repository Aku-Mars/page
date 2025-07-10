// soundManager.ts

// Define keys for your sound files.
// The actual files (e.g., village_theme.mp3) should be placed in:
// public/sounds/songs/
// public/sounds/sfx/

export const SONG_FILES = {
  VILLAGE: 'village_theme.mp3',
  BATTLE_NORMAL: 'battle_normal.mp3',
  BATTLE_BOSS: 'battle_boss.mp3',
  // Add more song keys here: e.g., MENU: 'menu_theme.mp3',
} as const; // Use "as const" for stricter type checking on keys

export const SFX_FILES = {
  PLAYER_ATTACK: 'player_attack.wav',
  SPELL_CAST: 'spell_cast.wav',
  POTION_USE: 'potion_use.wav',
  PLAYER_HURT: 'player_hurt.wav',
  LEVEL_UP: 'level_up.wav',
  BUTTON_CLICK: 'button_click.wav', // Example, if you want UI sounds
  ITEM_EQUIP: 'item_equip.wav',    // Example
  // Add more SFX keys here
} as const;

type SongKey = keyof typeof SONG_FILES;
type SfxKey = keyof typeof SFX_FILES;

let currentSongAudio: HTMLAudioElement | null = null;
let currentSongKeyPlaying: SongKey | null = null;
let musicVolume = 0.5; // Default music volume (0.0 to 1.0)
let sfxVolume = 0.7;   // Default SFX volume (0.0 to 1.0)

/**
 * Plays a song. Stops any currently playing song first.
 * @param songKey The key of the song to play (from SONG_FILES).
 * @param loop Whether the song should loop. Defaults to true.
 */
export const playSong = (songKey: SongKey, loop: boolean = true): void => {
  if (currentSongKeyPlaying === songKey && currentSongAudio && !currentSongAudio.paused) {
    // console.log(`Song ${songKey} is already playing.`);
    return;
  }

  stopSong(); // Stop any previous song

  const fileName = SONG_FILES[songKey];
  if (!fileName) {
    console.warn(`Song key "${songKey}" not found in SONG_FILES.`);
    return;
  }

  const audio = new Audio(`sounds/songs/${fileName}`);
  audio.volume = musicVolume;
  audio.loop = loop;

  audio.play()
    .then(() => {
      currentSongAudio = audio;
      currentSongKeyPlaying = songKey;
      console.log(`Playing song: ${fileName}`);
    })
    .catch(error => {
      console.error(`Error playing song ${fileName}:`, error);
      // Browsers might block autoplay if user hasn't interacted with the page.
      // You might need to gate initial music play behind a user action.
    });
};

/**
 * Stops the currently playing song.
 */
export const stopSong = (): void => {
  if (currentSongAudio) {
    currentSongAudio.pause();
    currentSongAudio.currentTime = 0; // Reset playback to the start
    console.log(`Stopped song: ${currentSongAudio.src}`);
    currentSongAudio = null;
    currentSongKeyPlaying = null;
  }
};

/**
 * Plays a sound effect.
 * @param sfxKey The key of the sound effect to play (from SFX_FILES).
 * @param customVolume Optional. Volume for this specific SFX instance (0.0 to 1.0).
 */
export const playSoundEffect = (sfxKey: SfxKey, customVolume?: number): void => {
  const fileName = SFX_FILES[sfxKey];
  if (!fileName) {
    console.warn(`SFX key "${sfxKey}" not found in SFX_FILES.`);
    return;
  }

  const audio = new Audio(`sounds/sfx/${fileName}`);
  audio.volume = customVolume !== undefined ? Math.max(0, Math.min(1, customVolume)) : sfxVolume;
  
  audio.play()
    .then(() => {
      // console.log(`Playing SFX: ${fileName} at volume ${audio.volume}`); // More detailed log
    })
    .catch(error => console.error(`Error playing SFX ${fileName}:`, error));
};

/**
 * Sets the music volume.
 * @param volume Volume level from 0.0 (muted) to 1.0 (full).
 */
export const setMusicVolume = (volume: number): void => {
  musicVolume = Math.max(0, Math.min(1, volume));
  if (currentSongAudio) {
    currentSongAudio.volume = musicVolume;
  }
  console.log(`Music volume set to: ${musicVolume}`);
};

/**
 * Sets the SFX volume.
 * @param volume Volume level from 0.0 (muted) to 1.0 (full).
 */
export const setSfxVolume = (volume: number): void => {
  sfxVolume = Math.max(0, Math.min(1, volume));
  console.log(`SFX volume set to: ${sfxVolume}`);
};

// Example: Get current volumes if needed
export const getMusicVolume = (): number => musicVolume;
export const getSfxVolume = (): number => sfxVolume;
export const getCurrentSongKey = (): SongKey | null => currentSongKeyPlaying;

// You could add more controls like pauseSong, resumeSong, fadeOutSong etc.