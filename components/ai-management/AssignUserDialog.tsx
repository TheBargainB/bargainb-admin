'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { UserPlus, Search, Phone, User, Loader2 } from 'lucide-react'
import { BBAssistant, WhatsAppContact, AssignUserData } from '@/types/ai-management.types'

interface AssignUserDialogProps {
  assistant: BBAssistant | null
  isOpen: boolean
  onClose: () => void
  onAssign: (contactId: string, assistantId: string) => Promise<void>
}

export const AssignUserDialog = ({
  assistant,
  isOpen,
  onClose,
  onAssign
}: AssignUserDialogProps) => {
  const [contacts, setContacts] = useState<WhatsAppContact[]>([])
  const [filteredContacts, setFilteredContacts] = useState<WhatsAppContact[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && assistant) {
      fetchContacts()
    }
  }, [isOpen, assistant])

  useEffect(() => {
    const filtered = contacts.filter(contact => {
      const displayName = contact.display_name || contact.push_name || ''
      const phoneNumber = contact.phone_number || ''
      
      return (
        displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneNumber.includes(searchTerm)
      )
    })
    setFilteredContacts(filtered)
  }, [contacts, searchTerm])

  const fetchContacts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/admin/chat/api/contacts/db')
      const result = await response.json()
      
      if (response.ok && result.success) {
        const mappedContacts = result.data.map((contact: any) => ({
          id: contact.id,
          phone_number: contact.phone_number,
          whatsapp_jid: `${contact.phone_number}@s.whatsapp.net`,
          push_name: contact.notify,
          display_name: contact.name || contact.notify,
          profile_picture_url: contact.img_url,
          verified_name: contact.verified_name,
          whatsapp_status: contact.status,
          last_seen_at: contact.last_seen_at,
          is_business_account: false,
          is_active: true,
          created_at: contact.created_at,
          updated_at: contact.updated_at
        }))
        setContacts(mappedContacts)
      }
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async (contact: WhatsAppContact) => {
    if (!assistant) return
    
    setIsAssigning(contact.id)
    try {
      await onAssign(contact.phone_number, assistant.assistant_id)
      handleClose()
    } catch (error) {
      console.error('Failed to assign user:', error)
    } finally {
      setIsAssigning(null)
    }
  }

  const handleClose = () => {
    setSearchTerm('')
    setContacts([])
    setFilteredContacts([])
    onClose()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!assistant) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-green-600" />
            <div>
              <DialogTitle className="text-xl">Assign Users</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Assign "{assistant.name}" to WhatsApp users
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Assistant Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{assistant.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {assistant.description || 'No description'}
                  </p>
                </div>
                <Badge variant="outline" className="ml-auto">
                  v{assistant.version}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Contacts</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search"
                placeholder="Search by name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Separator />

          {/* Contacts List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">WhatsApp Contacts</CardTitle>
              <p className="text-sm text-muted-foreground">
                Select users to assign this assistant to
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground animate-spin" />
                    <p className="text-muted-foreground">Loading contacts...</p>
                  </div>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <User className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? 'No Contacts Found' : 'No Contacts Available'}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'No WhatsApp contacts found in the system'
                    }
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="p-4 space-y-2">
                    {filteredContacts.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={contact.profile_picture_url || ''} 
                              alt={contact.display_name || contact.phone_number} 
                            />
                            <AvatarFallback className="text-sm">
                              {getInitials(contact.display_name || contact.phone_number)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {contact.display_name || contact.push_name || 'Unknown'}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span className="font-mono">{contact.phone_number}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAssign(contact)}
                          disabled={isAssigning === contact.id}
                          size="sm"
                          className="gap-2"
                        >
                          {isAssigning === contact.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Assigning...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4" />
                              Assign
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Separator />

          <div className="flex justify-end">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 