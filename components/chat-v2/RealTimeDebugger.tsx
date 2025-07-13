'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Wifi, WifiOff, RefreshCw, Bell, MessageSquare, Minimize2, Maximize2 } from 'lucide-react'
import { useUnifiedRealTime } from '@/hooks/chat-v2/useUnifiedRealTime'
import { cn } from '@/lib/utils'

interface RealTimeDebuggerProps {
  selectedConversationId?: string | null
  className?: string
}

export const RealTimeDebugger: React.FC<RealTimeDebuggerProps> = ({
  selectedConversationId,
  className
}) => {
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [conversationCount, setConversationCount] = useState(0)
  const [notificationCount, setNotificationCount] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs(prev => [`${timestamp}: ${message}`, ...prev.slice(0, 9)]) // Keep last 10 logs
    setLastUpdate(new Date())
  }

  const {
    isConnected,
    connectionStatus,
    globalUnreadCount,
    refreshAll,
    cleanup
  } = useUnifiedRealTime({
    selectedConversationId,
    onMessagesUpdate: (messages) => {
      addLog(`📨 Messages updated: ${messages.length} new messages`)
      setMessageCount(prev => prev + messages.length)
    },
    onConversationsUpdate: (conversations) => {
      addLog(`💬 Conversations updated: ${conversations.length} conversations`)
      setConversationCount(conversations.length)
    },
    onNotificationsUpdate: (notifications) => {
      addLog(`🔔 Notifications updated: ${notifications.length} notifications`)
      setNotificationCount(notifications.length)
    },
    onGlobalUnreadUpdate: (count) => {
      addLog(`📊 Global unread count: ${count}`)
    }
  })

  const handleTestNotification = async () => {
    try {
      addLog('🧪 Testing notification API...')
      
      const response = await fetch('/api/admin/chat/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation_id: selectedConversationId || 'test-conversation',
          message_content: 'Test notification from debugger',
          is_inbound: true
        })
      })

      if (response.ok) {
        addLog('✅ Test notification sent successfully')
      } else {
        addLog('❌ Test notification failed')
      }
    } catch (error) {
      addLog('❌ Test notification error: ' + (error as Error).message)
    }
  }

  const handleManualRefresh = async () => {
    addLog('🔄 Manual refresh triggered...')
    await refreshAll()
    addLog('✅ Manual refresh completed')
  }

  const handleClearLogs = () => {
    setDebugLogs([])
    setMessageCount(0)
    setConversationCount(0)
    setNotificationCount(0)
    addLog('🧹 Debug logs cleared')
  }

  const handleToggleMinimize = () => {
    setIsMinimized(!isMinimized)
  }

  const getConnectionBadge = () => {
    if (isConnected) {
      return (
        <Badge variant="default" className="bg-green-500">
          <Wifi className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <WifiOff className="w-3 h-3 mr-1" />
          Disconnected
        </Badge>
      )
    }
  }

  return (
    <Card className={cn(className, "transition-all duration-300", isMinimized && "h-auto")}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="text-sm">Real-Time Debug</span>
          <div className="flex items-center gap-2">
            {getConnectionBadge()}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleMinimize}
              className="h-6 w-6 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="w-3 h-3" />
              ) : (
                <Minimize2 className="w-3 h-3" />
              )}
            </Button>
          </div>
        </CardTitle>
        {!isMinimized && (
          <CardDescription className="text-xs">
            Monitor real-time connection status and test notifications
          </CardDescription>
        )}
      </CardHeader>
      
      {/* Minimized status indicator */}
      {isMinimized && (
        <CardContent className="py-2 px-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Status:</span>
            {getConnectionBadge()}
          </div>
        </CardContent>
      )}
      
      {!isMinimized && (
        <CardContent className="space-y-4 pt-0">
          {/* Connection Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">{connectionStatus}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Unread Count</p>
              <p className="text-sm text-muted-foreground">{globalUnreadCount}</p>
            </div>
          </div>

          {/* Counters */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <MessageSquare className="w-4 h-4 mx-auto mb-1" />
              <p className="text-sm font-medium">{messageCount}</p>
              <p className="text-xs text-muted-foreground">Messages</p>
            </div>
            <div className="text-center">
              <div className="w-4 h-4 mx-auto mb-1 bg-blue-500 rounded-full" />
              <p className="text-sm font-medium">{conversationCount}</p>
              <p className="text-xs text-muted-foreground">Conversations</p>
            </div>
            <div className="text-center">
              <Bell className="w-4 h-4 mx-auto mb-1" />
              <p className="text-sm font-medium">{notificationCount}</p>
              <p className="text-xs text-muted-foreground">Notifications</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualRefresh}
              className="flex-1"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestNotification}
              className="flex-1"
            >
              <Bell className="w-3 h-3 mr-1" />
              Test
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearLogs}
              className="flex-1"
            >
              Clear
            </Button>
          </div>

          {/* Debug Logs */}
          <div>
            <p className="text-sm font-medium mb-2">Debug Logs</p>
            <div className="bg-muted p-2 rounded-md max-h-32 overflow-y-auto">
              {debugLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground">No logs yet...</p>
              ) : (
                debugLogs.map((log, index) => (
                  <p key={index} className="text-xs font-mono">
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>

          {lastUpdate && (
            <div className="text-xs text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
} 