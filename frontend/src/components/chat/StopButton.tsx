import React from 'react';
import { Square } from 'lucide-react';

interface StopButtonProps {
  onClick: () => void;
}

export const StopButton: React.FC<StopButtonProps> = ({ onClick }) => {
  return (
    <button
      type="button"
      className="btn-stop"
      onClick={onClick}
      aria-label="Stop Generating"
      title="Stop Generating (Cancel)"
    >
      <Square size={14} fill="#ffffff" strokeWidth={0} />
    </button>
  );
};
