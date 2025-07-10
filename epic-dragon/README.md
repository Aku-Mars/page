
# 👑 Pixel Realms: Dragon Knight's Fury 🐉

**Embark on a text-based MMORPG adventure! Choose your class, battle monsters, collect loot, and conquer 25 stages of increasing difficulty, culminating in a battle against the Dragon Knight and perhaps... even darker forces.**

![Pixel Realms RPG Screenshot Placeholder](https://via.placeholder.com/800x400.png?text=Imagine+Your+Gameplay+Screenshot+Here!)
*(Suggestion: Replace the placeholder above with an actual screenshot of your game!)*

---

## 📜 Story Teaser

The lands of Aethelgard are in turmoil. The legendary Dragon Knight, Aetharion, once a protector, has fallen to a mysterious corruption, unleashing his fury upon the realms. From the humble Windfall Village to the treacherous peaks of Dragon's Tooth Pass, monsters roam free, and darkness spreads.

A prophecy speaks of a hero who will rise to challenge Aetharion and restore balance. Are you that hero? Choose your path, adventurer, and forge your legend in **Pixel Realms: Dragon Knight's Fury**!

---

## ✨ Key Features

*   **Choose Your Class:** Play as a stalwart **Knight**, a powerful **Mage**, or a cunning **Rogue**, each with unique starting stats, equipment, and spells.
*   **Epic Adventure:** Journey through 26 distinct stages, each with unique environments, monsters, and a challenging boss.
*   **Strategic Combat:** Engage in turn-based combat. Use basic attacks, cast a variety of spells (Physical, Fire, Ice, Holy, Shadow, and more!), and consume potions to defeat your foes.
*   **Loot & Equipment:** Discover and equip a wide array of weapons, armor, and accessories to enhance your abilities. Find rare spell books to learn new powerful spells.
*   **Monster Variety:** Battle over 20 unique monsters, each with different stats, abilities, resistances, and weaknesses.
*   **Challenging Bosses:** Face formidable bosses at the end of key stages, including the Elder Treant, Wraith of Hollowgrove, Molten Golem, Icebound Titan, and the ultimate Dragon Knight Aetharion. And a secret final boss awaits the truly dedicated!
*   **Character Progression:** Level up your character, improve your stats, and learn new spells to become more powerful.
*   **Village Hub:** Return to Windfall Village to rest, shop for new gear and potions, or refresh the shop's stock.
*   **Leaderboard:** Compete for the fastest completion time on the Hall of Legends leaderboard!
*   **Immersive Audio:** Enjoy background music for the village and combat, along with sound effects for attacks, spells, and UI interactions.
*   **Pixel Art Aesthetics:** Classic pixel art style for a nostalgic RPG feel.
*   **Dynamic Floating Text:** See damage numbers, spell names, and status effects float in combat for clear feedback.
*   **Offline Play & Data Persistence:** Your progress is saved locally in your browser.

---

## 🚀 How to Play

1.  **Setup:**
    *   Ensure you have a modern web browser.
    *   (For Developers) If you are running this project locally and want to use any features that might involve the Gemini API (like potential future dynamic content generation, though the current build is self-contained for gameplay), ensure you have an API key for the Gemini API. Set this key as an environment variable named `API_KEY` in your project's environment (e.g., in a `.env` file if your setup supports it, `API_KEY=your_gemini_api_key_here`). The game logic accesses it via `process.env.API_KEY`. **The application will not ask you for the API key through the UI.**
    *   To run locally with a simple HTTP server (recommended for proper ES module loading and asset paths), navigate to the project directory in your terminal and run `npx serve .` (you might need to install `serve` globally first via `npm install -g serve` or use `npm start` if you have the `package.json` from this update). Alternatively, Python's `python -m http.server` also works.

2.  **Starting the Game:**
    *   Open the `index.html` file in your browser (ideally via a local HTTP server).
    *   You'll be greeted with the authentication screen. You can **Register** a new account or **Login** if you've played before.
    *   **Character Creation:** Choose a name for your hero and select one of the three available classes (Knight, Mage, Rogue).
    *   **The Village:** You'll start in Windfall Village. From here, you can:
        *   Visit the **Shop** to buy and sell items.
        *   Talk to the **Old Mage** for cryptic advice.
        *   **Rest** to recover some HP/MP (this adds a time penalty to your leaderboard score).
        *   View the **Leaderboard**.
        *   **Go on Adventure** to select a stage and explore.
    *   **Adventure:** Select a stage to explore. You'll encounter monsters or find the stage boss.
    *   **Combat:** Fight monsters in turn-based combat. Use your attacks, spells, and items wisely!
    *   **Progression:** Defeat monsters to gain XP, level up, find gold and items, and unlock new stages.

3.  **Goal:**
    *   Progress through all 25 main stages, defeat Dragon Knight Aetharion, and then face the ultimate secret boss to truly save the realms!

---

## 🛠️ For Developers

*   **API Key for Gemini:** As mentioned in "How to Play", the application expects the Gemini API key to be available as `process.env.API_KEY`. This is essential for any direct API calls.
*   **Image Assets:** All monster and stage images are currently expected to be in the `/public/images/monsters/` and `/public/images/stages/` directories respectively. The paths are defined in `constants.tsx`.
*   **Sound Assets:** Song files (`.mp3`) should be placed in `public/sounds/songs/` and sound effect files (`.wav`) in `public/sounds/sfx/`. The mapping is in `soundManager.ts`.

---

## 💻 Technologies Used

*   **React 19**
*   **TypeScript**
*   **TailwindCSS** (via CDN)
*   **@google/genai (Gemini API Client)** for potential generative features (though core gameplay is self-contained).
*   HTML5 & CSS3
*   ES6 Modules

---

## 🖼️ Screenshots (Add Your Own!)

*(This is a great place to add some screenshots of your game in action!)*

*   *Character Creation Screen*
*   *Village Hub*
*   *Combat Scene*
*   *Inventory/Stats Panel*

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details (if you choose to add one).

---

Happy adventuring! May your blade stay sharp and your spells true!