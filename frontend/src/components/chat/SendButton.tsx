import React from 'react';
import { ArrowUp } from 'lucide-react';

interface SendButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export const SendButton: React.FC<SendButtonProps> = ({ disabled, onClick }) => {
  return (
    <button
      type="button"
      className="btn-send"
      disabled={disabled}
      onClick={onClick}
      aria-label="Send Message"
      title="Send (Enter)"
    >
      <ArrowUp size={18} strokeWidth={2.5} />
    </button>
  );
};
