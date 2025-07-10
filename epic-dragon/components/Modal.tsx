
import React from 'react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose?: () => void; // Optional: if you want a close button handled by the modal itself
  actions?: { label: string, onClick: () => void, variant?: 'primary' | 'secondary' | 'danger' }[];
}

const Modal: React.FC<ModalProps> = ({ isOpen, title, children, onClose, actions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-stone-800 p-6 rounded-lg shadow-xl w-full max-w-md pixel-border border-stone-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-yellow-400 text-shadow-pixel">{title}</h2>
          {onClose && (
            <Button onClick={onClose} variant="danger" className="text-xs p-1">X</Button>
          )}
        </div>
        <div className="text-sm text-gray-300 mb-6">
          {children}
        </div>
        {actions && actions.length > 0 && (
          <div className="flex justify-end space-x-3">
            {actions.map((action, index) => (
              <Button key={index} onClick={action.onClick} variant={action.variant || 'primary'}>
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
