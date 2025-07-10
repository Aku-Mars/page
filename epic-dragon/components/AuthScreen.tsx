
import React, { useState } from 'react';
import Button from './Button';
import TypewriterText from './TypewriterText';
import { GAME_TITLE } from '../constants';

interface AuthScreenProps {
  onLogin: (username: string, password?: string) => void;
  onRegister: (username: string, password?: string) => void;
  errorMessage?: string | null;
  // onToggleImageTool?: () => void; // Removed
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, errorMessage }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      onRegister(username, password);
    } else {
      onLogin(username, password);
    }
  };
  
  // const isDevMode = process.env.NODE_ENV === 'development' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dev'));


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-stone-900 text-gray-200">
      <div className="w-full max-w-md bg-stone-800 p-8 pixel-border border-stone-600 shadow-2xl">
        <h1 className="text-3xl text-yellow-400 mb-6 text-center text-shadow-pixel">{GAME_TITLE}</h1>
        <TypewriterText 
            text={isRegistering ? "Create your legend." : "Welcome back, adventurer."} 
            className="text-lg mb-6 text-center" 
            key={isRegistering ? 'register' : 'login'} 
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm text-gray-300 mb-1">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 pixel-input"
              required
              maxLength={20}
              aria-required="true"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm text-gray-300 mb-1">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pixel-input"
              required
              aria-required="true"
            />
            {isRegistering && <p className="text-xs text-gray-400 mt-1">Choose a secure password.</p>}
          </div>

          {errorMessage && <p className="text-red-400 text-sm pixel-border border-red-600 bg-red-900/50 p-2">{errorMessage}</p>}

          <Button type="submit" className="w-full mt-2">
            {isRegistering ? 'Register' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button onClick={() => setIsRegistering(!isRegistering)} variant="secondary" className="text-xs">
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </Button>
        </div>
         {/* {isDevMode && onToggleImageTool && (
          <div className="mt-4 text-center">
            <Button onClick={onToggleImageTool} variant="secondary" className="text-xs">
                DEV: Image Tool
            </Button>
          </div>
        )} */}
      </div>
       <footer className="mt-8 text-xs text-stone-500">Your journey awaits...</footer>
    </div>
  );
};

export default AuthScreen;