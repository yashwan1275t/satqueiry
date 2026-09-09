import React, { useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, AttachmentItem } from '../../types';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

interface ChatWindowProps {
  messages: ChatMessageType[];
  isGenerating: boolean;
  activeStep?: string;
  onSendMessage: (text: string, attachments: AttachmentItem[]) => void;
  onStopGeneration: () => void;
  onUploadFiles: (files: FileList, typeHint: string) => Promise<AttachmentItem[]>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isGenerating,
  activeStep,
  onSendMessage,
  onStopGeneration,
  onUploadFiles
}) => {
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating, activeStep]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Scrollable Messages Stream */}
      <div className="chat-scroll-area">
        <div className="chat-messages-container">
          {messages.map((msg, idx) => {
            const isLatestAi = !msg.role || msg.role === 'assistant';
            const isCurrentlyStreaming = isLatestAi && isGenerating && idx === messages.length - 1;

            return (
              <ChatMessage
                key={msg.id || idx}
                message={msg}
                isStreaming={isCurrentlyStreaming}
                currentStep={activeStep}
              />
            );
          })}
          <div ref={scrollBottomRef} />
        </div>
      </div>

      {/* Fixed Bottom Chat Input */}
      <ChatInput
        isGenerating={isGenerating}
        onSendMessage={onSendMessage}
        onStopGeneration={onStopGeneration}
        onUploadFiles={onUploadFiles}
      />
    </div>
  );
};
