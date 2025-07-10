
import React from 'react';
import * as SoundManager from '../soundManager'; // Import SoundManager

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className, onClick, ...props }) => {
  let baseStyle = "pixel-button text-sm";
  
  switch (variant) {
    case 'secondary':
      baseStyle += " bg-slate-500 hover:bg-slate-600 border-slate-700";
      break;
    case 'danger':
      baseStyle += " bg-red-600 hover:bg-red-700 border-red-800";
      break;
    case 'primary':
    default:
      // Uses default pixel-button style from index.html
      break;
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    SoundManager.playSoundEffect('BUTTON_CLICK', 0.1); // Play button click at 30% volume
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button
      className={`${baseStyle} ${className || ''}`}
      onClick={handleClick} // Use the new handleClick
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;