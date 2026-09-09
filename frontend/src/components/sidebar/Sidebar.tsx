import React from 'react';
import { Brand } from '../common/Brand';
import { NewChatButton } from './NewChatButton';
import { ChatHistory } from './ChatHistory';
import { SettingsButton } from './SettingsButton';
import { ChatSession } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  chats: ChatSession[];
  activeChatId?: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  chats,
  activeChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onRenameChat,
  onOpenSettings
}) => {
  return (
    <aside className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      {/* Sidebar Header with Brand and New Chat */}
      <div className="sidebar-header">
        <Brand size="md" />
        <NewChatButton onClick={onNewChat} />
      </div>

      {/* Middle: Chat History Scrollable List */}
      <div className="sidebar-content">
        <ChatHistory
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={onSelectChat}
          onDeleteChat={onDeleteChat}
          onRenameChat={onRenameChat}
        />
      </div>

      {/* Bottom: Settings Trigger */}
      <div className="sidebar-footer">
        <SettingsButton onClick={onOpenSettings} />
      </div>
    </aside>
  );
};
