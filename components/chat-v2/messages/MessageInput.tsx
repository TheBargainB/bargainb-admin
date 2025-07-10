'use client'

import { memo, useState, useRef, useCallback } from 'react'
import { Send, Paperclip, Image, FileText, Mic, X, Smile } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { Message, MessageInputState, MessageType } from '@/types/chat-v2.types'

// =============================================================================
// TYPES
// =============================================================================

interface MessageInputProps {
  state: MessageInputState
  conversation_id?: string
  is_disabled?: boolean
  placeholder?: string
  
  // Event handlers
  onSendMessage?: (content: string, type?: MessageType, mediaFile?: File) => void
  onContentChange?: (content: string) => void
  onReplyCancel?: () => void
  
  className?: string
}

interface MediaPreview {
  file: File
  type: MessageType
  preview_url: string
}

// =============================================================================
// COMPONENT
// =============================================================================

export const MessageInput = memo<MessageInputProps>(({
  state,
  conversation_id,
  is_disabled = false,
  placeholder = "Type a message...",
  onSendMessage,
  onContentChange,
  onReplyCancel,
  className
}) => {
  // =============================================================================
  // STATE
  // =============================================================================

  const [media_preview, setMediaPreview] = useState<MediaPreview | null>(null)
  const [is_recording, setIsRecording] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const hasContent = state.content.trim().length > 0 || media_preview
  const canSend = hasContent && !state.is_sending && !is_disabled && conversation_id
  const showReplyBar = !!state.reply_to_message

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value
    onContentChange?.(value)
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const handleSend = useCallback(() => {
    if (!canSend || !onSendMessage) return

    const content = state.content.trim()
    const mediaFile = media_preview?.file

    if (content || mediaFile) {
      const messageType = media_preview?.type || 'text'
      onSendMessage(content, messageType, mediaFile)
      
      // Clear state
      setMediaPreview(null)
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [canSend, onSendMessage, state.content, media_preview])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Determine message type from file
    let messageType: MessageType = 'document'
    if (file.type.startsWith('image/')) {
      messageType = 'image'
    } else if (file.type.startsWith('video/')) {
      messageType = 'video'
    } else if (file.type.startsWith('audio/')) {
      messageType = 'audio'
    }

    // Create preview URL
    const preview_url = URL.createObjectURL(file)
    
    setMediaPreview({
      file,
      type: messageType,
      preview_url
    })

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAttachmentClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*'
      fileInputRef.current.click()
    }
  }

  const handleDocumentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.zip'
      fileInputRef.current.click()
    }
  }

  const handleMediaPreviewRemove = () => {
    if (media_preview?.preview_url) {
      URL.revokeObjectURL(media_preview.preview_url)
    }
    setMediaPreview(null)
  }

  const handleReplyCancel = () => {
    if (onReplyCancel) {
      onReplyCancel()
    }
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderReplyBar = () => {
    if (!showReplyBar || !state.reply_to_message) return null

    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="w-1 h-8 bg-green-500 rounded-full" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-green-600 dark:text-green-400">
            Replying to {state.reply_to_message.sender_name || 'Unknown'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {state.reply_to_message.content}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReplyCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  const renderMediaPreview = () => {
    if (!media_preview) return null

    return (
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="relative inline-block">
          {media_preview.type === 'image' && (
            <img
              src={media_preview.preview_url}
              alt="Preview"
              className="max-h-20 max-w-32 rounded-lg object-cover"
            />
          )}
          
          {media_preview.type === 'video' && (
            <video
              src={media_preview.preview_url}
              className="max-h-20 max-w-32 rounded-lg object-cover"
              muted
            />
          )}
          
          {(media_preview.type === 'document' || media_preview.type === 'audio') && (
            <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-24">
                {media_preview.file.name}
              </span>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMediaPreviewRemove}
            className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-gray-800 hover:bg-gray-700 text-white rounded-full"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    )
  }

  const renderAttachmentMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={is_disabled || state.is_sending}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <Paperclip className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleImageClick}>
          <Image className="w-4 h-4 mr-2" />
          Image
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDocumentClick}>
          <FileText className="w-4 h-4 mr-2" />
          Document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={cn('bg-white dark:bg-gray-900', className)}>
      {/* Reply bar */}
      {renderReplyBar()}
      
      {/* Media preview */}
      {renderMediaPreview()}

      {/* Input area */}
      <div className="flex items-end gap-2 p-4">
        {/* Attachment button */}
        {renderAttachmentMenu()}

        {/* Text input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={state.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={is_disabled || state.is_sending}
            className={cn(
              'min-h-[40px] max-h-[120px] resize-none pr-12',
              'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
              'rounded-2xl px-4 py-2',
              'focus:ring-green-500 focus:border-green-500'
            )}
            rows={1}
          />
          
          {/* Emoji button (placeholder) */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={is_disabled || state.is_sending}
          >
            <Smile className="w-4 h-4" />
          </Button>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          className={cn(
            'rounded-full w-10 h-10 p-0 transition-all',
            canSend 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
          )}
        >
          {state.is_sending ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
      />
    </div>
  )
})

MessageInput.displayName = 'MessageInput' 