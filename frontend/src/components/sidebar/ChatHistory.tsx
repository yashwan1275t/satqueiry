import React, { useState } from 'react';
import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { ChatSession } from '../../types';

interface ChatHistoryProps {
  chats: ChatSession[];
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onRenameChat
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (e: React.MouseEvent, chat: ChatSession) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation from history?')) {
      onDeleteChat(chatId);
    }
  };

  if (chats.length === 0) {
    return (
      <div
        style={{
          padding: '24px 12px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '12.5px'
        }}
      >
        No recent analyses yet. Start a new query!
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-muted)',
          padding: '6px 8px 4px'
        }}
      >
        Recent Analyses
      </div>

      {chats.map((chat) => {
        const isActive = chat.id === activeChatId;
        const isEditing = editingId === chat.id;

        return (
          <div
            key={chat.id}
            className={`history-item ${isActive ? 'active' : ''}`}
            onClick={() => !isEditing && onSelectChat(chat.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px', flex: 1, minWidth: 0 }}>
              <MessageSquare size={14} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />

              {isEditing ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveRename(e as any, chat.id);
                    if (e.key === 'Escape') handleCancelRename(e as any);
                  }}
                  autoFocus
                  style={{
                    flex: 1,
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-active)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    padding: '2px 6px',
                    outline: 'none'
                  }}
                />
              ) : (
                <span className="title" title={chat.title}>
                  {chat.title}
                </span>
              )}
            </div>

            <div className="history-actions">
              {isEditing ? (
                <>
                  <button
                    className="history-action-btn"
                    onClick={(e) => handleSaveRename(e, chat.id)}
                    title="Save"
                  >
                    <Check size={13} color="var(--accent-emerald)" />
                  </button>
                  <button
                    className="history-action-btn"
                    onClick={handleCancelRename}
                    title="Cancel"
                  >
                    <X size={13} color="var(--accent-rose)" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="history-action-btn"
                    onClick={(e) => handleStartRename(e, chat)}
                    title="Rename"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    className="history-action-btn"
                    onClick={(e) => handleDelete(e, chat.id)}
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
