
import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // Milliseconds per character
  onFinished?: () => void;
  className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 50, onFinished, className }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (!text) return;

    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeoutId);
    } else if (onFinished) {
      onFinished();
    }
  }, [currentIndex, text, speed, onFinished]);

  return <p className={`whitespace-pre-wrap ${className || ''}`}>{displayedText}</p>;
};

export default TypewriterText;
