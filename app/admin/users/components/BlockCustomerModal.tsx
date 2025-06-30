"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Shield, Ban, User } from "lucide-react"

type CRMUser = {
  contact_id: string
  phone_number: string
  full_name: string | null
  preferred_name: string | null
  lifecycle_stage: string
}

interface BlockCustomerModalProps {
  user: CRMUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onBlock: (userId: string, reason: string) => void
  onUnblock: (userId: string) => void
}

export function BlockCustomerModal({ user, open, onOpenChange, onBlock, onUnblock }: BlockCustomerModalProps) {
  const [reason, setReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const isBlocked = user?.lifecycle_stage === 'blocked'

  const handleBlock = async () => {
    if (!user || !reason.trim()) return

    try {
      setIsProcessing(true)
      await onBlock(user.contact_id, reason)
      setReason("")
      onOpenChange(false)
    } catch (error) {
      console.error('Error blocking customer:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUnblock = async () => {
    if (!user) return

    try {
      setIsProcessing(true)
      await onUnblock(user.contact_id)
      onOpenChange(false)
    } catch (error) {
      console.error('Error unblocking customer:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isBlocked ? (
              <>
                <Shield className="h-5 w-5 text-green-600" />
                Unblock Customer
              </>
            ) : (
              <>
                <Ban className="h-5 w-5 text-red-600" />
                Block Customer
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <p className="font-medium">{user.full_name || user.preferred_name || 'Unknown'}</p>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <p className="font-medium">{user.phone_number}</p>
                </div>
                <div>
                  <Label>Current Status</Label>
                  <Badge className={isBlocked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                    {user.lifecycle_stage}
                  </Badge>
                </div>
                <div>
                  <Label>Customer ID</Label>
                  <p className="text-sm text-muted-foreground">{user.contact_id}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Section */}
          {isBlocked ? (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800">Unblock Customer</CardTitle>
                <CardDescription>
                  This customer is currently blocked. Unblocking will restore their access to BargainB services and allow them to receive messages again.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    The customer will be moved to 'prospect' status and can interact with BargainB again.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800">Block Customer</CardTitle>
                <CardDescription>
                  Blocking this customer will prevent them from receiving messages and using BargainB services. This action should only be taken for serious violations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Warning:</strong> This action will:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Block all WhatsApp communication with this customer</li>
                      <li>Prevent them from using BargainB services</li>
                      <li>Set their lifecycle stage to 'blocked'</li>
                      <li>Log this action for audit purposes</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="block-reason">Reason for Blocking (Required)</Label>
                  <Textarea
                    id="block-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a detailed reason for blocking this customer (e.g., spam, abuse, violation of terms)..."
                    rows={4}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This reason will be logged and can be reviewed by other administrators.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>
              Cancel
            </Button>
            {isBlocked ? (
              <Button 
                onClick={handleUnblock}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Shield className="mr-2 h-4 w-4" />
                {isProcessing ? 'Unblocking...' : 'Unblock Customer'}
              </Button>
            ) : (
              <Button 
                onClick={handleBlock}
                disabled={isProcessing || !reason.trim()}
                variant="destructive"
              >
                <Ban className="mr-2 h-4 w-4" />
                {isProcessing ? 'Blocking...' : 'Block Customer'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 