'use client'

import { memo, useState } from 'react'
import { Plus, X, Phone, User, Mail } from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { createContact } from '@/actions/chat-v2/contacts.actions'
import type { Contact, ContactInsert } from '@/types/chat-v2.types'
import { 
  formatPhoneNumber, 
  isValidPhoneNumber, 
  phoneToWhatsAppJid,
  getCountryFromPhoneNumber 
} from '@/lib/phone-utils'

// =============================================================================
// TYPES
// =============================================================================

interface NewContactDialogProps {
  is_open: boolean
  onClose: () => void
  onContactCreated: (contact: Contact) => void
}

interface NewContactForm {
  phone_number: string
  display_name: string
  email: string
}

// =============================================================================
// UTILS
// =============================================================================

const validateEmail = (email: string): boolean => {
  if (!email) return true // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const NewContactDialog = memo<NewContactDialogProps>(({
  is_open,
  onClose,
  onContactCreated
}) => {
  const { toast } = useToast()
  
  const [form, setForm] = useState<NewContactForm>({
    phone_number: '',
    display_name: '',
    email: ''
  })
  
  const [is_submitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<NewContactForm>>({})

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleInputChange = (field: keyof NewContactForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePhoneNumberChange = (value: string) => {
    // Auto-format phone number as user types
    const formatted = formatPhoneNumber(value)
    handleInputChange('phone_number', formatted)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<NewContactForm> = {}
    
    // Validate phone number
    if (!form.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    } else if (!isValidPhoneNumber(form.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number'
    }
    
    // Validate email (optional)
    if (form.email && !validateEmail(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      const contactData: ContactInsert = {
        phone_number: form.phone_number.trim(),
        whatsapp_jid: phoneToWhatsAppJid(form.phone_number),
        display_name: form.display_name.trim() || undefined,
        is_active: true
      }
      
      const newContact = await createContact(contactData)
      
      // If email was provided, we could create a CRM profile here
      // For now, just show success
      
      toast({
        title: 'Contact Created',
        description: `Successfully added ${newContact.display_name || newContact.phone_number}`,
        variant: 'default'
      })
      
      onContactCreated(newContact)
      handleClose()
      
    } catch (error) {
      console.error('Error creating contact:', error)
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create contact',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (is_submitting) return
    
    setForm({
      phone_number: '',
      display_name: '',
      email: ''
    })
    setErrors({})
    onClose()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <Dialog open={is_open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {/* Header */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-green-600" />
            New Contact
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-4 py-4">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone_number" className="text-sm font-medium">
              Phone Number *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                  id="phone_number"
                  placeholder="+20 114 351 5957 (Egypt) or +31 6 12345678 (Netherlands)"
                  value={form.phone_number}
                  onChange={(e) => handlePhoneNumberChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                  disabled={is_submitting}
                />
            </div>
            {errors.phone_number && (
              <p className="text-sm text-red-600">{errors.phone_number}</p>
            )}
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-sm font-medium">
              Display Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="display_name"
                placeholder="John Doe"
                value={form.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
                disabled={is_submitting}
              />
            </div>
          </div>

          {/* Email (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email <span className="text-gray-400">(optional)</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
                disabled={is_submitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={is_submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={is_submitting || !form.phone_number.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {is_submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Contact
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

NewContactDialog.displayName = 'NewContactDialog' 