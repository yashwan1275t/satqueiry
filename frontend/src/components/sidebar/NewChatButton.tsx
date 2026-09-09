import React from 'react';
import { Plus } from 'lucide-react';

interface NewChatButtonProps {
  onClick: () => void;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({ onClick }) => {
  return (
    <button className="btn-new-chat" onClick={onClick}>
      <Plus size={16} strokeWidth={2.5} />
      <span>New Chat</span>
    </button>
  );
};
