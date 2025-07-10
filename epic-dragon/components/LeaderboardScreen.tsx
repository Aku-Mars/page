
import React from 'react';
import { LeaderboardEntry } from '../types';
import Button from './Button';

interface LeaderboardScreenProps {
  leaderboardData: LeaderboardEntry[];
  onClose: () => void;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ leaderboardData, onClose }) => {
  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    let timeString = "";
    if (hours > 0) timeString += `${hours}h `;
    timeString += `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    return timeString.trim();
  };

  const sortedLeaderboard = [...leaderboardData].sort((a, b) => a.time - b.time);

  return (
    <div className="p-4 md:p-8 flex flex-col items-center bg-stone-800/90 pixel-border border-yellow-500 rounded-lg shadow-xl max-w-2xl mx-auto my-4">
      <h2 className="text-3xl text-yellow-400 mb-6 text-shadow-pixel">Hall of Legends</h2>
      
      {sortedLeaderboard.length === 0 ? (
        <p className="text-gray-300 text-lg">The Hall of Legends is empty. Be the first to claim a spot!</p>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-yellow-300 uppercase bg-stone-700">
              <tr>
                <th scope="col" className="px-4 py-2">Rank</th>
                <th scope="col" className="px-4 py-2">Player</th>
                <th scope="col" className="px-4 py-2">Class</th>
                <th scope="col" className="px-4 py-2">Level</th>
                <th scope="col" className="px-4 py-2">Time</th>
                <th scope="col" className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map((entry, index) => (
                <tr key={entry.username + entry.date} className={`${index % 2 === 0 ? 'bg-stone-800' : 'bg-stone-750'} border-b border-stone-600 hover:bg-stone-600`}>
                  <td className="px-4 py-2 font-medium text-yellow-200">{index + 1}</td>
                  <td className="px-4 py-2">{entry.username}</td>
                  <td className="px-4 py-2">{entry.playerClass}</td>
                  <td className="px-4 py-2">{entry.level}</td>
                  <td className="px-4 py-2">{formatTime(entry.time)}</td>
                  <td className="px-4 py-2 text-xs">{new Date(entry.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button onClick={onClose} variant="primary" className="mt-8">
        Close
      </Button>
    </div>
  );
};

export default LeaderboardScreen;
